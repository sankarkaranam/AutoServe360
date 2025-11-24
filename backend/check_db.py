import asyncio
from apps.core.db import async_session
from sqlalchemy import text

async def main():
    async with async_session() as s:
        r = await s.execute(text("SELECT email, tenant_id FROM users"))
        rows = r.fetchall()
        print("Users:")
        for row in rows:
            print(row)

if __name__ == "__main__":
    asyncio.run(main())
