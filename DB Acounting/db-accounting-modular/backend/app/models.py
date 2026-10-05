"""Model relasional. Payload akuntansi per perusahaan disimpan sebagai JSONB
agar mirror 1:1 dengan objek company di frontend (coa, journal, sales,
purchases, cashbank, contacts, inventory, inventoryLogs, fixedAssets,
counters). Agregasi berat (laporan) tetap bisa dipindah ke tabel
relasional bertahap tanpa mengubah kontrak API."""
import uuid

from sqlalchemy import JSON, Column, DateTime, Integer, String, func

from .database import Base


def _uuid():
    return str(uuid.uuid4())


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=_uuid)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    tier = Column(Integer, nullable=False, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Company(Base):
    __tablename__ = "companies"

    id = Column(String, primary_key=True)
    owner_id = Column(String, index=True, nullable=True)
    name = Column(String, nullable=False)
    industry = Column(String, default="")
    color = Column(String, default="#1EB682")
    initial = Column(String, default="")
    payload = Column(JSON, nullable=False, default=dict)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
