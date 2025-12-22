#!/bin/bash
# Comprehensive Backup Script for E-Commerce Application
# Backs up MongoDB, Redis, application files, and configurations

set -e

# Configuration
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_ROOT="/var/backups/ecommerce"
BACKUP_DIR="$BACKUP_ROOT/$DATE"
RETENTION_DAYS=30
APP_DIR="/var/www/ecommerce"

# Load environment variables
if [ -f "$APP_DIR/backend/.env" ]; then
    export $(cat "$APP_DIR/backend/.env" | grep -v '^#' | xargs)
fi

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}=========================================="
echo "E-Commerce Backup Script"
echo "==========================================${NC}"
echo "Backup Date: $DATE"
echo ""

# Create backup directory
mkdir -p "$BACKUP_DIR"

# 1. MongoDB Backup
echo -e "${YELLOW}[1/6] Backing up MongoDB...${NC}"
if [ -z "$MONGO_URI" ]; then
    echo -e "${RED}Error: MONGO_URI not found in .env file${NC}"
    exit 1
fi

mongodump --uri="$MONGO_URI" --out="$BACKUP_DIR/mongodb" --gzip 2>&1 | tee -a "$BACKUP_DIR/backup.log"
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ MongoDB backup completed${NC}"
else
    echo -e "${RED}✗ MongoDB backup failed${NC}"
    exit 1
fi

# 2. Redis Backup
echo -e "${YELLOW}[2/6] Backing up Redis...${NC}"
if command -v redis-cli &> /dev/null; then
    redis-cli SAVE
    cp /var/lib/redis/dump.rdb "$BACKUP_DIR/redis.rdb" 2>&1 | tee -a "$BACKUP_DIR/backup.log"
    echo -e "${GREEN}✓ Redis backup completed${NC}"
else
    echo -e "${YELLOW}! Redis not found, skipping${NC}"
fi

# 3. Application Code
echo -e "${YELLOW}[3/6] Backing up application code...${NC}"
tar -czf "$BACKUP_DIR/application.tar.gz" \
    --exclude='node_modules' \
    --exclude='logs' \
    --exclude='.git' \
    --exclude='dist' \
    --exclude='coverage' \
    "$APP_DIR" 2>&1 | tee -a "$BACKUP_DIR/backup.log"
echo -e "${GREEN}✓ Application backup completed${NC}"

# 4. Configuration Files
echo -e "${YELLOW}[4/6] Backing up configuration files...${NC}"
mkdir -p "$BACKUP_DIR/configs"
cp "$APP_DIR/backend/.env" "$BACKUP_DIR/configs/.env" 2>/dev/null || echo "No .env file found"
cp "$APP_DIR/backend/ecosystem.config.js" "$BACKUP_DIR/configs/" 2>/dev/null || echo "No ecosystem.config.js found"

if [ -f "/etc/nginx/sites-available/ecommerce" ]; then
    cp "/etc/nginx/sites-available/ecommerce" "$BACKUP_DIR/configs/"
fi

echo -e "${GREEN}✓ Configuration backup completed${NC}"

# 5. SSL Certificates
echo -e "${YELLOW}[5/6] Backing up SSL certificates...${NC}"
if [ -d "/etc/letsencrypt" ]; then
    tar -czf "$BACKUP_DIR/ssl.tar.gz" /etc/letsencrypt 2>&1 | tee -a "$BACKUP_DIR/backup.log"
    echo -e "${GREEN}✓ SSL backup completed${NC}"
else
    echo -e "${YELLOW}! No SSL certificates found, skipping${NC}"
fi

# 6. Compress entire backup
echo -e "${YELLOW}[6/6] Compressing backup...${NC}"
cd "$BACKUP_ROOT"
tar -czf "backup_$DATE.tar.gz" "$DATE" 2>&1 | tee -a "$DATE/backup.log"
rm -rf "$DATE"

# Get backup size
BACKUP_SIZE=$(du -sh "$BACKUP_ROOT/backup_$DATE.tar.gz" | cut -f1)

# Clean old backups
echo -e "${YELLOW}Cleaning old backups (keeping last $RETENTION_DAYS days)...${NC}"
find "$BACKUP_ROOT" -name "backup_*.tar.gz" -mtime +$RETENTION_DAYS -delete
REMAINING_BACKUPS=$(ls -1 "$BACKUP_ROOT"/backup_*.tar.gz 2>/dev/null | wc -l)

# Create backup metadata
cat > "$BACKUP_ROOT/backup_$DATE.json" << EOF
{
  "timestamp": "$DATE",
  "size": "$BACKUP_SIZE",
  "components": {
    "mongodb": true,
    "redis": $([ -f /var/lib/redis/dump.rdb ] && echo true || echo false),
    "application": true,
    "configurations": true,
    "ssl": $([ -d /etc/letsencrypt ] && echo true || echo false)
  },
  "retention_days": $RETENTION_DAYS,
  "location": "$BACKUP_ROOT/backup_$DATE.tar.gz"
}
EOF

# Summary
echo ""
echo -e "${GREEN}=========================================="
echo "Backup Completed Successfully!"
echo "==========================================${NC}"
echo "Date: $DATE"
echo "Size: $BACKUP_SIZE"
echo "Location: $BACKUP_ROOT/backup_$DATE.tar.gz"
echo "Remaining backups: $REMAINING_BACKUPS"
echo ""
echo "Backup includes:"
echo "  ✓ MongoDB database"
echo "  ✓ Redis data"
echo "  ✓ Application code"
echo "  ✓ Configuration files"
echo "  ✓ SSL certificates"
echo ""

# Optional: Upload to S3 (if AWS CLI is configured)
if command -v aws &> /dev/null && [ -n "$S3_BACKUP_BUCKET" ]; then
    echo -e "${YELLOW}Uploading to S3...${NC}"
    aws s3 cp "$BACKUP_ROOT/backup_$DATE.tar.gz" "s3://$S3_BACKUP_BUCKET/backups/"
    aws s3 cp "$BACKUP_ROOT/backup_$DATE.json" "s3://$S3_BACKUP_BUCKET/backups/"
    echo -e "${GREEN}✓ Uploaded to S3${NC}"
fi

# Optional: Send notification (webhook, email, etc.)
if [ -n "$WEBHOOK_URL" ]; then
    curl -X POST "$WEBHOOK_URL" \
        -H "Content-Type: application/json" \
        -d "{\"text\":\"✅ Backup completed: $DATE (Size: $BACKUP_SIZE)\"}" \
        2>/dev/null || echo "Webhook notification failed"
fi

echo ""
echo "Backup log: $BACKUP_ROOT/backup_$DATE.tar.gz"
echo ""
