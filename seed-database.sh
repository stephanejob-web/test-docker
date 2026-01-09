#!/bin/bash

# ============================================
# Light Church - Database Seeder Script
# ============================================
# Execute this script to populate the database with test data

set -e

echo "🌱 Light Church - Database Seeder"
echo "=================================="
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Error: Docker is not running"
    echo "Please start Docker and try again"
    exit 1
fi

# Check if mysql-db container exists and is running
if ! docker ps | grep -q mysql-db; then
    echo "❌ Error: mysql-db container is not running"
    echo "Please start the containers first:"
    echo "  docker-compose up -d"
    exit 1
fi

echo "📦 Checking database connection..."
if ! docker exec mysql-db mysqladmin ping -h localhost -u root -proot > /dev/null 2>&1; then
    echo "❌ Error: Cannot connect to database"
    echo "Please wait for MySQL to fully start"
    exit 1
fi

echo "✅ Database connection OK"
echo ""
echo "🚀 Executing seeders..."
echo ""

# Execute the seeder file
SEEDER_OUTPUT=$(docker exec -i mysql-db mysql -u root -proot light_church < backend-express/database/seeders.sql 2>&1)
SEEDER_EXIT=$?

if [ $SEEDER_EXIT -eq 0 ]; then
    echo ""
    echo "✅ Seeders executed successfully!"
    echo ""
    echo "📊 Database Statistics:"
    docker exec mysql-db mysql -u root -proot light_church -e "
        SELECT 'Admins:' AS type, COUNT(*) as count FROM admins
        UNION ALL SELECT 'Churches:', COUNT(*) FROM churches
        UNION ALL SELECT 'Languages:', COUNT(*) FROM languages
        UNION ALL SELECT 'Schedules:', COUNT(*) FROM church_schedules
        UNION ALL SELECT 'Socials:', COUNT(*) FROM church_socials;
    " 2>/dev/null | grep -v "Warning"

    echo ""
    echo "🔐 Test Credentials:"
    echo "-------------------"
    echo "Super Admin:"
    echo "  Email: admin@lightchurch.fr"
    echo "  Password: 780662aB2"
    echo ""
    echo "Pastor Examples:"
    echo "  Email: p.martin@paris1.fr"
    echo "  Password: 780662aB2"
    echo ""
    echo "📖 See backend-express/database/seeders.sql for complete list of 31 accounts"
    echo ""
    echo "🎉 You can now login to the application!"
else
    echo ""
    echo "❌ Error: Seeders execution failed"
    echo ""
    echo "Error details:"
    echo "$SEEDER_OUTPUT" | grep -E "ERROR|error" | head -10
    exit 1
fi
