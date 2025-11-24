import asyncio
from apps.core.db import engine, Base

from apps.services.dealers.models import Tenant
from apps.services.auth.models import User
from apps.services.crm.models import Customer, Vehicle
from apps.services.billing.models import Invoice, InvoiceItem
from apps.services.inventory.models import InventoryItem
from apps.services.features.models import FeatureFlag

async def create_all_tables():
    print("Creating all database tables...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("All tables created successfully!")

if __name__ == "__main__":
    asyncio.run(create_all_tables())
