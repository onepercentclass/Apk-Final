import datetime as dt

from sqlalchemy import Date, Float, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base
from app.models.types import JsonType, Money


class Recipe(Base):
    __tablename__ = "recipes"

    id: Mapped[str] = mapped_column(String(32), primary_key=True)
    name: Mapped[str] = mapped_column(String(150))
    output_product_id: Mapped[str] = mapped_column(String(32))
    batch_size: Mapped[float] = mapped_column(Float)
    batch_unit: Mapped[str] = mapped_column(String(20))
    fill_per_unit: Mapped[float] = mapped_column(Float)
    packaging_material_id: Mapped[str | None] = mapped_column(String(32), nullable=True)
    packaging_qty_per_unit: Mapped[float] = mapped_column(Float, default=0)
    labor_cost: Mapped[float] = mapped_column(Money, default=0)
    overhead_cost: Mapped[float] = mapped_column(Money, default=0)
    ingredients: Mapped[list] = mapped_column(JsonType)    # [{material_id, percent}]


class Production(Base):
    __tablename__ = "productions"

    id: Mapped[str] = mapped_column(String(32), primary_key=True)
    code: Mapped[str] = mapped_column(String(40), unique=True)
    date: Mapped[dt.date] = mapped_column(Date, index=True)
    recipe_id: Mapped[str] = mapped_column(String(32))
    batches: Mapped[float] = mapped_column(Float)
    produced_qty: Mapped[float] = mapped_column(Float)
    total_cost: Mapped[float] = mapped_column(Money)
    cost_per_unit: Mapped[float] = mapped_column(Money)
