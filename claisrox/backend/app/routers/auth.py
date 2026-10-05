from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.access import menus_for_tier
from app.database import get_db
from app.dependencies import get_current_user
from app.models import User
from app.schemas.auth import LoginRequest, SessionResponse, TokenResponse
from app.security import create_access_token, verify_password

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.scalar(select(User).where(User.username == payload.username))
    if user is None or not user.is_active or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Username atau password salah")
    return TokenResponse(access_token=create_access_token(user.username))


@router.get("/me", response_model=SessionResponse)
def me(user: User = Depends(get_current_user)):
    return SessionResponse(username=user.username, name=user.name, tier=user.tier, menus=menus_for_tier(user.tier))
