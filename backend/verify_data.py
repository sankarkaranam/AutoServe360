import asyncio
from sqlalchemy import text, select
from apps.core.db import async_session
from apps.services.billing.models import Invoice
from apps.services.inventory.models import InventoryItem

async def check_data():
    async with async_session() as session:
        # Check invoices
        result = await session.execute(select(Invoice))
        invoices = result.scalars().all()
        print(f"Found {len(invoices)} invoices")
        
        # Check inventory
        result = await session.execute(select(InventoryItem))
        items = result.scalars().all()
        print(f"Found {len(items)} inventory items")
        
        if invoices:
            print("\nSample invoices:")
            for inv in invoices[:3]:
                print(f"  - Invoice {inv.number}: ${inv.total_amount}")
        
        if items:
            print("\nSample inventory items:")
            for item in items[:3]:
                print(f"  - {item.name}: ${item.price} (stock: {item.stock_quantity})")

if __name__ == "__main__":
    asyncio.run(check_data())
