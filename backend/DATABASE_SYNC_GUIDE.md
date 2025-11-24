# Database Schema Sync Issues - Understanding & Prevention

## 🤔 Why This Happens Frequently

### The Problem
You're experiencing **database schema drift** - when your database structure doesn't match what your code expects. This is one of the most common issues in development environments.

### Root Causes

#### 1. **Multiple Sources of Truth**
Your project has THREE ways the database schema can be defined:
- **SQLAlchemy Models** (`apps/services/*/models.py`) - What the code expects
- **Alembic Migrations** (`migrations/versions/*.py`) - Version-controlled schema changes
- **Actual Database** - What PostgreSQL actually has

When these get out of sync, you get errors like:
```
column tenants.plan_id does not exist
HINT: Perhaps you meant to reference the column "tenants.plan"
```

#### 2. **Port Configuration Confusion**
```
Docker PostgreSQL:  5432 (inside) → 5433 (host)
Local PostgreSQL:   5432
Your .env had:      5433 ❌
```

This causes connection failures because the backend tries to connect to the wrong port.

#### 3. **Incomplete Migration Workflow**
```
Developer updates model → Forgets to create migration → Database stays old → Code crashes
```

## 🔄 How Schema Drift Happens

```mermaid
graph TD
    A[Developer Updates Model] -->|Adds new column| B[Code Expects New Schema]
    B --> C{Migration Created?}
    C -->|No ❌| D[Database Has Old Schema]
    C -->|Yes ✅| E[Migration Run?]
    E -->|No ❌| D
    E -->|Yes ✅| F[Database Updated]
    D --> G[Backend Crashes on Startup]
    F --> H[Everything Works]
    
    style D fill:#f99
    style G fill:#f99
    style F fill:#9f9
    style H fill:#9f9
```

## 🛠️ Solutions & Best Practices

### Option 1: Use Docker Compose (Recommended)

**Why:** Ensures consistent environment across all developers and deployments.

```bash
# Start all services (database, backend, frontend)
docker-compose up -d

# Run migrations
docker-compose exec backend alembic upgrade head

# Create demo data
docker-compose exec backend python ensure_demo_data.py

# View logs
docker-compose logs -f backend

# Reset everything
docker-compose down -v  # Removes volumes (database data)
docker-compose up -d
```

**Pros:**
- ✅ Everyone has the same PostgreSQL version
- ✅ No port conflicts with local PostgreSQL
- ✅ Easy to reset: just delete volumes
- ✅ Matches production environment

**Cons:**
- ❌ Slower startup than local
- ❌ Requires Docker Desktop running

### Option 2: Local PostgreSQL (Current Setup)

**Why:** Faster development, no Docker overhead.

#### Quick Reset Script

I've created [`reset_db.sh`](file:///Users/sankarkaranam/Documents/Projects/GrowthQ/AutoServe360/backend/reset_db.sh) for you:

```bash
cd backend
./reset_db.sh
```

This will:
1. Drop the database
2. Create a fresh one
3. Initialize the schema from models
4. Create demo data

#### Manual Steps

```bash
# 1. Stop backend server (Ctrl+C)

# 2. Reset database
psql -h localhost -p 5432 -U postgres -c "DROP DATABASE IF EXISTS autoserve360;"
psql -h localhost -p 5432 -U postgres -c "CREATE DATABASE autoserve360;"

# 3. Initialize schema
cd backend
source ./venv/bin/activate
python init_db.py

# 4. Create demo data
python ensure_demo_data.py

# 5. Restart backend
./venv/bin/python run.py
```

### Option 3: Fix Alembic Migrations (Long-term Solution)

The proper way to handle schema changes:

#### When You Change a Model:

```bash
# 1. Update your model (e.g., add a new column)
# apps/services/dealers/models.py
class Tenant(Base):
    # ... existing fields ...
    new_field: Mapped[str] = mapped_column(String(100), nullable=True)

# 2. Create a migration
cd backend
source ./venv/bin/activate
alembic revision --autogenerate -m "add new_field to tenant"

# 3. Review the generated migration
# Check migrations/versions/xxxxx_add_new_field_to_tenant.py

# 4. Apply the migration
alembic upgrade head

# 5. Commit both the model change AND the migration
git add apps/services/dealers/models.py
git add migrations/versions/xxxxx_add_new_field_to_tenant.py
git commit -m "Add new_field to Tenant model"
```

#### Current Migration Issues

Your Alembic migrations have problems:
- They try to alter tables before creating them
- Migration order is wrong
- Some migrations reference old schema

**To fix this properly**, you would need to:
1. Delete all migration files
2. Recreate a single "initial" migration from current models
3. Use that going forward

But for now, using `init_db.py` is simpler and works fine for development.

## 📋 Recommended Workflow

### Daily Development

```bash
# Morning: Start servers
cd frontend && npm run dev &
cd backend && source ./venv/bin/activate && ./venv/bin/python run.py &

# If you get database errors:
cd backend && ./reset_db.sh
```

### When Changing Models

**Option A: Quick & Dirty (Development)**
```bash
./reset_db.sh  # Recreates everything from scratch
```

**Option B: Proper Way (Production-ready)**
```bash
alembic revision --autogenerate -m "description"
alembic upgrade head
```

### Before Committing Code

```bash
# Make sure migrations are included
git status
# Should see both:
# - Modified model files
# - New migration files (if you changed schema)
```

## 🎯 Quick Reference

| Situation | Command |
|-----------|---------|
| Database out of sync | `./reset_db.sh` |
| Port connection error | Check `.env` has port `5432` |
| "Column does not exist" | `./reset_db.sh` |
| Fresh start | `./reset_db.sh` |
| Proper schema change | `alembic revision --autogenerate -m "msg"` |

## 🔧 Environment Configuration

### Backend `.env` (Local PostgreSQL)
```bash
DB_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/autoserve360
```

### Backend `.env` (Docker Compose)
```bash
DB_URL=postgresql+asyncpg://postgres:postgres@db:5432/autoserve360
```

### Frontend `.env.local` (Optional)
```bash
NEXT_PUBLIC_API_BASE=http://localhost:8000/api
```

## 🚨 Common Errors & Fixes

### Error: "Connection refused"
**Cause:** Wrong port or PostgreSQL not running  
**Fix:** 
```bash
# Check PostgreSQL is running
pg_isready -h localhost -p 5432

# If not running (local):
brew services start postgresql@16

# If using Docker:
docker-compose up -d db
```

### Error: "column X does not exist"
**Cause:** Database schema is outdated  
**Fix:** 
```bash
./reset_db.sh
```

### Error: "relation X already exists"
**Cause:** Trying to create tables that exist  
**Fix:** 
```bash
./reset_db.sh
```

### Error: "database is being accessed by other users"
**Cause:** Backend server is still connected  
**Fix:** 
```bash
# Stop backend server first (Ctrl+C)
# Then run reset_db.sh
```

## 💡 Best Practices Going Forward

1. **Choose ONE approach** (Docker OR local) and stick with it
2. **Always create migrations** when changing models (if using Alembic)
3. **Use `reset_db.sh`** when things get messy (development only!)
4. **Document your choice** in README so team knows what to use
5. **Version control migrations** - commit them with model changes

## 📝 Summary

This issue happens because:
- Database schema and code models get out of sync
- Multiple ways to create/modify schema (migrations, direct SQL, `create_all()`)
- Port configuration confusion (5432 vs 5433)

**Quick fix:** Use `./reset_db.sh` whenever you see database errors  
**Proper fix:** Use Alembic migrations consistently for all schema changes

The reset script I created will save you time - just run it whenever the database gets out of sync!
