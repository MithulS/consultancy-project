# 🔐 Google OAuth Login - Diagnostic & Configuration Guide

## 🎯 Issues Fixed

### Primary Issue: "next is not a function" Error
**Root Cause**: Async route handlers in Express without proper error handling caused the middleware chain to break.

**Solution**: Added `asyncHandler` wrapper to all Google OAuth routes to properly catch and handle async errors.

### Secondary Issues Fixed:
1. ✅ **Missing async error handling** - All OAuth routes now wrapped with error handlers
2. ✅ **Frontend infinite loop** - Added callback processing flags to prevent re-processing
3. ✅ **Poor error messages** - Enhanced error display with detailed, user-friendly messages
4. ✅ **Environment validation** - Added checks before OAuth flow starts
5. ✅ **Comprehensive logging** - Added detailed console logs for debugging
6. ✅ **Global error handler** - Added Express error middleware to catch all unhandled errors

---

## 📋 Pre-Flight Checklist

### 1. Environment Variables (Backend `.env`)

Ensure these variables are set in `backend/.env`:

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=http://localhost:5000/api/auth/google/callback

# Frontend URL
FRONTEND_URL=http://localhost:5173

# JWT Secret
JWT_SECRET=your-secure-jwt-secret

# MongoDB
MONGODB_URI=mongodb://localhost:27017/your-database

# Email (for notifications)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### 2. Google Cloud Console Setup

1. **Go to**: [Google Cloud Console](https://console.cloud.google.com/)
2. **Create/Select Project**
3. **Enable Google+ API**:
   - Navigate to "APIs & Services" > "Library"
   - Search for "Google+ API"
   - Click "Enable"

4. **Create OAuth 2.0 Credentials**:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client ID"
   - Application type: "Web application"
   - Add Authorized JavaScript origins:
     ```
     http://localhost:5173
     http://localhost:5174
     http://localhost:5000
     ```
   - Add Authorized redirect URIs:
     ```
     http://localhost:5000/api/auth/google/callback
     ```
   - Click "Create"
   - Copy **Client ID** and **Client Secret** to your `.env` file

### 3. Backend Port Configuration

Ensure backend is running on port **5000** (or update redirect URI accordingly):

```json
// backend/package.json
{
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js"
  }
}
```

### 4. Frontend API Configuration

Verify the API URL matches your backend:

```javascript
// frontend/src/components/LoginModern.jsx
const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';
```

Or set in `frontend/.env`:
```env
VITE_API_URL=http://localhost:5000
```

---

## 🧪 Testing the OAuth Flow

### Step 1: Start Backend
```bash
cd backend
npm install
node index.js
```

**Expected Output**:
```
=============================================================
🚀 Server Started Successfully!
=============================================================
📍 Local:            http://localhost:5000
📍 Health Check:     http://localhost:5000/health
📍 API Health:       http://localhost:5000/api/health
🌐 Environment:      development
📧 Email:            your-email@gmail.com
🔌 Allowed Origins:  http://localhost:5173, http://localhost:5174
=============================================================

✅ Mail transporter ready
```

### Step 2: Test Backend Health
```bash
curl http://localhost:5000/api/health
```

**Expected Response**:
```json
{
  "status": "OK",
  "message": "API is running",
  "timestamp": "2025-12-20T...",
  "version": "2.0.0"
}
```

### Step 3: Verify Google OAuth Configuration
```bash
curl http://localhost:5000/api/auth/debug-env
```

**Expected Response**:
```json
{
  "NODE_ENV": "development",
  "isDevelopment": true,
  "EMAIL_USER": "SET",
  "EMAIL_PASS": "SET"
}
```

### Step 4: Start Frontend
```bash
cd frontend
npm install
npm run dev
```

**Expected Output**:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

### Step 5: Test Google Login Flow

1. **Navigate to**: http://localhost:5173/#login
2. **Click**: "Continue with Google" button
3. **Observe Console Logs**:

   **Backend Console (Terminal 1)**:
   ```
   📥 [req-id] GET /api/auth/google - Origin: http://localhost:5173
   🔄 Initiating Google OAuth flow...
      Redirect URI: http://localhost:5000/api/auth/google/callback
      Client ID: 123456789...
   📤 [req-id] ✅ GET /api/auth/google - 302 - 15ms
   
   📥 [req-id] GET /api/auth/google/callback - Origin: none
   📥 Google OAuth callback received
      Has code: true
      Has error: false
   🔄 Exchanging authorization code for access token...
   ✅ Access token received from Google
   🔄 Fetching user info from Google...
   ✅ Google user info received: user@example.com
   ✅ Existing user logged in via Google: user@example.com
   ✅ JWT token generated for user: user@example.com
   🔄 Redirecting to frontend with token...
   📤 [req-id] ✅ GET /api/auth/google/callback - 302 - 1234ms
   ```

   **Browser Console (F12)**:
   ```
   ✅ Google OAuth token received, processing...
   ✅ User profile loaded: user@example.com
   ✅ Welcome back! Redirecting to dashboard...
   ```

4. **Expected Result**: 
   - Redirected to Google login
   - After selecting account, redirected back to app
   - Automatically logged in and redirected to dashboard
   - No error messages
   - No infinite loops

---

## 🐛 Troubleshooting

### Error: "Google login is not configured on this server"

**Cause**: Missing `GOOGLE_CLIENT_ID` or `GOOGLE_CLIENT_SECRET` in backend `.env`

**Solution**:
1. Check `backend/.env` file exists
2. Verify environment variables are set correctly
3. Restart backend server
4. Check backend console for: `✅ Mail transporter ready`

---

### Error: "redirect_uri_mismatch"

**Cause**: Redirect URI mismatch between code and Google Cloud Console

**Solution**:
1. **Check Backend `.env`**:
   ```env
   GOOGLE_REDIRECT_URI=http://localhost:5000/api/auth/google/callback
   ```

2. **Check Google Cloud Console**:
   - Go to Credentials
   - Edit OAuth 2.0 Client ID
   - Ensure redirect URI exactly matches: `http://localhost:5000/api/auth/google/callback`
   - No trailing slashes
   - Correct port (5000)
   - Click "Save"

3. **Verify Backend Port**:
   ```bash
   # Backend must be running on port 5000
   curl http://localhost:5000/health
   ```

---

### Error: "Failed to get access token from Google"

**Cause**: Invalid client secret or authorization code issues

**Solutions**:

1. **Regenerate Client Secret**:
   - Go to Google Cloud Console > Credentials
   - Click your OAuth 2.0 Client ID
   - Click "Reset Secret"
   - Update `GOOGLE_CLIENT_SECRET` in `.env`
   - Restart backend

2. **Check Token Exchange Logs**:
   ```bash
   # Backend console will show detailed error:
   ❌ Token exchange failed: {error details}
   ```

3. **Verify API is Enabled**:
   - Google Cloud Console > "APIs & Services" > "Library"
   - Search "Google+ API"
   - Ensure it's enabled

---

### Error: "Login successful but failed to load profile"

**Cause**: JWT token verification or `/api/auth/me` endpoint issue

**Solution**:

1. **Check JWT_SECRET**:
   ```env
   # backend/.env
   JWT_SECRET=your-secure-secret-at-least-32-characters-long
   ```

2. **Test `/api/auth/me` Endpoint**:
   ```bash
   # Get a token first (from browser localStorage)
   curl -H "Authorization: Bearer YOUR_TOKEN_HERE" \
        http://localhost:5000/api/auth/me
   ```

3. **Check Backend Logs**:
   ```
   ❌ Failed to fetch user: {error details}
   ```

---

### Issue: Infinite Loop / Page Keeps Reloading

**Cause**: Callback processing not properly managed

**Solution**: 
✅ **Already Fixed** in the updated code with `oauth_callback_processed` flag

**How It Works**:
1. When OAuth callback is received, frontend sets `sessionStorage.getItem('oauth_callback_processed')`
2. This prevents re-processing the same callback
3. Flag is cleared after successful redirect or on error
4. URL parameters are cleaned up to prevent re-triggering

**Verify Fix**:
1. Open browser DevTools (F12)
2. Go to "Application" tab > "Session Storage"
3. During login, you should see `oauth_callback_processed: "true"` briefly
4. After redirect, it should be removed

---

### Issue: CORS Errors

**Symptoms**: 
```
Access to fetch at 'http://localhost:5000/api/auth/me' from origin 
'http://localhost:5173' has been blocked by CORS policy
```

**Solution**:

1. **Check Backend CORS Configuration** (already configured):
   ```javascript
   // backend/index.js
   app.use(cors({
     origin: ['http://localhost:5173', 'http://localhost:5174', ...],
     credentials: true
   }));
   ```

2. **Verify Frontend Origin**:
   ```bash
   # Frontend should be running on localhost:5173
   npm run dev
   ```

3. **Check Backend Logs**:
   ```
   ⚠️  CORS blocked origin: http://localhost:XXXX
      Allowed origins: http://localhost:5173, http://localhost:5174
   ```

---

## 📊 Expected Log Flow (Successful Login)

### Backend Console:
```
📥 [abc-123] GET /api/auth/google - Origin: http://localhost:5173
🔄 Initiating Google OAuth flow...
   Redirect URI: http://localhost:5000/api/auth/google/callback
   Client ID: 123456789012-abc...
📤 [abc-123] ✅ GET /api/auth/google - 302 - 12ms

[User selects Google account]

📥 [def-456] GET /api/auth/google/callback?code=4/0AbC... - Origin: none
📥 Google OAuth callback received
   Has code: true
   Has error: false
🔄 Exchanging authorization code for access token...
✅ Access token received from Google
🔄 Fetching user info from Google...
✅ Google user info received: john.doe@example.com
✅ Existing user logged in via Google: john.doe@example.com
✅ JWT token generated for user: john.doe@example.com
🔄 Redirecting to frontend with token...
📤 [def-456] ✅ GET /api/auth/google/callback - 302 - 1456ms

📥 [ghi-789] GET /api/auth/me - Origin: http://localhost:5173
📤 [ghi-789] ✅ GET /api/auth/me - 200 - 45ms
```

### Browser Console:
```
✅ Google OAuth token received, processing...
✅ User profile loaded: john.doe@example.com
✅ Welcome back! Redirecting to dashboard...
```

---

## 🔒 Security Considerations

### 1. Production Environment Variables

For production, update:

```env
# Production URLs
GOOGLE_REDIRECT_URI=https://yourdomain.com/api/auth/google/callback
FRONTEND_URL=https://yourdomain.com

# Add production URLs to Google Cloud Console
```

### 2. Session Management

The current implementation uses:
- **JWT tokens** (7-day expiry)
- **localStorage** for token persistence
- **sessionStorage** for callback state

**Recommendations**:
- Consider implementing refresh tokens for longer sessions
- Add token rotation for enhanced security
- Implement logout endpoint to invalidate tokens

### 3. Rate Limiting

OAuth routes are protected with rate limiting:
```javascript
// Already implemented in auth.js
authLimiter: 5 requests per 15 minutes
```

---

## 🎨 User Experience Enhancements

### Loading States
- ✅ Google button shows loading spinner during OAuth flow
- ✅ Success/error messages display with emoji indicators
- ✅ Auto-redirect to dashboard after successful login

### Error Messages
All errors now show user-friendly messages:
- ❌ "Google login was cancelled or failed" (user cancelled)
- ❌ "Google login is not configured on this server" (env issues)
- ❌ "Failed to get access token from Google" (OAuth issues)
- ⚠️ "Login successful but failed to load profile" (token issues)

---

## 📞 Support & Debugging

### Enable Detailed Logging

Set environment to development:
```env
NODE_ENV=development
```

This enables:
- Detailed request/response logging
- Full error stack traces
- Body logging (with password sanitization)

### Check Database Connection

```bash
# Backend console should show:
✅ MongoDB connected
```

If not:
```bash
# Verify MongoDB is running
mongosh
# Or check connection string in .env
MONGODB_URI=mongodb://localhost:27017/ecommerce
```

### Manual Token Testing

```bash
# 1. Get a valid token from browser localStorage (F12 > Application > Local Storage)
# 2. Test the token:
curl -H "Authorization: Bearer YOUR_TOKEN_HERE" \
     http://localhost:5000/api/auth/me

# Expected response:
{
  "id": "user-id",
  "name": "John Doe",
  "email": "john@example.com",
  "username": "johndoe",
  "isVerified": true
}
```

---

## ✅ Post-Fix Verification Checklist

- [ ] Backend starts without errors
- [ ] `/health` endpoint responds with OK status
- [ ] `/api/auth/debug-env` shows all variables as SET
- [ ] Google login button is clickable
- [ ] Clicking Google login redirects to Google
- [ ] After selecting account, redirected back to app
- [ ] No "next is not a function" error in URL
- [ ] User is logged in and redirected to dashboard
- [ ] No infinite loops or repeated redirects
- [ ] Console shows detailed OAuth flow logs
- [ ] Token is stored in localStorage
- [ ] User profile loads correctly

---

## 🚀 Next Steps

### Additional Enhancements to Consider:

1. **Refresh Token Implementation**
   - Add refresh token rotation
   - Implement silent token renewal

2. **Social Login Expansion**
   - Add Facebook login
   - Add Apple Sign In
   - Add GitHub OAuth

3. **Account Linking**
   - Allow users to link multiple OAuth providers
   - Merge accounts with same email

4. **Advanced Security**
   - Implement PKCE flow for enhanced security
   - Add device fingerprinting
   - Implement suspicious activity detection

5. **Analytics & Monitoring**
   - Track OAuth success/failure rates
   - Monitor login performance
   - Set up alerts for authentication failures

---

## 📝 Change Log

### December 20, 2025

**Fixed Issues:**
1. ✅ "next is not a function" error - Added asyncHandler wrapper
2. ✅ Infinite loop on login - Added callback processing flags
3. ✅ Poor error handling - Enhanced error messages and logging
4. ✅ Missing environment validation - Added pre-flight checks
5. ✅ No global error handler - Added Express error middleware

**Files Modified:**
- `backend/routes/auth.js` - Added async error handling
- `backend/index.js` - Added global error handler
- `frontend/src/components/LoginModern.jsx` - Fixed callback loop

**New Features:**
- Comprehensive logging at every OAuth step
- User-friendly error messages
- Automatic callback cleanup
- URL parameter sanitization
- Environment variable validation

---

## 🆘 Emergency Contacts

If issues persist:

1. **Check GitHub Issues**: Look for similar problems in dependencies
2. **Google OAuth Status**: https://status.cloud.google.com/
3. **MongoDB Status**: Verify local database is running
4. **Clear Browser Cache**: Sometimes old tokens cause issues
5. **Test in Incognito**: Eliminates browser extension interference

---

## 📚 Additional Resources

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Express.js Error Handling](https://expressjs.com/en/guide/error-handling.html)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [CORS Configuration](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)

---

**Last Updated**: December 20, 2025  
**Version**: 2.0.0  
**Status**: ✅ All critical issues resolved
