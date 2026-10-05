"""
Password hashing and JWT issuance.

Hashing uses bcrypt straight from the ``bcrypt`` package rather than
``passlib``: passlib's bcrypt backend has been unmaintained since 2023 and
breaks against bcrypt >= 4.1. The dependency is smaller and the behaviour is
the library's own.

Tokens are plain HS256 JWTs with two token types:

    access   short lived, sent as ``Authorization: Bearer <token>``
    refresh  long lived, exchanged at POST /auth/refresh for a new access token

Nothing here decides what a user may do. That is ``deps.require`` plus the
tier JSON files.
"""

from __future__ import annotations

import uuid
from datetime import datetime, timedelta, timezone
from typing import Any, Literal

import bcrypt
import jwt

from .config import settings

TokenType = Literal["access", "refresh"]

MIN_PASSWORD_LENGTH = 8
BCRYPT_MAX_BYTES = 72  # bcrypt ignores bytes past 72; reject instead of truncating


class TokenError(Exception):
    """Raised when a token is missing, malformed, expired or of the wrong type."""


# --------------------------------------------------------------------- passwords
def hash_password(password: str) -> str:
    """Return a bcrypt hash for a plaintext password."""
    if len(password) < MIN_PASSWORD_LENGTH:
        raise ValueError(f"password must be at least {MIN_PASSWORD_LENGTH} characters")
    raw = password.encode("utf-8")
    if len(raw) > BCRYPT_MAX_BYTES:
        raise ValueError("password must be at most 72 bytes once UTF-8 encoded")
    return bcrypt.hashpw(raw, bcrypt.gensalt()).decode("ascii")


def verify_password(password: str, password_hash: str | None) -> bool:
    """Constant-time check. Returns False rather than raising on a bad hash."""
    if not password_hash:
        return False
    try:
        return bcrypt.checkpw(password.encode("utf-8"), password_hash.encode("utf-8"))
    except (ValueError, TypeError):
        return False


def needs_rehash(password_hash: str) -> bool:
    """True when a stored hash uses weaker settings than we now write."""
    if not password_hash:
        return True
    parts = password_hash.split("$")
    if len(parts) != 4:
        return True
    try:
        return int(parts[2]) < 12
    except ValueError:
        return True


# ------------------------------------------------------------------------ tokens
def _secret() -> str:
    if not settings.SECRET_KEY:
        # Development fallback. get_settings() already refuses to start in
        # production without one; this only covers a bare local run.
        return "n6-development-only-secret-do-not-use-in-production"
    return settings.SECRET_KEY


def _create(
    subject: str,
    token_type: TokenType,
    expires_delta: timedelta,
    claims: dict[str, Any] | None = None,
) -> str:
    now = datetime.now(timezone.utc)
    payload: dict[str, Any] = {
        "sub": str(subject),
        "typ": token_type,
        "iat": int(now.timestamp()),
        "exp": int((now + expires_delta).timestamp()),
        "jti": uuid.uuid4().hex,
    }
    if claims:
        payload.update(claims)
    return jwt.encode(payload, _secret(), algorithm=settings.JWT_ALGORITHM)


def create_access_token(subject: str | int, **claims: Any) -> str:
    """Access token for an account id."""
    return _create(
        str(subject),
        "access",
        timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
        claims,
    )


def create_refresh_token(subject: str | int, **claims: Any) -> str:
    """Long-lived token accepted only by POST /auth/refresh."""
    return _create(
        str(subject),
        "refresh",
        timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
        claims,
    )


def create_token_pair(subject: str | int, **claims: Any) -> dict[str, str]:
    return {
        "access_token": create_access_token(subject, **claims),
        "refresh_token": create_refresh_token(subject, **claims),
        "token_type": "bearer",
    }


def decode_token(token: str, expected: TokenType = "access") -> dict[str, Any]:
    """Validate a token and return its claims, or raise TokenError."""
    try:
        payload = jwt.decode(token, _secret(), algorithms=[settings.JWT_ALGORITHM])
    except jwt.ExpiredSignatureError as exc:
        raise TokenError("token has expired") from exc
    except jwt.InvalidTokenError as exc:
        raise TokenError("token is not valid") from exc
    if payload.get("typ") != expected:
        raise TokenError(f"expected a {expected} token")
    if not payload.get("sub"):
        raise TokenError("token has no subject")
    return payload