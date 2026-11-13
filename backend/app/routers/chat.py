from typing import List

from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from app import models, schemas
from app.database import get_db
from app.security import get_current_user
from app.services.ai_service import AIServiceError, get_ai_reply

router = APIRouter(prefix="/api", tags=["chat"])


def make_title(text):
    """Make a short chat title from the first message."""
    title = " ".join(text.split())
    return title[:40] + ("..." if len(title) > 40 else "")


def get_conversation_or_404(db, conversation_id, user):
    """Find a chat. It must belong to this user."""
    conv = (
        db.query(models.Conversation)
        .filter(
            models.Conversation.id == conversation_id,
            models.Conversation.user_id == user.id,
        )
        .first()
    )
    if conv is None:
        raise HTTPException(status_code=404, detail="Conversation not found.")
    return conv


def _ask_ai(history):
    """Ask the AI. Turn errors into messages the website can show."""
    try:
        reply = get_ai_reply(history)
    except AIServiceError as e:
        status = e.status_code if e.status_code in (429, 500, 503, 504) else 502
        raise HTTPException(status_code=status, detail=e.message)
    if not reply.strip():
        raise HTTPException(
            status_code=502, detail="The AI sent an empty answer. Please try again."
        )
    return reply


@router.post("/conversations", response_model=schemas.ConversationOut, status_code=201)
def create_conversation(
    data: schemas.ConversationCreate = schemas.ConversationCreate(),
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    conv = models.Conversation(title=data.title, user_id=user.id)
    db.add(conv)
    db.commit()
    db.refresh(conv)
    return conv


@router.get("/conversations", response_model=List[schemas.ConversationOut])
def list_conversations(
    q: str = "",
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    """List your chats, newest first. Use ?q=word to search."""
    query = db.query(models.Conversation).filter(models.Conversation.user_id == user.id)
    word = q.strip()
    if word:
        like = f"%{word}%"
        matching = select(models.Message.conversation_id).where(
            models.Message.content.ilike(like)
        )
        query = query.filter(
            or_(
                models.Conversation.title.ilike(like),
                models.Conversation.id.in_(matching),
            )
        )
    return query.order_by(models.Conversation.updated_at.desc()).all()


@router.get(
    "/conversations/{conversation_id}/messages",
    response_model=List[schemas.MessageOut],
)
def get_messages(
    conversation_id: int,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    conv = get_conversation_or_404(db, conversation_id, user)
    return conv.messages


@router.patch("/conversations/{conversation_id}", response_model=schemas.ConversationOut)
def rename_conversation(
    conversation_id: int,
    data: schemas.ConversationRename,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    conv = get_conversation_or_404(db, conversation_id, user)
    conv.title = data.title.strip() or "New chat"
    db.commit()
    db.refresh(conv)
    return conv


@router.delete("/conversations/{conversation_id}", status_code=204)
def delete_conversation(
    conversation_id: int,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    conv = get_conversation_or_404(db, conversation_id, user)
    db.delete(conv)
    db.commit()
    return Response(status_code=204)


@router.post("/chat", response_model=schemas.ChatResponse)
def send_message(
    data: schemas.ChatRequest,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    text = data.message.strip()
    if not text:
        raise HTTPException(status_code=400, detail="Message cannot be empty.")

    conv = None
    history = []
    if data.conversation_id is not None:
        conv = get_conversation_or_404(db, data.conversation_id, user)
        history = [{"role": m.role, "content": m.content} for m in conv.messages]
    history.append({"role": "user", "content": text})

    # Ask the AI first. If it fails, we save nothing.
    reply = _ask_ai(history)

    # Save the chat, the question and the answer.
    if conv is None:
        conv = models.Conversation(title=make_title(text), user_id=user.id)
        db.add(conv)
        db.flush()
    elif conv.title == "New chat":
        conv.title = make_title(text)
    conv.updated_at = models.utcnow()

    user_msg = models.Message(conversation_id=conv.id, role="user", content=text)
    db.add(user_msg)
    db.flush()
    ai_msg = models.Message(conversation_id=conv.id, role="assistant", content=reply)
    db.add(ai_msg)
    db.commit()
    db.refresh(conv)
    db.refresh(user_msg)
    db.refresh(ai_msg)

    return schemas.ChatResponse(
        conversation=conv, user_message=user_msg, assistant_message=ai_msg
    )


@router.post(
    "/conversations/{conversation_id}/regenerate", response_model=schemas.MessageOut
)
def regenerate_reply(
    conversation_id: int,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    """Ask the AI for a new answer to the last question."""
    conv = get_conversation_or_404(db, conversation_id, user)
    messages = conv.messages
    if len(messages) < 2 or messages[-1].role != "assistant":
        raise HTTPException(status_code=400, detail="There is no answer to redo.")
    last = messages[-1]
    history = [{"role": m.role, "content": m.content} for m in messages[:-1]]
    last.content = _ask_ai(history)
    conv.updated_at = models.utcnow()
    db.commit()
    db.refresh(last)
    return last


@router.delete("/conversations/{conversation_id}/messages", status_code=204)
def clear_conversation(
    conversation_id: int,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    """Remove all messages from a chat. The chat itself stays."""
    conv = get_conversation_or_404(db, conversation_id, user)
    db.query(models.Message).filter(
        models.Message.conversation_id == conv.id
    ).delete()
    conv.title = "New chat"
    conv.updated_at = models.utcnow()
    db.commit()
    return Response(status_code=204)


@router.delete("/conversations", status_code=204)
def delete_all_conversations(
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    """Delete ALL chats of the logged-in user."""
    chats = (
        db.query(models.Conversation)
        .filter(models.Conversation.user_id == user.id)
        .all()
    )
    for conv in chats:
        db.delete(conv)
    db.commit()
    return Response(status_code=204)
