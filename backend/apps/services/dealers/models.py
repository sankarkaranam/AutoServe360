from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String
from apps.core.db import Base


class Tenant(Base):
    __tablename__ = "tenants"
    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    code: Mapped[str] = mapped_column(
        String(64), unique=True, index=True)  # dealer-001
    # backref to users
    users = relationship("User", back_populates="tenant", cascade="all,delete")
