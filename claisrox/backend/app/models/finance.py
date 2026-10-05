from sqlalchemy import Integer
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base
from app.models.types import Money

FINANCE_ROW_ID = 1


class Finance(Base):
    """Satu baris saja: modal, piutang, hutang."""

    __tablename__ = "finance"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, default=FINANCE_ROW_ID)
    modal: Mapped[float] = mapped_column(Money, default=0)
    piutang: Mapped[float] = mapped_column(Money, default=0)
    hutang: Mapped[float] = mapped_column(Money, default=0)
