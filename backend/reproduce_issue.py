import asyncio
import uuid
import datetime as dt
from sqlalchemy import select, text
from apps.core.db import engine, async_session
from apps.services.inventory.models import InventoryItem
from apps.services.billing.models import Invoice, InvoiceItem
from apps.services.crm.models import Customer
from apps.services.dealers.models import Tenant
from apps.services.auth.models import User

# Mock user tenant_id
TENANT_ID = uuid.UUID("aef19a91-9890-4822-98b0-eeee6af4c8bf") # Using the one from the error log in previous turn if possible, or just a new one. 
# Actually, I need a valid tenant_id. Let's query one.

async def test_inventory_and_history():
    async with async_session() as session:
        # 1. Get a valid tenant_id (or create one if needed, but assuming one exists from previous context)
        # For this test, I'll just pick the first tenant found or create a dummy one if I could, 
        # but I can't easily create a tenant without a user. 
        # Let's try to find a tenant.
        result = await session.execute(text("SELECT id FROM tenants LIMIT 1"))
        tenant_id_row = result.scalar()
        
        if not tenant_id_row:
            print("No tenant found! Creating one...")
            tenant_id = uuid.uuid4()
            from sqlalchemy import insert, table, column
            # We need to insert raw sql or use a model if available. 
            # Since Tenant model is not imported, let's use raw SQL for simplicity or import it.
            # Better to import it if possible, but let's use raw SQL to avoid more imports.
            await session.execute(
                text("INSERT INTO tenants (id, name, code, created_at, updated_at) VALUES (:id, :name, :code, NOW(), NOW())"),
                {"id": tenant_id, "name": "Test Tenant", "code": "TEST001"}
            )
            await session.commit()
            print(f"Created new Tenant: {tenant_id}")
        else:
            # Ensure tenant_id is UUID
            if isinstance(tenant_id_row, str):
                tenant_id = uuid.UUID(tenant_id_row)
            else:
                tenant_id = tenant_id_row
            
        print(f"Using Tenant ID: {tenant_id}")

        # 2. Create an Inventory Item
        product_id = uuid.uuid4()
        initial_stock = 10
        inv_item = InventoryItem(
            id=product_id,
            tenant_id=tenant_id,
            name="Test Product",
            stock_quantity=initial_stock,
            price=100.0
        )
        session.add(inv_item)
        await session.commit()
        print(f"Created Inventory Item: {product_id} with stock {initial_stock}")

        # 3. Create an Invoice using this item
        # We need to simulate the logic in create_invoice router
        # But since I can't easily call the router function directly without mocking Depends,
        # I will replicate the logic here to test the SQLAlchemy part.
        
        # ... Logic from create_invoice ...
        invoice_id = uuid.uuid4()
        customer_id = uuid.uuid4()
        
        # Create dummy customer
        customer = Customer(
            id=customer_id,
            tenant_id=tenant_id,
            name="Test Customer",
            phone="1234567890"
        )
        session.add(customer)
        await session.flush()
        
        invoice = Invoice(
            id=invoice_id,
            tenant_id=tenant_id,
            customer_id=customer_id,
            number=f"INV-TEST-{int(dt.datetime.utcnow().timestamp())}",
            total_amount=100.0,
            status="paid"
        )
        session.add(invoice)
        
        invoice_item = InvoiceItem(
            id=uuid.uuid4(),
            invoice_id=invoice_id,
            product_id=product_id, # Link to inventory
            name="Test Product",
            qty=2,
            rate=100.0,
            amount=200.0
        )
        session.add(invoice_item)
        
        # THE CRITICAL PART: Reduce stock
        # Replicating the router logic:
        # Find inventory item
        inv_query = select(InventoryItem).where(
            InventoryItem.id == product_id,
            InventoryItem.tenant_id == tenant_id
        )
        result = await session.execute(inv_query)
        fetched_inv_item = result.scalar_one_or_none()
        
        if fetched_inv_item:
            print(f"Found inventory item for update. Current stock: {fetched_inv_item.stock_quantity}")
            fetched_inv_item.stock_quantity -= 2
            if fetched_inv_item.stock_quantity < 0:
                fetched_inv_item.stock_quantity = 0
            print(f"Updated stock to: {fetched_inv_item.stock_quantity}")
        else:
            print("FAILED to find inventory item for update!")

        await session.commit()
        
        # 4. Verify Stock in DB
        # Create new session to ensure fresh data
        async with async_session() as verify_session:
            result = await verify_session.execute(
                select(InventoryItem).where(InventoryItem.id == product_id)
            )
            final_inv_item = result.scalar_one()
            print(f"Final Stock in DB: {final_inv_item.stock_quantity}")
            
            if final_inv_item.stock_quantity == initial_stock - 2:
                print("✅ Stock update SUCCESS")
            else:
                print("❌ Stock update FAILED")
                
            # 5. Verify Transaction Listing
            # Replicating list_invoices query
            result = await verify_session.execute(
                select(Invoice, Customer)
                .outerjoin(Customer, Invoice.customer_id == Customer.id)
                .where(Invoice.tenant_id == tenant_id)
                .order_by(Invoice.issued_at.desc())
            )
            invoices = result.all()
            print(f"Found {len(invoices)} invoices in history")
            found = False
            for inv, cust in invoices:
                if inv.id == invoice_id:
                    found = True
                    print(f"✅ Found created invoice: {inv.number}")
                    break
            if not found:
                print("❌ Created invoice NOT found in history")

if __name__ == "__main__":
    asyncio.run(test_inventory_and_history())
