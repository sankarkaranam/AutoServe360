from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, ForeignKey
from apps.core.db import Base, BaseMixin

class User(BaseMixin, Base):
    __tablename__ = "users"
    
    # BaseMixin provides id, tenant_id, created_at, updated_at
    # We need to override tenant_id to add the ForeignKey constraint
    
    # Note: In SQLAlchemy, if we want to add a ForeignKey to a column defined in a Mixin,
    # we might need to redeclare it or use @declared_attr. 
    # But for simplicity in this setup, let's see if we can just add the constraint or if we need to redefine.
    # A common pattern with Mixins is to allow the Mixin to define the column, but here we want a FK.
    # Let's redefine tenant_id here to be explicit about the FK.
    
    from sqlalchemy.dialects.postgresql import UUID
    
    tenant_id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False, index=True
    )
    
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    username: Mapped[str] = mapped_column(String(100), nullable=True)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(String(32), nullable=False, default="dealer_admin")

    tenant = relationship("Tenant", back_populates="users")
