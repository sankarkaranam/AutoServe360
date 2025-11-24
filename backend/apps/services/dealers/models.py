from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, DateTime, func
from sqlalchemy.dialects.postgresql import UUID
import uuid
from apps.core.db import Base

class Tenant(Base):
    __tablename__ = "tenants"
    
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    code: Mapped[str] = mapped_column(String(64), unique=True, index=True)  # dealer-001
    
    # Subscription fields
    plan_id: Mapped[str] = mapped_column(String, nullable=True) # Link to SubscriptionPlan.id manually or via FK if needed
    status: Mapped[str] = mapped_column(String(20), default="active") # active, suspended, cancelled
    subscription_start: Mapped[DateTime] = mapped_column(DateTime(timezone=True), nullable=True)
    subscription_end: Mapped[DateTime] = mapped_column(DateTime(timezone=True), nullable=True)
    is_active: Mapped[bool] = mapped_column(default=True)
    
    created_at = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at = mapped_column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())

    # backref to users
    users = relationship("User", back_populates="tenant", cascade="all,delete")
