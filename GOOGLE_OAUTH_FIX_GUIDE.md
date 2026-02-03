# 🔧 Google OAuth "invalid_client" Fix Guide

## ❌ Current Error
```
Access blocked: Authorization Error
Error 401: invalid_client
The OAuth client was not found.
```

## 🔍 Root Cause
Your Google OAuth Client ID doesn't exist or doesn't match what's configured in Google Cloud Console. This happens when:
- The Client ID was deleted or never created properly
- There's a typo in the Client ID or Secret
- The project was deleted or credentials were regenerated
- The OAuth consent screen isn't properly configured

---

## ✅ COMPLETE SETUP GUIDE

### Step 1: Access Google Cloud Console

1. Go to **[Google Cloud Console](https://console.cloud.google.com/)**
2. Sign in with **mithuld321@gmail.com**
3. Click on the **project selector** dropdown (top-left, next to "Google Cloud")
4. Either:
   - Select your existing project, OR
   - Click **"NEW PROJECT"** to create a fresh one

**Creating New Project (Recommended for clean setup):**
- Project Name: `E-Commerce OAuth` (or any name)
- Location: Leave as default (No organization)
- Click **"CREATE"**
- Wait for the project to be created (~30 seconds)
- Make sure the new project is selected (check top-left)

---

### Step 2: Enable Required APIs

1. In the left sidebar, go to: **APIs & Services** > **Library**
2. Search for: **"Google+ API"** → Click → Click **"ENABLE"**
3. Search for: **"People API"** → Click → Click **"ENABLE"**
4. Search for: **"Google Cloud APIs"** → Click → Click **"ENABLE"** (if not already enabled)

⏱️ Wait 1-2 minutes for APIs to fully activate

---

### Step 3: Configure OAuth Consent Screen

1. Go to: **APIs & Services** > **OAuth consent screen**
2. Choose **User Type**:
   - ✅ **External** (recommended) - Anyone with a Google account can test
   - Click **"CREATE"**

3. **App Information:**
   - App name: `E-Commerce Platform` (or your app name)
   - User support email: `mithuld321@gmail.com`
   - App logo: (Optional, skip for now)

4. **App domain:**
   - Application home page: `http://localhost:5173` (for development)
   - Application privacy policy: `http://localhost:5173/privacy` (can be dummy for testing)
   - Application terms of service: `http://localhost:5173/terms` (can be dummy for testing)

5. **Developer contact information:**
   - Email addresses: `mithuld321@gmail.com`
   - Click **"SAVE AND CONTINUE"**

6. **Scopes:**
   - Click **"ADD OR REMOVE SCOPES"**
   - Search and select:
     - ✅ `userinfo.email` - View your email address
     - ✅ `userinfo.profile` - See your personal info
   - Click **"UPDATE"**
   - Click **"SAVE AND CONTINUE"**

7. **Test users (IMPORTANT for development):**
   - Click **"+ ADD USERS"**
   - Add your email: `mithuld321@gmail.com`
   - Add any other test emails (optional)
   - Click **"ADD"**
   - Click **"SAVE AND CONTINUE"**

8. **Summary:**
   - Review everything
   - Click **"BACK TO DASHBOARD"**

⚠️ **NOTE:** Your app will be in "Testing" mode. Only test users can sign in. To make it public, you need to publish it (not required for development).

---

### Step 4: Create OAuth Client ID (NEW CREDENTIALS)

1. Go to: **APIs & Services** > **Credentials**
2. Click **"+ CREATE CREDENTIALS"** (top of page)
3. Select: **"OAuth client ID"**

4. **Application type:**
   - Select: **"Web application"**

5. **Name:**
   - Enter: `E-Commerce Web Client` (or any descriptive name)

6. **Authorized JavaScript origins:**
   Click **"+ ADD URI"** and add:
   ```
   http://localhost:5173
   http://localhost:5174
   http://127.0.0.1:5173
   ```
   _(Add each one separately)_

7. **Authorized redirect URIs:** (⚠️ CRITICAL)
   Click **"+ ADD URI"** and add:
   ```
   http://localhost:5000/api/auth/google/callback
   http://127.0.0.1:5000/api/auth/google/callback
   ```
   _(Add each one separately)_

   **Common Mistakes to Avoid:**
   - ❌ Don't add trailing slashes: `http://localhost:5000/api/auth/google/callback/`
   - ❌ Don't forget `/api/auth/google/callback` path
   - ❌ Don't use `https://` for localhost (unless you have SSL)
   - ✅ Must EXACTLY match what your backend sends

8. Click **"CREATE"**

9. **SAVE YOUR CREDENTIALS:**
   - A popup will show your new credentials
   - **Copy the Client ID** (looks like: `123456789-abc123xyz.apps.googleusercontent.com`)
   - **Copy the Client Secret** (looks like: `GOCSPX-abc123xyz`)
   - Click **"DOWNLOAD JSON"** (optional, for backup)
   - Click **"OK"**

---

### Step 5: Update Backend .env File

1. Open: `d:\consultancy\backend\.env`
2. Replace the Google OAuth section with your NEW credentials:

```env
# ============================================
# GOOGLE OAUTH CONFIGURATION
# ============================================

# Google OAuth Client ID (from Google Cloud Console)
GOOGLE_CLIENT_ID=YOUR_NEW_CLIENT_ID_HERE.apps.googleusercontent.com

# Google OAuth Client Secret (from Google Cloud Console)
GOOGLE_CLIENT_SECRET=GOCSPX-YOUR_NEW_CLIENT_SECRET_HERE

# OAuth Redirect URI (must match Google Cloud Console configuration)
GOOGLE_REDIRECT_URI=http://localhost:5000/api/auth/google/callback

# Frontend URL (for post-authentication redirects)
FRONTEND_URL=http://localhost:5173
```

3. **Save the file** (Ctrl+S)

---

### Step 6: Restart Backend Server

The backend must be restarted to load new environment variables:

**Option A: Stop and restart in VS Code terminal:**
```powershell
# Press Ctrl+C in the backend terminal to stop
cd D:\consultancy\backend
npm start
```

**Option B: Kill and restart:**
```powershell
# Find and kill node processes
Get-Process node | Stop-Process -Force
cd D:\consultancy\backend
npm start
```

**Verify it's running:**
- Should see: `🚀 Server Started Successfully!`
- Should see: `MongoDB connected successfully`
- Open: http://localhost:5000/health (should show OK)

---

### Step 7: Test the Login Flow

1. **Open your app:** http://localhost:5173
2. Click **"Continue with Google"** or **"Sign in with Google"**
3. You should be redirected to Google's login page
4. Select your Google account (**must be a test user if in Testing mode**)
5. Grant permissions (if prompted)
6. You should be redirected back to your app and logged in

**Expected Flow:**
```
Your App → Google Login → User Selects Account → 
Google Redirects to Backend → Backend Processes → 
Frontend Shows Success
```

---

## 🛠️ Troubleshooting Common Issues

### Issue 1: Still getting "invalid_client"
**Cause:** Old credentials cached or server not restarted
**Fix:**
```powershell
# Kill all node processes
Get-Process node | Stop-Process -Force

# Clear browser cache
# Chrome: Ctrl+Shift+Delete → Clear cached images and files

# Restart backend
cd D:\consultancy\backend
npm start
```

### Issue 2: "Access blocked: This app's request is invalid"
**Cause:** Redirect URI mismatch
**Fix:**
1. Check Google Cloud Console → Credentials → Your OAuth Client
2. Verify redirect URI is EXACTLY: `http://localhost:5000/api/auth/google/callback`
3. Check backend logs for actual redirect URI being used
4. Make sure no typos, no trailing slashes

### Issue 3: "Access blocked: You can't sign in"
**Cause:** Your email is not in the test users list
**Fix:**
1. Go to: OAuth consent screen → Test users
2. Add your email: mithuld321@gmail.com
3. Save and try again

### Issue 4: "redirect_uri_mismatch"
**Cause:** The redirect URI in your request doesn't match Google Cloud Console
**Fix:**
1. Backend logs will show: "Redirect URI: http://localhost:5000/api/auth/google/callback"
2. Google Cloud Console must have EXACTLY this URI
3. Check for:
   - Typos
   - Wrong port (5000 vs 5173)
   - Missing `/api/auth/google/callback` path
   - Extra trailing slash

### Issue 5: Backend shows "GOOGLE_CLIENT_ID not configured"
**Cause:** .env file not saved or has syntax errors
**Fix:**
1. Check .env has no extra spaces around `=`
2. No quotes needed: `GOOGLE_CLIENT_ID=123456...` (not `"123456..."`)
3. Save file and restart server

---

## ✅ Final Verification Checklist

Before testing, verify ALL of these:

### Google Cloud Console:
- [ ] Project is selected (check top-left dropdown)
- [ ] Google+ API and People API are ENABLED
- [ ] OAuth consent screen is configured
- [ ] Your email is added as a test user
- [ ] OAuth Client ID is created
- [ ] Redirect URI is: `http://localhost:5000/api/auth/google/callback`
- [ ] JavaScript origins include: `http://localhost:5173`

### Backend Configuration:
- [ ] `.env` file has valid `GOOGLE_CLIENT_ID`
- [ ] `.env` file has valid `GOOGLE_CLIENT_SECRET`
- [ ] `.env` has `GOOGLE_REDIRECT_URI=http://localhost:5000/api/auth/google/callback`
- [ ] `.env` has `FRONTEND_URL=http://localhost:5173`
- [ ] Backend server is running on port 5000
- [ ] Can access http://localhost:5000/health successfully

### Frontend Configuration:
- [ ] Frontend is running on port 5173 (or 5174 - check your terminal)
- [ ] Can access http://localhost:5173 in browser
- [ ] "Continue with Google" button is visible

### Testing:
- [ ] Browser cache cleared (or try incognito mode)
- [ ] All node processes restarted after .env changes
- [ ] Using the same Google account that's added as test user

---

## 🎯 Quick Test Commands

Run these to verify everything:

```powershell
# Check if backend is running
Test-NetConnection -ComputerName localhost -Port 5000

# Check backend health
curl http://localhost:5000/health

# Check if frontend is running
Test-NetConnection -ComputerName localhost -Port 5173

# View backend .env (verify credentials)
Get-Content D:\consultancy\backend\.env | Select-String "GOOGLE"

# Restart backend
cd D:\consultancy\backend
npm start
```

---

## 📝 Example Valid Configuration

**Google Cloud Console:**
```
OAuth Client ID:
  Name: E-Commerce Web Client
  Application type: Web application
  
  Authorized JavaScript origins:
    - http://localhost:5173
    - http://localhost:5174
  
  Authorized redirect URIs:
    - http://localhost:5000/api/auth/google/callback
```

**backend/.env:**
```env
GOOGLE_CLIENT_ID=513465967830-abc123xyz456def789.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-1234567890abcdefghij
GOOGLE_REDIRECT_URI=http://localhost:5000/api/auth/google/callback
FRONTEND_URL=http://localhost:5173
```

---

## 🚀 Production Deployment Notes

When deploying to production (e.g., Vercel, Heroku):

1. **Create PRODUCTION OAuth Client ID:**
   - Repeat Step 4 but use production URLs
   - Authorized JavaScript origins: `https://yourdomain.com`
   - Authorized redirect URIs: `https://api.yourdomain.com/api/auth/google/callback`

2. **Update OAuth Consent Screen:**
   - Add production URLs to app domains
   - Consider publishing the app (submit for verification)

3. **Environment Variables:**
   - Set production env vars on your hosting platform
   - Use production Client ID and Secret
   - Update redirect URIs to use `https://`

---

## 📞 Need Help?

If you're still stuck after following this guide:

1. **Check backend logs:** Look for detailed error messages
2. **Check browser console:** Press F12 → Console tab
3. **Verify credentials:** Double-check no copy-paste errors
4. **Try incognito mode:** Eliminates cache issues
5. **Create fresh credentials:** Delete and recreate OAuth client

**Common Copy-Paste Errors:**
- Extra spaces before/after credentials
- Copying partial Client ID (truncated)
- Including comments from .env.example
- Wrong Client ID format (missing `.apps.googleusercontent.com`)

---

## ✅ Success Indicators

You'll know it's working when:
1. ✅ Clicking Google login redirects to Google (not localhost error)
2. ✅ Can select your Google account
3. ✅ No "invalid_client" error
4. ✅ Redirected back to your app
5. ✅ Logged in successfully with your name/email shown

Good luck! 🎉
