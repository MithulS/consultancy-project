# 🔧 Google OAuth "invalid_client" Error Fix

## Problem
You're seeing this error when trying to sign in with Google:
```
Access blocked: Authorization Error
Error 401: invalid_client
```

## Root Cause
The OAuth client configuration in Google Cloud Console doesn't match your application settings, or the credentials are invalid.

---

## ✅ Solution Steps

### Step 1: Access Google Cloud Console

1. Go to: https://console.cloud.google.com/apis/credentials
2. Sign in with your Google account (mithuld321@gmail.com)
3. Select your project or create a new one

### Step 2: Verify OAuth 2.0 Client ID

1. Look for your existing OAuth 2.0 Client ID:
   ```
   513465967830-s6djtj28aeojt17tfgsr114t5sqq74s.apps.googleusercontent.com
   ```

2. **If it exists:**
   - Click on it to edit
   - Proceed to Step 3

3. **If it doesn't exist (or was deleted):**
   - Click **"+ CREATE CREDENTIALS"** → **"OAuth client ID"**
   - Choose **"Web application"**
   - Name it: "Consultancy App"
   - Proceed to Step 3

### Step 3: Configure Authorized Redirect URIs

Add these EXACT URIs (case-sensitive):

**For Development:**
```
http://localhost:5000/api/auth/google/callback
```

**For Production (when deploying):**
```
https://your-api-domain.com/api/auth/google/callback
```

### Step 4: Configure Authorized JavaScript Origins

Add these origins:

**For Development:**
```
http://localhost:5000
http://localhost:5173
http://localhost:5174
```

**For Production:**
```
https://your-api-domain.com
https://your-frontend-domain.com
```

### Step 5: Update Environment Variables

1. **If you created a NEW OAuth client**, update your `.env` file:

```bash
cd d:\consultancy\backend
notepad .env
```

Update with your new credentials:
```env
GOOGLE_CLIENT_ID=your-new-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your-new-secret
GOOGLE_REDIRECT_URI=http://localhost:5000/api/auth/google/callback
```

2. **Save the file**

### Step 6: Enable Required APIs

In Google Cloud Console, ensure these APIs are enabled:
1. **Google+ API** (or **People API**)
2. **Google OAuth2 API**

To enable:
1. Go to: https://console.cloud.google.com/apis/library
2. Search for "Google+ API" or "People API"
3. Click **ENABLE**

### Step 7: Restart Your Backend Server

```bash
# Stop the current server (Ctrl+C in terminal)
# Then restart:
cd d:\consultancy\backend
node server.js
```

---

## 🧪 Testing

1. **Clear browser cache and cookies** for localhost
2. Open your app: http://localhost:5173
3. Click "Sign in with Google"
4. You should see the Google account selection screen
5. Select your account
6. Authorize the app
7. You should be redirected back and logged in

---

## 🔍 Common Issues & Solutions

### Issue 1: "redirect_uri_mismatch"
**Solution:** The redirect URI in your `.env` file must EXACTLY match what's in Google Cloud Console (including protocol, port, and path).

### Issue 2: "access_denied"
**Solution:** The OAuth consent screen may be in "Testing" mode. Add your email as a test user:
- Go to: https://console.cloud.google.com/apis/credentials/consent
- Add test users under "Test users"

### Issue 3: Still getting "invalid_client"
**Solution:** 
1. Double-check your Client ID and Secret in `.env`
2. Make sure there are no extra spaces or line breaks
3. Regenerate the Client Secret in Google Cloud Console if needed

### Issue 4: "OAuth consent screen not configured"
**Solution:**
1. Go to: https://console.cloud.google.com/apis/credentials/consent
2. Choose "External" user type
3. Fill in required fields:
   - App name: "Consultancy App"
   - User support email: your email
   - Developer contact: your email
4. Click "Save and Continue"
5. Skip scopes (click "Save and Continue")
6. Add test users (your email)
7. Click "Save and Continue"

---

## 📝 Current Configuration

**Your current settings (.env):**
```
Client ID: 513465967830-s6djtj28aeojt17tfgsr114t5sqq74s.apps.googleusercontent.com
Redirect URI: http://localhost:5000/api/auth/google/callback
```

**What needs to match in Google Cloud Console:**
- Authorized redirect URIs must include: `http://localhost:5000/api/auth/google/callback`
- Authorized JavaScript origins must include: `http://localhost:5000` and `http://localhost:5173`

---

## 🚀 Quick Verification Commands

```bash
# Check if .env has correct variables
cd d:\consultancy\backend
findstr "GOOGLE" .env

# Restart backend
node server.js

# Check backend logs for OAuth configuration
# Look for: "Google OAuth flow initiated" messages
```

---

## 📚 Additional Resources

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [OAuth 2.0 Redirect URI Guide](https://developers.google.com/identity/protocols/oauth2/web-server#uri-validation)
- [Common OAuth Errors](https://developers.google.com/identity/protocols/oauth2/web-server#error-codes)

---

## ⚠️ Security Notes

- Never commit `.env` file to git
- Keep your Client Secret private
- Rotate secrets if they're exposed
- Use environment-specific credentials for production

---

**Last Updated:** January 28, 2026
