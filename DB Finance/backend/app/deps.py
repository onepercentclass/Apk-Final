"""Dependency FastAPI: sesi DB, pengguna aktif, dan pemeriksaan akses menu."""
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from . import models
from .database import get_db
from .security import decode_token
from .services.access import keys_for_tier

bearer = HTTPBearer(auto_error=False)


def current_user(
    cred: HTTPAuthorizationCredentials | None = Depends(bearer),
    db: Session = Depends(get_db),
) -> models.User:
    user_id = decode_token(cred.credentials) if cred else None
    user = db.get(models.User, user_id) if user_id else None
    if not user:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Token tidak valid", headers={"WWW-Authenticate": "Bearer"})
    return user


def access_keys(user: models.User = Depends(current_user)) -> set[str]:
    return set(keys_for_tier(user.tier))


def require_menu(menu_id: str):
    """Dependency pabrik: tolak (403) bila tier pengguna tidak punya key akses `menu_id`."""

    def check(keys: set[str] = Depends(access_keys)) -> None:
        if menu_id not in keys:
            raise HTTPException(status.HTTP_403_FORBIDDEN, "Tier Anda tidak memiliki akses ke fitur ini")

    return check
