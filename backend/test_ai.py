from app.services.ai_service import get_ai_reply, AIServiceError

try:
    reply = get_ai_reply([{"role": "user", "content": "Say hello in 5 words."}])
    print("AI says:", reply)
except AIServiceError as e:
    print("Error caught:", e.message)
