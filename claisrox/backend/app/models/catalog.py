from sqlalchemy import Float, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base
from app.models.types import Money


class Product(Base):
    __tablename__ = "products"

    id: Mapped[str] = mapped_column(String(32), primary_key=True)
    name: Mapped[str] = mapped_column(String(150))
    category: Mapped[str] = mapped_column(String(80))
    buy_price: Mapped[float] = mapped_column(Money)
    sell_price: Mapped[float] = mapped_column(Money)
    stock: Mapped[float] = mapped_column(Float)
    min_stock: Mapped[float] = mapped_column(Float)
    unit: Mapped[str] = mapped_column(String(20))


class Material(Base):
    __tablename__ = "materials"

    id: Mapped[str] = mapped_column(String(32), primary_key=True)
    name: Mapped[str] = mapped_column(String(150))
    unit: Mapped[str] = mapped_column(String(20))
    price: Mapped[float] = mapped_column(Money)
    stock: Mapped[float] = mapped_column(Float)
    min_stock: Mapped[float] = mapped_column(Float)
