import asyncio
import sys
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text

async def test_db_connection():
    """Test database connection and list tables"""
    db_url = "postgresql+asyncpg://postgres:postgres@localhost:5433/autoserve360"
    
    try:
        print(f"Connecting to: {db_url}")
        engine = create_async_engine(db_url, echo=True)
        
        async with engine.begin() as conn:
            # Test connection
            result = await conn.execute(text("SELECT version()"))
            version = result.scalar()
            print(f"\n✓ Connected to PostgreSQL!")
            print(f"Version: {version}\n")
            
            # List all tables
            result = await conn.execute(text("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public'
                ORDER BY table_name
            """))
            tables = result.fetchall()
            
            print("Tables in database:")
            for table in tables:
                print(f"  - {table[0]}")
            
            # Count invoices
            result = await conn.execute(text("SELECT COUNT(*) FROM invoices"))
            count = result.scalar()
            print(f"\nTotal invoices: {count}")
            
            # Show sample invoices
            if count > 0:
                result = await conn.execute(text("""
                    SELECT id, number, total_amount, status, issued_at 
                    FROM invoices 
                    ORDER BY issued_at DESC 
                    LIMIT 5
                """))
                invoices = result.fetchall()
                print("\nRecent invoices:")
                for inv in invoices:
                    print(f"  {inv[1]}: ${inv[2]} - {inv[3]} ({inv[4]})")
        
        await engine.dispose()
        return True
        
    except Exception as e:
        print(f"\n✗ Database connection failed!")
        print(f"Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = asyncio.run(test_db_connection())
    sys.exit(0 if success else 1)
