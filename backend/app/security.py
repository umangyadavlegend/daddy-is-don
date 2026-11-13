from datetime import datetime, timedelta, timezone

import bcrypt
import jwt
from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app import models
from app.config import settings
from app.database import get_db

bearer = HTTPBearer(auto_error=False)
TOKEN_DAYS = 7


def hash_password(password):
    """Turn a password into a safe hash. We never save the real password."""
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(password, hashed):
    try:
        return bcrypt.checkpw(password.encode("utf-8"), hashed.encode("utf-8"))
    except ValueError:
        return False


def create_token(user_id):
    """Make a login token (JWT) that is valid for 7 days."""
    payload = {
        "sub": str(user_id),
        "exp": datetime.now(timezone.utc) + timedelta(days=TOKEN_DAYS),
    }
    return jwt.encode(payload, settings.secret_key, algorithm="HS256")


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer),
    db: Session = Depends(get_db),
):
    """Find who is logged in. Used by every protected route."""
    if credentials is None:
        raise HTTPException(status_code=401, detail="Please log in first.")
    try:
        payload = jwt.decode(
            credentials.credentials, settings.secret_key, algorithms=["HS256"]
        )
        user_id = int(payload["sub"])
    except (jwt.PyJWTError, KeyError, ValueError):
        raise HTTPException(
            status_code=401, detail="Session expired. Please log in again."
        )
    user = db.get(models.User, user_id)
    if user is None:
        raise HTTPException(
            status_code=401, detail="Session expired. Please log in again."
        )
    return user
