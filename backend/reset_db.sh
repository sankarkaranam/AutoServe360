#!/bin/bash
# Reset database script - use when schema gets out of sync

set -e  # Exit on error

echo "🗑️  Dropping database..."
psql -h localhost -p 5432 -U postgres -c "DROP DATABASE IF EXISTS autoserve360;"

echo "📦 Creating fresh database..."
psql -h localhost -p 5432 -U postgres -c "CREATE DATABASE autoserve360;"

echo "🔨 Initializing schema..."
source ./venv/bin/activate
python init_db.py

echo "👤 Creating demo data..."
python ensure_demo_data.py

echo "✅ Database reset complete!"
echo ""
echo "Login credentials:"
echo "  Dealer ID: dealer-001"
echo "  Email: dealer@example.com"
echo "  Password: password"
