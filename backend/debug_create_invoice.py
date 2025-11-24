import asyncio
import uuid
import datetime as dt
from sqlalchemy import select
from apps.core.db import async_session
from apps.services.billing.models import Invoice, InvoiceItem
from apps.services.crm.models import Customer, Vehicle
from apps.services.dealers.models import Tenant
from apps.services.auth.models import User
from decimal import Decimal

async def main():
    async with async_session() as session:
        # 1. Get Tenant
        stmt = select(Tenant).where(Tenant.code == "dealer-001")
        result = await session.execute(stmt)
        tenant = result.scalar_one_or_none()
        if not tenant:
            print("Tenant not found")
            return

        # 2. Simulate create_invoice logic
        customer_name = "Debug Customer"
        mobile = "1234567890"
        email = "debug@example.com"
        vehicle_no = "DEBUG-01"
        items = [
            {
                "name": "Debug Item",
                "qty": 1,
                "rate": 100.0,
                "tax_rate": 18.0,
                "product_id": None
            }
        ]
        status = "PAID"

        # Find/Create Customer
        customer = Customer(
            id=uuid.uuid4(),
            tenant_id=tenant.id,
            name=customer_name,
            phone=mobile,
            email=email
        )
        session.add(customer)
        await session.flush()
        
        # Find/Create Vehicle
        vehicle = Vehicle(
            id=uuid.uuid4(),
            tenant_id=tenant.id,
            customer_id=customer.id,
            vin=vehicle_no,
            active=True
        )
        session.add(vehicle)
        await session.flush()

        # Calculate total
        total_amount = sum(item['qty'] * item['rate'] * (1 + item['tax_rate']/100) for item in items)
        
        # Create Invoice
        invoice = Invoice(
            id=uuid.uuid4(),
            tenant_id=tenant.id,
            customer_id=customer.id,
            vehicle_id=vehicle.id,
            number=f"INV-{int(dt.datetime.utcnow().timestamp())}",
            total_amount=total_amount,
            status=status,
            issued_at=dt.datetime.utcnow()
        )
        session.add(invoice)
        
        # Create Items
        for item_data in items:
            invoice_item = InvoiceItem(
                id=uuid.uuid4(),
                invoice_id=invoice.id,
                **item_data
            )
            session.add(invoice_item)
            
        try:
            await session.commit()
            print("Success!")
        except Exception as e:
            print(f"Error: {e}")
            import traceback
            traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(main())
