#!/usr/bin/env bash
set -e

DB_PATH="backend/db/pickleball.db"
SCHEMA_PATH="backend/db/schema.sql"

mkdir -p backend/db
rm -f "$DB_PATH"
sqlite3 "$DB_PATH" < "$SCHEMA_PATH"

echo "✅ Created $DB_PATH"
