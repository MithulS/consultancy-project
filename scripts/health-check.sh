#!/bin/bash
# Health Check Script - Monitor application health
# Can be run manually or via cron

# Configuration
API_URL="${API_URL:-http://localhost:5000/api/health}"
WEB_URL="${WEB_URL:-http://localhost:80}"
ALERT_EMAIL="${ALERT_EMAIL:-admin@example.com}"
MAX_RESPONSE_TIME=5000  # milliseconds

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo "=========================================="
echo "E-Commerce Health Check"
echo "=========================================="
echo "Time: $(date)"
echo ""

# Function to send alert
send_alert() {
    local message=$1
    local severity=$2
    
    echo -e "${RED}ALERT: $message${NC}"
    
    # Log alert
    echo "[$(date)] ALERT: $message" >> /var/log/ecommerce/health-check.log
    
    # Send email (if mail is configured)
    if command -v mail &> /dev/null; then
        echo "$message" | mail -s "[$severity] E-Commerce Health Alert" "$ALERT_EMAIL"
    fi
    
    # Webhook notification
    if [ -n "$WEBHOOK_URL" ]; then
        curl -X POST "$WEBHOOK_URL" \
            -H "Content-Type: application/json" \
            -d "{\"text\":\"🚨 [$severity] $message\"}" \
            2>/dev/null || true
    fi
}

# Function to check HTTP endpoint
check_http() {
    local url=$1
    local name=$2
    
    echo -n "Checking $name... "
    
    # Get response time and status code
    response=$(curl -o /dev/null -s -w "%{http_code}|%{time_total}" "$url" -m 10)
    status_code=$(echo $response | cut -d'|' -f1)
    response_time=$(echo $response | cut -d'|' -f2 | awk '{print $1*1000}')
    
    if [ "$status_code" = "200" ]; then
        echo -e "${GREEN}✓ OK${NC} (${response_time%.*}ms)"
        return 0
    else
        echo -e "${RED}✗ FAILED${NC} (Status: $status_code)"
        return 1
    fi
}

# Function to check service
check_service() {
    local service=$1
    local name=$2
    
    echo -n "Checking $name... "
    
    if systemctl is-active --quiet "$service"; then
        echo -e "${GREEN}✓ Running${NC}"
        return 0
    else
        echo -e "${RED}✗ Stopped${NC}"
        return 1
    fi
}

# Function to check PM2 process
check_pm2() {
    local process=$1
    
    echo -n "Checking PM2 process '$process'... "
    
    if pm2 list | grep -q "$process.*online"; then
        echo -e "${GREEN}✓ Running${NC}"
        return 0
    else
        echo -e "${RED}✗ Not running${NC}"
        return 1
    fi
}

# Function to check database connection
check_mongodb() {
    echo -n "Checking MongoDB... "
    
    if mongosh --eval "db.adminCommand('ping')" --quiet &>/dev/null; then
        echo -e "${GREEN}✓ Connected${NC}"
        return 0
    else
        echo -e "${RED}✗ Connection failed${NC}"
        return 1
    fi
}

# Function to check Redis
check_redis() {
    echo -n "Checking Redis... "
    
    if redis-cli ping &>/dev/null; then
        echo -e "${GREEN}✓ Connected${NC}"
        return 0
    else
        echo -e "${RED}✗ Connection failed${NC}"
        return 1
    fi
}

# Function to check disk space
check_disk_space() {
    echo -n "Checking disk space... "
    
    disk_usage=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
    
    if [ "$disk_usage" -lt 80 ]; then
        echo -e "${GREEN}✓ OK${NC} (${disk_usage}% used)"
        return 0
    elif [ "$disk_usage" -lt 90 ]; then
        echo -e "${YELLOW}⚠ Warning${NC} (${disk_usage}% used)"
        return 0
    else
        echo -e "${RED}✗ Critical${NC} (${disk_usage}% used)"
        return 1
    fi
}

# Function to check memory
check_memory() {
    echo -n "Checking memory... "
    
    mem_usage=$(free | awk 'NR==2 {printf "%.0f", $3*100/$2}')
    
    if [ "$mem_usage" -lt 80 ]; then
        echo -e "${GREEN}✓ OK${NC} (${mem_usage}% used)"
        return 0
    elif [ "$mem_usage" -lt 90 ]; then
        echo -e "${YELLOW}⚠ Warning${NC} (${mem_usage}% used)"
        return 0
    else
        echo -e "${RED}✗ Critical${NC} (${mem_usage}% used)"
        return 1
    fi
}

# Initialize failure counter
failures=0

# Run checks
echo "1. HTTP Endpoints"
echo "─────────────────"
check_http "$API_URL" "API Health Endpoint" || {
    failures=$((failures + 1))
    send_alert "API health check failed" "CRITICAL"
}

check_http "$WEB_URL" "Website" || {
    failures=$((failures + 1))
    send_alert "Website is not responding" "CRITICAL"
}

echo ""
echo "2. System Services"
echo "──────────────────"
check_service "nginx" "Nginx" || {
    failures=$((failures + 1))
    send_alert "Nginx is not running" "CRITICAL"
    sudo systemctl restart nginx
}

check_service "mongod" "MongoDB" || {
    failures=$((failures + 1))
    send_alert "MongoDB is not running" "CRITICAL"
    sudo systemctl restart mongod
}

check_service "redis-server" "Redis" || {
    failures=$((failures + 1))
    send_alert "Redis is not running" "WARNING"
    sudo systemctl restart redis-server
}

echo ""
echo "3. Application"
echo "──────────────"
check_pm2 "ecommerce-api" || {
    failures=$((failures + 1))
    send_alert "PM2 process is not running" "CRITICAL"
    pm2 restart ecommerce-api
}

echo ""
echo "4. Database Connections"
echo "───────────────────────"
check_mongodb || {
    failures=$((failures + 1))
    send_alert "MongoDB connection failed" "CRITICAL"
}

check_redis || {
    failures=$((failures + 1))
    send_alert "Redis connection failed" "WARNING"
}

echo ""
echo "5. System Resources"
echo "───────────────────"
check_disk_space || {
    failures=$((failures + 1))
    send_alert "Disk space critical" "WARNING"
}

check_memory || {
    failures=$((failures + 1))
    send_alert "Memory usage critical" "WARNING"
}

# Summary
echo ""
echo "=========================================="
if [ $failures -eq 0 ]; then
    echo -e "${GREEN}All checks passed! ✓${NC}"
    echo "Status: HEALTHY"
else
    echo -e "${RED}$failures check(s) failed! ✗${NC}"
    echo "Status: UNHEALTHY"
fi
echo "=========================================="
echo ""

# Additional information
echo "System Information:"
echo "  • Uptime: $(uptime -p)"
echo "  • Load: $(uptime | awk -F'load average:' '{print $2}')"
echo "  • Disk: $(df -h / | awk 'NR==2 {print $5 " used"}')"
echo "  • Memory: $(free -h | awk 'NR==2 {print $3 "/" $2}')"
echo ""

# Exit with failure code if any checks failed
[ $failures -eq 0 ] && exit 0 || exit 1
