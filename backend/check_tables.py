import asyncio
from sqlalchemy import text
from apps.core.db import async_session

async def check_tables():
    async with async_session() as session:
        result = await session.execute(text("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name;
        """))
        tables = result.fetchall()
        print("Existing tables:")
        for table in tables:
            print(f"  - {table[0]}")

if __name__ == "__main__":
    asyncio.run(check_tables())
