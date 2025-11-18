import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
import os

DB_URL = os.getenv("DB_URL")
if not DB_URL:
    raise SystemExit("Set DB_URL in your environment or .env")


async def main():
    engine = create_async_engine(DB_URL, future=True)
    async with engine.begin() as conn:
        await conn.run_sync(lambda sync_conn: sync_conn.exec_driver_sql("DROP TABLE IF EXISTS alembic_version;"))
    await engine.dispose()
    print("Dropped alembic_version")

if __name__ == "__main__":
    asyncio.run(main())
