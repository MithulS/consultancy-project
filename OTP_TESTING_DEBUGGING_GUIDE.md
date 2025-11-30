# 🧪 OTP Verification Testing & Debugging Guide

**Purpose:** Comprehensive guide for testing OTP verification fixes and diagnosing issues  
**Date:** November 30, 2025  
**Status:** Ready for Testing

---

## 🎯 Quick Testing Checklist

### ✅ Pre-Flight Checks
```powershell
# 1. Start backend server
cd D:\consultancy\backend
npm start

# 2. Start frontend server (in new terminal)
cd D:\consultancy\frontend
npm run dev

# 3. Check both servers running
# Backend: http://localhost:5000
# Frontend: http://localhost:5173

# 4. Open browser DevTools (F12)
# - Console tab for logs
# - Application tab for storage
# - Network tab for requests
```

---

## 🔬 Test Scenarios

### Test 1: Normal Registration → OTP Flow ✅

**Expected: PASS**

**Steps:**
```
1. Navigate to http://localhost:5173/#register
2. Fill form:
   - Username: testuser123
   - Name: Test User
   - Email: your.email@gmail.com
   - Password: Test@1234
3. Click "Register"
4. Watch console logs (F12)
5. Wait 2 seconds for redirect
6. Should auto-redirect to #verify-otp?email=your.email@gmail.com
7. OTP page should show:
   - Timer counting down from 10:00
   - Masked email: yo**@gmail.com
   - 6 empty input boxes
   - NO error messages
```

**Console Output (Expected):**
```
🚀 Initiating registration request...
📍 API URL: http://localhost:5000/api/auth/register
📦 Payload: {username: "testuser123", name: "Test User", email: "your.email@gmail.com"}
📡 Response received: 201 Created
📦 Response data: {msg: "User registered. OTP sent to email."}
✅ Registration successful!
📧 Email stored in localStorage and sessionStorage

🔐 OTP Verification Initialization
📧 Email from localStorage: your.email@gmail.com
📧 Email from sessionStorage: your.email@gmail.com
📧 Email from URL: your.email@gmail.com
📧 Final email: your.email@gmail.com
💾 LocalStorage keys: ["pendingVerificationEmail", "otpExpiry"]
🕒 OTP expiry: 2025-11-30T12:30:00.000Z
🌐 Current URL: http://localhost:5173/#verify-otp?email=your.email@gmail.com
📍 Hash: #verify-otp?email=your.email@gmail.com
🔍 Referrer: http://localhost:5173/
```

**Verification:**
```
✅ Email stored in localStorage
✅ Email stored in sessionStorage
✅ Email passed via URL parameter
✅ OTP page loads correctly
✅ Timer starts at 10:00
✅ Email displayed as masked
✅ No error messages
```

---

### Test 2: Manual Email Entry (Storage Cleared) ✅

**Expected: PASS with Recovery**

**Steps:**
```
1. Complete Test 1 (register successfully)
2. On OTP page, open DevTools → Application
3. Storage → Local Storage → http://localhost:5173
4. Right-click → Clear
5. Also clear Session Storage
6. Refresh page (F5)
7. Should show "Session Not Found" warning box
8. Enter email manually in the input field
9. Click "Continue with this email"
10. Page reloads with email restored
```

**Console Output (Expected):**
```
🔐 OTP Verification Initialization
📧 Email from localStorage: NOT FOUND
📧 Email from sessionStorage: NOT FOUND
📧 Email from URL: your.email@gmail.com
📧 Final email: your.email@gmail.com
💾 LocalStorage keys: []
❌ CRITICAL: No email found in any storage location

// After manual entry:
✅ Email manually entered and stored: your.email@gmail.com
```

**UI Elements:**
```
⚠️ Session Not Found
We couldn't find your email address. This usually happens when:
• 🔗 You navigated directly to this page
• 🧹 Your browser cleared stored data
• 🔒 Private/Incognito mode restrictions
• ⏰ Session expired (> 30 minutes)

Enter your email to continue:
[input field: your.email@example.com]
[Continue with this email]
[🔄 Register a new account instead]
[🔑 Already verified? Go to login]
```

---

### Test 3: URL Parameter Fallback ✅

**Expected: PASS**

**Steps:**
```
1. Clear all browser storage manually
2. Navigate directly to:
   http://localhost:5173/#verify-otp?email=test@example.com
3. Page should load with email from URL
4. No error message
5. Shows "te**@example.com"
```

**Console Output (Expected):**
```
🔐 OTP Verification Initialization
📧 Email from localStorage: NOT FOUND
📧 Email from sessionStorage: NOT FOUND
📧 Email from URL: test@example.com
📧 Final email: test@example.com
```

**Verification:**
```
✅ Email retrieved from URL parameter
✅ No storage errors
✅ Page functions normally
```

---

### Test 4: Enter and Verify OTP ✅

**Expected: PASS**

**Steps:**
```
1. Complete Test 1 (normal registration)
2. Check your email for OTP (6-digit code)
3. On OTP page, click first input box
4. Type digits one by one: 1, 2, 3, 4, 5, 6
5. Observe auto-focus moving to next box
6. Click "Verify Email" button
7. Success message appears
8. Redirects to login page after 2 seconds
```

**Console Output (Expected):**
```
🔐 Verifying OTP...
📧 Email: your.email@gmail.com
🔢 OTP: 123456
📡 Response: 200 {msg: "Email verified successfully"}
✅ Verification successful!
```

**Verification:**
```
✅ Auto-focus works between inputs
✅ All 6 digits entered
✅ Verify button enabled
✅ Backend accepts OTP
✅ Success message shown
✅ Redirects to login
✅ Storage cleared after success
```

---

### Test 5: Paste OTP Code ✅

**Expected: PASS**

**Steps:**
```
1. Complete Test 1 (normal registration)
2. Copy OTP code from email: "123456"
3. Click first input box
4. Paste (Ctrl+V or Cmd+V)
5. All 6 digits should fill automatically
6. Focus should move to last box
7. Click "Verify Email"
```

**Console Output:**
```
(Paste event detected)
🔐 Verifying OTP...
📧 Email: your.email@gmail.com
🔢 OTP: 123456
```

**Verification:**
```
✅ Paste detected
✅ All 6 digits filled
✅ Focus on last input
✅ Verify button enabled
✅ Verification succeeds
```

---

### Test 6: Wrong OTP (Error Handling) ❌→✅

**Expected: FAIL then RECOVER**

**Steps:**
```
1. Complete Test 1 (normal registration)
2. Enter wrong OTP: 999999
3. Click "Verify Email"
4. Error message: "Incorrect code. 4 attempts remaining."
5. Input boxes clear automatically
6. Focus returns to first box
7. Enter correct OTP
8. Verification succeeds
```

**Console Output:**
```
🔐 Verifying OTP...
📧 Email: your.email@gmail.com
🔢 OTP: 999999
📡 Response: 400 {msg: "Invalid OTP. 4 attempts remaining.", attemptsRemaining: 4}

❌ Error: Incorrect code
```

**UI Display:**
```
❌ Incorrect code. 4 attempts remaining.
⚠️ 4 attempts remaining
```

**Verification:**
```
✅ Error message displayed
✅ Attempts counter updated
✅ Inputs cleared
✅ Focus restored
✅ Can retry
```

---

### Test 7: OTP Expiry & Resend ⏰

**Expected: PASS**

**Steps:**
```
1. Complete Test 1 (normal registration)
2. Wait 10 minutes (or manipulate timer in code for testing)
3. Timer reaches 0:00
4. Error: "Your OTP has expired. Please request a new one."
5. Verify button disabled
6. Resend button enabled
7. Click "Resend Code"
8. Success: "New code sent to your email!"
9. Timer resets to 10:00
10. Enter new OTP from email
```

**Console Output:**
```
⏱️ Countdown: 9:59, 9:58, ... 0:01, 0:00
⏱️ OTP expired

🔄 Resending OTP to: your.email@gmail.com
📡 Resend response: 200 {msg: "New OTP sent to email"}
✅ New code sent!
⏱️ Countdown restarted: 10:00
```

**Verification:**
```
✅ Timer counts down correctly
✅ Expires at 0:00
✅ Verify button disabled when expired
✅ Resend button enabled
✅ New OTP sent
✅ Timer resets
✅ Can verify with new OTP
```

---

### Test 8: Account Locking (Security) 🔒

**Expected: PASS**

**Steps:**
```
1. Complete Test 1 (normal registration)
2. Enter wrong OTP 5 times
   - Attempt 1: 111111 → "4 attempts remaining"
   - Attempt 2: 222222 → "3 attempts remaining"
   - Attempt 3: 333333 → "2 attempts remaining"
   - Attempt 4: 444444 → "1 attempt remaining"
   - Attempt 5: 555555 → "Account locked"
3. Account locked message appears
4. Both buttons disabled
5. Lock icon displayed
6. Must wait 15 minutes
```

**Console Output:**
```
Attempt 1:
📡 Response: 400 {msg: "Invalid OTP. 4 attempts remaining.", attemptsRemaining: 4}

Attempt 5:
📡 Response: 429 {msg: "Too many failed attempts. Account locked for 15 minutes."}
🔒 Account locked
```

**UI Display:**
```
❌ Account locked due to too many failed attempts. Please wait 15 minutes.
🔒 Account locked. Please wait 15 minutes before trying again.

[Verify Email] - DISABLED
[Resend Code] - DISABLED
```

**Verification:**
```
✅ Tracks attempts correctly
✅ Locks after 5 failures
✅ Clear error message
✅ Both buttons disabled
✅ Security working
```

---

### Test 9: Direct Navigation (No Registration) ❌→✅

**Expected: ERROR with Recovery**

**Steps:**
```
1. Open new browser (or clear all storage)
2. Navigate directly to:
   http://localhost:5173/#verify-otp
3. No email in storage, no URL parameter
4. Manual email input section appears
5. Enter email: test@example.com
6. Click "Continue with this email"
7. Or click "Register a new account instead"
```

**Console Output:**
```
🔐 OTP Verification Initialization
📧 Email from localStorage: NOT FOUND
📧 Email from sessionStorage: NOT FOUND
📧 Email from URL: NOT FOUND
📧 Final email: NONE AVAILABLE
❌ CRITICAL: No email found in any storage location
```

**UI Display:**
```
⚠️ Session Not Found

We couldn't find your email address. This usually happens when:
• 🔗 You navigated directly to this page
• 🧹 Your browser cleared stored data
• 🔒 Private/Incognito mode restrictions
• ⏰ Session expired (> 30 minutes)

[Manual email input form]
```

**Verification:**
```
✅ Detects missing email
✅ Shows recovery options
✅ Allows manual entry
✅ Provides alternative actions
✅ No infinite redirects
```

---

### Test 10: Keyboard Navigation ⌨️

**Expected: PASS**

**Steps:**
```
1. Complete Test 1 (normal registration)
2. Test keyboard controls:
   - Tab: Move to first input
   - Type "1": Auto-focus to second input
   - Type "2": Auto-focus to third input
   - Backspace: Clear "2", stay on second input
   - Backspace again: Move back to first, clear "1"
   - Arrow Right: Move to second input
   - Arrow Left: Move back to first
   - Type "123456" continuously
   - All boxes fill correctly
```

**Verification:**
```
✅ Tab navigation works
✅ Auto-advance on type
✅ Backspace clears digit
✅ Backspace moves back when empty
✅ Arrow keys navigate
✅ Continuous typing works
```

---

## 🐛 Common Issues & Debugging

### Issue 1: "Failed to fetch" Error

**Symptoms:**
```
❌ Cannot connect to server. Please check:
1. Backend server is running
2. Backend is on port 5000
3. Your internet connection
```

**Diagnosis:**
```powershell
# Check backend server
cd D:\consultancy\backend
npm start

# Should see:
# Server running on port 5000
# MongoDB connected
# Mail transporter ready
```

**Fix:**
1. Restart backend server
2. Check MongoDB connection
3. Verify EMAIL_USER and EMAIL_PASS in .env

---

### Issue 2: Email Not Stored

**Symptoms:**
- Registration succeeds
- Redirects to OTP page
- Shows "No email found"

**Diagnosis:**
```javascript
// Check console during registration
// Should see:
✅ Registration successful!
📧 Email stored in localStorage and sessionStorage

// If NOT seen, check:
// 1. Registration response
// 2. Storage permissions
// 3. Private/Incognito mode
```

**Fix:**
1. Disable private browsing
2. Check browser storage settings
3. Allow cookies and site data
4. Use manual email entry as fallback

---

### Issue 3: OTP Email Not Received

**Symptoms:**
- Registration succeeds
- No email arrives
- Check spam folder - nothing

**Diagnosis:**
```
Check backend console for:
❌ sendMail error during register: ...
```

**Common Causes:**
1. Invalid EMAIL_USER or EMAIL_PASS
2. Gmail App Password not enabled
3. Email service rate limits
4. Firewall blocking SMTP

**Fix:**
```
1. Generate Gmail App Password:
   - Go to myaccount.google.com
   - Security → 2-Step Verification
   - App Passwords → Generate
   - Copy password to .env file

2. Update backend/.env:
   EMAIL_USER=your.email@gmail.com
   EMAIL_PASS=your-16-char-app-password

3. Restart backend server
```

---

### Issue 4: Timer Not Counting Down

**Symptoms:**
- Timer stuck at 10:00
- Doesn't decrease
- Resend button never enables

**Diagnosis:**
```javascript
// Check console for:
⏱️ Countdown started: 10 minutes
⏱️ Countdown: 9:59 (should appear every second)

// If no updates, check useEffect dependencies
```

**Fix:**
1. Clear browser cache
2. Hard refresh (Ctrl+F5)
3. Check React version compatibility
4. Verify useEffect dependencies

---

### Issue 5: Paste Not Working

**Symptoms:**
- Copy OTP: "123456"
- Paste in first box
- Only "1" appears, not all 6

**Diagnosis:**
```javascript
// Check onPaste handler
// Should see in console:
(Paste event detected)
Pasted data: 123456
```

**Fix:**
1. Ensure `onPaste` on first input only
2. Check regex: `/^\d{6}$/`
3. Verify paste event not prevented elsewhere
4. Test with different browsers

---

## 📊 Testing Checklist

### Functional Tests
- [ ] Registration stores email in localStorage
- [ ] Registration stores email in sessionStorage  
- [ ] Registration passes email via URL
- [ ] OTP page loads email from storage
- [ ] OTP page loads email from URL
- [ ] Manual email entry works
- [ ] Timer counts down correctly
- [ ] Timer color changes (green → orange → red)
- [ ] Masked email displays correctly
- [ ] 6 individual inputs work
- [ ] Auto-focus between inputs
- [ ] Keyboard navigation (arrows, backspace)
- [ ] Paste functionality
- [ ] Verify button works
- [ ] Resend button works
- [ ] Error messages clear
- [ ] Success redirect to login
- [ ] Account locking after 5 attempts
- [ ] Attempt counter accurate

### Security Tests
- [ ] Rate limiting works
- [ ] Account locks after 5 failures
- [ ] OTP expires after 10 minutes
- [ ] Can't verify expired OTP
- [ ] Can't verify with wrong OTP
- [ ] Can't bypass verification
- [ ] Audit logs created

### UX Tests
- [ ] Error messages helpful
- [ ] Recovery options available
- [ ] Loading states shown
- [ ] Success feedback clear
- [ ] Mobile responsive
- [ ] Accessible (ARIA labels)
- [ ] Keyboard-only navigation
- [ ] Screen reader compatible

### Edge Cases
- [ ] Direct navigation handled
- [ ] Storage cleared mid-flow
- [ ] Multiple tabs/windows
- [ ] Session expiry
- [ ] Network errors
- [ ] Backend down
- [ ] Invalid email format
- [ ] Already verified user
- [ ] User doesn't exist

---

## 🎯 Success Criteria

### All Tests Must Pass:
- ✅ Normal flow: Register → Verify → Login
- ✅ Recovery flow: Storage cleared → Manual entry → Verify
- ✅ Error handling: Wrong OTP → Clear feedback → Retry
- ✅ Security: 5 failures → Account locked → Wait 15 min
- ✅ Expiry: 10 minutes → Resend → New OTP → Verify

### Performance Metrics:
- ⚡ Page load: < 1 second
- ⚡ OTP verification: < 2 seconds
- ⚡ Email delivery: < 30 seconds
- ⚡ Resend cooldown: 10 minutes

### User Experience:
- 😊 Clear instructions
- 😊 Helpful error messages
- 😊 Multiple recovery options
- 😊 Fast and smooth
- 😊 No dead ends

---

## 📝 Bug Report Template

When reporting issues, include:

```markdown
**Bug Title:** Brief description

**Environment:**
- OS: Windows 11
- Browser: Chrome 120.0
- Frontend: http://localhost:5173
- Backend: http://localhost:5000

**Steps to Reproduce:**
1. Step one
2. Step two
3. Step three

**Expected Result:**
What should happen

**Actual Result:**
What actually happened

**Console Logs:**
```
Paste relevant console output
```

**Screenshots:**
[Attach screenshots]

**Storage State:**
```javascript
localStorage: {
  pendingVerificationEmail: "test@example.com",
  otpExpiry: "2025-11-30T12:30:00.000Z"
}
```

**Network Requests:**
```
POST /api/auth/register - 201 Created
POST /api/auth/verify-otp - 400 Bad Request
```
```

---

## ✅ Final Verification

Before marking as complete:

```bash
# Run all tests
npm test

# Check code quality
npm run lint

# Build production
npm run build

# Deploy to staging
# Test in production-like environment
# Monitor error rates
# Check analytics
```

---

**Status:** ✅ Ready for Testing  
**Next:** Run all test scenarios and report results  
**Timeline:** Testing should complete within 2-4 hours

