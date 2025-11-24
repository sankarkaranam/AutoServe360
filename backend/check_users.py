"""Quick script to check existing users and tenants in the database"""
import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text

async def check_users():
    db_url = "postgresql+asyncpg://postgres:postgres@localhost:5433/autoserve360"
    engine = create_async_engine(db_url)
    
    async with engine.begin() as conn:
        # Check tenants
        result = await conn.execute(text("SELECT id, name, code FROM tenants"))
        tenants = result.fetchall()
        print("TENANTS:")
        for t in tenants:
            print(f"  ID: {t[0]}, Name: {t[1]}, Code: {t[2]}")
        
        # Check users
        result = await conn.execute(text("SELECT id, email, role, tenant_id FROM users"))
        users = result.fetchall()
        print("\nUSERS:")
        for u in users:
            print(f"  Email: {u[1]}, Role: {u[2]}, Tenant: {u[3]}")
    
    await engine.dispose()

asyncio.run(check_users())
