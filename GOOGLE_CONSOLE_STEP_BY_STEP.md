# 📸 Google Cloud Console - Step-by-Step Visual Guide

## 🎯 Goal
Configure Google OAuth to work with your deployed website (not just localhost)

---

## 📋 Before You Start

**You MUST know:**
1. ✅ Your frontend URL: `https://sakthi-k0mkcvfje-mithul-ss-projects.vercel.app` (already have this)
2. ❓ Your backend URL: `https://??????` (NEED THIS!)

**If you haven't deployed your backend yet, STOP HERE and deploy it first!**

---

## 🚀 Step-by-Step Instructions

### Step 1: Open Google Cloud Console

1. Go to: https://console.cloud.google.com/
2. Log in with the Google account that created the OAuth credentials

### Step 2: Find Your Project

In the top navigation bar, click the **project dropdown** (it shows the current project name)

You're looking for the project that has this Client ID:
```
513465967830-s6djtj28aeojt7t7tfgsr114t5sqq74s
```

### Step 3: Navigate to Credentials

1. Click the **hamburger menu** (☰) in top-left
2. Hover over **"APIs & Services"**
3. Click **"Credentials"**

Or use direct link: https://console.cloud.google.com/apis/credentials

### Step 4: Find Your OAuth 2.0 Client

On the Credentials page, you'll see a section called **"OAuth 2.0 Client IDs"**

Look for your client - it will show:
- **Name:** Something like "Web client 1" or "My OAuth App"
- **Client ID:** `513465967830-s6djtj28aeojt7t7tfgsr114t5sqq74s`

**Click on the client name** to edit it.

### Step 5: Edit Authorized JavaScript Origins

You'll see a section called **"Authorized JavaScript origins"**

Currently you probably have:
```
http://localhost:5173
http://localhost:5000
```

**Click "ADD URI"** and add:
```
https://sakthi-k0mkcvfje-mithul-ss-projects.vercel.app
```

**Click "ADD URI"** again and add your backend URL:
```
https://YOUR-BACKEND-URL-HERE
```

Example if using Render:
```
https://my-ecommerce-api.onrender.com
```

### Step 6: Edit Authorized Redirect URIs

Scroll down to **"Authorized redirect URIs"**

Currently you probably have:
```
http://localhost:5000/api/auth/google/callback
```

**Click "ADD URI"** and add:
```
https://YOUR-BACKEND-URL-HERE/api/auth/google/callback
```

Example if using Render:
```
https://my-ecommerce-api.onrender.com/api/auth/google/callback
```

⚠️ **IMPORTANT:** The path MUST be exactly `/api/auth/google/callback` (lowercase, no extra slashes)

### Step 7: Save Changes

Click the **"SAVE"** button at the bottom

You'll see a message: "Client ID updated"

---

## ✅ After Saving - What Should You Have?

### Authorized JavaScript origins:
```
http://localhost:5173                                           (for local dev)
http://localhost:5000                                           (for local dev)
https://sakthi-k0mkcvfje-mithul-ss-projects.vercel.app        (your frontend)
https://YOUR-BACKEND-URL                                        (your backend)
```

### Authorized redirect URIs:
```
http://localhost:5000/api/auth/google/callback                 (for local dev)
https://YOUR-BACKEND-URL/api/auth/google/callback              (production)
```

---

## 🐛 Common Mistakes

### ❌ Wrong: Extra slash at the end
```
https://my-backend.com/api/auth/google/callback/  ← DON'T DO THIS
```

### ✅ Correct:
```
https://my-backend.com/api/auth/google/callback   ← DO THIS
```

### ❌ Wrong: Using http instead of https
```
http://my-backend.com  ← Won't work in production
```

### ✅ Correct:
```
https://my-backend.com  ← Always use https in production
```

---

## 🔍 How to Find Your Backend URL

**If you deployed to Render:**
1. Go to https://dashboard.render.com/
2. Click on your backend service
3. Look for the URL at the top - something like:
   `https://hardware-store-api-xxxx.onrender.com`

**If you deployed to Railway:**
1. Go to https://railway.app/dashboard
2. Click on your project → backend service
3. Click "Settings" → Look for "Public Domain"
   `https://your-app.up.railway.app`

**If you deployed to Heroku:**
1. Go to https://dashboard.heroku.com/apps
2. Click on your app
3. Look for the domain:
   `https://your-app-name.herokuapp.com`

**If you deployed to Vercel (backend):**
1. Go to https://vercel.com/dashboard
2. Click on your backend project
3. Look for the domain:
   `https://your-backend.vercel.app`

---

## 📞 Still Confused?

**Tell me:**
1. Where did you deploy your backend? (Render, Railway, Heroku, etc.)
2. Or, do you need help deploying the backend first?

I can give you exact screenshots or more specific instructions!
