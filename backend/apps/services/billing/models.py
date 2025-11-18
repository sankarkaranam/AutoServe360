
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import String, Integer, ForeignKey, DateTime, Numeric
from apps.core.db import Base
import datetime as dt

class Invoice(Base):
    __tablename__ = "invoices"
    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    tenant_id: Mapped[str] = mapped_column(String(64), ForeignKey("tenants.id", ondelete="CASCADE"), index=True)
    customer_id: Mapped[str] = mapped_column(String(36), ForeignKey("customers.id", ondelete="SET NULL"), nullable=True, index=True)
    vehicle_id: Mapped[str] = mapped_column(String(36), ForeignKey("vehicles.id", ondelete="SET NULL"), nullable=True, index=True)
    number: Mapped[str] = mapped_column(String(32), unique=True, index=True)
    total_amount: Mapped[float] = mapped_column(Numeric(12,2), default=0)
    status: Mapped[str] = mapped_column(String(24), default="draft")  # draft, issued, paid, void
    issued_at: Mapped[dt.datetime] = mapped_column(DateTime, default=dt.datetime.utcnow)
    updated_at: Mapped[dt.datetime] = mapped_column(DateTime, default=dt.datetime.utcnow, onupdate=dt.datetime.utcnow)
