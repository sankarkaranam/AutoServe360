
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import String, Integer, ForeignKey, DateTime, Numeric, UUID
from apps.core.db import Base
import datetime as dt

class Invoice(Base):
    __tablename__ = "invoices"
    id: Mapped[str] = mapped_column(UUID, primary_key=True)
    tenant_id: Mapped[str] = mapped_column(UUID, ForeignKey("tenants.id", ondelete="CASCADE"), index=True)
    customer_id: Mapped[str] = mapped_column(UUID, ForeignKey("customers.id", ondelete="SET NULL"), nullable=True, index=True)
    vehicle_id: Mapped[str] = mapped_column(UUID, ForeignKey("vehicles.id", ondelete="SET NULL"), nullable=True, index=True)
    number: Mapped[str] = mapped_column(String(32), unique=True, index=True)
    total_amount: Mapped[float] = mapped_column(Numeric(12,2), default=0)
    status: Mapped[str] = mapped_column(String(24), default="draft")  # draft, issued, paid, void
    issued_at: Mapped[dt.datetime] = mapped_column(DateTime, default=dt.datetime.utcnow)
    updated_at: Mapped[dt.datetime] = mapped_column(DateTime, default=dt.datetime.utcnow, onupdate=dt.datetime.utcnow)

class InvoiceItem(Base):
    __tablename__ = "invoice_items"
    id: Mapped[str] = mapped_column(UUID, primary_key=True)
    invoice_id: Mapped[str] = mapped_column(UUID, ForeignKey("invoices.id", ondelete="CASCADE"), index=True)
    product_id: Mapped[str] = mapped_column(UUID, nullable=True)  # optional link to inventory
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    qty: Mapped[int] = mapped_column(Integer, default=1)
    rate: Mapped[float] = mapped_column(Numeric(12,2), default=0)
    tax_rate: Mapped[float] = mapped_column(Numeric(5,2), default=0)  # percentage
    amount: Mapped[float] = mapped_column(Numeric(12,2), default=0)  # qty * rate * (1 + tax_rate/100)

class SubscriptionPlan(Base):
    __tablename__ = "subscription_plans"
    id: Mapped[str] = mapped_column(String, primary_key=True) # basic, standard, premium
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    price: Mapped[float] = mapped_column(Numeric(10,2), default=0)
    features: Mapped[str] = mapped_column(String(500), nullable=True) # JSON or comma-separated
    is_active: Mapped[bool] = mapped_column(default=True)
