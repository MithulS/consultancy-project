# 🔧 Quick Setup - Google OAuth Configuration

## ⚡ 5-Minute Setup Guide

### Step 1: Backend Environment Variables

Create/edit `backend/.env`:

```env
# Google OAuth (REQUIRED)
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=http://localhost:5000/api/auth/google/callback

# Application URLs
FRONTEND_URL=http://localhost:5173
PORT=5000

# Security
JWT_SECRET=your-super-secure-random-string-min-32-chars

# Database
MONGODB_URI=mongodb://localhost:27017/ecommerce

# Email (Optional for OAuth)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
NODE_ENV=development
```

### Step 2: Google Cloud Console Setup

1. **Visit**: https://console.cloud.google.com/
2. **Create/Select Project**
3. **Enable APIs**:
   - Navigate to "APIs & Services" > "Library"
   - Enable "Google+ API"

4. **Create Credentials**:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client ID"
   - Application type: **Web application**
   
5. **Configure Authorized Origins**:
   ```
   http://localhost:5173
   http://localhost:5174
   http://localhost:5000
   ```

6. **Configure Redirect URIs**:
   ```
   http://localhost:5000/api/auth/google/callback
   ```

7. **Save Credentials**:
   - Copy **Client ID** → `GOOGLE_CLIENT_ID`
   - Copy **Client Secret** → `GOOGLE_CLIENT_SECRET`

### Step 3: Start Application

```bash
# Terminal 1 - Backend
cd backend
npm install
node index.js

# Terminal 2 - Frontend
cd frontend
npm install
npm run dev
```

### Step 4: Test

1. Open: http://localhost:5173/#login
2. Click "Continue with Google"
3. Select Google account
4. Should redirect to dashboard ✅

---

## ✅ Quick Verification

Run these commands to verify setup:

```bash
# Test backend health
curl http://localhost:5000/api/health

# Check environment variables
curl http://localhost:5000/api/auth/debug-env

# Should see:
# { "EMAIL_USER": "SET", "EMAIL_PASS": "SET", ... }
```

---

## 🐛 Quick Troubleshooting

| Issue | Solution |
|-------|----------|
| `redirect_uri_mismatch` | Check Google Console redirect URI matches exactly |
| `Google login not configured` | Add `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` to `.env` |
| `CORS error` | Restart backend, check port is 5000 |
| Page loops | Clear browser cache, localStorage, sessionStorage |
| `next is not a function` | ✅ Fixed in updated code! Just restart backend |

---

## 📋 Environment Variable Template

Save as `backend/.env.example`:

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=http://localhost:5000/api/auth/google/callback

# Application Configuration
FRONTEND_URL=http://localhost:5173
PORT=5000
NODE_ENV=development

# Security
JWT_SECRET=

# Database
MONGODB_URI=mongodb://localhost:27017/ecommerce

# Email Configuration (Optional)
EMAIL_USER=
EMAIL_PASS=
```

---

## 🎯 Production Deployment

When deploying to production:

1. **Update `.env`**:
   ```env
   GOOGLE_REDIRECT_URI=https://yourdomain.com/api/auth/google/callback
   FRONTEND_URL=https://yourdomain.com
   NODE_ENV=production
   ```

2. **Update Google Console**:
   - Add production domain to Authorized Origins
   - Add production callback to Redirect URIs

3. **Test thoroughly**:
   - Test OAuth flow in production
   - Verify SSL certificates
   - Check CORS headers

---

## 📞 Need Help?

See the full diagnostic guide: `GOOGLE_OAUTH_DIAGNOSTIC_GUIDE.md`

**Common Fixes**:
- Restart backend after changing `.env`
- Clear browser cache/cookies
- Check MongoDB is running
- Verify ports 5000 (backend) and 5173 (frontend) are not in use

---

**Status**: ✅ Ready to Use  
**Last Updated**: December 20, 2025
