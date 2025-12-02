# Admin Panel Access Guide

## 🔐 Admin Login System

The admin panel is **completely hidden** from regular users and requires special credentials to access.

### How to Access Admin Panel

1. **Secret URL**: Navigate to `http://localhost:5173/#secret-admin-login`
   - This URL is NOT linked anywhere in the customer-facing interface
   - Regular users cannot discover this URL

2. **Required Credentials**:
   - **Admin Email**: Your registered and verified user email
   - **Password**: Your account password
   - **Admin Access Key**: Special key from environment variable (default: `admin123secret`)

### Setup Admin Access

#### 1. Configure Admin Key

Add to your `backend/.env` file:
```env
ADMIN_KEY=your_secure_admin_key_here
```

**Important**: Change the default key `admin123secret` to something secure!

#### 2. Register and Verify Your Admin Account

```bash
# 1. Register a new account at http://localhost:5173/#register
# 2. Verify email with OTP
# 3. Now you can use this account for admin login
```

#### 3. Access Admin Panel

```
URL: http://localhost:5173/#secret-admin-login

Fields:
- Admin Email: your-email@example.com
- Password: YourPassword123!
- Admin Access Key: admin123secret (or your custom key)
```

### Security Features

✅ **Three-Factor Authentication**:
   - Valid registered email
   - Correct password
   - Admin access key (only you know)

✅ **Hidden from Users**:
   - No links to admin login on customer interface
   - Secret URL not discoverable through navigation
   - Admin routes are separate from user routes

✅ **Audit Logging**:
   - All admin login attempts are logged
   - Failed attempts recorded in audit logs
   - Track who accessed admin panel and when

✅ **Token-Based Session**:
   - Admin sessions use separate JWT tokens
   - 8-hour session expiry
   - Token includes `isAdmin: true` flag

### Admin Panel Features

Once logged in, admins can:

📦 **Product Management**
- View all products in table format
- Add new products
- Edit existing products
- Delete products
- Real-time stock management

📊 **Dashboard Analytics**
- Total products count
- In-stock vs out-of-stock
- Total inventory value
- Quick stats overview

### API Endpoints

```
POST /api/auth/admin-login
Body: {
  "email": "admin@example.com",
  "password": "password123",
  "adminKey": "admin123secret"
}

Response: {
  "msg": "Admin login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "name": "Admin Name",
    "email": "admin@example.com",
    "isAdmin": true
  }
}
```

### Testing Admin Login

```bash
# Using curl
curl -X POST http://localhost:5000/api/auth/admin-login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your-email@example.com",
    "password": "YourPassword123!",
    "adminKey": "admin123secret"
  }'
```

### Production Deployment

**⚠️ CRITICAL SECURITY STEPS:**

1. **Change Admin Key**:
   ```env
   ADMIN_KEY=use_a_very_long_random_secure_key_here
   ```
   Generate secure key:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

2. **Use HTTPS**: Admin panel must be served over HTTPS in production

3. **Rate Limiting**: Admin login endpoints are rate-limited (5 attempts per 15 minutes)

4. **Environment Variables**: Never commit `.env` file to version control

5. **Audit Logs**: Monitor `backend/audit.log` for suspicious activity

### Troubleshooting

**Problem**: Can't login as admin
- ✓ Check admin key matches your `.env` ADMIN_KEY
- ✓ Verify email is registered and verified
- ✓ Check password is correct
- ✓ Look for error messages in browser console
- ✓ Check backend logs for audit events

**Problem**: Admin dashboard redirects to login
- ✓ Admin token might be expired (8-hour limit)
- ✓ Clear browser storage and login again
- ✓ Check localStorage has `isAdmin` flag set to `true`

**Problem**: Backend returns 401 Unauthorized
- ✓ Admin key doesn't match
- ✓ Check `.env` file loaded correctly
- ✓ Restart backend server after changing `.env`

### Support

For issues or questions about admin panel:
1. Check backend logs: `backend/audit.log`
2. Check browser console for errors
3. Verify all environment variables are set correctly
