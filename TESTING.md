# 🧪 Testing Guide for MERN Authentication System

This document provides detailed test scenarios and expected results for the authentication system.

## Prerequisites

- Backend server running on http://localhost:5000
- Frontend running on http://localhost:5173
- MongoDB connected and running
- Gmail SMTP configured correctly

## Test Scenarios

### 1. User Registration - Success Case

**Steps:**
1. Navigate to http://localhost:5173
2. In the Register section, enter:
   - Name: `Test User`
   - Email: `your-test-email@gmail.com`
   - Password: `Test@123`
3. Click "Register" button

**Expected Results:**
- ✅ Password strength indicator shows "Strong"
- ✅ Success message: "Registered successfully! OTP sent to your email..."
- ✅ Form fields are cleared
- ✅ Email received with 6-digit OTP within seconds
- ✅ Backend console logs: "Registered user [email] - OTP sent"
- ✅ User created in MongoDB with `isVerified: false`

**Validation Checks:**
- Password meets all requirements:
  - ✓ At least 8 characters
  - ✓ One uppercase letter
  - ✓ One lowercase letter
  - ✓ One number
  - ✓ One special character

---

### 2. User Registration - Validation Errors

**Test 2a: Invalid Email Format**

**Steps:**
1. Enter name: `Test User`
2. Enter email: `invalid-email` (no @ or domain)
3. Enter password: `Test@123`
4. Click "Register"

**Expected Results:**
- ❌ Red border on email field
- ❌ Error message: "Invalid email format"
- ❌ No API call made

**Test 2b: Weak Password**

**Steps:**
1. Enter name: `Test User`
2. Enter email: `test@example.com`
3. Enter password: `weak`
4. Click "Register"

**Expected Results:**
- ❌ Password strength shows "Weak"
- ❌ Red border on password field
- ❌ List of missing requirements displayed
- ❌ Error message: "Password does not meet requirements"

**Test 2c: Duplicate Email**

**Steps:**
1. Try to register with an email that's already registered
2. Click "Register"

**Expected Results:**
- ❌ Error message: "Email already registered"
- ❌ HTTP 400 status code

---

### 3. Email Verification - Success Case

**Steps:**
1. Check email inbox for OTP (6-digit code)
2. In Verify OTP section, enter:
   - Email: `your-test-email@gmail.com`
   - OTP: `123456` (from email)
3. Click "Verify"

**Expected Results:**
- ✅ Success message: "Email verified successfully! You can now login."
- ✅ Form fields cleared
- ✅ Backend console logs: "User [email] verified"
- ✅ Database updated: `isVerified: true`, OTP fields cleared
- ✅ Can now login with credentials

---

### 4. Email Verification - Error Cases

**Test 4a: Invalid OTP Format**

**Steps:**
1. Enter email: `test@example.com`
2. Enter OTP: `abc` (not 6 digits)
3. Click "Verify"

**Expected Results:**
- ❌ Error message: "OTP must be 6 digits"
- ❌ No API call made

**Test 4b: Wrong OTP**

**Steps:**
1. Enter email: `test@example.com`
2. Enter OTP: `999999` (wrong code)
3. Click "Verify"

**Expected Results:**
- ❌ Error message: "Invalid OTP"
- ❌ HTTP 400 status code
- ❌ User remains unverified in database

**Test 4c: Expired OTP**

**Steps:**
1. Register and wait 11+ minutes
2. Try to verify with the OTP
3. Click "Verify"

**Expected Results:**
- ❌ Error message: "OTP expired or not set. Please request a new OTP."
- ❌ HTTP 400 status code

---

### 5. Resend OTP Functionality

**Steps:**
1. In Verify OTP section, enter registered email
2. Click "Resend OTP" button

**Expected Results:**
- ✅ Success message: "OTP resent to your email..."
- ✅ New email received with different 6-digit OTP
- ✅ New OTP replaces old one in database
- ✅ New OTP has fresh 10-minute expiration
- ✅ Old OTP no longer works

**Edge Case: Resend without email**

**Steps:**
1. Leave email field empty
2. Click "Resend OTP"

**Expected Results:**
- ❌ Button is disabled
- ❌ Cannot click

---

### 6. User Login - Success Case

**Steps:**
1. Ensure email is verified (complete test #3 first)
2. In Login section, enter:
   - Email: `your-test-email@gmail.com`
   - Password: `Test@123`
3. Click "Login"

**Expected Results:**
- ✅ Success message: "Welcome back, Test User!"
- ✅ JWT token saved in localStorage
- ✅ User data saved in localStorage
- ✅ Dashboard section shows user information
- ✅ Form fields cleared
- ✅ Backend console logs: "User [email] logged in"

**Verify localStorage:**
```javascript
// In browser console
localStorage.getItem('token')    // Should show JWT token
localStorage.getItem('user')     // Should show user JSON
```

---

### 7. User Login - Error Cases

**Test 7a: Wrong Password**

**Steps:**
1. Enter email: `test@example.com`
2. Enter password: `WrongPassword123!`
3. Click "Login"

**Expected Results:**
- ❌ Error message: "Invalid credentials"
- ❌ HTTP 400 status code
- ❌ No token in localStorage

**Test 7b: Unverified Email**

**Steps:**
1. Register a new account but don't verify
2. Try to login with those credentials
3. Click "Login"

**Expected Results:**
- ❌ Error message: "Please verify your email first..."
- ❌ HTTP 403 status code
- ❌ No token in localStorage

**Test 7c: Non-existent User**

**Steps:**
1. Enter email that was never registered
2. Enter any password
3. Click "Login"

**Expected Results:**
- ❌ Error message: "Invalid credentials"
- ❌ HTTP 400 status code

---

### 8. Dashboard - View Profile

**Steps:**
1. Login successfully (complete test #6)
2. Scroll to Dashboard section

**Expected Results:**
- ✅ Dashboard displays:
  - Name
  - Email
  - Verification status (✅ Verified)
  - Member since date
- ✅ Profile data fetched from protected route
- ✅ "Logout" button visible

**Without Login:**

**Steps:**
1. Clear localStorage
2. Reload page
3. Check Dashboard section

**Expected Results:**
- ❌ Error message: "No token found. Please login first."
- ❌ No profile data displayed

---

### 9. Protected Route - API Test

**Test with Postman/cURL:**

**Test 9a: Without Token**

```bash
GET http://localhost:5000/api/auth/profile
```

**Expected Results:**
- ❌ HTTP 401 Unauthorized
- ❌ Response: `{"msg": "No token, authorization denied"}`

**Test 9b: With Valid Token**

```bash
GET http://localhost:5000/api/auth/profile
Headers:
  Authorization: Bearer <your_jwt_token>
```

**Expected Results:**
- ✅ HTTP 200 OK
- ✅ Response contains user data (no password)
```json
{
  "user": {
    "name": "Test User",
    "email": "test@example.com",
    "isVerified": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Test 9c: With Expired Token**

**Steps:**
1. Wait 7+ days or manually create expired token
2. Make request with expired token

**Expected Results:**
- ❌ HTTP 401 Unauthorized
- ❌ Response: `{"msg": "Token has expired"}`

---

### 10. Logout Functionality

**Steps:**
1. Login successfully
2. In Dashboard, click "Logout" button

**Expected Results:**
- ✅ Success message: "Logged out successfully"
- ✅ localStorage cleared (token & user removed)
- ✅ Dashboard shows error message
- ✅ Must login again to access profile

**Verify:**
```javascript
// In browser console
localStorage.getItem('token')    // Should be null
localStorage.getItem('user')     // Should be null
```

---

### 11. End-to-End Flow Test

**Complete workflow from registration to logout:**

1. ✅ Register new account
2. ✅ Receive OTP email
3. ✅ Verify email with OTP
4. ✅ Login with credentials
5. ✅ View profile in dashboard
6. ✅ Logout successfully
7. ✅ Try to access dashboard (should fail)
8. ✅ Login again (should work)

**Expected Time:** 2-3 minutes

---

## Database Verification

### Check User Document

**MongoDB Shell:**
```javascript
use consultancy_db
db.users.findOne({ email: "test@example.com" })
```

**Before Verification:**
```json
{
  "_id": ObjectId("..."),
  "name": "Test User",
  "email": "test@example.com",
  "password": "$2a$10$...",  // Hashed
  "isVerified": false,
  "otp": "$2a$10$...",       // Hashed OTP
  "otpExpiresAt": ISODate("..."),
  "createdAt": ISODate("..."),
  "updatedAt": ISODate("...")
}
```

**After Verification:**
```json
{
  "_id": ObjectId("..."),
  "name": "Test User",
  "email": "test@example.com",
  "password": "$2a$10$...",
  "isVerified": true,
  // otp and otpExpiresAt removed
  "createdAt": ISODate("..."),
  "updatedAt": ISODate("...")
}
```

---

## Browser Console Tests

### Test Registration API

```javascript
// Open browser console (F12)
const response = await fetch('http://localhost:5000/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Console Test',
    email: 'console@test.com',
    password: 'Test@123'
  })
});
const data = await response.json();
console.log(data);
```

### Test Login API

```javascript
const response = await fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'console@test.com',
    password: 'Test@123'
  })
});
const data = await response.json();
console.log(data);
localStorage.setItem('token', data.token);
```

### Test Protected Route

```javascript
const token = localStorage.getItem('token');
const response = await fetch('http://localhost:5000/api/auth/profile', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
const data = await response.json();
console.log(data);
```

---

## Performance Tests

### Response Time Benchmarks

| Endpoint | Expected Response Time |
|----------|------------------------|
| POST /api/auth/register | < 2 seconds (includes email sending) |
| POST /api/auth/verify-otp | < 500ms |
| POST /api/auth/login | < 500ms |
| GET /api/auth/profile | < 200ms |
| POST /api/auth/resend-otp | < 2 seconds |

---

## Security Tests

### Test 1: SQL Injection Attempt
```javascript
// Should be safely handled by MongoDB
{
  "email": "test@example.com' OR '1'='1",
  "password": "anything"
}
```
**Expected:** Invalid credentials error

### Test 2: XSS Attempt
```javascript
{
  "name": "<script>alert('xss')</script>",
  "email": "test@example.com",
  "password": "Test@123"
}
```
**Expected:** Stored safely, displayed as plain text

### Test 3: Password Hashing
- ✅ Passwords never stored in plain text
- ✅ bcrypt hash starts with `$2a$` or `$2b$`
- ✅ Different users with same password have different hashes

---

## Common Issues & Solutions

### Issue: OTP Email Not Received

**Check:**
1. Backend console for email errors
2. Gmail spam/junk folder
3. EMAIL_USER and EMAIL_PASS in .env
4. 2FA enabled on Gmail
5. App Password generated correctly

### Issue: CORS Error

**Check:**
1. CLIENT_URL matches frontend URL
2. CORS middleware properly configured
3. Browser console for specific error

### Issue: MongoDB Connection Failed

**Check:**
1. MongoDB service is running
2. Connection string is correct
3. Database permissions (for Atlas)

### Issue: JWT Token Invalid

**Check:**
1. JWT_SECRET is set in backend .env
2. Token hasn't expired (7 days)
3. Authorization header format: `Bearer <token>`

---

## Test Checklist

Use this checklist to verify all functionality:

- [ ] Register with valid data
- [ ] Register with invalid email
- [ ] Register with weak password
- [ ] Register with duplicate email
- [ ] Receive OTP email
- [ ] Verify with correct OTP
- [ ] Verify with wrong OTP
- [ ] Verify with expired OTP
- [ ] Resend OTP successfully
- [ ] Login with verified account
- [ ] Login with unverified account
- [ ] Login with wrong password
- [ ] View profile when logged in
- [ ] Profile fails without token
- [ ] Logout successfully
- [ ] Password hashing works
- [ ] JWT token generation works
- [ ] Protected route blocks unauthenticated requests
- [ ] CORS configured properly
- [ ] MongoDB saves data correctly

---

## Automated Testing (Future Enhancement)

Consider adding:
- Jest for unit tests
- Supertest for API integration tests
- React Testing Library for component tests
- Cypress for E2E tests

**Example test structure:**
```
tests/
├── unit/
│   ├── auth.middleware.test.js
│   └── user.model.test.js
├── integration/
│   └── auth.routes.test.js
└── e2e/
    └── auth.flow.test.js
```

---

## Reporting Issues

When reporting a bug, include:
1. Test scenario that failed
2. Expected vs actual result
3. Browser console errors
4. Backend console logs
5. MongoDB state (if relevant)
6. Environment (.env configuration)

---

**Last Updated:** November 30, 2025
