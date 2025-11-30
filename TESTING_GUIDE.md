# 🧪 OTP VERIFICATION SYSTEM - TESTING GUIDE

## Quick Test Instructions

### ✅ System Status: OPERATIONAL
- Backend: http://localhost:5000 ✅
- Frontend: http://localhost:5173 ✅
- Database: MongoDB Connected ✅

---

## 🎯 TEST SCENARIOS

### **Scenario 1: New User Registration & Verification**

1. **Open Browser**: http://localhost:5173/#register

2. **Fill Registration Form**:
   ```
   Username: testuser123
   Name: Test User
   Email: [your email]
   Password: Test1234!
   ```

3. **Submit Form** → Should see:
   - ✅ "Success! Check your email for verification code"
   - ✅ Auto-redirect to OTP page after 2 seconds

4. **On OTP Page** → Should see:
   - ✅ 10-minute countdown timer (starts at 10:00)
   - ✅ Your masked email (te***@example.com)
   - ✅ 6 empty input boxes
   - ✅ "Verify Email" button (disabled until 6 digits entered)

5. **Check Email** → Get 6-digit OTP code

6. **Enter OTP**:
   - Type each digit (auto-advances to next box)
   - OR paste all 6 digits at once
   - "Verify Email" button becomes enabled

7. **Click "Verify Email"** → Should see:
   - ✅ "Email verified successfully! Redirecting to login..."
   - ✅ Auto-redirect to login page after 2 seconds

8. **On Login Page** → Should see:
   - ✅ Green success message: "✅ Email verified successfully! You can now log in."
   - Message auto-disappears after 5 seconds

9. **Login with Credentials** → Should:
   - ✅ Show "Welcome back, [Name]!"
   - ✅ Redirect to dashboard

**Expected Result**: ✅ PASS - Complete flow successful

---

### **Scenario 2: Unverified User Tries to Login**

1. **Register User** (but DON'T verify OTP)

2. **Navigate to Login**: http://localhost:5173/#login

3. **Enter Email + Password** → Click "Login"

4. **Should See**:
   - ❌ Red message: "Email not verified. Redirecting to verification page..."
   - ⏱️ Wait 1.5 seconds
   - ✅ **Auto-redirect to OTP page with email loaded**

5. **On OTP Page**:
   - ✅ Email is already filled in
   - ✅ Timer shows time remaining
   - Enter OTP and verify

**Expected Result**: ✅ PASS - User automatically guided to verification

---

### **Scenario 3: OTP Expiry & Resend**

1. **On OTP Verification Page**

2. **Wait for Timer**:
   - Timer counts down from 10:00
   - Color changes: Green → Orange (at 5:00) → Red (at 1:00)

3. **When Timer Hits 0:00**:
   - ✅ Message appears: "Your OTP has expired. Please request a new one."
   - ✅ "Resend Code" button becomes enabled (was disabled during countdown)

4. **Click "Resend Code"**:
   - ✅ Shows "Resending verification code..."
   - ✅ New OTP sent to email
   - ✅ Success message: "✅ New code sent! Please check your email."
   - ✅ Timer resets to 10:00
   - ✅ OTP inputs cleared

5. **Check Email** → Get new 6-digit code

6. **Enter New Code** → Verify successfully

**Expected Result**: ✅ PASS - Resend works, timer resets

---

### **Scenario 4: Failed OTP Attempts**

1. **On OTP Verification Page**

2. **Enter WRONG OTP** (6 random digits)

3. **Click "Verify"** → Should see:
   - ❌ "Incorrect code. 4 attempt(s) remaining."
   - ⚠️ Orange warning box shows attempts remaining
   - OTP inputs cleared

4. **Enter Wrong OTP 3 More Times**:
   - Attempt 2: "3 attempt(s) remaining"
   - Attempt 3: "2 attempt(s) remaining"
   - Attempt 4: "1 attempt remaining"

5. **5th Wrong Attempt**:
   - ❌ "Too many failed attempts. Account locked for 15 minutes."
   - 🔒 Red lock message appears
   - ✅ "Verify" button disabled
   - ✅ "Resend" button disabled

6. **Wait 15 Minutes** (or reset in database):
   - Lock expires
   - Can try again

**Expected Result**: ✅ PASS - Security lock prevents brute force

---

### **Scenario 5: Direct Navigation to OTP Page**

1. **Open Browser** → Direct URL: http://localhost:5173/#verify-otp

2. **Should See**:
   - ⚠️ Orange warning box: "Session Not Found"
   - 📝 Manual email input form appears
   - Options:
     - Enter email manually
     - Register new account
     - Go to login (if already verified)

3. **Enter Email** → Click "Continue"

4. **Page Reloads**:
   - ✅ Email now loaded
   - ✅ Shows normal OTP verification UI

**Expected Result**: ✅ PASS - Graceful fallback for missing email

---

### **Scenario 6: Already Verified User**

1. **User Already Verified** (completed OTP before)

2. **Try to Verify Again** (navigate to OTP page or try old code)

3. **Enter Any OTP Code** → Click "Verify"

4. **Should See**:
   - ✅ "Your email is already verified! Redirecting to login..."
   - ✅ Auto-redirect to login page
   - ✅ Login shows success message

**Expected Result**: ✅ PASS - Handles already-verified gracefully

---

### **Scenario 7: Keyboard Navigation**

1. **On OTP Page**

2. **Test Keyboard Controls**:
   - **Type digits**: Auto-focus next box ✅
   - **Backspace**: Clear current, move to previous ✅
   - **Arrow Left**: Move to previous box ✅
   - **Arrow Right**: Move to next box ✅
   - **Ctrl+V / Cmd+V**: Paste 6-digit code ✅

**Expected Result**: ✅ PASS - Seamless keyboard UX

---

### **Scenario 8: Browser Storage Clearing**

1. **Register User** → On OTP page

2. **Open DevTools** (F12) → Application tab

3. **Clear localStorage and sessionStorage**

4. **Refresh Page**

5. **Should See**:
   - ✅ Email still loaded (from URL parameter)
   - ✅ Page works normally

6. **If URL Also Cleared**:
   - ✅ Manual email input form appears
   - Can enter email to continue

**Expected Result**: ✅ PASS - Multi-layer redundancy works

---

## 🔧 DEBUGGING CHECKLIST

### If Something Doesn't Work:

#### Backend Issues:
```powershell
# Check if backend is running
Get-Process -Name node

# Restart backend
cd D:\consultancy\backend
npm start

# Check backend logs for errors
# Look for MongoDB connection, email transport errors
```

#### Frontend Issues:
```powershell
# Check if frontend is running
Invoke-WebRequest -Uri "http://localhost:5173"

# Restart frontend
cd D:\consultancy\frontend
npm run dev

# Check browser console (F12) for JavaScript errors
```

#### Database Issues:
```powershell
# Check MongoDB status
# Ensure MongoDB is running on localhost:27017
```

#### Email Issues:
```
# Check .env file in backend folder
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Verify Gmail App Password is correct
# Check spam folder for OTP emails
```

---

## 📊 SUCCESS CRITERIA

### All Tests Should Show:
- ✅ Registration completes successfully
- ✅ OTP email sent within 2 seconds
- ✅ OTP verification works with correct code
- ✅ Failed attempts tracked correctly
- ✅ Account locks after 5 failures
- ✅ Resend button works after expiry
- ✅ Unverified users redirected to OTP page
- ✅ Already verified users handled gracefully
- ✅ Email persists across page refreshes
- ✅ Manual email entry works as fallback

---

## 🐛 COMMON ISSUES & SOLUTIONS

### Issue: "Email not sent"
**Solution**: Check backend .env file, verify Gmail App Password

### Issue: "OTP page shows login instead"
**Solution**: Already fixed! Hash routing now strips query parameters correctly

### Issue: "Email not found on OTP page"
**Solution**: Already fixed! Multi-layer storage ensures email is always available

### Issue: "Can't login after verification"
**Solution**: Use same email/password from registration

### Issue: "Account locked forever"
**Solution**: Lock expires after 15 minutes, or manually reset in database

---

## 📞 SUPPORT

For issues not covered here:
1. Check browser console (F12) for JavaScript errors
2. Check backend terminal for server errors
3. Check MongoDB connection
4. Verify all environment variables are set

---

**Last Updated**: November 30, 2025  
**System Version**: v1.0 - Production Ready  
**Status**: ✅ All Systems Operational
