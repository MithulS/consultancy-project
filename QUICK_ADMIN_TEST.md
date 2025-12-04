# Quick Admin Panel Testing Guide

## ⚡ Fast Setup (5 minutes)

### Option 1: Use Browser (Recommended)

1. **Open Frontend**: http://localhost:5173

2. **Register New Account**:
   - Click "Register" or go to `http://localhost:5173/#register`
   - Fill in:
     - Username: `admin`
     - Name: `Admin User`
     - Email: `admin@test.com`
     - Password: `Admin@123`
   - Click Register

3. **Get OTP from Backend Console**:
   - Look at your backend terminal
   - Find the box with `📧 OTP EMAIL (DEVELOPMENT MODE)`
   - Copy the 6-digit code (e.g., `597532`)

4. **Verify Email**:
   - You'll be redirected to OTP verification page
   - Enter the 6-digit code
   - Click "Verify Email"

5. **Login to Regular Account First**:
   - Go to `http://localhost:5173/#login`
   - Email: `admin@test.com`
   - Password: `Admin@123`
   - This confirms your account works

6. **Access Admin Panel**:
   - Navigate to: `http://localhost:5173/#secret-admin-login`
   - Enter:
     - **Admin Email**: `admin@test.com`
     - **Password**: `Admin@123`
     - **Admin Access Key**: `admin123secret`
   - Click "Access Admin Panel"

7. **You're In!** 🎉
   - View product management table
   - See analytics dashboard
   - Edit/Delete products

### Option 2: Test via API (For Developers)

```powershell
# Step 1: Register
$registerBody = @{
    username = 'adminuser'
    name = 'Admin Test'
    email = 'admintest@example.com'
    password = 'Admin@12345'
} | ConvertTo-Json

Invoke-RestMethod -Uri 'http://localhost:5000/api/auth/register' -Method POST -Body $registerBody -ContentType 'application/json'

# Step 2: Check backend console for OTP (e.g., 123456)

# Step 3: Verify OTP
$verifyBody = @{
    email = 'admintest@example.com'
    otp = '123456'  # Replace with actual OTP from console
} | ConvertTo-Json

Invoke-RestMethod -Uri 'http://localhost:5000/api/auth/verify-otp' -Method POST -Body $verifyBody -ContentType 'application/json'

# Step 4: Admin Login
$adminBody = @{
    email = 'admintest@example.com'
    password = 'Admin@12345'
    adminKey = 'admin123secret'
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri 'http://localhost:5000/api/auth/admin-login' -Method POST -Body $adminBody -ContentType 'application/json'
$response

# Step 5: Use admin token for authenticated requests
$token = $response.token
$headers = @{ Authorization = "Bearer $token" }

# Get products (with admin auth)
Invoke-RestMethod -Uri 'http://localhost:5000/api/products' -Headers $headers
```

## 🔍 Troubleshooting

### "Invalid credentials" Error
**Cause**: Account doesn't exist or password is wrong
**Solution**: 
1. Make sure you registered the account first
2. Verify the email with OTP
3. Check password is correct

### "Email not verified" Error
**Cause**: Account exists but OTP not verified
**Solution**: 
1. Check backend console for OTP code
2. Go to `http://localhost:5173/#verify-otp?email=your-email@test.com`
3. Enter the OTP code

### "Invalid admin access key" Error
**Cause**: Admin key doesn't match
**Solution**:
1. Default key is `admin123secret`
2. Check your `backend/.env` file for `ADMIN_KEY`
3. If you changed it, use your custom key

### Backend Not Running
```powershell
# Start backend
cd D:\consultancy\backend
npm run dev
```

### Frontend Not Running
```powershell
# Start frontend
cd D:\consultancy\frontend
npm run dev
```

## 📝 Default Credentials for Testing

**⚠️ These are example credentials - create your own:**

```
Email: admin@test.com
Password: Admin@123
Admin Key: admin123secret
```

## 🎯 What You Can Do in Admin Panel

✅ View all products in table format
✅ See product images, prices, stock
✅ Edit product details
✅ Delete products
✅ View analytics:
   - Total products: 12
   - In stock: 11
   - Out of stock: 1 (PlayStation 5)
   - Total inventory value

## 🔒 Security Notes

- Admin URL is hidden: `/#secret-admin-login`
- Regular users have no way to find this URL
- Requires 3 factors: email + password + admin key
- All attempts are logged in audit logs
- Sessions expire after 8 hours

## 🚀 Quick Demo Video Script

1. Show customer dashboard (pretty products)
2. Show there's no admin link anywhere
3. Manually type admin URL
4. Login with credentials + admin key
5. Show admin dashboard with full product management
6. Edit a product
7. Delete a product
8. Show analytics stats

---

**Need help?** Check `ADMIN_ACCESS_GUIDE.md` for full documentation.
