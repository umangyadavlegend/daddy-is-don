import uuid

from fastapi.testclient import TestClient

from app import models
from app.database import SessionLocal
from app.main import app

client = TestClient(app)
tag = uuid.uuid4().hex[:8]
email_a = f"a_{tag}@example.com"
email_b = f"b_{tag}@example.com"
password = "StrongPass123"


def auth(token):
    return {"Authorization": f"Bearer {token}"}


r = client.post("/api/auth/register", json={"email": email_a, "username": "Alice", "password": password})
print("1. Register A:", r.status_code, "(should be 201)")
if r.status_code != 201:
    print("   Error:", r.json())
    raise SystemExit
token_a = r.json()["access_token"]

r = client.post("/api/auth/register", json={"email": email_a, "username": "Alice", "password": password})
print("2. Same email again:", r.status_code, "(should be 409)")

r = client.post("/api/auth/register", json={"email": f"c_{tag}@example.com", "username": "Carl", "password": "abc"})
print("3. Short password blocked:", r.status_code, "(should be 422)")

r = client.post("/api/auth/login", json={"email": email_a, "password": "WrongPass999"})
print("4. Wrong password:", r.status_code, "(should be 401)")

r = client.post("/api/auth/login", json={"email": email_a, "password": password})
print("5. Correct login:", r.status_code, "(should be 200)")

r = client.get("/api/auth/me", headers=auth(token_a))
print("6. Who am I:", r.status_code, r.json().get("username"), "(should be 200 Alice)")

r = client.get("/api/conversations")
print("7. Chats without login:", r.status_code, "(should be 401)")

r = client.get("/api/conversations", headers=auth("fake.token.here"))
print("8. Chats with fake token:", r.status_code, "(should be 401)")

r = client.post("/api/auth/register", json={"email": email_b, "username": "Bob", "password": password})
token_b = r.json()["access_token"]

r = client.post("/api/chat", json={"message": "Say hi in 3 words."}, headers=auth(token_a))
print("9. Alice sends a message:", r.status_code, "(should be 200)")
if r.status_code != 200:
    print("   Error:", r.json())
    raise SystemExit
conv_id = r.json()["conversation"]["id"]

r = client.get("/api/conversations", headers=auth(token_b))
print("10. Bob sees Alice's chat in his list:", any(c["id"] == conv_id for c in r.json()), "(should be False)")

r = client.get(f"/api/conversations/{conv_id}/messages", headers=auth(token_b))
print("11. Bob reads Alice's messages:", r.status_code, "(should be 404)")

r = client.patch(f"/api/conversations/{conv_id}", json={"title": "hacked"}, headers=auth(token_b))
print("12. Bob renames Alice's chat:", r.status_code, "(should be 404)")

r = client.post("/api/chat", json={"message": "hi", "conversation_id": conv_id}, headers=auth(token_b))
print("13. Bob writes in Alice's chat:", r.status_code, "(should be 404)")

r = client.delete(f"/api/conversations/{conv_id}", headers=auth(token_b))
print("14. Bob deletes Alice's chat:", r.status_code, "(should be 404)")

r = client.get("/api/conversations", headers=auth(token_a))
print("15. Alice still sees her chat:", any(c["id"] == conv_id for c in r.json()), "(should be True)")

db = SessionLocal()
alice = db.query(models.User).filter(models.User.email == email_a).first()
print("16. Password saved as hash, not plain text:", alice.hashed_password.startswith("$2") and password not in alice.hashed_password, "(should be True)")

# Clean up the test users and their chats.
for email in (email_a, email_b):
    user = db.query(models.User).filter(models.User.email == email).first()
    if user:
        db.delete(user)
db.commit()
db.close()
print("Cleaned up test data.")
