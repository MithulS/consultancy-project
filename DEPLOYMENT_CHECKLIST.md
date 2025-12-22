# 🚀 Quick Deployment Checklist

## Pre-Deployment (15 minutes)

### 1. Server Preparation
```bash
# Choose your server:
□ VPS Provider selected (Recommended: DigitalOcean/Linode/Vultr)
□ Server specs: 4 CPU, 8GB RAM, 160GB SSD
□ Ubuntu 22.04 LTS installed
□ Root SSH access configured

# Run automated setup:
wget https://raw.githubusercontent.com/MithulS/consultancy-project/main/scripts/server-setup.sh
chmod +x server-setup.sh
sudo bash server-setup.sh
```

### 2. Domain & DNS
```bash
□ Domain purchased (e.g., from Namecheap, Google Domains)
□ DNS A record: @ → YOUR_SERVER_IP
□ DNS A record: www → YOUR_SERVER_IP
□ DNS propagation checked (dnschecker.org)
```

### 3. Environment Variables
```bash
□ Generated secure JWT_SECRET (32-byte hex)
□ Generated secure ADMIN_KEY
□ Configured Gmail App Password
□ Obtained Google OAuth credentials
□ Set up Cloudinary account
□ Configured Stripe keys (test mode initially)
□ Created production MongoDB (local or Atlas)
□ Configured Redis password
```

## Deployment (30 minutes)

### 4. Clone & Configure
```bash
# As deploy user
sudo su - deploy
cd /var/www/ecommerce

# Clone repository
git clone https://github.com/MithulS/consultancy-project.git .

# Configure backend
cd backend
cp .env.example .env
nano .env  # Add production values

# Install dependencies
npm install --production
```

### 5. Build Frontend
```bash
cd /var/www/ecommerce/frontend
npm install
npm run build

# Deploy to web root
sudo cp -r dist/* /var/www/html/ecommerce/
```

### 6. Start Application
```bash
cd /var/www/ecommerce/backend
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup systemd  # Run the command PM2 outputs
```

### 7. Configure Nginx
```bash
# Create Nginx configuration
sudo nano /etc/nginx/sites-available/ecommerce
# Paste configuration from PRODUCTION_DEPLOYMENT_GUIDE.md (section 4.2)

# Enable site
sudo ln -s /etc/nginx/sites-available/ecommerce /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 8. SSL Certificate
```bash
# Install SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Test auto-renewal
sudo certbot renew --dry-run
```

## Post-Deployment (15 minutes)

### 9. Validation
```bash
□ Website loads: https://yourdomain.com
□ API health: https://yourdomain.com/api/health
□ User registration works
□ User login works
□ Google OAuth works
□ Email sending works (OTP)
□ Product listing displays
□ Admin panel accessible
□ Payment test successful

# Check services
pm2 status
pm2 logs
sudo systemctl status nginx
sudo systemctl status mongod
sudo systemctl status redis-server
```

### 10. Monitoring Setup
```bash
# Set up automated backups
sudo cp /var/www/ecommerce/scripts/backup.sh /usr/local/bin/
sudo chmod +x /usr/local/bin/backup.sh

# Schedule daily backups (3 AM)
sudo crontab -e
0 3 * * * /usr/local/bin/backup.sh >> /var/log/backup.log 2>&1

# Set up health checks (every 5 minutes)
sudo cp /var/www/ecommerce/scripts/health-check.sh /usr/local/bin/
sudo chmod +x /usr/local/bin/health-check.sh
*/5 * * * * /usr/local/bin/health-check.sh >> /var/log/health-check.log 2>&1

# Configure external monitoring
□ UptimeRobot account created
□ Monitors configured for website and API
□ Alert email configured
```

### 11. Security Hardening
```bash
□ UFW firewall enabled (ports 22, 80, 443)
□ Fail2Ban configured and running
□ SSH key authentication enabled
□ Password authentication disabled (optional)
□ MongoDB authentication enabled
□ Redis password set
□ .env file permissions: chmod 600
□ Security headers configured in Nginx
□ Rate limiting active
```

### 12. Documentation
```bash
□ Server IP and credentials documented (securely)
□ Database credentials stored in password manager
□ API keys backed up securely
□ Emergency contact list created
□ Deployment procedures documented
□ Team access configured
```

## Quick Commands Reference

### Application Management
```bash
# View status
pm2 status
pm2 monit

# View logs
pm2 logs
pm2 logs --lines 100

# Restart application
pm2 restart ecommerce-api

# Zero-downtime reload
pm2 reload ecommerce-api

# Stop application
pm2 stop ecommerce-api
```

### Deployment Updates
```bash
# Automated deployment
cd /var/www/ecommerce
bash scripts/deploy.sh

# Manual deployment
git pull origin main
cd backend && npm install --production
cd ../frontend && npm run build
sudo cp -r dist/* /var/www/html/ecommerce/
pm2 reload ecommerce-api
sudo systemctl reload nginx
```

### Maintenance
```bash
# Run backup manually
sudo bash /usr/local/bin/backup.sh

# Check health
sudo bash /usr/local/bin/health-check.sh

# View logs
tail -f /var/www/ecommerce/backend/logs/combined.log
sudo tail -f /var/log/nginx/ecommerce_access.log
sudo tail -f /var/log/nginx/ecommerce_error.log

# Check disk space
df -h

# Check memory
free -h

# Check processes
top
htop
```

### Database Operations
```bash
# Connect to MongoDB
mongosh

# Backup database
mongodump --uri="$MONGO_URI" --out=/var/backups/manual/

# Restore database
mongorestore --uri="$MONGO_URI" /path/to/backup/

# Check Redis
redis-cli ping
redis-cli INFO
redis-cli FLUSHALL  # Clear cache
```

### Nginx Operations
```bash
# Test configuration
sudo nginx -t

# Reload (no downtime)
sudo systemctl reload nginx

# Restart
sudo systemctl restart nginx

# View logs
sudo tail -f /var/log/nginx/error.log
```

### SSL Certificate
```bash
# Renew certificate
sudo certbot renew

# Force renewal
sudo certbot renew --force-renewal

# Check expiry
sudo certbot certificates
```

## Troubleshooting

### Application not responding
```bash
pm2 restart ecommerce-api
pm2 logs --lines 50
```

### Database connection errors
```bash
sudo systemctl restart mongod
mongosh --eval "db.adminCommand('ping')"
```

### High memory usage
```bash
pm2 restart all
redis-cli FLUSHALL
```

### SSL certificate issues
```bash
sudo certbot renew --force-renewal
sudo systemctl reload nginx
```

### Nginx errors
```bash
sudo nginx -t
sudo tail -f /var/log/nginx/error.log
sudo systemctl restart nginx
```

## Emergency Rollback

```bash
# If deployment fails, rollback to previous version
cd /var/www/ecommerce
git log --oneline -10  # Find previous commit
git reset --hard <previous-commit-hash>

# Restore from backup
cd /var/backups/ecommerce/pre-deploy
tar -xzf backup_YYYYMMDD_HHMMSS.tar.gz
cp -r backend /var/www/ecommerce/
cp -r frontend /var/www/ecommerce/

# Rebuild and restart
cd /var/www/ecommerce/frontend
npm run build
sudo cp -r dist/* /var/www/html/ecommerce/
cd ../backend
pm2 restart ecommerce-api
```

## Performance Optimization

```bash
# Enable Redis caching (already configured)
# Check cache hit rate
redis-cli INFO stats | grep keyspace

# Create database indexes
cd /var/www/ecommerce/backend
node scripts/createIndexes.js

# Enable Cloudflare (free CDN)
# Sign up at cloudflare.com and add domain

# Monitor performance
pm2 monit
htop
```

## Cost Tracking

### Monthly Costs (VPS Deployment)
- VPS: $40/month
- Domain: $1/month (yearly)
- MongoDB Atlas (optional): $0-9/month
- Cloudinary: $0 (free tier)
- SSL: $0 (Let's Encrypt)
- **Total: ~$41-50/month**

## Support Resources

- **Full Guide:** PRODUCTION_DEPLOYMENT_GUIDE.md
- **API Docs:** API_DOCUMENTATION.md
- **Quick Start:** QUICK_START.md
- **Scripts:** /scripts directory

## Deployment Status

```
Last deployment: _____________
Current version: _____________
Server IP: _____________
Domain: _____________
SSL expiry: _____________
Last backup: _____________
```

---

**✅ Deployment Complete!**

Your e-commerce application is now live and accessible to users worldwide.

**Next Steps:**
1. Test all features thoroughly
2. Monitor logs for first 24 hours
3. Set up automated alerts
4. Plan regular maintenance schedule
5. Document any custom configurations

**Need Help?**
- Check logs: `pm2 logs`
- Run health check: `sudo bash /usr/local/bin/health-check.sh`
- Review full guide: PRODUCTION_DEPLOYMENT_GUIDE.md
