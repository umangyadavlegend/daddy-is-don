from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import Base, engine
from app import models  # noqa: F401 (loads the tables)
from app.routers import auth, chat

# Make the database tables when the app starts.
Base.metadata.create_all(bind=engine)

# Allowed website addresses. Use commas for more than one.
origins = [o.strip().rstrip("/") for o in settings.frontend_url.split(",") if o.strip()]

# When hosted, refuse to start with a weak secret key.
if settings.environment == "production" and (
    len(settings.secret_key) < 32 or settings.secret_key.startswith("change-me")
):
    raise RuntimeError("Set a strong SECRET_KEY in the environment settings.")

app = FastAPI(title="DADDY IS DON", description="Your AI. Your Conversation. Your World.")

# CORS lets our React website talk to this backend.
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health_check():
    return {"status": "ok", "app": "DADDY IS DON"}



app.include_router(chat.router)

app.include_router(auth.router)

