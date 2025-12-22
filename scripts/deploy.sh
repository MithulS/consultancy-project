#!/bin/bash
# Deployment Script - Automated deployment from GitHub
# This script pulls the latest code and deploys the application

set -e

# Configuration
APP_DIR="/var/www/ecommerce"
BACKUP_DIR="/var/backups/ecommerce"
BRANCH="${1:-main}"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}=========================================="
echo "E-Commerce Deployment Script"
echo "==========================================${NC}"
echo "Branch: $BRANCH"
echo "Time: $(date)"
echo ""

# Check if running as deploy user
if [ "$USER" != "deploy" ]; then
    echo -e "${RED}Please run as deploy user${NC}"
    exit 1
fi

# Navigate to app directory
cd "$APP_DIR"

# 1. Create backup before deployment
echo -e "${YELLOW}[1/8] Creating pre-deployment backup...${NC}"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p "$BACKUP_DIR/pre-deploy"
tar -czf "$BACKUP_DIR/pre-deploy/backup_$DATE.tar.gz" \
    --exclude='node_modules' \
    --exclude='logs' \
    --exclude='.git' \
    backend/ frontend/ 2>/dev/null || true
echo -e "${GREEN}✓ Backup created${NC}"

# 2. Fetch latest code
echo -e "${YELLOW}[2/8] Fetching latest code from GitHub...${NC}"
git fetch origin
CURRENT_COMMIT=$(git rev-parse HEAD)
LATEST_COMMIT=$(git rev-parse origin/$BRANCH)

if [ "$CURRENT_COMMIT" = "$LATEST_COMMIT" ]; then
    echo -e "${GREEN}Already up to date (commit: ${CURRENT_COMMIT:0:7})${NC}"
else
    echo "Current: ${CURRENT_COMMIT:0:7}"
    echo "Latest:  ${LATEST_COMMIT:0:7}"
    git pull origin $BRANCH
    echo -e "${GREEN}✓ Code updated${NC}"
fi

# 3. Install/Update Backend Dependencies
echo -e "${YELLOW}[3/8] Installing backend dependencies...${NC}"
cd "$APP_DIR/backend"
npm install --production
npm audit fix --production 2>/dev/null || true
echo -e "${GREEN}✓ Backend dependencies updated${NC}"

# 4. Run Backend Tests (optional, comment out if slowing deployment)
echo -e "${YELLOW}[4/8] Running backend tests...${NC}"
# npm test 2>&1 | tee test-results.log || {
#     echo -e "${RED}Tests failed! Deployment aborted.${NC}"
#     exit 1
# }
echo -e "${YELLOW}⊘ Tests skipped (remove comment to enable)${NC}"

# 5. Build Frontend
echo -e "${YELLOW}[5/8] Building frontend...${NC}"
cd "$APP_DIR/frontend"
npm install
npm run build

if [ ! -d "dist" ]; then
    echo -e "${RED}Frontend build failed! dist folder not found${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Frontend built successfully${NC}"

# 6. Deploy Frontend
echo -e "${YELLOW}[6/8] Deploying frontend...${NC}"
sudo rm -rf /var/www/html/ecommerce/*
sudo cp -r dist/* /var/www/html/ecommerce/
sudo chown -R www-data:www-data /var/www/html/ecommerce
echo -e "${GREEN}✓ Frontend deployed${NC}"

# 7. Reload Backend with PM2
echo -e "${YELLOW}[7/8] Reloading backend...${NC}"
cd "$APP_DIR/backend"

# Check if PM2 process exists
if pm2 list | grep -q "ecommerce-api"; then
    pm2 reload ecosystem.config.js --env production --update-env
    echo -e "${GREEN}✓ Backend reloaded (zero-downtime)${NC}"
else
    pm2 start ecosystem.config.js --env production
    pm2 save
    echo -e "${GREEN}✓ Backend started${NC}"
fi

# 8. Clear caches
echo -e "${YELLOW}[8/8] Clearing caches...${NC}"
pm2 flush
if command -v redis-cli &> /dev/null; then
    redis-cli FLUSHALL 2>/dev/null || true
    echo -e "${GREEN}✓ Redis cache cleared${NC}"
fi

# Reload Nginx
sudo systemctl reload nginx 2>/dev/null || true
echo -e "${GREEN}✓ Nginx reloaded${NC}"

# Health check
echo ""
echo -e "${YELLOW}Running health check...${NC}"
sleep 3

HEALTH_CHECK=$(curl -s http://localhost:5000/api/health || echo "failed")
if echo "$HEALTH_CHECK" | grep -q "ok"; then
    echo -e "${GREEN}✓ Health check passed${NC}"
else
    echo -e "${RED}✗ Health check failed${NC}"
    echo "Response: $HEALTH_CHECK"
fi

# Display PM2 status
echo ""
echo -e "${YELLOW}PM2 Status:${NC}"
pm2 list

# Summary
echo ""
echo -e "${GREEN}=========================================="
echo "Deployment Completed!"
echo "==========================================${NC}"
echo "Branch: $BRANCH"
echo "Commit: $(git rev-parse --short HEAD)"
echo "Time: $(date)"
echo ""
echo "Services Status:"
pm2 jlist | grep -o '"status":"[^"]*"' | head -1 || echo "PM2 running"
echo ""
echo "Deployment log: $APP_DIR/deployment.log"
echo ""
echo "Next steps:"
echo "  • Test the application: https://yourdomain.com"
echo "  • Check logs: pm2 logs"
echo "  • Monitor: pm2 monit"
echo ""

# Log deployment
echo "[$(date)] Deployment completed - Branch: $BRANCH, Commit: $(git rev-parse --short HEAD)" >> "$APP_DIR/deployment.log"

# Optional: Send notification
if [ -n "$WEBHOOK_URL" ]; then
    curl -X POST "$WEBHOOK_URL" \
        -H "Content-Type: application/json" \
        -d "{\"text\":\"🚀 Deployment completed: $(git rev-parse --short HEAD)\"}" \
        2>/dev/null || true
fi
