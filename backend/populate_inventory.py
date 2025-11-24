import asyncio
import uuid
from sqlalchemy import select
from apps.core.db import async_session
from apps.services.dealers.models import Tenant
from apps.services.auth.models import User
from apps.services.inventory.models import InventoryItem
from decimal import Decimal

async def main():
    async with async_session() as session:
        # 1. Get Tenant
        stmt = select(Tenant).where(Tenant.code == "dealer-001")
        result = await session.execute(stmt)
        tenant = result.scalar_one_or_none()
        
        if not tenant:
            print("Tenant 'dealer-001' not found. Please run ensure_demo_data.py first.")
            return

        print(f"Adding inventory for tenant: {tenant.name} ({tenant.id})")

        # 2. Define sample items
        items = [
            {
                "name": "Synthetic Oil 5W-30",
                "sku": "OIL-SYN-5W30",
                "stock_quantity": 50,
                "price": 45.00,
                "low_stock_threshold": 10
            },
            {
                "name": "Oil Filter (Generic)",
                "sku": "FILT-OIL-GEN",
                "stock_quantity": 100,
                "price": 12.50,
                "low_stock_threshold": 20
            },
            {
                "name": "Brake Pads (Front)",
                "sku": "BRK-PAD-F",
                "stock_quantity": 20,
                "price": 85.00,
                "low_stock_threshold": 5
            },
            {
                "name": "Air Filter",
                "sku": "FILT-AIR",
                "stock_quantity": 30,
                "price": 18.00,
                "low_stock_threshold": 5
            },
            {
                "name": "Spark Plug",
                "sku": "SPK-PLG",
                "stock_quantity": 200,
                "price": 8.00,
                "low_stock_threshold": 40
            },
             {
                "name": "General Service (Labor)",
                "sku": "SVC-GEN",
                "stock_quantity": 9999, # Service has unlimited stock
                "price": 150.00,
                "low_stock_threshold": 0
            }
        ]

        count = 0
        for item_data in items:
            # Check if exists
            stmt_check = select(InventoryItem).where(
                InventoryItem.tenant_id == tenant.id,
                InventoryItem.sku == item_data["sku"]
            )
            res = await session.execute(stmt_check)
            existing = res.scalar_one_or_none()

            if not existing:
                new_item = InventoryItem(
                    id=uuid.uuid4(),
                    tenant_id=tenant.id,
                    name=item_data["name"],
                    sku=item_data["sku"],
                    stock_quantity=item_data["stock_quantity"],
                    price=Decimal(str(item_data["price"])),
                    low_stock_threshold=item_data["low_stock_threshold"]
                )
                session.add(new_item)
                count += 1
                print(f"Added: {item_data['name']}")
            else:
                print(f"Skipped (exists): {item_data['name']}")
        
        await session.commit()
        print(f"Done. Added {count} new inventory items.")

if __name__ == "__main__":
    asyncio.run(main())
