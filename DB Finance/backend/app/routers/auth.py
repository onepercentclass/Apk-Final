from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from ..deps import current_user
from ..security import create_token, verify_password
from ..services.access import keys_for_tier

router = APIRouter(tags=["auth"])


@router.post("/auth/login", response_model=schemas.TokenOut)
def login(body: schemas.LoginIn, db: Session = Depends(get_db)):
    user = db.scalar(select(models.User).where(models.User.username == body.username))
    if not user or not verify_password(body.password, user.password_hash):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Username atau password salah")
    return schemas.TokenOut(access_token=create_token(user.id), tier=user.tier)


@router.get("/access/me", response_model=schemas.AccessOut)
def my_access(user: models.User = Depends(current_user)):
    return schemas.AccessOut(tier=user.tier, name=user.name, access=keys_for_tier(user.tier))
