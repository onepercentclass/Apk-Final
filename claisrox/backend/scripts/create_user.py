"""Membuat user. Contoh owner:  python -m scripts.create_user owner --tier 0 --name "Pemilik Claisrox" """
import argparse
import getpass

from sqlalchemy import select

from app import models  # noqa: F401
from app.access import load_tiers
from app.database import Base, SessionLocal, engine
from app.models import User
from app.security import hash_password


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("username")
    parser.add_argument("--name", required=True)
    parser.add_argument("--tier", type=int, default=0, choices=sorted(load_tiers()))
    args = parser.parse_args()

    password = getpass.getpass("Password: ")
    if len(password) < 8:
        raise SystemExit("Password minimal 8 karakter")

    Base.metadata.create_all(engine)
    with SessionLocal() as db:
        if db.scalar(select(User).where(User.username == args.username)):
            raise SystemExit(f"User '{args.username}' sudah ada")
        db.add(User(username=args.username, name=args.name, tier=args.tier, password_hash=hash_password(password)))
        db.commit()
    print(f"User '{args.username}' (tier {args.tier}) dibuat.")


if __name__ == "__main__":
    main()
