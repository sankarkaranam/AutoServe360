from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import UniqueConstraint, String, Integer, ForeignKey, DateTime, Boolean, UUID, Enum
from apps.core.db import Base
import datetime as dt
import enum

class LeadStatus(str, enum.Enum):
    NEW = "NEW"
    CONTACTED = "CONTACTED"
    FOLLOW_UP = "FOLLOW_UP"
    QUALIFIED = "QUALIFIED"
    CONVERTED = "CONVERTED"
    LOST = "LOST"

class LeadSource(str, enum.Enum):
    WALK_IN = "WALK_IN"
    WEBSITE = "WEBSITE"
    REFERRAL = "REFERRAL"
    PHONE = "PHONE"
    SOCIAL_MEDIA = "SOCIAL_MEDIA"

class Lead(Base):
    __tablename__ = "leads"
    
    id: Mapped[str] = mapped_column(UUID, primary_key=True)
    tenant_id: Mapped[str] = mapped_column(UUID, ForeignKey("tenants.id", ondelete="CASCADE"), index=True)
    
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    phone: Mapped[str] = mapped_column(String(20), nullable=True)
    email: Mapped[str] = mapped_column(String(255), nullable=True)
    
    source: Mapped[LeadSource] = mapped_column(String(50), default=LeadSource.WALK_IN)
    status: Mapped[LeadStatus] = mapped_column(String(50), default=LeadStatus.NEW)
    
    vehicle_of_interest: Mapped[str] = mapped_column(String(255), nullable=True)
    notes: Mapped[str] = mapped_column(String, nullable=True)
    
    follow_up_date: Mapped[dt.datetime] = mapped_column(DateTime, nullable=True)
    assigned_to: Mapped[str] = mapped_column(String(255), nullable=True)
    
    converted_at: Mapped[dt.datetime] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[dt.datetime] = mapped_column(DateTime, default=dt.datetime.utcnow)
    updated_at: Mapped[dt.datetime] = mapped_column(DateTime, default=dt.datetime.utcnow, onupdate=dt.datetime.utcnow)

class Customer(Base):
    __tablename__ = "customers"
    
    id: Mapped[str] = mapped_column(UUID, primary_key=True)
    tenant_id: Mapped[str] = mapped_column(UUID, ForeignKey("tenants.id", ondelete="CASCADE"), index=True)
    lead_id: Mapped[str] = mapped_column(UUID, ForeignKey("leads.id", ondelete="SET NULL"), nullable=True)
    
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str] = mapped_column(String(255), nullable=True)
    phone: Mapped[str] = mapped_column(String(20), nullable=True)
    
    address: Mapped[str] = mapped_column(String(500), nullable=True)
    city: Mapped[str] = mapped_column(String(100), nullable=True)
    state: Mapped[str] = mapped_column(String(100), nullable=True)
    pincode: Mapped[str] = mapped_column(String(10), nullable=True)
    
    dob: Mapped[dt.date] = mapped_column(DateTime, nullable=True)
    
    created_at: Mapped[dt.datetime] = mapped_column(DateTime, default=dt.datetime.utcnow)
    updated_at: Mapped[dt.datetime] = mapped_column(DateTime, default=dt.datetime.utcnow, onupdate=dt.datetime.utcnow)

class Vehicle(Base):
    __tablename__ = "vehicles"
    id: Mapped[str] = mapped_column(UUID, primary_key=True)
    tenant_id: Mapped[str] = mapped_column(UUID, ForeignKey("tenants.id", ondelete="CASCADE"), index=True)
    customer_id: Mapped[str] = mapped_column(UUID, ForeignKey("customers.id", ondelete="CASCADE"), index=True)
    make: Mapped[str] = mapped_column(String(100), nullable=True)
    model: Mapped[str] = mapped_column(String(100), nullable=True)
    year: Mapped[int] = mapped_column(Integer, nullable=True)
    vin: Mapped[str] = mapped_column(String(64), nullable=True, index=True)
    van_number: Mapped[str] = mapped_column(String(64), nullable=True)
    chassis_number: Mapped[str] = mapped_column(String(64), nullable=True)
    purchase_date: Mapped[dt.datetime] = mapped_column(DateTime, nullable=True)
    active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[dt.datetime] = mapped_column(DateTime, default=dt.datetime.utcnow)
    updated_at: Mapped[dt.datetime] = mapped_column(DateTime, default=dt.datetime.utcnow, onupdate=dt.datetime.utcnow)

    customer = relationship("Customer")
