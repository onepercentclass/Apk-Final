import datetime as dt

from sqlalchemy import Date, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class Supplier(Base):
    __tablename__ = "suppliers"

    id: Mapped[str] = mapped_column(String(32), primary_key=True)
    name: Mapped[str] = mapped_column(String(150))
    contact: Mapped[str] = mapped_column(String(50))
    product: Mapped[str] = mapped_column(String(200))
    status: Mapped[str] = mapped_column(String(20))
    created_at: Mapped[dt.date] = mapped_column(Date)


class Customer(Base):
    __tablename__ = "customers"

    id: Mapped[str] = mapped_column(String(32), primary_key=True)
    name: Mapped[str] = mapped_column(String(150))
    contact: Mapped[str] = mapped_column(String(50))
    type: Mapped[str] = mapped_column(String(30))
    created_at: Mapped[dt.date] = mapped_column(Date)
