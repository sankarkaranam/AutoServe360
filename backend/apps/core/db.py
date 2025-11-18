# apps/core/db.py
from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base
from apps.core.config import settings

# Base for your models
Base = declarative_base()

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

# FastAPI dependency


async def get_session() -> AsyncGenerator[AsyncSession, None]:
    async with async_session() as session:
        yield session
