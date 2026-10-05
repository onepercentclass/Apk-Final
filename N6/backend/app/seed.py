"""
Create the schema and the first two accounts.

    cd backend
    python -m app.seed            # create tables if absent, add owner + admin
    python -m app.seed --reset    # drop and recreate everything first

Safe to re-run. Each account is created only if its username is free, so
running this after adding staff accounts does nothing.

The tier ladder, for the two accounts it creates:

    tier 0  owner       reaches every menu and every action
    tier 1  admin       sees tier-1-admin.json

Tier 0 has no JSON file on purpose - `core/tiers.py` treats owner as the
implicit all-access case and refuses to load a file for it. That is why the
owner is created here, by the bootstrap, and not through `POST /accounts`:
`AccountCreate` rejects tier 0 for exactly that reason.
"""

from __future__ import annotations

import argparse
import sys

from sqlalchemy import select
from sqlalchemy.orm import Session

from .core.config import settings
from .core.security import hash_password
from .core.tiers import TIER_ADMIN, TIER_OWNER, load_tiers
from .db.base import Base
from .db.models import Account
from .db.session import SessionLocal, engine


def create_schema(reset: bool = False) -> None:
    """
    Create every table.

    `Base.metadata.create_all` rather than Alembic: this is the first-run path
    for a schema that is still moving, and `alembic revision --autogenerate`
    becomes the right answer the first time a deployment needs to change one.
    The naming convention in db/base.py exists so that switch produces stable
    constraint names.
    """
    if reset:
        print("dropping every table ...")
        Base.metadata.drop_all(engine)
    Base.metadata.create_all(engine)
    print(f"schema ready at {engine.url.render_as_string(hide_password=True)}")


def ensure_account(
    db: Session,
    *,
    username: str,
    password: str,
    full_name: str,
    tier: int,
) -> bool:
    """Create the account if the username is free. Returns True if created."""
    existing = db.scalar(select(Account).where(Account.username == username))
    if existing is not None:
        print(f"  {username:<12} already exists (tier {existing.tier}), left alone")
        return False

    db.add(
        Account(
            username=username,
            full_name=full_name,
            password_hash=hash_password(password),
            tier=tier,
            is_active=True,
        )
    )
    print(f"  {username:<12} created (tier {tier})")
    return True


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Create the N6 schema and first accounts.")
    parser.add_argument(
        "--reset",
        action="store_true",
        help="drop all tables first. Destroys every row.",
    )
    args = parser.parse_args(argv)

    print(f"{settings.APP_NAME} {settings.VERSION} - seed ({settings.ENVIRONMENT})")

    # Fail here, with the file name, rather than at the first request.
    matrix = load_tiers(refresh=True)
    print("access matrix: " + ", ".join(f"t{t}={m.role}" for t, m in sorted(matrix.items())))

    create_schema(reset=args.reset)

    print("accounts:")
    with SessionLocal() as db:
        created_owner = ensure_account(
            db,
            username=settings.SEED_OWNER_USERNAME,
            password=settings.SEED_OWNER_PASSWORD,
            full_name="Owner N6",
            tier=TIER_OWNER,
        )
        ensure_account(
            db,
            username=settings.SEED_ADMIN_USERNAME,
            password=settings.SEED_ADMIN_PASSWORD,
            full_name="Admin N6",
            tier=TIER_ADMIN,
        )
        db.commit()

    if created_owner:
        print()
        print("Sign in at POST /api/v1/auth/login with the owner credentials above.")
        print("Change them before this reaches anything other than localhost.")
    return 0


if __name__ == "__main__":
    sys.exit(main())