# 🧪 Admin Settings Feature - Testing Guide

## Overview
The Admin Settings feature allows administrators to securely update their credentials (email, username, password) through a dedicated interface.

---

## ✅ Features Implemented

### Backend API (`/api/admin/update-credentials`)
- ✅ **Current Password Verification**: Requires current password for all changes
- ✅ **Email Validation**: Regex pattern validation + uniqueness check
- ✅ **Username Validation**: 3+ chars, alphanumeric + underscore only
- ✅ **Password Strength**: 6+ chars, uppercase, lowercase, number required
- ✅ **Special Character Check**: Warns if password lacks special characters
- ✅ **Duplicate Prevention**: Checks for existing email/username in database
- ✅ **Password Confirmation**: Ensures new password matches confirmation
- ✅ **Bcrypt Hashing**: Secure password storage with salt rounds 10
- ✅ **Admin Authorization**: Requires `verifyAdmin` middleware
- ✅ **Comprehensive Error Messages**: Specific feedback for each validation failure

### Frontend UI (`AdminSettings.jsx`)
- ✅ **Profile Display**: Shows current username, name, email, verification status
- ✅ **Update Form**: Fields for current password, new email/username/password
- ✅ **Password Strength Meter**: Visual indicator (Very Weak to Strong)
- ✅ **Password Visibility Toggles**: Eye icons for all password fields
- ✅ **Real-time Validation**: Client-side checks matching backend rules
- ✅ **Success/Error Messages**: Toast notifications with auto-hide
- ✅ **Auto-logout on Password Change**: Forces re-login for security
- ✅ **Security Notice**: Educational warning about credential management
- ✅ **Responsive Design**: Clean, professional UI with proper styling

### Integration
- ✅ **Settings Button**: Added to AdminDashboard header (⚙️ Settings)
- ✅ **Route Registration**: `/api/admin/update-credentials` in backend
- ✅ **Frontend Route**: `#admin-settings` in App.jsx
- ✅ **Navigation**: Back to Dashboard button in AdminSettings

---

## 🧪 Test Scenarios

### Test 1: Access Control
**Purpose**: Verify only admins can access settings

**Steps**:
1. Try accessing `http://localhost:5173/#admin-settings` without being logged in
2. Try accessing with regular user token (not admin)

**Expected Results**:
- Should redirect to `#secret-admin-login` if not logged in
- Should return 403 Forbidden if token doesn't have `isAdmin: true`

---

### Test 2: Update Email
**Purpose**: Test email update with validation

**Test 2a - Valid Email**:
```
Current Password: [your current password]
New Email: newemail@example.com
New Username: [leave empty]
New Password: [leave empty]
```
**Expected**: ✅ Success - Email updated, no logout required

**Test 2b - Invalid Email Format**:
```
Current Password: [your current password]
New Email: invalidemail
```
**Expected**: ❌ Error - "Please enter a valid email address"

**Test 2c - Duplicate Email**:
```
Current Password: [your current password]
New Email: [existing user's email]
```
**Expected**: ❌ Error - "Email already in use by another user"

---

### Test 3: Update Username
**Purpose**: Test username validation

**Test 3a - Valid Username**:
```
Current Password: [your current password]
New Username: admin_user123
```
**Expected**: ✅ Success - Username updated

**Test 3b - Too Short**:
```
Current Password: [your current password]
New Username: ab
```
**Expected**: ❌ Error - "Username must be at least 3 characters long"

**Test 3c - Special Characters**:
```
Current Password: [your current password]
New Username: admin@user!
```
**Expected**: ❌ Error - "Username can only contain letters, numbers, and underscores"

**Test 3d - Duplicate Username**:
```
Current Password: [your current password]
New Username: [existing username]
```
**Expected**: ❌ Error - "Username already taken"

---

### Test 4: Update Password
**Purpose**: Test password strength validation

**Test 4a - Strong Password**:
```
Current Password: [your current password]
New Password: StrongPass123!
Confirm New Password: StrongPass123!
```
**Expected**: ✅ Success - Password updated, auto-logout after 4 seconds

**Test 4b - Weak Password (no uppercase)**:
```
Current Password: [your current password]
New Password: weakpass123
Confirm New Password: weakpass123
```
**Expected**: ❌ Error - "Password must contain at least one uppercase letter"

**Test 4c - Weak Password (no number)**:
```
Current Password: [your current password]
New Password: WeakPassword
Confirm New Password: WeakPassword
```
**Expected**: ❌ Error - "Password must contain at least one number"

**Test 4d - Too Short**:
```
Current Password: [your current password]
New Password: Pass1
Confirm New Password: Pass1
```
**Expected**: ❌ Error - "Password must be at least 6 characters long"

**Test 4e - Mismatch**:
```
Current Password: [your current password]
New Password: StrongPass123
Confirm New Password: StrongPass456
```
**Expected**: ❌ Error - "New password and confirm password do not match"

---

### Test 5: Wrong Current Password
**Purpose**: Verify security validation

**Steps**:
```
Current Password: wrongpassword123
New Email: test@example.com
```
**Expected**: ❌ Error - "Current password is incorrect"

---

### Test 6: Update Multiple Fields
**Purpose**: Test updating all fields at once

**Steps**:
```
Current Password: [your current password]
New Email: admin2@example.com
New Username: admin_user_v2
New Password: NewStrongPass123!
Confirm New Password: NewStrongPass123!
```
**Expected**: ✅ Success - All fields updated, auto-logout

---

### Test 7: Password Strength Meter
**Purpose**: Visual indicator functionality

**Steps**:
1. Type passwords gradually in "New Password" field:
   - `pass` → Very Weak (red)
   - `Pass1` → Weak (orange)
   - `Pass123` → Fair (yellow)
   - `Pass123A` → Good (light green)
   - `Pass123A!` → Strong (green)

**Expected**: Strength bar and label update in real-time

---

### Test 8: Password Visibility Toggles
**Purpose**: Eye icons functionality

**Steps**:
1. Fill current password field
2. Click eye icon → password should become visible
3. Click again → password should be hidden
4. Repeat for New Password and Confirm Password fields

**Expected**: All three toggle buttons work independently

---

### Test 9: Auto-Logout After Password Change
**Purpose**: Security measure validation

**Steps**:
1. Successfully change password
2. Wait 4 seconds after success message

**Expected**:
- Success message: "✅ Credentials updated successfully"
- Info message: "ℹ️ Password changed! Please login again..."
- Automatic redirect to `#secret-admin-login`
- All tokens cleared from localStorage

---

### Test 10: Navigation
**Purpose**: Button functionality

**Steps**:
1. From AdminDashboard, click "⚙️ Settings" button
2. From AdminSettings, click "← Back to Dashboard" button

**Expected**:
- Settings button navigates to `#admin-settings`
- Back button navigates to `#admin-dashboard`

---

## 🔍 Manual Backend Testing (Optional)

### Using curl or Postman:

**Get Admin Profile**:
```bash
curl -X GET http://localhost:5000/api/admin/profile \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

**Update Credentials**:
```bash
curl -X PUT http://localhost:5000/api/admin/update-credentials \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "your_current_password",
    "newEmail": "newemail@example.com",
    "newUsername": "newusername",
    "newPassword": "NewPass123",
    "confirmPassword": "NewPass123"
  }'
```

---

## 📋 Test Checklist

Use this checklist to track your testing progress:

### Access Control
- [ ] Non-authenticated user redirected to login
- [ ] Non-admin user receives 403 Forbidden

### Email Validation
- [ ] Valid email updates successfully
- [ ] Invalid format rejected
- [ ] Duplicate email rejected

### Username Validation
- [ ] Valid username updates successfully
- [ ] Too short (< 3 chars) rejected
- [ ] Special characters rejected
- [ ] Duplicate username rejected

### Password Validation
- [ ] Strong password accepted
- [ ] Missing uppercase rejected
- [ ] Missing lowercase rejected
- [ ] Missing number rejected
- [ ] Too short (< 6 chars) rejected
- [ ] Password mismatch rejected
- [ ] Special char warning logged (optional)

### Security
- [ ] Wrong current password rejected
- [ ] Current password always required
- [ ] Passwords hashed with bcrypt
- [ ] Auto-logout after password change

### UI Features
- [ ] Password strength meter updates
- [ ] All password toggles work
- [ ] Success/error messages display
- [ ] Form clears after success
- [ ] Navigation buttons work

### Integration
- [ ] Settings button visible in AdminDashboard
- [ ] Settings route registered in App.jsx
- [ ] Backend route accessible
- [ ] localStorage updated on email change

---

## 🐛 Known Behaviors

1. **Auto-Logout on Password Change**: By design, changing password forces logout after 4 seconds for security
2. **Optional Fields**: Email, username, and password are all optional - at least one must be provided
3. **Current Password Always Required**: Security measure to prevent unauthorized changes
4. **Special Character Warning**: If password lacks special chars, warning is logged but update proceeds

---

## 🔧 Troubleshooting

**Issue**: Settings button not visible
- **Fix**: Clear browser cache, restart frontend dev server

**Issue**: 401 Unauthorized error
- **Fix**: Check adminToken in localStorage, ensure not expired (8 hours)

**Issue**: 403 Forbidden error
- **Fix**: Verify user has `isAdmin: true` flag in database

**Issue**: Validation errors not matching backend
- **Fix**: Check backend console logs for detailed error messages

**Issue**: Password strength meter not updating
- **Fix**: Type in "New Password" field, not "Current Password" field

---

## ✅ Success Criteria

All tests pass when:
1. ✅ Only admins can access settings page
2. ✅ Current password verification works
3. ✅ All validation rules enforced (email, username, password)
4. ✅ Duplicate prevention working
5. ✅ Password strength meter displays correctly
6. ✅ Success/error messages show appropriately
7. ✅ Auto-logout on password change
8. ✅ Navigation works (dashboard ↔ settings)
9. ✅ No console errors in browser or backend
10. ✅ Database updates correctly

---

## 📚 Additional Resources

- **Backend Route**: `backend/routes/adminManagement.js` (263 lines)
- **Frontend Component**: `frontend/src/components/AdminSettings.jsx` (622 lines)
- **Middleware**: `backend/middleware/auth.js` - `verifyAdmin` function
- **User Model**: `backend/models/user.js` - Schema definition

---

## 🎯 Next Steps After Testing

1. Test all scenarios from this guide
2. Report any bugs or issues found
3. Consider adding:
   - Activity log (track credential changes)
   - Two-factor authentication
   - Password history (prevent reuse)
   - Account recovery questions
   - Email verification on email change

---

**Happy Testing! 🚀**
