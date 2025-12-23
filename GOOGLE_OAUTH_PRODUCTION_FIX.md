# 🔧 Google OAuth Production Deployment Fix

## Problem
Google OAuth is working locally but failing in production with error:
**"Google login is not configured on this server"**

## Root Cause
The backend deployment is missing the required environment variables:
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_REDIRECT_URI`
- `FRONTEND_URL`

---

## ✅ Complete Fix Guide

### Step 1: Identify Your Backend Deployment Platform

**Where is your backend currently deployed?**
- Render.com
- Railway.app
- Heroku
- AWS/DigitalOcean
- Other

(You need to know this to set environment variables correctly)

---

### Step 2: Update Google Cloud Console

Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)

#### A. Select Your Project
Find the project with Client ID: `513465967830-s6djtj28aeojt7t7tfgsr114t5sqq74s`

#### B. Edit OAuth 2.0 Client

**Add Authorized JavaScript origins:**
```
https://sakthi-k0mkcvfje-mithul-ss-projects.vercel.app
https://YOUR-BACKEND-URL.com
```

**Add Authorized redirect URIs:**
```
https://YOUR-BACKEND-URL.com/api/auth/google/callback
http://localhost:5000/api/auth/google/callback (keep for local dev)
```

**Click SAVE**

---

### Step 3: Configure Backend Environment Variables

Based on your deployment platform, add these environment variables:

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=https://YOUR-BACKEND-URL/api/auth/google/callback
FRONTEND_URL=https://your-frontend-url.vercel.app

# Other required variables (ensure these are also set)
NODE_ENV=production
JWT_SECRET=your-jwt-secret
MONGODB_URI=your-mongodb-connection-string
```

#### Platform-Specific Instructions:

**In Render Dashboard:**
1. Go to Dashboard → Select your backend service
2. Click "Environment" tab
3. Add each variable individually (use your actual values)
4. Click "Save Changes" (will auto-redeploy)

**Railway.app:**
1. Go to your project → Select backend service
2. Click "Variables" tab
3. Add each variable (use your actual values)
4. Redeploy automatically

**Heroku:**
```bash
heroku config:set GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
heroku config:set GOOGLE_CLIENT_SECRET=your-client-secret
heroku config:set GOOGLE_REDIRECT_URI=https://YOUR-APP.herokuapp.com/api/auth/google/callback
heroku config:set FRONTEND_URL=https://your-frontend.vercel.app
```

---

### Step 4: Configure Frontend Environment Variable (Vercel)

Your frontend needs to know where the backend is deployed.

**In Vercel Dashboard:**
1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add:
   ```
   VITE_API_URL=https://YOUR-BACKEND-URL
   ```
4. Redeploy the frontend

**Alternative: Update vercel.json**

If you prefer hardcoding it, you can create/update `frontend/.env.production`:
```env
VITE_API_URL=https://YOUR-BACKEND-URL
```

---

### Step 5: Verify Backend Health

After setting environment variables and redeploying, test:

```bash
# Test backend health
curl https://YOUR-BACKEND-URL/api/health

# Should return:
{
  "status": "OK",
  "environment": "production",
  ...
}

# Test Google OAuth setup
curl https://YOUR-BACKEND-URL/api/auth/google

# Should redirect to Google login (not return an error)
```

---

### Step 6: Test Google Login

1. Clear browser cache
2. Go to: `https://sakthi-k0mkcvfje-mithul-ss-projects.vercel.app/#login`
3. Click "Continue with Google"
4. Should redirect to Google
5. After selecting account, should redirect back to your app
6. Should land on dashboard with user logged in ✅

---

## 🐛 Troubleshooting

### Issue: "Redirect URI mismatch" error

**Solution:** 
- Double-check the exact URL in Google Cloud Console
- Ensure no trailing slashes: ✅ `/api/auth/google/callback` ❌ `/api/auth/google/callback/`
- URLs are case-sensitive

### Issue: CORS errors

**Solution:**
Your backend already has CORS configured. Ensure `CLIENT_URL` or `FRONTEND_URL` is set correctly:
```env
FRONTEND_URL=https://sakthi-k0mkcvfje-mithul-ss-projects.vercel.app
```

### Issue: "Invalid client" error

**Solution:**
- Verify `GOOGLE_CLIENT_ID` is set correctly (no extra spaces)
- Ensure the Client ID matches the one in Google Cloud Console

### Issue: Backend logs show "Missing GOOGLE_CLIENT_ID"

**Solution:**
- Environment variables not set in deployment platform
- Redeploy after setting variables
- Check variable names are exactly: `GOOGLE_CLIENT_ID` (case-sensitive)

---

## 📋 Quick Checklist

- [ ] Backend deployed and running
- [ ] Google Cloud Console updated with production URLs
- [ ] `GOOGLE_CLIENT_ID` set in backend environment
- [ ] `GOOGLE_CLIENT_SECRET` set in backend environment
- [ ] `GOOGLE_REDIRECT_URI` set in backend environment
- [ ] `FRONTEND_URL` set in backend environment
- [ ] `VITE_API_URL` set in frontend environment (Vercel)
- [ ] Backend redeployed after setting variables
- [ ] Frontend redeployed after setting variables
- [ ] Tested `/api/health` endpoint
- [ ] Tested Google login flow end-to-end

---

## 🔍 Backend Deployment URL

**Critical Question:** What is your backend deployment URL?

If you don't know, check:
- Your deployment platform dashboard (Render, Railway, etc.)
- Look for something like:
  - `https://your-app.onrender.com`
  - `https://your-app.up.railway.app`
  - `https://your-app.herokuapp.com`

This URL is needed for all the configurations above.

---

## 📞 Need Help?

If you provide your backend deployment URL and platform, I can give you exact step-by-step instructions for your specific setup.

**Example:**
- Backend URL: `https://my-ecommerce-api.onrender.com`
- Platform: Render.com
- Then I can provide exact configuration steps.
