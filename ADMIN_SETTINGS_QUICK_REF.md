# 🎯 Admin Settings - Quick Reference

## Access the Feature
```
URL: http://localhost:5173/#admin-settings
Button: Click "⚙️ Settings" in Admin Dashboard header
```

## Form Fields

| Field | Required | Validation Rules |
|-------|----------|------------------|
| Current Password | ✅ Always | Must match your current password |
| New Email | ❌ Optional | Valid email format, not already taken |
| New Username | ❌ Optional | 3+ chars, letters/numbers/underscore only |
| New Password | ❌ Optional | 6+ chars, uppercase, lowercase, number |
| Confirm Password | ⚠️ If password | Must match new password exactly |

## Password Strength Levels
```
🔴 Very Weak: < 8 chars
🟠 Weak:      8+ chars + lowercase
🟡 Fair:      + uppercase
🟢 Good:      + number
🟢 Strong:    + special character
```

## Common Errors

| Error Message | Solution |
|---------------|----------|
| "Current password is incorrect" | Check your password, try again |
| "Email already in use" | Use a different email address |
| "Username already taken" | Choose a different username |
| "Password must contain..." | Follow password strength requirements |
| "Passwords do not match" | Ensure new password and confirm match |
| "Please fill at least one field" | Update email, username, OR password |

## Important Notes
⚠️ **Changing Password**: You'll be logged out automatically after 4 seconds
⚠️ **Current Password**: Always required for security, even if changing email only
⚠️ **Optional Fields**: You can update only the fields you want to change
✅ **Auto-Save**: No need to click save, submit button does everything

## API Endpoints
```bash
GET  /api/admin/profile              # View current profile
PUT  /api/admin/update-credentials   # Update credentials
```

## Quick Test
1. Login as admin
2. Click "⚙️ Settings"
3. Enter current password: `[your password]`
4. Enter new email: `test123@example.com`
5. Click "💾 Update Credentials"
6. ✅ Should see success message

## Need Help?
- Check `ADMIN_SETTINGS_TESTING_GUIDE.md` for detailed test scenarios
- Check `ADMIN_SETTINGS_SUMMARY.md` for implementation details
- Check browser console for client-side errors
- Check backend terminal for server-side errors
