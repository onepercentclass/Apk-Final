"""Tabel database. Data keuangan selalu milik satu user (user_id); id baris dibuat oleh frontend."""
import datetime as dt

from sqlalchemy import BigInteger, Boolean, Date, Float, ForeignKey, ForeignKeyConstraint, Index, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from .database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    username: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(256))
    name: Mapped[str] = mapped_column(String(120))
    tier: Mapped[int] = mapped_column(Integer, default=0)
    theme: Mapped[str] = mapped_column(String(10), default="dark")
    hide_balance: Mapped[bool] = mapped_column(Boolean, default=False)


class Account(Base):
    __tablename__ = "accounts"

    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    id: Mapped[str] = mapped_column(String(40), primary_key=True)
    position: Mapped[int] = mapped_column(Integer, default=0)
    name: Mapped[str] = mapped_column(String(30))
    type: Mapped[str] = mapped_column(String(10))
    number: Mapped[str] = mapped_column(String(24), default="")
    color: Mapped[str] = mapped_column(String(9))
    opening_balance: Mapped[int] = mapped_column(BigInteger, default=0)


class Transaction(Base):
    __tablename__ = "transactions"
    __table_args__ = (
        ForeignKeyConstraint(["user_id", "account_id"], ["accounts.user_id", "accounts.id"]),
        ForeignKeyConstraint(["user_id", "from_account_id"], ["accounts.user_id", "accounts.id"]),
        ForeignKeyConstraint(["user_id", "to_account_id"], ["accounts.user_id", "accounts.id"]),
        Index("ix_transactions_user_date", "user_id", "date"),
    )

    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    id: Mapped[str] = mapped_column(String(40), primary_key=True)
    ts: Mapped[int] = mapped_column(BigInteger)
    type: Mapped[str] = mapped_column(String(3))  # in | out | tf
    category: Mapped[str | None] = mapped_column(String(30), nullable=True)
    amount: Mapped[int] = mapped_column(BigInteger)
    date: Mapped[dt.date] = mapped_column(Date)
    description: Mapped[str] = mapped_column(String(500), default="")
    account_id: Mapped[str | None] = mapped_column(String(40), nullable=True)
    from_account_id: Mapped[str | None] = mapped_column(String(40), nullable=True)
    to_account_id: Mapped[str | None] = mapped_column(String(40), nullable=True)


class Budget(Base):
    __tablename__ = "budgets"

    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    category: Mapped[str] = mapped_column(String(30), primary_key=True)
    limit: Mapped[int] = mapped_column(BigInteger, default=0)


class Bill(Base):
    __tablename__ = "bills"

    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    id: Mapped[str] = mapped_column(String(40), primary_key=True)
    position: Mapped[int] = mapped_column(Integer, default=0)
    name: Mapped[str] = mapped_column(String(120))
    amount: Mapped[int] = mapped_column(BigInteger)
    due_date: Mapped[dt.date] = mapped_column(Date)
    icon: Mapped[str] = mapped_column(String(20))
    color: Mapped[str] = mapped_column(String(9))


class Goal(Base):
    __tablename__ = "goals"

    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    id: Mapped[str] = mapped_column(String(40), primary_key=True)
    position: Mapped[int] = mapped_column(Integer, default=0)
    name: Mapped[str] = mapped_column(String(120))
    saved: Mapped[int] = mapped_column(BigInteger, default=0)
    target: Mapped[int] = mapped_column(BigInteger)
    icon: Mapped[str] = mapped_column(String(20))
    color: Mapped[str] = mapped_column(String(9))


class Investment(Base):
    __tablename__ = "investments"

    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    id: Mapped[str] = mapped_column(String(40), primary_key=True)
    position: Mapped[int] = mapped_column(Integer, default=0)
    name: Mapped[str] = mapped_column(String(120))
    value: Mapped[int] = mapped_column(BigInteger)
    return_pct: Mapped[float] = mapped_column(Float, default=0)
    icon: Mapped[str] = mapped_column(String(20))
    color: Mapped[str] = mapped_column(String(9))
