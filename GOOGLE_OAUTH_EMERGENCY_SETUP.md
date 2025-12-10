# 🚀 URGENT: Google OAuth Setup - Step-by-Step Guide

## ⚠️ CURRENT ISSUE
Your app is using **PLACEHOLDER** credentials, causing Google to return:
**"Error 401: invalid_client - The OAuth client was not found"**

---

## ✅ SOLUTION: Get Real Google OAuth Credentials (15 minutes)

### **Step 1: Access Google Cloud Console** (2 min)

1. Go to: https://console.cloud.google.com
2. Sign in with your Google account
3. Accept terms if prompted

---

### **Step 2: Create a New Project** (2 min)

1. Click the **project dropdown** at top (next to "Google Cloud")
2. Click **"NEW PROJECT"**
3. **Project name:** `ElectroStore-Auth`
4. **Organization:** Leave as "No organization"
5. Click **"CREATE"**
6. Wait for project creation (30 seconds)
7. Select your new project from the dropdown

---

### **Step 3: Configure OAuth Consent Screen** (3 min)

1. In left sidebar: **APIs & Services → OAuth consent screen**
2. Select **"External"** user type
3. Click **"CREATE"**

**Fill in the form:**

**App information:**
- **App name:** `ElectroStore`
- **User support email:** `your-email@gmail.com` (your email)

**App domain (all optional for testing):**
- Application home page: `http://localhost:5173`
- Application privacy policy: `http://localhost:5173/#/privacy-policy`
- Application terms of service: `http://localhost:5173/#/terms`

**Authorized domains:**
- Click "+ ADD DOMAIN"
- Enter: `localhost` (for development)

**Developer contact information:**
- **Email addresses:** `your-email@gmail.com`

4. Click **"SAVE AND CONTINUE"**

**Scopes page:**
5. Click **"ADD OR REMOVE SCOPES"**
6. Find and check these scopes:
   - ✅ `.../auth/userinfo.email`
   - ✅ `.../auth/userinfo.profile`
7. Click **"UPDATE"**
8. Click **"SAVE AND CONTINUE"**

**Test users page:**
9. Click **"+ ADD USERS"**
10. Add your email address
11. Click **"ADD"**
12. Click **"SAVE AND CONTINUE"**

**Summary:**
13. Review and click **"BACK TO DASHBOARD"**

---

### **Step 4: Create OAuth 2.0 Credentials** (3 min)

1. In left sidebar: **APIs & Services → Credentials**
2. Click **"+ CREATE CREDENTIALS"** at top
3. Select **"OAuth client ID"**

**Configure:**

4. **Application type:** Select **"Web application"**

5. **Name:** `ElectroStore Web Client`

6. **Authorized JavaScript origins:**
   - Click **"+ ADD URI"**
   - Add: `http://localhost:5173`
   - Click **"+ ADD URI"** again
   - Add: `http://127.0.0.1:5173`

7. **Authorized redirect URIs:**
   - Click **"+ ADD URI"**
   - Add: `http://localhost:5000/api/auth/google/callback`
   - Click **"+ ADD URI"** again  
   - Add: `http://127.0.0.1:5000/api/auth/google/callback`

8. Click **"CREATE"**

---

### **Step 5: Copy Your Credentials** (1 min)

A popup will appear with your credentials:

**IMPORTANT - Copy these immediately:**

```
Client ID: 
123456789012-abcdefghijklmnopqrstuvwxyz123456.apps.googleusercontent.com

Client Secret:
GOCSPX-AbCdEfGhIjKlMnOpQrStUvWxYz
```

⚠️ **CRITICAL:** Keep these secret! Never commit to GitHub!

---

### **Step 6: Update Your `.env` File** (2 min)

1. Open: `d:\consultancy\backend\.env`

2. Replace the placeholder values:

**BEFORE:**
```bash
GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your-secret-here
```

**AFTER:** (use your REAL values)
```bash
GOOGLE_CLIENT_ID=123456789012-abcdefghijklmnopqrstuvwxyz123456.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-AbCdEfGhIjKlMnOpQrStUvWxYz
```

3. **SAVE THE FILE** (Ctrl + S)

---

### **Step 7: Restart Backend Server** (1 min)

**In your terminal:**

```powershell
# Stop current server (Ctrl + C)
# Then restart:
cd d:\consultancy\backend
npm run dev
```

You should see:
```
✅ Mail transporter ready
MongoDB connected successfully
```

---

### **Step 8: Test Google Login** (1 min)

1. **Open browser:** `http://localhost:5173/#/login`
2. **Hard refresh:** `Ctrl + Shift + R`
3. **Click:** "Continue with Google"
4. **Expected:** Google's real login page
5. **Sign in** with your Google account
6. **Grant permissions** when prompted
7. **Success:** Redirected back to your app, logged in!

---

## ✅ **SUCCESS CRITERIA**

You'll know it works when:

1. ✅ Click "Continue with Google"
2. ✅ Redirected to Google's **real** login page (blue Google branding)
3. ✅ Can select your Google account
4. ✅ See permission consent screen for ElectroStore
5. ✅ Redirected back to `http://localhost:5173`
6. ✅ Logged in successfully
7. ✅ Dashboard appears with your profile

---

## 🐛 **TROUBLESHOOTING**

### **Problem: "redirect_uri_mismatch"**

**Solution:** Go back to Google Cloud Console → Credentials
- Verify redirect URI exactly matches: `http://localhost:5000/api/auth/google/callback`
- No extra spaces or characters
- Check protocol is `http` (not `https` for local development)

### **Problem: "Access blocked: This app's request is invalid"**

**Solution:** 
- Add yourself as a test user in OAuth consent screen
- App must be in "Testing" mode for external users

### **Problem: Still getting "invalid_client"**

**Solution:**
1. Double-check you copied the FULL Client ID (very long)
2. Double-check Client Secret (starts with `GOCSPX-`)
3. Make sure no extra spaces when pasting
4. Restart backend after saving `.env`

---

## 📸 **VISUAL GUIDE**

### What You'll See at Each Step:

**Step 1: Google Cloud Console**
```
[Google Cloud Logo]
My First Project ▼   [Search]   [Notifications]
────────────────────────────────────────────────
Quick access
- Compute Engine
- Cloud Storage
```

**Step 3: OAuth Consent Screen**
```
OAuth consent screen
────────────────────
○ Internal  ● External

App information
App name: [ElectroStore____________]
User support email: [your@email.com ▼]
```

**Step 4: Create Credentials**
```
Create OAuth client ID
──────────────────────
Application type: [Web application ▼]

Name: [ElectroStore Web Client_____]

Authorized JavaScript origins
http://localhost:5173
[+ ADD URI]

Authorized redirect URIs  
http://localhost:5000/api/auth/google/callback
[+ ADD URI]

[CANCEL]  [CREATE]
```

**Step 5: Credentials Created**
```
OAuth client created
────────────────────────────
Your Client ID
123456789012-abc...xyz.apps.googleusercontent.com
[COPY]

Your Client Secret
GOCSPX-AbCdEfGhIjKlMnOpQrStUvWxYz
[COPY]

[OK]
```

---

## 🎯 **QUICK CHECKLIST**

- [ ] Signed in to Google Cloud Console
- [ ] Created new project "ElectroStore-Auth"
- [ ] Configured OAuth consent screen (External)
- [ ] Added email and profile scopes
- [ ] Added yourself as test user
- [ ] Created OAuth 2.0 Web client credentials
- [ ] Added JavaScript origin: `http://localhost:5173`
- [ ] Added redirect URI: `http://localhost:5000/api/auth/google/callback`
- [ ] Copied Client ID to `.env`
- [ ] Copied Client Secret to `.env`
- [ ] Saved `.env` file
- [ ] Restarted backend server
- [ ] Hard refreshed browser
- [ ] Tested Google login successfully

---

## 📞 **NEED HELP?**

If you encounter issues:

1. **Check backend logs** for errors
2. **Check browser console** (F12)
3. **Verify all URLs** match exactly
4. **Ensure no typos** in credentials
5. **Try incognito mode** to rule out cache issues

---

## 🎉 **YOU'RE DONE!**

After completing these steps, your Google OAuth login will work perfectly!

**Time to complete:** ~15 minutes  
**Difficulty:** Easy (just follow steps carefully)

---

**Last Updated:** December 7, 2025  
**Version:** 1.0 (Emergency Setup Guide)
