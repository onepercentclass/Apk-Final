from sqlalchemy import JSON, Numeric
from sqlalchemy.dialects.postgresql import JSONB

# JSONB di PostgreSQL, JSON biasa di database lain.
JsonType = JSON().with_variant(JSONB(), "postgresql")

# Uang dalam rupiah; asdecimal=False agar langsung float seperti di frontend.
Money = Numeric(16, 2, asdecimal=False)
