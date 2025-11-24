"""
Initialize the database schema by creating all tables from SQLAlchemy models.
"""
import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from apps.core.config import settings
from apps.core.db import Base

# Import all models to ensure they're registered with Base
from apps.services.dealers.models import Tenant
from apps.services.auth.models import User

async def init_db():
    """Create all tables in the database."""
    engine = create_async_engine(settings.DB_URL, echo=True)
    
    async with engine.begin() as conn:
        # Drop all tables (for development only!)
        await conn.run_sync(Base.metadata.drop_all)
        # Create all tables
        await conn.run_sync(Base.metadata.create_all)
    
    await engine.dispose()
    print("✅ Database schema created successfully!")

if __name__ == "__main__":
    asyncio.run(init_db())
