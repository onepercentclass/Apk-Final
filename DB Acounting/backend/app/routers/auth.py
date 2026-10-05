"""Auth placeholder — gantikan hash & token dummy dengan bcrypt/JWT produksi."""
import hashlib

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models, schemas
from ..auth import current_tier
from ..database import get_db

router = APIRouter(prefix="/auth", tags=["auth"])


def _hash(password: str) -> str:
    # DEV SAJA — produksi: passlib bcrypt.
    return "sha256$" + hashlib.sha256(password.encode()).hexdigest()


@router.post("/register", response_model=schemas.AuthOut)
def register(body: schemas.RegisterIn, db: Session = Depends(get_db)):
    exists = db.query(models.User).filter(models.User.email == body.email.lower()).first()
    if exists:
        raise HTTPException(status_code=409, detail="Email sudah terdaftar")
    user = models.User(name=body.name, email=body.email.lower(), password_hash=_hash(body.password), tier=0)
    db.add(user)
    db.commit()
    return {"token": "dev-token", "tier": 0, "name": user.name, "email": user.email}


@router.post("/login", response_model=schemas.AuthOut)
def login(body: schemas.LoginIn, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == body.email.lower()).first()
    if not user or user.password_hash != _hash(body.password):
        raise HTTPException(status_code=401, detail="Email atau kata sandi salah")
    return {"token": "dev-token", "tier": user.tier, "name": user.name, "email": user.email}


@router.get("/me")
def me(tier_def: dict = Depends(current_tier)):
    return {"tier": tier_def["tier"], "menus": tier_def["menus"]}


@router.post("/profile")
def save_profile(body: dict, tier_def: dict = Depends(current_tier)):
    return {"ok": True, "tier": tier_def["tier"]}
