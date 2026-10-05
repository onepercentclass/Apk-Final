"""Login + info user + file tier."""
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from ..access import load_tier
from ..database import get_db
from ..models import User
from ..security import create_token, current_user, verify_password

router = APIRouter(tags=["auth"])


class LoginBody(BaseModel):
    username: str
    password: str


@router.post("/auth/login")
def login(body: LoginBody, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == body.username).first()
    if not user or not verify_password(body.password, user.password_hash):
        raise HTTPException(401, "Username atau password salah")
    return {
        "access_token": create_token(user),
        "token_type": "bearer",
        "tier": user.tier,
        "user": {"name": user.name, "role": user.role},
    }


@router.get("/auth/me")
def me(user: User = Depends(current_user)):
    return {"id": user.id, "name": user.name, "role": user.role, "tier": user.tier}


@router.get("/tiers/{n}")
def get_tier(n: int, user: User = Depends(current_user)):
    # Tier yang lebih kecil (lebih tinggi hak aksesnya) boleh melihat tier lain; selain itu hanya tier sendiri.
    if n < user.tier:
        raise HTTPException(403, "Tidak boleh melihat tier ini")
    return load_tier(n)
