import uuid
from unittest.mock import patch

import httpx
from fastapi.testclient import TestClient

from app import models
from app.config import settings
from app.database import SessionLocal
from app.main import app
from app.services.ai_service import AIServiceError, get_ai_reply

msgs = [{"role": "user", "content": "Hi"}]


def try_ai():
    try:
        get_ai_reply(msgs)
        return "NO ERROR (this is wrong)"
    except AIServiceError as e:
        return f"{e.status_code} - {e.message}"


real_key = settings.gemini_api_key

settings.gemini_api_key = "this-is-a-fake-key"
print("1. Wrong key  :", try_ai())

settings.gemini_api_key = ""
print("2. Missing key:", try_ai())
settings.gemini_api_key = real_key

with patch("app.services.ai_service.httpx.post", side_effect=httpx.ConnectError("boom")):
    print("3. No internet:", try_ai())

with patch("app.services.ai_service.httpx.post", side_effect=httpx.ReadTimeout("slow")):
    print("4. Too slow   :", try_ai())

# 5. If the AI fails in a chat, nothing must be saved.
client = TestClient(app)
tag = uuid.uuid4().hex[:8]
email = f"err_{tag}@example.com"
r = client.post("/api/auth/register", json={"email": email, "username": "Tester", "password": "StrongPass123"})
headers = {"Authorization": f"Bearer {r.json()['access_token']}"}

with patch("app.routers.chat.get_ai_reply", side_effect=AIServiceError("fake AI failure", 401)):
    r = client.post("/api/chat", json={"message": "Hello"}, headers=headers)
print("5. Chat when AI fails:", r.status_code, "-", r.json().get("detail"), "(status should be 502)")

r = client.get("/api/conversations", headers=headers)
print("6. Chats saved after the failure:", len(r.json()), "(should be 0)")

db = SessionLocal()
user = db.query(models.User).filter(models.User.email == email).first()
if user:
    db.delete(user)
db.commit()
db.close()
print("Cleaned up test data.")
