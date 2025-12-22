# 🚀 Production Deployment Guide
## Complete E-Commerce Application Deployment Framework

**Project:** MERN Stack E-Commerce Platform  
**Technology Stack:** MongoDB, Express.js, React (Vite), Node.js  
**Last Updated:** December 22, 2025

---

## 📋 Table of Contents

1. [Project Environment & Prerequisites](#1-project-environment--prerequisites)
2. [Hosting Options & Recommendations](#2-hosting-options--recommendations)
3. [Pre-Deployment Checklist](#3-pre-deployment-checklist)
4. [Deployment Strategy & CI/CD](#4-deployment-strategy--cicd)
5. [Security Implementation](#5-security-implementation)
6. [Scalability & Performance](#6-scalability--performance)
7. [Monitoring & Maintenance](#7-monitoring--maintenance)
8. [Domain & DNS Configuration](#8-domain--dns-configuration)
9. [Backup & Disaster Recovery](#9-backup--disaster-recovery)
10. [Post-Deployment Validation](#10-post-deployment-validation)

---

## 1. Project Environment & Prerequisites

### 1.1 Runtime Requirements

```bash
# Required Software Versions
Node.js: >= 18.x LTS (recommended: 20.x)
MongoDB: >= 6.0
Redis: >= 7.0 (for caching)
PM2: >= 5.x (process manager)
Nginx: >= 1.24 (reverse proxy)
```

### 1.2 System Dependencies

```bash
# Ubuntu/Debian
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git build-essential nginx certbot python3-certbot-nginx

# Install Node.js (using NodeSource)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt update
sudo apt install -y mongodb-org

# Install Redis
sudo apt install -y redis-server

# Install PM2 globally
sudo npm install -g pm2
```

### 1.3 Project Dependencies

**Backend Dependencies:**
- Express.js 5.x - Web framework
- Mongoose 9.x - MongoDB ODM
- Redis 5.x - Caching layer
- Cloudinary 2.x - Image hosting
- Stripe 20.x - Payment processing
- Nodemailer 7.x - Email service
- Winston 3.x - Logging
- JWT & bcryptjs - Authentication

**Frontend Dependencies:**
- React 19.x
- Vite 7.x (Rolldown)
- Modern ES modules

### 1.4 Environment Variables Setup

Create production `.env` files:

**Backend (.env):**
```bash
# Server Configuration
NODE_ENV=production
PORT=5000

# Database
MONGO_URI=mongodb://localhost:27017/ecommerce_prod
# Or MongoDB Atlas:
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/ecommerce_prod?retryWrites=true&w=majority

# Security
JWT_SECRET=<GENERATE_SECURE_64_CHAR_HEX>
ADMIN_KEY=<GENERATE_SECURE_KEY>

# Email (Gmail App Password)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=<APP_PASSWORD>

# Google OAuth
GOOGLE_CLIENT_ID=<CLIENT_ID>.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=<CLIENT_SECRET>
GOOGLE_REDIRECT_URI=https://api.yourdomain.com/api/auth/google/callback

# Cloudinary
CLOUDINARY_CLOUD_NAME=<YOUR_CLOUD_NAME>
CLOUDINARY_API_KEY=<YOUR_API_KEY>
CLOUDINARY_API_SECRET=<YOUR_API_SECRET>

# Stripe
STRIPE_SECRET_KEY=sk_live_<YOUR_KEY>
STRIPE_WEBHOOK_SECRET=whsec_<YOUR_SECRET>

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=<SECURE_PASSWORD>

# URLs
CLIENT_URL=https://yourdomain.com
FRONTEND_URL=https://yourdomain.com
```

**Generate Secure Keys:**
```bash
# JWT Secret (64 characters)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Admin Key
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"
```

---

## 2. Hosting Options & Recommendations

### 2.1 Recommended Hosting Solutions

#### **Option A: AWS (Amazon Web Services) - RECOMMENDED**

**Best for:** Enterprise-grade scalability, full control

**Services Required:**
- **EC2**: Application servers (t3.medium or larger)
- **RDS MongoDB Atlas**: Managed MongoDB
- **ElastiCache**: Redis caching
- **S3**: Static file storage (alternative to Cloudinary)
- **CloudFront**: CDN for global distribution
- **Route 53**: DNS management
- **ELB**: Load balancing
- **Certificate Manager**: Free SSL certificates

**Estimated Monthly Cost:** $100-300 (depends on traffic)

**Setup Steps:**
1. Launch EC2 instance (Ubuntu 22.04 LTS)
2. Configure security groups (ports 80, 443, 22)
3. Set up MongoDB Atlas cluster
4. Configure ElastiCache Redis
5. Deploy application

#### **Option B: DigitalOcean - COST-EFFECTIVE**

**Best for:** Small to medium projects, budget-conscious

**Services Required:**
- **Droplet**: $24/month (4GB RAM, 2 vCPU)
- **Managed MongoDB**: $15/month
- **Managed Redis**: $15/month
- **Spaces**: Object storage
- **Load Balancer**: $12/month (optional)

**Estimated Monthly Cost:** $50-100

#### **Option C: Vercel + Railway/Render - FASTEST**

**Best for:** Quick deployment, minimal DevOps

**Setup:**
- **Frontend**: Vercel (free/hobby plan)
- **Backend**: Railway.app or Render.com ($5-20/month)
- **Database**: MongoDB Atlas (free tier or $9/month)
- **Redis**: Upstash (free tier)

**Estimated Monthly Cost:** $0-30

**Pros:** Zero-config deployment, automatic SSL, CI/CD built-in  
**Cons:** Less control, scaling limitations

#### **Option D: Self-Hosted VPS (Recommended for This Project)**

**Providers:** Linode, Vultr, Hetzner, Contabo

**Recommended Specs:**
- **CPU:** 4 cores
- **RAM:** 8GB
- **Storage:** 160GB SSD
- **Bandwidth:** 4TB/month
- **Cost:** $20-40/month

**Why VPS?** Full control, cost-effective, suitable for MERN stack

### 2.2 Chosen Approach for This Guide

We'll use **VPS with Ubuntu 22.04**, as it provides:
- Complete control
- Cost-effectiveness
- Scalability path
- Industry-standard setup

---

## 3. Pre-Deployment Checklist

### 3.1 Code Preparation

```bash
# 1. Update production URLs in code
# Backend: check all CLIENT_URL references
# Frontend: update API_BASE_URL

# 2. Build frontend for production
cd frontend
npm install
npm run build
# Creates 'dist' folder with optimized assets

# 3. Test production build locally
npm run preview

# 4. Backend production readiness
cd backend
npm install --production
npm test

# 5. Remove development dependencies
npm prune --production
```

### 3.2 Security Audit

```bash
# Check for vulnerabilities
npm audit
npm audit fix

# Update dependencies
npm update

# Check for exposed secrets
git log --all --full-history -- "**/*.env"
```

### 3.3 Database Preparation

```bash
# Export development data (if needed)
mongodump --db consultancy_db --out ./backup

# Create production database indexes
# Run this script on production MongoDB
node backend/scripts/createIndexes.js
```

---

## 4. Deployment Strategy & CI/CD

### 4.1 Manual Deployment (Initial Setup)

#### Step 1: Server Setup

```bash
# SSH into your server
ssh root@your-server-ip

# Create deployment user
adduser deploy
usermod -aG sudo deploy
su - deploy

# Set up SSH key authentication (from local machine)
ssh-copy-id deploy@your-server-ip
```

#### Step 2: Install Application

```bash
# Create application directory
sudo mkdir -p /var/www/ecommerce
sudo chown deploy:deploy /var/www/ecommerce
cd /var/www/ecommerce

# Clone repository
git clone https://github.com/MithulS/consultancy-project.git .

# Backend setup
cd backend
npm install --production
cp .env.example .env
nano .env  # Edit with production values

# Frontend build
cd ../frontend
npm install
npm run build

# Move frontend build to serve location
sudo mkdir -p /var/www/html/ecommerce
sudo cp -r dist/* /var/www/html/ecommerce/
```

#### Step 3: Configure PM2

```bash
cd /var/www/ecommerce/backend

# Start application with PM2
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
pm2 save

# Set PM2 to start on system boot
pm2 startup systemd
# Run the command PM2 outputs

# Check status
pm2 status
pm2 logs
```

### 4.2 Nginx Reverse Proxy Configuration

```nginx
# /etc/nginx/sites-available/ecommerce

# Redirect HTTP to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name yourdomain.com www.yourdomain.com;
    
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }
    
    location / {
        return 301 https://$server_name$request_uri;
    }
}

# HTTPS Configuration
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL Configuration (will be updated by Certbot)
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Frontend (React App)
    root /var/www/html/ecommerce;
    index index.html;

    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # API Proxy to Backend
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        # Buffer settings
        proxy_buffering on;
        proxy_buffer_size 4k;
        proxy_buffers 8 4k;
        proxy_busy_buffers_size 8k;
    }

    # Frontend Routes (SPA)
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Static Files Caching
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Prevent access to sensitive files
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }

    # Access and Error Logs
    access_log /var/log/nginx/ecommerce_access.log;
    error_log /var/log/nginx/ecommerce_error.log;
}
```

**Enable Configuration:**
```bash
# Link configuration
sudo ln -s /etc/nginx/sites-available/ecommerce /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

### 4.3 SSL Certificate (Let's Encrypt)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal test
sudo certbot renew --dry-run

# Certbot will automatically:
# 1. Obtain SSL certificate
# 2. Update Nginx configuration
# 3. Set up auto-renewal cron job
```

### 4.4 CI/CD Pipeline (GitHub Actions)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '20'
    
    - name: Install backend dependencies
      run: |
        cd backend
        npm ci --production
    
    - name: Run backend tests
      run: |
        cd backend
        npm test
    
    - name: Build frontend
      run: |
        cd frontend
        npm ci
        npm run build
    
    - name: Deploy to server
      uses: appleboy/ssh-action@master
      with:
        host: ${{ secrets.SERVER_IP }}
        username: ${{ secrets.SERVER_USER }}
        key: ${{ secrets.SSH_PRIVATE_KEY }}
        script: |
          cd /var/www/ecommerce
          git pull origin main
          
          # Backend
          cd backend
          npm install --production
          pm2 reload ecosystem.config.js --env production
          
          # Frontend
          cd ../frontend
          npm install
          npm run build
          sudo cp -r dist/* /var/www/html/ecommerce/
          
          # Clear caches
          pm2 flush
          sudo systemctl reload nginx
    
    - name: Notification
      if: always()
      run: echo "Deployment completed"
```

**Setup GitHub Secrets:**
```
Settings → Secrets and variables → Actions → New repository secret

Required Secrets:
- SERVER_IP: Your server IP address
- SERVER_USER: deploy
- SSH_PRIVATE_KEY: Your private SSH key
```

### 4.5 Docker Deployment (Alternative)

**backend/Dockerfile:**
```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 5000

CMD ["node", "index.js"]
```

**frontend/Dockerfile:**
```dockerfile
FROM node:20-alpine as build

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**docker-compose.yml:**
```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
    env_file:
      - ./backend/.env
    depends_on:
      - mongodb
      - redis
    restart: unless-stopped
    networks:
      - ecommerce-network

  frontend:
    build: ./frontend
    ports:
      - "80:80"
      - "443:443"
    depends_on:
      - backend
    restart: unless-stopped
    networks:
      - ecommerce-network

  mongodb:
    image: mongo:6
    volumes:
      - mongo-data:/data/db
    environment:
      - MONGO_INITDB_ROOT_USERNAME=admin
      - MONGO_INITDB_ROOT_PASSWORD=${MONGO_PASSWORD}
    restart: unless-stopped
    networks:
      - ecommerce-network

  redis:
    image: redis:7-alpine
    command: redis-server --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis-data:/data
    restart: unless-stopped
    networks:
      - ecommerce-network

volumes:
  mongo-data:
  redis-data:

networks:
  ecommerce-network:
    driver: bridge
```

**Deploy with Docker:**
```bash
# Build and start
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

---

## 5. Security Implementation

### 5.1 Firewall Configuration (UFW)

```bash
# Enable UFW
sudo ufw enable

# Allow SSH (change 22 if using custom port)
sudo ufw allow 22/tcp

# Allow HTTP and HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Deny all other incoming, allow outgoing
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Check status
sudo ufw status verbose

# Rate limiting for SSH (prevent brute force)
sudo ufw limit 22/tcp
```

### 5.2 Fail2Ban (Intrusion Prevention)

```bash
# Install Fail2Ban
sudo apt install fail2ban

# Configure for Nginx
sudo nano /etc/fail2ban/jail.local
```

**jail.local:**
```ini
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

[nginx-badbots]
enabled = true
port = http,https

[nginx-noproxy]
enabled = true
port = http,https
```

```bash
# Start Fail2Ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban

# Check status
sudo fail2ban-client status
```

### 5.3 MongoDB Security

```bash
# Enable authentication
sudo nano /etc/mongod.conf
```

**mongod.conf:**
```yaml
security:
  authorization: enabled

net:
  bindIp: localhost
  port: 27017
```

**Create admin user:**
```bash
mongosh

use admin
db.createUser({
  user: "admin",
  pwd: "SECURE_PASSWORD",
  roles: ["root"]
})

use ecommerce_prod
db.createUser({
  user: "ecommerce_user",
  pwd: "SECURE_PASSWORD",
  roles: ["readWrite"]
})
```

**Update connection string:**
```
MONGO_URI=mongodb://ecommerce_user:SECURE_PASSWORD@localhost:27017/ecommerce_prod
```

### 5.4 Redis Security

```bash
# Configure Redis
sudo nano /etc/redis/redis.conf
```

**redis.conf:**
```conf
# Bind to localhost only
bind 127.0.0.1

# Require password
requirepass YOUR_SECURE_PASSWORD

# Disable dangerous commands
rename-command FLUSHDB ""
rename-command FLUSHALL ""
rename-command CONFIG ""

# Enable persistence
appendonly yes
```

```bash
# Restart Redis
sudo systemctl restart redis-server
```

### 5.5 Application Security

**Backend Security Middleware (backend/index.js):**

```javascript
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

// Security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// Data sanitization against NoSQL injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(hpp());

// Rate limiting
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
});
app.use('/api/', limiter);
```

**Install security packages:**
```bash
npm install helmet express-mongo-sanitize xss-clean hpp
```

### 5.6 Environment Variables Security

```bash
# Secure .env file permissions
chmod 600 /var/www/ecommerce/backend/.env

# Ensure .env is in .gitignore (already done)
cat .gitignore | grep .env

# Never commit .env to Git
git rm --cached .env  # If accidentally committed
```

### 5.7 Regular Security Updates

```bash
# Create update script
sudo nano /usr/local/bin/security-updates.sh
```

**security-updates.sh:**
```bash
#!/bin/bash
apt update
apt upgrade -y
apt autoremove -y

# Update npm packages
cd /var/www/ecommerce/backend
npm audit fix

# Restart services if needed
pm2 restart all
systemctl reload nginx
```

```bash
chmod +x /usr/local/bin/security-updates.sh

# Schedule weekly updates (Sundays at 2 AM)
sudo crontab -e
0 2 * * 0 /usr/local/bin/security-updates.sh >> /var/log/security-updates.log 2>&1
```

---

## 6. Scalability & Performance

### 6.1 PM2 Cluster Mode

Already configured in `ecosystem.config.js`:
```javascript
instances: 'max',  // Uses all CPU cores
exec_mode: 'cluster'
```

**Monitor cluster:**
```bash
pm2 list
pm2 monit
```

### 6.2 Redis Caching Strategy

**Implement caching middleware:**

**backend/middleware/cache.js:**
```javascript
const redis = require('redis');
const client = redis.createClient({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD
});

client.connect();

const cache = (duration) => {
  return async (req, res, next) => {
    const key = `cache:${req.originalUrl}`;
    
    try {
      const cachedData = await client.get(key);
      
      if (cachedData) {
        return res.json(JSON.parse(cachedData));
      }
      
      // Store original res.json
      const originalJson = res.json.bind(res);
      
      res.json = (data) => {
        // Cache the response
        client.setEx(key, duration, JSON.stringify(data));
        return originalJson(data);
      };
      
      next();
    } catch (error) {
      next();
    }
  };
};

module.exports = cache;
```

**Usage:**
```javascript
const cache = require('./middleware/cache');

// Cache product list for 5 minutes
router.get('/products', cache(300), productController.getAllProducts);
```

### 6.3 Database Optimization

**Create indexes:**

**backend/scripts/createIndexes.js:**
```javascript
const mongoose = require('mongoose');
require('dotenv').config();

async function createIndexes() {
  await mongoose.connect(process.env.MONGO_URI);
  
  const db = mongoose.connection.db;
  
  // Products indexes
  await db.collection('products').createIndex({ name: 'text', description: 'text' });
  await db.collection('products').createIndex({ category: 1 });
  await db.collection('products').createIndex({ price: 1 });
  await db.collection('products').createIndex({ stock: 1 });
  await db.collection('products').createIndex({ createdAt: -1 });
  
  // Users indexes
  await db.collection('users').createIndex({ email: 1 }, { unique: true });
  await db.collection('users').createIndex({ role: 1 });
  
  // Orders indexes
  await db.collection('orders').createIndex({ userId: 1 });
  await db.collection('orders').createIndex({ createdAt: -1 });
  await db.collection('orders').createIndex({ status: 1 });
  
  console.log('✅ Indexes created successfully');
  await mongoose.disconnect();
}

createIndexes();
```

**Run on production:**
```bash
node backend/scripts/createIndexes.js
```

### 6.4 CDN Integration

**Option 1: Cloudflare (Recommended)**

1. Sign up at cloudflare.com
2. Add your domain
3. Update nameservers at domain registrar
4. Enable:
   - Auto Minify (JS, CSS, HTML)
   - Brotli compression
   - Rocket Loader
   - Caching Level: Standard
   - Browser Cache TTL: 4 hours

**Option 2: CloudFront (AWS)**

1. Create CloudFront distribution
2. Origin: Your domain
3. Behaviors: Cache static assets
4. SSL Certificate: ACM
5. Update frontend to use CloudFront URLs

### 6.5 Image Optimization

**Already using Cloudinary** - ensure transformations:

```javascript
// backend/config/cloudinary.js
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Optimize uploads
const uploadOptions = {
  folder: 'ecommerce/products',
  transformation: [
    { width: 800, height: 800, crop: 'limit' },
    { quality: 'auto:good' },
    { fetch_format: 'auto' }
  ]
};

module.exports = { cloudinary, uploadOptions };
```

### 6.6 Load Balancing (Multi-Server)

**Nginx Load Balancer:**

```nginx
# /etc/nginx/sites-available/load-balancer

upstream backend_servers {
    least_conn;  # Load balancing method
    
    server 10.0.1.10:5000 weight=3;
    server 10.0.1.11:5000 weight=2;
    server 10.0.1.12:5000 weight=1 backup;
    
    # Health checks
    keepalive 32;
}

server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://backend_servers;
        proxy_http_version 1.1;
        proxy_set_header Connection "";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        
        # Enable keepalive
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
```

### 6.7 Database Replication (MongoDB)

**For high availability:**

```bash
# MongoDB Replica Set (3 nodes minimum)
mongosh

rs.initiate({
  _id: "rs0",
  members: [
    { _id: 0, host: "mongo1.yourdomain.com:27017" },
    { _id: 1, host: "mongo2.yourdomain.com:27017" },
    { _id: 2, host: "mongo3.yourdomain.com:27017" }
  ]
})

# Connection string for replica set:
MONGO_URI=mongodb://mongo1.yourdomain.com:27017,mongo2.yourdomain.com:27017,mongo3.yourdomain.com:27017/ecommerce_prod?replicaSet=rs0
```

---

## 7. Monitoring & Maintenance

### 7.1 PM2 Monitoring

**Built-in monitoring:**
```bash
# Real-time monitoring
pm2 monit

# Logs
pm2 logs
pm2 logs --lines 100

# Application metrics
pm2 describe ecommerce-api
```

**PM2 Plus (Advanced Monitoring):**
```bash
# Sign up at pm2.io
pm2 link <secret_key> <public_key>

# Features:
# - Real-time metrics
# - Exception tracking
# - Custom metrics
# - Alerts
```

### 7.2 Application Logging (Winston)

**Already configured** - check `backend/config/logger.js`

**Log rotation:**
```bash
sudo nano /etc/logrotate.d/ecommerce
```

**ecommerce:**
```
/var/www/ecommerce/backend/logs/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 deploy deploy
    sharedscripts
    postrotate
        pm2 reloadLogs
    endscript
}
```

### 7.3 Uptime Monitoring

**Option 1: UptimeRobot (Free)**
- Website: uptimerobot.com
- Add monitors for:
  - https://yourdomain.com (HTTP)
  - https://yourdomain.com/api/health (API)
- Alert via email/SMS

**Option 2: Custom Health Check Endpoint**

**backend/routes/health.js:**
```javascript
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const redis = require('../config/redis');

router.get('/health', async (req, res) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    checks: {
      database: 'unknown',
      redis: 'unknown'
    }
  };

  // Check MongoDB
  try {
    const dbState = mongoose.connection.readyState;
    health.checks.database = dbState === 1 ? 'connected' : 'disconnected';
  } catch (error) {
    health.checks.database = 'error';
    health.status = 'degraded';
  }

  // Check Redis
  try {
    await redis.ping();
    health.checks.redis = 'connected';
  } catch (error) {
    health.checks.redis = 'error';
    health.status = 'degraded';
  }

  const httpStatus = health.status === 'ok' ? 200 : 503;
  res.status(httpStatus).json(health);
});

module.exports = router;
```

**Add to backend/index.js:**
```javascript
const healthRouter = require('./routes/health');
app.use('/api', healthRouter);
```

### 7.4 Error Tracking (Sentry)

```bash
npm install @sentry/node @sentry/profiling-node
```

**backend/index.js:**
```javascript
const Sentry = require("@sentry/node");
const { ProfilingIntegration } = require("@sentry/profiling-node");

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  integrations: [
    new ProfilingIntegration(),
  ],
  tracesSampleRate: 1.0,
  profilesSampleRate: 1.0,
  environment: process.env.NODE_ENV
});

// Error handler
app.use(Sentry.Handlers.errorHandler());
```

### 7.5 Performance Monitoring

**New Relic APM:**
```bash
npm install newrelic
```

**newrelic.js:**
```javascript
exports.config = {
  app_name: ['E-Commerce API'],
  license_key: process.env.NEW_RELIC_LICENSE_KEY,
  logging: {
    level: 'info'
  }
};
```

**Require at app start:**
```javascript
// First line in backend/index.js
require('newrelic');
```

### 7.6 Database Monitoring

**MongoDB Monitoring:**
```bash
# Enable MongoDB monitoring
mongosh

use admin
db.setProfilingLevel(1, { slowms: 100 })

# View slow queries
db.system.profile.find().sort({ ts: -1 }).limit(10)
```

**MongoDB Atlas (Recommended):**
- Automatic backups
- Performance advisor
- Real-time monitoring
- Alerts

### 7.7 Nginx Monitoring

**Access logs analysis:**
```bash
# Install GoAccess
sudo apt install goaccess

# Real-time dashboard
goaccess /var/log/nginx/ecommerce_access.log -o report.html --log-format=COMBINED --real-time-html
```

**Nginx status module:**
```nginx
# Add to Nginx config
location /nginx_status {
    stub_status on;
    access_log off;
    allow 127.0.0.1;
    deny all;
}
```

### 7.8 Automated Maintenance Scripts

**backup-daily.sh:**
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/ecommerce"

# MongoDB backup
mongodump --uri="$MONGO_URI" --out="$BACKUP_DIR/mongo_$DATE"

# Redis backup
redis-cli --rdb "$BACKUP_DIR/redis_$DATE.rdb"

# Application code backup
tar -czf "$BACKUP_DIR/app_$DATE.tar.gz" /var/www/ecommerce

# Keep only last 7 days
find $BACKUP_DIR -type f -mtime +7 -delete

echo "Backup completed: $DATE"
```

**health-check.sh:**
```bash
#!/bin/bash
HEALTH_URL="https://yourdomain.com/api/health"

RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" $HEALTH_URL)

if [ $RESPONSE -ne 200 ]; then
    echo "Health check failed! Response: $RESPONSE"
    # Send alert (email, SMS, Slack, etc.)
    pm2 restart ecommerce-api
fi
```

**Schedule with cron:**
```bash
sudo crontab -e

# Daily backup at 2 AM
0 2 * * * /usr/local/bin/backup-daily.sh >> /var/log/backup.log 2>&1

# Health check every 5 minutes
*/5 * * * * /usr/local/bin/health-check.sh >> /var/log/health-check.log 2>&1

# SSL renewal check (Certbot handles this automatically, but verify)
0 0 1 * * certbot renew --quiet
```

---

## 8. Domain & DNS Configuration

### 8.1 Domain Registration

**Recommended Registrars:**
- Namecheap
- Google Domains
- Cloudflare Registrar
- GoDaddy

**Cost:** $10-15/year

### 8.2 DNS Configuration

**Required DNS Records:**

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | @ | YOUR_SERVER_IP | 3600 |
| A | www | YOUR_SERVER_IP | 3600 |
| CNAME | api | yourdomain.com | 3600 |
| TXT | @ | SPF record for email | 3600 |
| MX | @ | Email server (if hosting email) | 3600 |

**Example (Cloudflare/Namecheap):**
```
Type: A
Name: @
Value: 203.0.113.50
TTL: Auto

Type: A
Name: www
Value: 203.0.113.50
TTL: Auto

Type: CNAME
Name: api
Value: yourdomain.com
TTL: Auto
```

### 8.3 DNS Propagation

```bash
# Check DNS propagation
dig yourdomain.com
nslookup yourdomain.com

# Online tool: dnschecker.org
```

**Propagation time:** 0-48 hours (usually < 1 hour)

### 8.4 Email Configuration (Optional)

**For transactional emails (using Gmail):**

**SPF Record:**
```
Type: TXT
Name: @
Value: v=spf1 include:_spf.google.com ~all
```

**DKIM Setup:**
1. Google Workspace → Admin Console
2. Apps → Google Workspace → Gmail → Authenticate email
3. Generate DKIM key
4. Add TXT record provided by Google

### 8.5 Subdomain Setup (if needed)

**For separate API domain:**
```
Type: A
Name: api
Value: YOUR_SERVER_IP
```

**Update Nginx configuration** for `api.yourdomain.com`

---

## 9. Backup & Disaster Recovery

### 9.1 Backup Strategy

**What to backup:**
1. Database (MongoDB)
2. Redis data
3. Application code
4. Uploaded files (if not using Cloudinary)
5. Configuration files (.env, Nginx configs)
6. SSL certificates

### 9.2 Automated Backup Script

**comprehensive-backup.sh:**
```bash
#!/bin/bash
set -e

# Configuration
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_ROOT="/var/backups/ecommerce"
BACKUP_DIR="$BACKUP_ROOT/$DATE"
RETENTION_DAYS=30
S3_BUCKET="s3://your-backup-bucket/ecommerce"

# Create backup directory
mkdir -p "$BACKUP_DIR"

echo "Starting backup: $DATE"

# 1. MongoDB Backup
echo "Backing up MongoDB..."
mongodump --uri="$MONGO_URI" --out="$BACKUP_DIR/mongodb" --gzip

# 2. Redis Backup
echo "Backing up Redis..."
redis-cli --rdb "$BACKUP_DIR/redis.rdb"

# 3. Application Code
echo "Backing up application..."
tar -czf "$BACKUP_DIR/application.tar.gz" \
    --exclude='node_modules' \
    --exclude='logs' \
    --exclude='.git' \
    /var/www/ecommerce

# 4. Configuration Files
echo "Backing up configurations..."
mkdir -p "$BACKUP_DIR/configs"
cp /var/www/ecommerce/backend/.env "$BACKUP_DIR/configs/"
cp /etc/nginx/sites-available/ecommerce "$BACKUP_DIR/configs/"
cp /var/www/ecommerce/backend/ecosystem.config.js "$BACKUP_DIR/configs/"

# 5. SSL Certificates
echo "Backing up SSL certificates..."
sudo tar -czf "$BACKUP_DIR/ssl.tar.gz" /etc/letsencrypt

# 6. Compress entire backup
echo "Compressing backup..."
cd "$BACKUP_ROOT"
tar -czf "backup_$DATE.tar.gz" "$DATE"
rm -rf "$DATE"

# 7. Upload to S3 (optional)
if command -v aws &> /dev/null; then
    echo "Uploading to S3..."
    aws s3 cp "backup_$DATE.tar.gz" "$S3_BUCKET/"
fi

# 8. Clean old backups
echo "Cleaning old backups..."
find "$BACKUP_ROOT" -name "backup_*.tar.gz" -mtime +$RETENTION_DAYS -delete

# 9. Verify backup
BACKUP_SIZE=$(du -sh "$BACKUP_ROOT/backup_$DATE.tar.gz" | cut -f1)
echo "✅ Backup completed successfully!"
echo "   Size: $BACKUP_SIZE"
echo "   Location: $BACKUP_ROOT/backup_$DATE.tar.gz"

# 10. Send notification
curl -X POST "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/sendMessage" \
    -d "chat_id=$TELEGRAM_CHAT_ID" \
    -d "text=✅ E-Commerce backup completed: $DATE (Size: $BACKUP_SIZE)"
```

**Make executable and schedule:**
```bash
sudo chmod +x /usr/local/bin/comprehensive-backup.sh

# Daily at 3 AM
sudo crontab -e
0 3 * * * /usr/local/bin/comprehensive-backup.sh >> /var/log/backup.log 2>&1
```

### 9.3 Database Point-in-Time Recovery

**MongoDB Oplog (Replica Set Required):**

```javascript
// Enable oplog
rs.status()

// Restore to specific time
mongorestore --oplogReplay --oplogLimit 1640995200:1 /path/to/backup
```

### 9.4 Disaster Recovery Plan

**Recovery Time Objective (RTO):** 2 hours  
**Recovery Point Objective (RPO):** 24 hours

**Recovery Steps:**

**Scenario 1: Server Crash**

```bash
# 1. Provision new server
# 2. Install dependencies (use saved script)
bash /path/to/server-setup.sh

# 3. Restore from backup
cd /var/backups/ecommerce
tar -xzf backup_LATEST.tar.gz
cd backup_LATEST

# 4. Restore MongoDB
mongorestore --gzip mongodb/

# 5. Restore Redis
redis-cli --rdb redis.rdb

# 6. Restore application
tar -xzf application.tar.gz -C /var/www/

# 7. Restore configs
cp configs/.env /var/www/ecommerce/backend/
cp configs/ecommerce /etc/nginx/sites-available/

# 8. Restore SSL
tar -xzf ssl.tar.gz -C /

# 9. Start services
pm2 start ecosystem.config.js --env production
sudo systemctl restart nginx

# 10. Verify
curl https://yourdomain.com/api/health
```

**Scenario 2: Database Corruption**

```bash
# Stop application
pm2 stop all

# Restore from last good backup
mongorestore --drop --gzip /var/backups/ecommerce/latest/mongodb/

# Restart application
pm2 start all
```

**Scenario 3: Accidental Data Deletion**

```bash
# Restore specific collection
mongorestore --gzip --nsInclude="ecommerce_prod.products" /var/backups/ecommerce/latest/mongodb/
```

### 9.5 Off-Site Backup (S3/Backblaze)

**Install AWS CLI:**
```bash
sudo apt install awscli
aws configure
```

**Automated S3 sync:**
```bash
#!/bin/bash
# sync-to-s3.sh

LOCAL_BACKUP="/var/backups/ecommerce"
S3_BUCKET="s3://your-backup-bucket/ecommerce"

# Sync to S3
aws s3 sync "$LOCAL_BACKUP" "$S3_BUCKET" \
    --storage-class STANDARD_IA \
    --exclude "*" \
    --include "backup_*.tar.gz"

# Lifecycle policy (delete after 90 days)
# Configure in S3 console or CLI
```

**Alternative: Backblaze B2 (Cost-effective)**
```bash
# Install B2 CLI
pip install b2

# Configure
b2 authorize-account

# Upload
b2 sync /var/backups/ecommerce b2://your-bucket-name/ecommerce
```

### 9.6 Testing Disaster Recovery

**Quarterly DR Test:**

```bash
# 1. Create test environment
# 2. Restore from backup
# 3. Verify functionality
# 4. Document results
# 5. Update recovery procedures
```

---

## 10. Post-Deployment Validation

### 10.1 Functional Testing

**Manual Tests:**

1. ✅ Homepage loads
2. ✅ User registration works
3. ✅ User login works
4. ✅ Product listing displays
5. ✅ Product search functions
6. ✅ Add to cart works
7. ✅ Checkout process completes
8. ✅ Payment processing (test mode)
9. ✅ Order confirmation email sent
10. ✅ Admin panel accessible
11. ✅ Admin can manage products
12. ✅ Google OAuth login works

**Automated Tests:**

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm run test

# E2E tests (if configured)
npm run cypress:run
```

### 10.2 Performance Testing

**Load Testing with Apache Bench:**

```bash
# Install
sudo apt install apache2-utils

# Test homepage
ab -n 1000 -c 10 https://yourdomain.com/

# Test API endpoint
ab -n 500 -c 5 https://yourdomain.com/api/products

# Expected results:
# - Response time < 200ms
# - No failed requests
# - Requests per second > 50
```

**Load Testing with Artillery:**

```bash
npm install -g artillery

# Create test scenario
cat > load-test.yml << EOF
config:
  target: 'https://yourdomain.com'
  phases:
    - duration: 60
      arrivalRate: 10
      name: Warm up
    - duration: 300
      arrivalRate: 50
      name: Sustained load
scenarios:
  - name: "Browse products"
    flow:
      - get:
          url: "/api/products"
      - get:
          url: "/api/products/{{ \$randomNumber(1, 100) }}"
EOF

# Run test
artillery run load-test.yml
```

### 10.3 Security Testing

**SSL Test:**
```bash
# Check SSL configuration
curl -I https://yourdomain.com

# SSL Labs test
# Visit: https://www.ssllabs.com/ssltest/analyze.html?d=yourdomain.com
```

**Security Headers:**
```bash
curl -I https://yourdomain.com | grep -E "Strict-Transport-Security|X-Frame-Options|X-Content-Type-Options"
```

**Vulnerability Scan:**
```bash
# OWASP ZAP (automated security testing)
docker run -t owasp/zap2docker-stable zap-baseline.py -t https://yourdomain.com
```

### 10.4 Monitoring Validation

**Check monitoring services:**

1. ✅ PM2 monitoring active
   ```bash
   pm2 list
   pm2 monit
   ```

2. ✅ Logs being written
   ```bash
   tail -f /var/www/ecommerce/backend/logs/combined.log
   ```

3. ✅ Uptime monitor configured (UptimeRobot)

4. ✅ Error tracking active (Sentry, if configured)

5. ✅ Health endpoint responding
   ```bash
   curl https://yourdomain.com/api/health
   ```

### 10.5 Backup Validation

```bash
# Verify backup exists
ls -lh /var/backups/ecommerce/

# Test restore on staging environment
# (Never test on production!)
```

### 10.6 DNS & Domain Validation

```bash
# Check DNS propagation
dig yourdomain.com +short
dig www.yourdomain.com +short

# Check SSL certificate
openssl s_client -connect yourdomain.com:443 -servername yourdomain.com < /dev/null | grep "Verify return code"

# Expected: Verify return code: 0 (ok)
```

### 10.7 Performance Benchmarks

**Google PageSpeed Insights:**
- Visit: https://pagespeed.web.dev/
- Target Score: > 90

**WebPageTest:**
- Visit: https://www.webpagetest.org/
- Target First Byte Time: < 500ms

### 10.8 Final Checklist

```
Production Deployment Checklist:

Infrastructure:
[ ] Server provisioned and secured
[ ] Firewall configured (UFW)
[ ] Fail2Ban installed and active
[ ] SSL certificate installed and valid
[ ] Nginx configured as reverse proxy
[ ] Domain pointing to server

Application:
[ ] Backend running on PM2
[ ] Frontend built and served
[ ] Environment variables configured
[ ] Database indexes created
[ ] Redis caching active
[ ] Cloudinary configured

Security:
[ ] Passwords are strong and unique
[ ] .env files secured (chmod 600)
[ ] MongoDB authentication enabled
[ ] Redis password protected
[ ] Security headers configured
[ ] Rate limiting active
[ ] CORS properly configured

Monitoring:
[ ] PM2 monitoring active
[ ] Application logs working
[ ] Health endpoint responding
[ ] Uptime monitor configured
[ ] Error tracking setup (optional)

Backup:
[ ] Automated backup script scheduled
[ ] Backup restoration tested
[ ] Off-site backup configured (optional)

Performance:
[ ] Load testing completed
[ ] Response times acceptable
[ ] Caching working properly
[ ] CDN configured (optional)

Validation:
[ ] All features tested and working
[ ] SSL certificate valid
[ ] Google OAuth working
[ ] Email sending functional
[ ] Payment processing tested (test mode)
[ ] Admin panel accessible

Documentation:
[ ] Server access credentials documented
[ ] API documentation up to date
[ ] Runbook created for common issues
[ ] Emergency contacts list created
```

---

## 11. Maintenance Runbook

### 11.1 Common Issues & Solutions

**Issue 1: Application Not Responding**

```bash
# Check if PM2 is running
pm2 status

# Restart application
pm2 restart ecommerce-api

# Check logs for errors
pm2 logs --lines 50

# If issue persists, check system resources
free -h
df -h
top
```

**Issue 2: Database Connection Errors**

```bash
# Check MongoDB status
sudo systemctl status mongod

# Restart MongoDB
sudo systemctl restart mongod

# Check connection
mongosh --eval "db.adminCommand('ping')"

# Check logs
sudo tail -f /var/log/mongodb/mongod.log
```

**Issue 3: High Memory Usage**

```bash
# Check memory usage
free -h
pm2 monit

# Restart PM2 processes
pm2 restart all

# Clear Redis cache if needed
redis-cli FLUSHALL
```

**Issue 4: SSL Certificate Expired**

```bash
# Renew certificate
sudo certbot renew

# If renewal fails, force renew
sudo certbot renew --force-renewal

# Reload Nginx
sudo systemctl reload nginx
```

**Issue 5: Slow Response Times**

```bash
# Check Redis
redis-cli ping

# Clear cache
redis-cli FLUSHALL

# Check database slow queries
mongosh
use ecommerce_prod
db.system.profile.find().sort({ ts: -1 }).limit(10)

# Restart application
pm2 restart all
```

### 11.2 Scaling Procedures

**Vertical Scaling (Upgrade Server):**

```bash
# 1. Take backup
/usr/local/bin/comprehensive-backup.sh

# 2. Snapshot current server (at VPS provider)
# 3. Resize/upgrade server
# 4. Restart services
sudo reboot

# 5. Verify application
curl https://yourdomain.com/api/health
```

**Horizontal Scaling (Add Servers):**

```bash
# 1. Set up new server with same configuration
# 2. Install application
# 3. Configure as replica
# 4. Update load balancer (Nginx)
# 5. Test traffic distribution
```

### 11.3 Regular Maintenance Schedule

**Daily:**
- Check error logs
- Monitor application performance
- Review uptime reports

**Weekly:**
- Review security logs
- Check backup completion
- Update dependencies (if patches available)

**Monthly:**
- Security updates
- Performance audit
- Backup restoration test
- Review and optimize database queries

**Quarterly:**
- Disaster recovery drill
- Capacity planning review
- Security audit
- SSL certificate expiry check

---

## 12. Cost Estimation

### 12.1 VPS Hosting (Recommended for This Project)

**Provider: Linode/DigitalOcean/Vultr**

| Resource | Specification | Cost/Month |
|----------|---------------|------------|
| VPS | 4 CPU, 8GB RAM, 160GB SSD | $40 |
| MongoDB Atlas | Shared Cluster (Optional) | $0-9 |
| Cloudinary | Free tier (25GB storage) | $0 |
| Domain | .com domain | $1 (yearly) |
| SSL | Let's Encrypt | $0 |
| Email | Gmail (existing) | $0 |
| Backups | Server backups | $5 |
| **Total** | | **~$46/month** |

### 12.2 Cloud Hosting (AWS)

| Resource | Specification | Cost/Month |
|----------|---------------|------------|
| EC2 | t3.medium (2 vCPU, 4GB RAM) | $30 |
| RDS/Atlas | MongoDB managed | $15 |
| ElastiCache | Redis (cache.t3.micro) | $12 |
| S3 | Storage (50GB) | $1 |
| CloudFront | CDN (1TB transfer) | $80 |
| Route 53 | DNS | $1 |
| Data Transfer | Out (100GB) | $9 |
| **Total** | | **~$148/month** |

### 12.3 Serverless (Vercel + Railway)

| Resource | Specification | Cost/Month |
|----------|---------------|------------|
| Vercel | Pro plan (frontend) | $20 |
| Railway | Backend hosting | $20 |
| MongoDB Atlas | M2 cluster | $9 |
| Upstash Redis | Pro plan | $10 |
| **Total** | | **~$59/month** |

**Recommendation:** Start with VPS ($46/month), scale to AWS when needed.

---

## 13. Quick Start Deployment

### 13.1 Fastest Path to Production (30 Minutes)

**Using Render.com (Simplest):**

1. **Backend:**
   ```bash
   # Create render.yaml in root
   cat > render.yaml << EOF
   services:
     - type: web
       name: ecommerce-backend
       env: node
       buildCommand: cd backend && npm install
       startCommand: cd backend && npm start
       envVars:
         - key: NODE_ENV
           value: production
         - key: PORT
           value: 5000
   EOF
   
   # Push to GitHub
   git add render.yaml
   git commit -m "Add Render config"
   git push
   
   # Connect repository at render.com
   # Add environment variables in dashboard
   ```

2. **Frontend:**
   ```bash
   # Deploy to Vercel
   cd frontend
   npx vercel --prod
   
   # Follow prompts
   # Add API URL as environment variable
   ```

3. **Database:**
   - Sign up at mongodb.com/atlas
   - Create free cluster
   - Whitelist IPs (0.0.0.0/0 for development)
   - Copy connection string to Render env vars

**Total time:** ~30 minutes  
**Cost:** $0-10/month

---

## 14. Support & Resources

### 14.1 Documentation

- **Project Documentation:** `/docs` folder
- **API Documentation:** `API_DOCUMENTATION.md`
- **Quick Start:** `QUICK_START.md`

### 14.2 Useful Commands Reference

```bash
# PM2 Commands
pm2 start ecosystem.config.js --env production
pm2 stop all
pm2 restart all
pm2 reload all  # Zero-downtime restart
pm2 delete all
pm2 logs
pm2 monit
pm2 list

# Nginx Commands
sudo nginx -t  # Test configuration
sudo systemctl start nginx
sudo systemctl stop nginx
sudo systemctl restart nginx
sudo systemctl reload nginx
sudo systemctl status nginx

# MongoDB Commands
sudo systemctl start mongod
sudo systemctl stop mongod
sudo systemctl status mongod
mongosh  # Connect to MongoDB

# Redis Commands
sudo systemctl start redis-server
sudo systemctl stop redis-server
redis-cli  # Connect to Redis
redis-cli FLUSHALL  # Clear all cache

# Git Deployment
git pull origin main
cd backend && npm install --production
cd ../frontend && npm run build
pm2 reload all

# SSL Certificate Renewal
sudo certbot renew
sudo certbot renew --dry-run  # Test renewal

# System Monitoring
htop  # Process monitor
df -h  # Disk usage
free -h  # Memory usage
netstat -tulpn  # Network connections
journalctl -u nginx -f  # Nginx logs
```

### 14.3 Emergency Contacts

```
Server Provider: [provider support]
Domain Registrar: [registrar support]
MongoDB Atlas: support.mongodb.com
Cloudinary: support.cloudinary.com
Stripe: support.stripe.com
```

### 14.4 Additional Resources

- **Node.js Best Practices:** github.com/goldbergyoni/nodebestpractices
- **Nginx Documentation:** nginx.org/en/docs/
- **MongoDB Manual:** docs.mongodb.com/manual/
- **PM2 Documentation:** pm2.keymetrics.io/docs/
- **Let's Encrypt:** letsencrypt.org/docs/

---

## 15. Conclusion

This comprehensive deployment guide provides enterprise-grade deployment strategies for your MERN stack e-commerce application. The guide covers:

✅ **Complete infrastructure setup** from server provisioning to SSL configuration  
✅ **Security best practices** including firewall, authentication, and vulnerability protection  
✅ **Scalability strategies** with caching, load balancing, and auto-scaling  
✅ **Monitoring and maintenance** with automated logging, alerts, and health checks  
✅ **Backup and disaster recovery** with automated backups and tested recovery procedures  
✅ **CI/CD pipelines** for automated deployment and zero-downtime updates

### Next Steps:

1. Choose hosting provider based on budget and requirements
2. Follow pre-deployment checklist
3. Execute deployment steps
4. Validate with post-deployment tests
5. Set up monitoring and backups
6. Document server access credentials
7. Create runbook for your team

### Estimated Timeline:

- **Initial Deployment:** 4-6 hours
- **Full Production Setup:** 1-2 days
- **Security Hardening:** 1 day
- **Monitoring Setup:** 2-4 hours

**Your application is ready for production deployment!** 🚀

For questions or issues, refer to the runbook or contact your DevOps team.

---

**Last Updated:** December 22, 2025  
**Version:** 1.0  
**Maintained By:** DevOps Team
