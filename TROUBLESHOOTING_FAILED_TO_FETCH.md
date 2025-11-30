# 🔧 Troubleshooting Guide: "Failed to Fetch" on Registration Page

**Error:** "Failed to fetch" or "NetworkError" during user registration

**Last Updated:** November 30, 2025  
**Applicable to:** MERN Authentication System v2.0.0

---

## 📋 Table of Contents

1. [Understanding the Error](#understanding-the-error)
2. [Quick Diagnostic Checklist](#quick-diagnostic-checklist)
3. [Client-Side Troubleshooting](#client-side-troubleshooting)
4. [Server-Side Troubleshooting](#server-side-troubleshooting)
5. [Network & CORS Issues](#network--cors-issues)
6. [Rate Limiting Issues](#rate-limiting-issues)
7. [Environment Configuration](#environment-configuration)
8. [Advanced Debugging](#advanced-debugging)
9. [Reporting Issues](#reporting-issues)

---

## 🎯 Understanding the Error

### What Does "Failed to Fetch" Mean?

**"Failed to fetch"** is a generic browser error that occurs when a JavaScript `fetch()` or AJAX request cannot complete successfully. It indicates that:

- The browser **attempted** to make an HTTP request to the server
- The request **failed to complete** for some reason
- The browser **could not receive a response** from the server

### Common Scenarios During Registration

```
User Action → Frontend (React) → Fetch Request → Backend (Express) → Database
                                      ❌ FAILS HERE
```

**Typical causes:**
1. ❌ Backend server is not running
2. ❌ Network connectivity issues
3. ❌ CORS (Cross-Origin Resource Sharing) blocking the request
4. ❌ Incorrect API endpoint URL
5. ❌ Firewall or proxy blocking the connection
6. ❌ SSL/TLS certificate issues (HTTPS)
7. ❌ Rate limiting blocking excessive requests
8. ❌ Server timeout or crash

---

## ✅ Quick Diagnostic Checklist

Before diving deep, run through this quick checklist:

```
□ Is the backend server running? (Check terminal)
□ Is the frontend server running? (Check terminal)
□ Are you connected to the internet?
□ Can you access http://localhost:5000 in your browser?
□ Does the browser console show any errors?
□ Have you tried refreshing the page (Ctrl+F5)?
□ Have you recently changed any configuration?
□ Are you using the correct port numbers?
```

---

## 🖥️ Client-Side Troubleshooting

### Step 1: Check Network Connection

**Verify your internet connection:**

1. Open a new browser tab
2. Try accessing external websites (google.com, github.com)
3. If other sites work, the issue is likely with your local servers

**For local development:**
- Ensure both frontend and backend servers are running
- Check terminal windows for error messages

### Step 2: Inspect Browser Console for Errors

**How to access the console:**

**Chrome/Edge/Brave:**
1. Press `F12` OR right-click anywhere → "Inspect"
2. Click the **Console** tab
3. Look for red error messages

**Firefox:**
1. Press `F12` OR right-click → "Inspect Element"
2. Click **Console** tab

**Safari:**
1. Enable Developer menu: Preferences → Advanced → "Show Develop menu"
2. Develop → Show JavaScript Console

**What to look for:**

```javascript
// ❌ Backend Not Running
Failed to fetch
TypeError: Failed to fetch
net::ERR_CONNECTION_REFUSED

// ❌ CORS Error
Access to fetch at 'http://localhost:5000/api/auth/register' 
from origin 'http://localhost:5173' has been blocked by CORS policy

// ❌ Network Timeout
net::ERR_EMPTY_RESPONSE
net::ERR_CONNECTION_TIMED_OUT

// ❌ Wrong URL
GET http://localhost:5000/api/auth/register 404 (Not Found)

// ❌ Rate Limiting
POST http://localhost:5000/api/auth/register 429 (Too Many Requests)
```

### Step 3: Check Network Tab

**View actual HTTP requests:**

1. Open Developer Tools (`F12`)
2. Click **Network** tab
3. Ensure "Fetch/XHR" filter is selected
4. Try registering again
5. Click on the failed request (shown in red)

**Analyze the request:**

```
Request URL: http://localhost:5000/api/auth/register
Request Method: POST
Status Code: (failed) or 429 or 404 or 500
```

**Important details to check:**
- **Request URL:** Is it correct? Should match your backend port
- **Request Method:** Should be `POST` for registration
- **Request Payload:** Check if data is being sent correctly
- **Response:** Any error message from server?

### Step 4: Clear Browser Cache and Cookies

**Chrome/Edge/Brave:**
1. Press `Ctrl + Shift + Delete`
2. Select "All time" in time range
3. Check: ✅ Cookies ✅ Cached images and files
4. Click "Clear data"
5. Restart browser

**Firefox:**
1. Press `Ctrl + Shift + Delete`
2. Select "Everything" in time range
3. Check: ✅ Cookies ✅ Cache
4. Click "Clear Now"

**Safari:**
1. Safari menu → Preferences → Privacy
2. Click "Manage Website Data"
3. Click "Remove All"

**After clearing:**
- Restart your browser completely
- Navigate back to `http://localhost:5173` (or your frontend URL)
- Try registering again

### Step 5: Disable Browser Extensions

**Extensions that commonly cause issues:**
- Ad blockers (uBlock Origin, AdBlock Plus)
- Privacy extensions (Privacy Badger, Ghostery)
- Security extensions (HTTPS Everywhere)
- VPN extensions

**How to disable:**

**Chrome/Edge:**
1. Click menu (⋮) → Extensions → Manage Extensions
2. Toggle off each extension
3. Refresh the page and test

**Firefox:**
1. Click menu (☰) → Add-ons and themes
2. Disable each extension
3. Refresh and test

**Alternative: Use Incognito/Private Mode:**
- Chrome: `Ctrl + Shift + N`
- Firefox: `Ctrl + Shift + P`
- Edge: `Ctrl + Shift + N`
- Safari: `File → New Private Window`

Incognito mode disables most extensions by default.

### Step 6: Test on Different Browser/Device

**Try these browsers in order:**
1. Chrome/Edge (Chromium-based)
2. Firefox
3. Safari (if on Mac)

**Test on different device:**
- Mobile phone on same WiFi network
- Different computer
- Access your app via local IP: `http://192.168.x.x:5173`

**If it works on another browser/device:**
- Issue is browser-specific (cache, extensions, or browser bug)

**If it fails everywhere:**
- Issue is likely server-side or network-related

---

## 🖧 Server-Side Troubleshooting

### Step 1: Verify Backend Server is Running

**Check terminal running backend:**

```bash
# You should see something like:
Server running on port 5000
MongoDB connected: <connection-string>
```

**If server is NOT running:**

```bash
cd backend
npm start
```

**Expected output:**
```
> backend@1.0.0 start
> node index.js

Server running on port 5000
MongoDB connected successfully
```

### Step 2: Check Backend Logs

**When you attempt registration, backend terminal should show:**

```bash
POST /api/auth/register
Status: 201 Created  # Success
# OR
Status: 400 Bad Request  # Validation error
# OR
Status: 500 Internal Server Error  # Server error
```

**If you see NO logs:**
- Backend is not receiving the request
- Likely a CORS, network, or URL issue

**If you see errors:**
- Check the error message in terminal
- Common errors documented below

### Step 3: Test Backend API Directly

**Use curl or Postman to bypass frontend:**

**Option A: Using curl (PowerShell):**

```powershell
# Test backend health
curl http://localhost:5000

# Test registration endpoint
curl -X POST http://localhost:5000/api/auth/register `
  -H "Content-Type: application/json" `
  -d '{\"name\":\"Test User\",\"email\":\"test@example.com\",\"password\":\"Test123!@#\"}'
```

**Option B: Using PowerShell Invoke-WebRequest:**

```powershell
$body = @{
    name = "Test User"
    email = "test@example.com"
    password = "Test123!@#"
} | ConvertTo-Json

Invoke-WebRequest -Uri http://localhost:5000/api/auth/register `
  -Method POST `
  -Body $body `
  -ContentType "application/json"
```

**Option C: Using Postman:**

1. Download Postman: https://www.postman.com/downloads/
2. Create new request:
   - Method: `POST`
   - URL: `http://localhost:5000/api/auth/register`
   - Headers: `Content-Type: application/json`
   - Body (raw JSON):
     ```json
     {
       "name": "Test User",
       "email": "test@example.com",
       "password": "Test123!@#"
     }
     ```
3. Click "Send"

**Expected Response (Success):**
```json
{
  "message": "Registration successful. Please check your email for OTP."
}
```

**If curl/Postman works but browser doesn't:**
- Issue is on frontend or CORS-related

**If curl/Postman also fails:**
- Issue is on backend server

### Step 4: Check API Endpoint Configuration

**Verify frontend is pointing to correct backend URL:**

**File:** `frontend/src/components/RegisterModern.jsx`

**Line ~89-94:**
```javascript
const response = await fetch('http://localhost:5000/api/auth/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ name, email, password }),
});
```

**Common mistakes:**
- ❌ `http://localhost:3000` (wrong port)
- ❌ `http://localhost:5000/register` (missing `/api/auth`)
- ❌ `https://localhost:5000` (using HTTPS locally without SSL)
- ✅ `http://localhost:5000/api/auth/register` (correct)

**If deployed to production:**
- Change to your production URL: `https://yourdomain.com/api/auth/register`

### Step 5: Verify Backend Route Configuration

**File:** `backend/routes/auth.js`

**Check registration route exists:**
```javascript
router.post('/register', registrationLimiter, async (req, res) => {
  // Registration logic
});
```

**Check backend index.js mounts routes:**
```javascript
app.use('/api/auth', authRoutes);
```

**Full path should be:** `/api/auth/register`

---

## 🌐 Network & CORS Issues

### Understanding CORS

**CORS (Cross-Origin Resource Sharing)** is a security mechanism that restricts web pages from making requests to a different domain than the one serving the page.

**Example scenario:**
```
Frontend: http://localhost:5173  (Vite dev server)
Backend:  http://localhost:5000  (Express server)
          ^^^ Different ports = Different origins
```

Browsers block these requests by default for security.

### Check CORS Configuration

**File:** `backend/index.js`

**Should contain:**
```javascript
const cors = require('cors');

app.use(cors({
  origin: 'http://localhost:5173',  // Frontend URL
  credentials: true
}));
```

**Common CORS errors in console:**
```
Access to fetch at 'http://localhost:5000/api/auth/register' 
from origin 'http://localhost:5173' has been blocked by CORS policy: 
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

### Fix CORS Issues

**Solution 1: Enable CORS in backend**

```javascript
// backend/index.js
const cors = require('cors');

// Development - Allow specific origin
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

// OR Production - Allow your production domain
app.use(cors({
  origin: 'https://yourdomain.com',
  credentials: true
}));

// OR Allow all origins (NOT recommended for production)
app.use(cors());
```

**Solution 2: Install cors package if missing**

```bash
cd backend
npm install cors
```

Then restart backend server.

**Solution 3: Manual CORS headers**

If `cors` package is not working:

```javascript
// backend/index.js
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});
```

### Network Configuration Issues

**Firewall blocking requests:**

**Windows Firewall:**
1. Search "Windows Defender Firewall"
2. Click "Allow an app through firewall"
3. Ensure Node.js is allowed for Private networks

**Antivirus software:**
- Temporarily disable antivirus
- Add exception for localhost connections

**Corporate proxy:**
- May block localhost connections
- Try accessing via IP: `http://127.0.0.1:5000`

**VPN interference:**
- Disconnect VPN temporarily
- VPNs can block local network requests

---

## ⏱️ Rate Limiting Issues

Our system has rate limiting to prevent abuse. This can cause "Failed to fetch" if limits are exceeded.

### Rate Limits

**From:** `backend/middleware/rateLimiter.js`

```javascript
// Registration: 3 attempts per hour per IP
registrationLimiter: 3 requests / 1 hour

// OTP Verification: 10 attempts per 15 minutes per IP
otpLimiter: 10 requests / 15 minutes

// Resend OTP: 3 attempts per 5 minutes per IP
resendOtpLimiter: 3 requests / 5 minutes
```

### Check if Rate Limited

**Browser console error:**
```
POST http://localhost:5000/api/auth/register 429 (Too Many Requests)
```

**Backend terminal log:**
```
Too many registration attempts from IP: ::1
Rate limit exceeded: registrationLimiter
```

### Solutions for Rate Limiting

**Option 1: Wait for cooldown period**
- Registration: Wait 1 hour
- OTP verification: Wait 15 minutes
- Resend OTP: Wait 5 minutes

**Option 2: Disable rate limiting (development only)**

**File:** `backend/routes/auth.js`

```javascript
// Temporarily remove rate limiters for testing
// BEFORE:
router.post('/register', registrationLimiter, async (req, res) => {

// AFTER (for testing):
router.post('/register', async (req, res) => {
```

⚠️ **Remember to re-enable rate limiting after testing!**

**Option 3: Increase rate limits (development)**

**File:** `backend/middleware/rateLimiter.js`

```javascript
const registrationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 100,  // Increase from 3 to 100 for testing
  message: 'Too many registration attempts...'
});
```

**Option 4: Clear rate limit (development)**

Rate limits are stored in memory and reset when server restarts:

```bash
# Restart backend server
Ctrl+C  # Stop server
npm start  # Start again
```

**Option 5: Use different IP/browser**
- Try incognito mode (different session)
- Use different browser
- Access from different device on network

---

## ⚙️ Environment Configuration

### Check Environment Variables

**File:** `backend/.env`

**Required variables:**
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/auth-system
JWT_SECRET=your-secret-key-here
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-specific-password
```

**Common issues:**

**❌ PORT mismatch:**
```env
# .env file says:
PORT=3000

# But frontend expects:
http://localhost:5000/api/auth/register
```

**Solution:** Change PORT to 5000 or update frontend URL

**❌ Missing .env file:**
```bash
# Create .env file
cd backend
New-Item .env -Type File

# Add required variables
```

**❌ MongoDB connection issues:**
```
MongoServerError: connect ECONNREFUSED 127.0.0.1:27017
```

**Solution:** Ensure MongoDB is running:
```bash
# Windows - Check if MongoDB service is running
Get-Service -Name MongoDB

# Start MongoDB if stopped
net start MongoDB
```

### Check Frontend Environment

**File:** `frontend/.env` (if exists)

**May contain:**
```env
VITE_API_URL=http://localhost:5000
```

**If frontend is using environment variable for API URL:**

**Check:** `frontend/src/components/RegisterModern.jsx`

```javascript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const response = await fetch(`${API_URL}/api/auth/register`, {
  // ...
});
```

---

## 🔍 Advanced Debugging

### Enable Verbose Logging

**Backend logging:**

**File:** `backend/routes/auth.js`

Add detailed logging to registration route:

```javascript
router.post('/register', registrationLimiter, async (req, res) => {
  try {
    console.log('===== REGISTRATION REQUEST =====');
    console.log('Request body:', req.body);
    console.log('Request headers:', req.headers);
    console.log('Client IP:', req.ip);
    console.log('================================');

    // ... rest of registration logic

    console.log('Registration successful for:', email);
    res.status(201).json({ message: 'Registration successful...' });
  } catch (error) {
    console.error('===== REGISTRATION ERROR =====');
    console.error('Error details:', error);
    console.error('Error stack:', error.stack);
    console.error('==============================');
    res.status(500).json({ error: 'Server error' });
  }
});
```

**Frontend logging:**

**File:** `frontend/src/components/RegisterModern.jsx`

```javascript
const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');
  setLoading(true);

  console.log('===== REGISTRATION ATTEMPT =====');
  console.log('Name:', name);
  console.log('Email:', email);
  console.log('API URL:', 'http://localhost:5000/api/auth/register');
  console.log('================================');

  try {
    const response = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, password }),
    });

    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);

    const data = await response.json();
    console.log('Response data:', data);

    // ... rest of logic
  } catch (err) {
    console.error('===== FETCH ERROR =====');
    console.error('Error type:', err.name);
    console.error('Error message:', err.message);
    console.error('Error stack:', err.stack);
    console.error('=======================');
    setError('Failed to connect to server. Please check if the backend is running.');
  } finally {
    setLoading(false);
  }
};
```

### Check MongoDB Connection

**Verify MongoDB is running:**

```bash
# Test MongoDB connection
mongosh

# Should show:
# Connected to: mongodb://127.0.0.1:27017/
```

**If MongoDB is not installed:**

See: [QUICKSTART.md](./QUICKSTART.md) - Section: "Prerequisites"

**Check MongoDB logs:**

```javascript
// backend/config/db.js
const connectDB = async () => {
  try {
    console.log('Attempting MongoDB connection...');
    console.log('URI:', process.env.MONGODB_URI);
    
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('MongoDB Connection Error:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
};
```

### Test with curl in Verbose Mode

```bash
# Verbose curl request
curl -v -X POST http://localhost:5000/api/auth/register `
  -H "Content-Type: application/json" `
  -d '{\"name\":\"Test\",\"email\":\"test@test.com\",\"password\":\"Test123!\"}'
```

**Look for:**
- `* Connected to localhost` - Connection successful
- `> POST /api/auth/register` - Request sent
- `< HTTP/1.1 201 Created` - Success response
- `< Access-Control-Allow-Origin` - CORS headers

### Check Server Health Endpoint

**Add health check to backend:**

**File:** `backend/index.js`

```javascript
// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});
```

**Test health endpoint:**

```bash
curl http://localhost:5000/health
```

**Expected response:**
```json
{
  "status": "OK",
  "timestamp": "2025-11-30T12:00:00.000Z",
  "uptime": 123.45,
  "mongodb": "connected"
}
```

### Network Tracing

**Use browser Network tab with detailed timing:**

1. Open DevTools (`F12`) → Network tab
2. Click on failed request
3. Check **Timing** tab

**Timing breakdown:**
- **Queueing:** Request waiting to start
- **Stalled:** Browser waiting for available network connection
- **DNS Lookup:** Resolving domain name
- **Initial connection:** TCP handshake
- **SSL:** SSL/TLS negotiation (if HTTPS)
- **Request sent:** Time to send request data
- **Waiting (TTFB):** Time to first byte from server
- **Content Download:** Time to download response

**If stuck at:**
- **Queueing/Stalled:** Too many simultaneous requests
- **DNS Lookup:** DNS issues (unlikely with localhost)
- **Initial connection:** Server not responding
- **Waiting:** Server taking too long to respond

---

## 📊 Common Error Patterns

### Error Pattern 1: Connection Refused

**Browser console:**
```
Failed to fetch
net::ERR_CONNECTION_REFUSED
```

**Cause:** Backend server is not running

**Solution:**
```bash
cd backend
npm start
```

---

### Error Pattern 2: CORS Policy Error

**Browser console:**
```
Access to fetch at 'http://localhost:5000/api/auth/register' 
from origin 'http://localhost:5173' has been blocked by CORS policy
```

**Cause:** Backend not configured to accept requests from frontend origin

**Solution:**
```javascript
// backend/index.js
const cors = require('cors');
app.use(cors({ origin: 'http://localhost:5173' }));
```

---

### Error Pattern 3: 404 Not Found

**Browser console:**
```
POST http://localhost:5000/api/auth/register 404 (Not Found)
```

**Cause:** Incorrect API endpoint URL

**Solution:** Verify:
1. Backend route: `router.post('/register', ...)`
2. Backend mounts: `app.use('/api/auth', authRoutes)`
3. Frontend URL: `http://localhost:5000/api/auth/register`

---

### Error Pattern 4: 429 Too Many Requests

**Browser console:**
```
POST http://localhost:5000/api/auth/register 429 (Too Many Requests)
```

**Response body:**
```json
{
  "error": "Too many registration attempts from this IP, please try again after an hour."
}
```

**Cause:** Rate limit exceeded

**Solution:** Wait or restart backend server to reset limits

---

### Error Pattern 5: 500 Internal Server Error

**Browser console:**
```
POST http://localhost:5000/api/auth/register 500 (Internal Server Error)
```

**Cause:** Backend server error

**Solution:** Check backend terminal for error details

**Common 500 causes:**
- MongoDB not connected
- Missing environment variables
- Email service error
- Code error in registration logic

---

### Error Pattern 6: Empty Response

**Browser console:**
```
Failed to fetch
net::ERR_EMPTY_RESPONSE
```

**Cause:** Server crashed or timed out

**Solution:** Check backend terminal for crash logs

---

## 📞 Reporting Issues

If you've followed all troubleshooting steps and the issue persists, please report it with the following information:

### Information to Include

**1. Environment Details:**
```
Operating System: Windows 11 / macOS / Linux
Node.js Version: (run: node --version)
npm Version: (run: npm --version)
Browser: Chrome 120.0 / Firefox 121.0
```

**2. Error Details:**
```
- Exact error message from browser console
- Screenshot of Network tab showing failed request
- Screenshot of backend terminal logs
```

**3. Configuration:**
```
- Backend port: 5000
- Frontend port: 5173
- MongoDB connection string: mongodb://localhost:27017/...
- CORS configuration: (from backend/index.js)
```

**4. Steps to Reproduce:**
```
1. Started backend with: npm start
2. Started frontend with: npm run dev
3. Navigated to: http://localhost:5173
4. Clicked on "Register"
5. Filled form with: name, email, password
6. Clicked "Register" button
7. Error occurred: "Failed to fetch"
```

**5. What You've Tried:**
```
✅ Verified backend is running
✅ Cleared browser cache
✅ Tested in incognito mode
✅ Checked CORS configuration
❌ Still getting error
```

### How to Collect Logs

**Backend logs:**
```bash
# Run backend and save output to file
cd backend
npm start > backend.log 2>&1

# Try registration, then stop server
# Send backend.log file
```

**Browser console:**
1. Open DevTools (F12) → Console
2. Right-click in console
3. "Save as..." → save to file

**Network HAR file:**
1. Open DevTools (F12) → Network tab
2. Reproduce the error
3. Right-click in Network tab
4. "Save all as HAR with content"
5. Attach HAR file

### Where to Report

**GitHub Issues:**
```
Title: [BUG] Failed to fetch on registration page
Labels: bug, needs-investigation

Include all information from above
```

**Email Support:**
```
To: support@yourdomain.com
Subject: Failed to fetch error - Registration
Attach: logs, screenshots, HAR file
```

---

## 🎯 Conclusion

The "Failed to fetch" error can stem from multiple causes, but systematically following this guide should help you:

✅ **Identify** whether the issue is client-side or server-side  
✅ **Resolve** common configuration problems  
✅ **Understand** CORS and rate limiting behavior  
✅ **Debug** with detailed logging and network analysis  
✅ **Report** issues effectively if problems persist

### Quick Resolution Checklist

Most common fixes (try in order):

1. ✅ **Restart both servers**
   ```bash
   # Stop both servers (Ctrl+C)
   # Start backend: cd backend && npm start
   # Start frontend: cd frontend && npm run dev
   ```

2. ✅ **Clear browser cache** (Ctrl+Shift+Delete)

3. ✅ **Check browser console** for specific error

4. ✅ **Verify CORS configuration** in `backend/index.js`

5. ✅ **Test backend directly** with curl/Postman

6. ✅ **Check rate limiting** (restart server to reset)

### Remember

- 🔄 **Restart servers** after configuration changes
- 🧹 **Clear cache** when behavior seems inconsistent
- 📝 **Check logs** in both frontend and backend
- 🌐 **CORS** is the most common culprit in development
- ⏱️ **Rate limiting** can block during testing

### Need More Help?

- 📖 [API Documentation](./API_DOCUMENTATION.md) - Detailed API reference
- 🚀 [Quick Start Guide](./QUICKSTART.md) - Setup instructions
- 🔒 [Security & Deployment](./SECURITY_DEPLOYMENT.md) - Production issues
- 📚 [Documentation Index](./DOCUMENTATION_INDEX.md) - All documentation

---

**If this guide helped you resolve the issue, consider:**
- ⭐ Starring the repository
- 📝 Updating this guide with your solution
- 🤝 Helping others with similar issues

---

**Last Updated:** November 30, 2025  
**Version:** 2.0.0  
**Applies to:** MERN Authentication System with OTP Verification

---

## 🔗 Related Documentation

- [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) - Error codes reference
- [QUICKSTART.md](./QUICKSTART.md) - Initial setup troubleshooting
- [SECURITY_DEPLOYMENT.md](./SECURITY_DEPLOYMENT.md) - Production deployment issues
- [ARCHITECTURE_DIAGRAMS.md](./ARCHITECTURE_DIAGRAMS.md) - System flow visualization
- [USER_GUIDE.md](./USER_GUIDE.md) - End-user troubleshooting

---

💡 **Pro Tip:** Most "Failed to fetch" errors are resolved by ensuring both backend and frontend servers are running and properly configured. Always start there!
