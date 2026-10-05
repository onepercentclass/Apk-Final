from app.schemas.base import CamelModel


class FinanceSchema(CamelModel):
    modal: float = 0
    piutang: float = 0
    hutang: float = 0
