# apps/core/db.py
from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base
from apps.core.config import settings


from sqlalchemy import Column, String, DateTime, func
from sqlalchemy.dialects.postgresql import UUID
import uuid

# Base for your models
Base = declarative_base()

class BaseMixin:
    """
    Standard mixin for all tables:
    - id (UUID pk)
    - tenant_id (UUID, required for A1 multi-tenancy)
    - created_at
    - updated_at
    """
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())

# Async engine (PostgreSQL async driver)
engine = create_async_engine(
    settings.DB_URL,  # e.g. postgresql+asyncpg://user:pass@localhost:5432/db
    echo=False,
    future=True,
)

# Session factory
async_session = async_sessionmaker(
    bind=engine,
    expire_on_commit=False,
    class_=AsyncSession,
)


async def get_session() -> AsyncGenerator[AsyncSession, None]:
    async with async_session() as session:
        yield session
