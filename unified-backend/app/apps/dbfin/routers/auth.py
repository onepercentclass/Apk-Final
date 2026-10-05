from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core import security
from app.core.database import get_db

from .. import models, schemas
from ..deps import current_user
from ..services.access import keys_for_tier

router = APIRouter(tags=["auth"])


@router.post("/auth/login", response_model=schemas.TokenOut)
def login(body: schemas.LoginIn, db: Session = Depends(get_db)):
    user = db.scalar(select(models.User).where(models.User.username == body.username))
    if not user or not security.verify_password(body.password, user.password_hash):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Username atau password salah")
    return schemas.TokenOut(
        access_token=security.create_access_token(app="dbfin", sub=str(user.id), tier=user.tier),
        tier=user.tier,
    )


@router.get("/access/me", response_model=schemas.AccessOut)
def my_access(user: models.User = Depends(current_user)):
    return schemas.AccessOut(tier=user.tier, name=user.name, access=keys_for_tier(user.tier))
