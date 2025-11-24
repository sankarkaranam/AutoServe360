from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import String, Integer, Float, DateTime, Boolean, UUID, ForeignKey, Enum
from apps.core.db import Base
import datetime as dt
import enum

class VehicleStatus(str, enum.Enum):
    IN_STOCK = "IN_STOCK"
    SOLD = "SOLD"
    RESERVED = "RESERVED"

class VehicleInventory(Base):
    __tablename__ = "vehicle_inventory"
    
    id: Mapped[str] = mapped_column(UUID, primary_key=True)
    tenant_id: Mapped[str] = mapped_column(UUID, ForeignKey("tenants.id", ondelete="CASCADE"), index=True)
    
    make: Mapped[str] = mapped_column(String(100), nullable=False)
    model: Mapped[str] = mapped_column(String(100), nullable=False)
    year: Mapped[int] = mapped_column(Integer, nullable=False)
    color: Mapped[str] = mapped_column(String(50), nullable=True)
    
    vin: Mapped[str] = mapped_column(String(64), nullable=True, index=True)
    chassis_number: Mapped[str] = mapped_column(String(64), nullable=True, index=True)
    
    status: Mapped[VehicleStatus] = mapped_column(String(20), default=VehicleStatus.IN_STOCK)
    
    cost_price: Mapped[float] = mapped_column(Float, nullable=True)
    selling_price: Mapped[float] = mapped_column(Float, nullable=True)
    
    arrival_date: Mapped[dt.datetime] = mapped_column(DateTime, default=dt.datetime.utcnow)
    created_at: Mapped[dt.datetime] = mapped_column(DateTime, default=dt.datetime.utcnow)
    updated_at: Mapped[dt.datetime] = mapped_column(DateTime, default=dt.datetime.utcnow, onupdate=dt.datetime.utcnow)
