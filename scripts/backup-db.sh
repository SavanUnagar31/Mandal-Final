#!/bin/bash
# scripts/backup-db.sh
# Database backup script for Mandal MySQL Database

# Load environment variables from .env if it exists
if [ -f .env ]; then
  # Exclude comments and export variables
  export $(grep -v '^#' .env | xargs)
fi

DB_HOST=${DB_HOST:-"localhost"}
DB_USER=${DB_USER:-"root"}
DB_PASSWORD=${DB_PASSWORD:-"password"}
DB_NAME=${DB_NAME:-"mandal_db"}

BACKUP_DIR="./backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/${DB_NAME}_backup_$TIMESTAMP.sql"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

echo "Starting database backup for '$DB_NAME' from host '$DB_HOST'..."
mysqldump -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" > "$BACKUP_FILE"

if [ $? -eq 0 ]; then
  echo "Backup successfully created: $BACKUP_FILE"
  gzip "$BACKUP_FILE"
  echo "Backup compressed: ${BACKUP_FILE}.gz"
else
  echo "Error: Database backup failed!"
  exit 1
fi
