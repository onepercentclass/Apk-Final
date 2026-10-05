from collections.abc import Callable

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.access import can_access
from app.database import get_db
from app.models import User
from app.security import decode_access_token

bearer = HTTPBearer(auto_error=False)


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer),
    db: Session = Depends(get_db),
) -> User:
    username = decode_access_token(credentials.credentials) if credentials else None
    user = db.scalar(select(User).where(User.username == username)) if username else None
    if user is None or not user.is_active:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Sesi tidak valid")
    return user


def require_menu(menu: str) -> Callable[[User], User]:
    def checker(user: User = Depends(get_current_user)) -> User:
        if not can_access(user.tier, menu):
            raise HTTPException(status.HTTP_403_FORBIDDEN, f"Tier {user.tier} tidak punya akses ke '{menu}'")
        return user

    return checker
