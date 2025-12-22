#!/bin/bash
# Server Setup Script for Ubuntu 22.04
# This script automates the initial server setup for the e-commerce application

set -e  # Exit on error

echo "=========================================="
echo "E-Commerce Server Setup Script"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}Please run as root (use sudo)${NC}"
    exit 1
fi

echo -e "${GREEN}Starting server setup...${NC}"
echo ""

# Update system
echo -e "${YELLOW}[1/10] Updating system packages...${NC}"
apt update && apt upgrade -y

# Install essential tools
echo -e "${YELLOW}[2/10] Installing essential tools...${NC}"
apt install -y curl wget git build-essential software-properties-common ufw fail2ban

# Install Node.js 20.x
echo -e "${YELLOW}[3/10] Installing Node.js 20.x...${NC}"
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Verify Node.js installation
node_version=$(node -v)
npm_version=$(npm -v)
echo -e "${GREEN}✓ Node.js $node_version installed${NC}"
echo -e "${GREEN}✓ npm $npm_version installed${NC}"

# Install MongoDB
echo -e "${YELLOW}[4/10] Installing MongoDB 6.0...${NC}"
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-6.0.list
apt update
apt install -y mongodb-org
systemctl start mongod
systemctl enable mongod
echo -e "${GREEN}✓ MongoDB installed and started${NC}"

# Install Redis
echo -e "${YELLOW}[5/10] Installing Redis...${NC}"
apt install -y redis-server
systemctl start redis-server
systemctl enable redis-server
echo -e "${GREEN}✓ Redis installed and started${NC}"

# Install Nginx
echo -e "${YELLOW}[6/10] Installing Nginx...${NC}"
apt install -y nginx
systemctl start nginx
systemctl enable nginx
echo -e "${GREEN}✓ Nginx installed and started${NC}"

# Install PM2
echo -e "${YELLOW}[7/10] Installing PM2 globally...${NC}"
npm install -g pm2
echo -e "${GREEN}✓ PM2 installed${NC}"

# Install Certbot for SSL
echo -e "${YELLOW}[8/10] Installing Certbot...${NC}"
apt install -y certbot python3-certbot-nginx
echo -e "${GREEN}✓ Certbot installed${NC}"

# Configure UFW Firewall
echo -e "${YELLOW}[9/10] Configuring firewall...${NC}"
ufw --force reset
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp   # SSH
ufw allow 80/tcp   # HTTP
ufw allow 443/tcp  # HTTPS
ufw limit 22/tcp   # Rate limit SSH
ufw --force enable
echo -e "${GREEN}✓ Firewall configured${NC}"

# Create deployment user
echo -e "${YELLOW}[10/10] Creating deployment user...${NC}"
if id "deploy" &>/dev/null; then
    echo -e "${YELLOW}User 'deploy' already exists${NC}"
else
    adduser --disabled-password --gecos "" deploy
    usermod -aG sudo deploy
    echo -e "${GREEN}✓ User 'deploy' created${NC}"
fi

# Create application directory
echo -e "${YELLOW}Creating application directories...${NC}"
mkdir -p /var/www/ecommerce
mkdir -p /var/www/html/ecommerce
mkdir -p /var/backups/ecommerce
mkdir -p /var/log/ecommerce

chown -R deploy:deploy /var/www/ecommerce
chown -R deploy:deploy /var/www/html/ecommerce
chown -R deploy:deploy /var/backups/ecommerce
chown -R deploy:deploy /var/log/ecommerce

echo -e "${GREEN}✓ Directories created${NC}"

# System optimization
echo -e "${YELLOW}Optimizing system settings...${NC}"
cat >> /etc/sysctl.conf << EOF

# Network optimization
net.core.somaxconn = 65535
net.ipv4.tcp_max_syn_backlog = 8192
net.ipv4.ip_local_port_range = 1024 65535

# File descriptor limits
fs.file-max = 2097152
EOF

sysctl -p

# Set ulimits
cat >> /etc/security/limits.conf << EOF
deploy soft nofile 65535
deploy hard nofile 65535
deploy soft nproc 65535
deploy hard nproc 65535
EOF

echo -e "${GREEN}✓ System optimized${NC}"

# Configure Fail2Ban
echo -e "${YELLOW}Configuring Fail2Ban...${NC}"
cat > /etc/fail2ban/jail.local << EOF
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5

[sshd]
enabled = true
port = 22

[nginx-http-auth]
enabled = true
port = http,https

[nginx-noscript]
enabled = true
port = http,https
EOF

systemctl restart fail2ban
echo -e "${GREEN}✓ Fail2Ban configured${NC}"

# Display summary
echo ""
echo -e "${GREEN}=========================================="
echo "Server Setup Complete!"
echo "==========================================${NC}"
echo ""
echo "Installed Software:"
echo "  ✓ Node.js $(node -v)"
echo "  ✓ npm $(npm -v)"
echo "  ✓ MongoDB (systemctl status mongod)"
echo "  ✓ Redis (systemctl status redis-server)"
echo "  ✓ Nginx (systemctl status nginx)"
echo "  ✓ PM2 (pm2 -v)"
echo "  ✓ Certbot"
echo ""
echo "Security:"
echo "  ✓ UFW Firewall enabled"
echo "  ✓ Fail2Ban configured"
echo "  ✓ SSH rate limiting active"
echo ""
echo "Next Steps:"
echo "  1. Set up SSH key authentication for 'deploy' user"
echo "  2. Clone your application repository"
echo "  3. Configure environment variables"
echo "  4. Set up SSL certificate with Certbot"
echo "  5. Configure Nginx reverse proxy"
echo "  6. Start application with PM2"
echo ""
echo "Deployment user: deploy"
echo "Application directory: /var/www/ecommerce"
echo "Web root: /var/www/html/ecommerce"
echo "Backups: /var/backups/ecommerce"
echo ""
echo -e "${YELLOW}Switch to deploy user: sudo su - deploy${NC}"
echo ""
