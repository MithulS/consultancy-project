# 🚀 Quick Start Guide - Out-of-Stock Notification System

## ⚡ Immediate Setup (5 Minutes)

### Step 1: Set Admin Phone Number
```bash
cd d:\consultancy\backend
node scripts/setupAdminPhone.js
```
**Enter:**
- Admin email (existing or new)
- Phone number (e.g., +91-9876543210)

### Step 2: Start Server
```bash
npm run dev
```

### Step 3: Test the System
```bash
node scripts/demonstrateNotifications.js
```

---

## 📞 Get Admin Phone Number - Quick Commands

### Option 1: Using the Demo Script (Recommended)
```bash
cd d:\consultancy\backend
node scripts/demonstrateNotifications.js
```

**Expected Output:**
```
Admin Phone Number: +91-9876543210
Message: "Attention: The product [Product Name] is currently out of stock. Immediate action is required. Contact Admin: [Name] at +91-9876543210"
```

### Option 2: Using API Endpoint
```bash
# 1. Login as admin and get token
curl -X POST http://localhost:5000/api/auth/admin-login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"Admin@123","adminKey":"admin123secret"}'

# 2. Use token to get admin contact
curl -X GET http://localhost:5000/api/notifications/primary-admin \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Option 3: Check Specific Product
```bash
# Replace PRODUCT_ID with actual product ID
curl -X GET http://localhost:5000/api/notifications/out-of-stock/PRODUCT_ID \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 🎯 Use Case Examples

### Example 1: Check PlayStation 5
```javascript
// In your code
const response = await fetch('http://localhost:5000/api/notifications/out-of-stock/674fd1234567890abcdef123', {
  headers: { 'Authorization': 'Bearer ' + adminToken }
});

const data = await response.json();
console.log(`Admin Phone: ${data.adminPhoneNumber}`);
console.log(`Message: ${data.message}`);
```

### Example 2: Monitor All Products
```javascript
const response = await fetch('http://localhost:5000/api/notifications/out-of-stock-all', {
  headers: { 'Authorization': 'Bearer ' + adminToken }
});

const data = await response.json();
if (data.outOfStockCount > 0) {
  alert(`${data.outOfStockCount} products need restocking!`);
  console.log(`Contact: ${data.adminPhoneNumber}`);
}
```

---

## 📋 Output Format

### Standard Format:
```
Admin Phone Number: [Phone Number]
Message: "Attention: The product [Product Name] is currently out of stock. Immediate action is required. Contact Admin: [Name] at [Phone Number]"
```

### Example Output:
```
Admin Phone Number: +91-9876543210
Message: "Attention: The product PlayStation 5 is currently out of stock. Immediate action is required. Contact Admin: Store Manager at +91-9876543210"
```

---

## 🔧 Troubleshooting

**Problem:** No admin found  
**Solution:** `node scripts/setupAdminPhone.js`

**Problem:** Product not found  
**Solution:** Check product ID is correct

**Problem:** Authentication error  
**Solution:** Login as admin first to get token

---

## 📚 Full Documentation
See `OUT_OF_STOCK_NOTIFICATION_SYSTEM.md` for complete details.

---

**Ready to use!** ✅
