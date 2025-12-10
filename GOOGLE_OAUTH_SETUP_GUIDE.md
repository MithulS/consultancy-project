# Google OAuth Setup Guide

Complete guide to setting up Google OAuth authentication for your e-commerce application.

## 📋 Table of Contents
1. [Prerequisites](#prerequisites)
2. [Google Cloud Console Setup](#google-cloud-console-setup)
3. [Environment Configuration](#environment-configuration)
4. [Testing the Integration](#testing-the-integration)
5. [Security Best Practices](#security-best-practices)
6. [Troubleshooting](#troubleshooting)
7. [Analytics & Monitoring](#analytics--monitoring)

---

## Prerequisites

Before setting up Google OAuth, ensure you have:
- A Google account
- Access to [Google Cloud Console](https://console.cloud.google.com)
- Node.js backend running on port 5000
- React frontend running on port 5174

---

## Google Cloud Console Setup

### Step 1: Create a New Project

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Click on the project dropdown at the top
3. Click **"New Project"**
4. Enter project name: `ElectroStore Authentication`
5. Click **"Create"**

### Step 2: Enable Google+ API

1. In the left sidebar, navigate to **"APIs & Services" > "Library"**
2. Search for **"Google+ API"**
3. Click on it and press **"Enable"**

### Step 3: Configure OAuth Consent Screen

1. Go to **"APIs & Services" > "OAuth consent screen"**
2. Select **"External"** user type
3. Click **"Create"**

**Fill in the required information:**

- **App name:** `ElectroStore`
- **User support email:** Your email address
- **App logo:** (Optional) Upload your logo
- **Application home page:** `http://localhost:5174` (or your production URL)
- **Application privacy policy link:** `http://localhost:5174/#/privacy-policy`
- **Application terms of service link:** `http://localhost:5174/#/terms`
- **Authorized domains:** 
  - `localhost` (for development)
  - Your production domain (e.g., `electrostore.com`)
- **Developer contact email:** Your email address

4. Click **"Save and Continue"**
5. **Scopes:** Add the following scopes:
   - `.../auth/userinfo.email`
   - `.../auth/userinfo.profile`
6. Click **"Save and Continue"**
7. **Test users:** Add your email for testing
8. Click **"Save and Continue"**

### Step 4: Create OAuth 2.0 Credentials

1. Go to **"APIs & Services" > "Credentials"**
2. Click **"Create Credentials" > "OAuth client ID"**
3. Select **"Web application"**
4. Configure:

**Name:** `ElectroStore Web Client`

**Authorized JavaScript origins:**
```
http://localhost:5174
http://127.0.0.1:5174
http://localhost:5173
```

**Authorized redirect URIs:**
```
http://localhost:5000/api/auth/google/callback
http://localhost:5174/#/login
```

5. Click **"Create"**
6. **IMPORTANT:** Copy your credentials:
   - Client ID (looks like: `123456789-abc123def456.apps.googleusercontent.com`)
   - Client Secret (looks like: `GOCSPX-abc123def456`)

---

## Environment Configuration

### Backend Configuration

Add these variables to your `backend/.env` file:

```bash
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret-here
GOOGLE_REDIRECT_URI=http://localhost:5000/api/auth/google/callback

# Frontend URL (for redirects)
FRONTEND_URL=http://localhost:5174

# Existing variables
JWT_SECRET=your-jwt-secret
MONGODB_URI=your-mongodb-uri
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### Frontend Configuration

Your frontend is already configured! The `LoginModern.jsx` component includes all necessary Google OAuth functionality.

### Production Configuration

For production, update the redirect URI:

```bash
# Production
GOOGLE_REDIRECT_URI=https://api.yourdomain.com/api/auth/google/callback
FRONTEND_URL=https://yourdomain.com
```

And update your Google Cloud Console OAuth credentials with production URLs.

---

## Testing the Integration

### Local Testing Steps

1. **Start Backend Server:**
```bash
cd backend
npm run dev
```

2. **Start Frontend Server:**
```bash
cd frontend
npm run dev
```

3. **Test Google Login:**
   - Navigate to `http://localhost:5174/#/login`
   - Click the **"Continue with Google"** button
   - You should be redirected to Google's login page
   - Sign in with your Google account
   - Grant permissions when prompted
   - You should be redirected back to your app and logged in

### Verification Checklist

✅ Google button appears on login page  
✅ Clicking button redirects to Google  
✅ Google consent screen displays your app name  
✅ After authorization, redirects back to app  
✅ User is logged in successfully  
✅ User profile data is saved to database  
✅ Token is stored in localStorage  
✅ Dashboard loads correctly  

---

## Security Best Practices

### 1. Secure Environment Variables

**Never commit `.env` files to version control!**

Add to `.gitignore`:
```
.env
.env.local
.env.production
```

### 2. Use HTTPS in Production

Google requires HTTPS for production OAuth:
- Use SSL certificates (Let's Encrypt is free)
- Update redirect URIs to use `https://`

### 3. Restrict OAuth Scopes

Only request the minimum scopes needed:
- ✅ `userinfo.email` - Get user email
- ✅ `userinfo.profile` - Get user name and picture
- ❌ Don't request unnecessary scopes

### 4. Implement CSRF Protection

The backend uses state parameters to prevent CSRF attacks.

### 5. Token Security

- Store JWT tokens securely in `localStorage`
- Use `httpOnly` cookies for production
- Implement token refresh mechanism
- Set reasonable token expiration (7 days)

### 6. Rate Limiting

Backend includes rate limiting for all authentication endpoints:
- 5 requests per 15 minutes for registration
- 10 requests per 15 minutes for login

---

## Troubleshooting

### Common Issues

#### 1. "Redirect URI Mismatch" Error

**Problem:** Google shows error: `redirect_uri_mismatch`

**Solution:**
- Verify redirect URI in Google Cloud Console matches exactly
- Check for trailing slashes
- Ensure protocol matches (http vs https)
- Common correct format: `http://localhost:5000/api/auth/google/callback`

#### 2. "Access Blocked: This app's request is invalid"

**Problem:** OAuth consent screen not properly configured

**Solution:**
- Complete all required fields in OAuth consent screen
- Add test users if app is in testing mode
- Verify authorized domains are correct

#### 3. "GOOGLE_CLIENT_ID not configured"

**Problem:** Environment variables not loaded

**Solution:**
```bash
# Check if .env file exists
ls backend/.env

# Restart backend server
cd backend
npm run dev
```

#### 4. User Not Redirecting After Login

**Problem:** Frontend not receiving token

**Solution:**
- Check browser console for errors
- Verify `FRONTEND_URL` in backend `.env`
- Check network tab for redirect URL
- Ensure token is in URL query parameters

#### 5. Database Error on User Creation

**Problem:** MongoDB validation errors

**Solution:**
- Ensure User model includes `googleId` field
- Check if email already exists in database
- Verify MongoDB connection

---

## Analytics & Monitoring

### Track Login Methods

The application automatically tracks:
- Google login attempts vs traditional email login
- Success/failure rates for each method
- Timestamps and user agents

### View Analytics

**Endpoint:** `GET http://localhost:5000/api/analytics/stats`

**Response:**
```json
{
  "today": {
    "google": {
      "attempts": 45,
      "successes": 43
    },
    "email": {
      "attempts": 120,
      "successes": 108
    }
  },
  "conversionRates": {
    "google": "95.56%",
    "email": "90.00%"
  },
  "recentAttempts": [...]
}
```

### Google Analytics Integration

The frontend includes Google Analytics tracking:

```javascript
// Automatically tracked events:
- login_attempt (method: 'google' or 'email')
- login_success
- login_failure
```

Add Google Analytics to your app:

1. Get GA4 tracking ID from [Google Analytics](https://analytics.google.com)
2. Add to `frontend/index.html`:

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

---

## Features Summary

### ✅ Implemented Features

1. **Clear Call to Action**
   - Prominent "Continue with Google" button
   - Tooltip explaining benefits
   - Professional Google branding

2. **Visual Elements**
   - Official Google logo (SVG)
   - Correct color scheme (#ffffff background)
   - Proper spacing and sizing
   - Mobile-responsive design

3. **User Experience**
   - Loading spinner during authentication
   - Success/error feedback messages
   - Smooth animations and transitions
   - Non-blocking OAuth process

4. **Accessibility**
   - ARIA labels for screen readers
   - Keyboard navigation support
   - Alt text for Google logo
   - Focus indicators
   - Semantic HTML

5. **Security**
   - HTTPS enforcement in production
   - Secure token handling
   - Privacy policy links
   - CSRF protection
   - Rate limiting

6. **Alternative Login**
   - Traditional email/password fields
   - Password visibility toggle
   - Remember me functionality
   - Forgot password link

7. **Analytics**
   - Login method tracking
   - Success/failure rates
   - User behavior insights
   - Google Analytics integration

---

## Next Steps

1. **Test thoroughly** in development
2. **Set up production** Google Cloud project
3. **Update redirect URIs** for production
4. **Enable HTTPS** on production server
5. **Configure Google Analytics** for tracking
6. **Monitor analytics** to optimize UX
7. **Gather user feedback** and iterate

---

## Support & Resources

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Google Branding Guidelines](https://developers.google.com/identity/branding-guidelines)
- [OAuth 2.0 Best Practices](https://tools.ietf.org/html/draft-ietf-oauth-security-topics)

---

## Production Deployment Checklist

Before deploying to production:

- [ ] Update OAuth consent screen to "In Production"
- [ ] Add production redirect URIs to Google Cloud Console
- [ ] Set environment variables on production server
- [ ] Enable HTTPS with valid SSL certificate
- [ ] Test OAuth flow in production environment
- [ ] Set up monitoring and error tracking
- [ ] Configure backup email login
- [ ] Document OAuth credentials securely
- [ ] Set up automatic credential rotation (recommended)
- [ ] Configure CORS for production domain

---

**Last Updated:** December 7, 2025  
**Version:** 1.0.0
