# 🚨 Out-of-Stock Admin Notification System

## 📋 Overview

This system automatically retrieves admin contact information (phone number) when a product is out of stock and formats professional notification messages for immediate dispatch.

---

## 🏗️ System Architecture

### Components Created:

1. **User Model Enhancement** (`backend/models/user.js`)
   - Added `phoneNumber` field to store admin contact
   - Added `isAdmin` flag to identify admin users

2. **Admin Notification Utility** (`backend/utils/adminNotification.js`)
   - Core functions for checking stock and retrieving admin contacts
   - Message formatting and notification generation

3. **Notification Routes** (`backend/routes/notifications.js`)
   - RESTful API endpoints for stock checks and admin contact retrieval

4. **Setup Script** (`backend/scripts/setupAdminPhone.js`)
   - Interactive script to configure admin phone number

---

## 🔧 Setup Instructions

### Step 1: Set Up Admin Phone Number

Run the interactive setup script:

```bash
cd backend
node scripts/setupAdminPhone.js
```

**Example:**
```
Enter admin email: admin@electrostore.com
Enter admin phone number: +91-9876543210
```

### Step 2: Start the Server

```bash
cd backend
npm run dev
```

Server will start on `http://localhost:5000`

---

## 📡 API Endpoints

### 1. Get Primary Admin Contact

**Endpoint:** `GET /api/notifications/primary-admin`  
**Access:** Admin only (requires admin token)

**Request:**
```bash
curl -X GET http://localhost:5000/api/notifications/primary-admin \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

**Response (Success):**
```json
{
  "success": true,
  "admin": {
    "name": "Admin User",
    "email": "admin@electrostore.com",
    "phoneNumber": "+91-9876543210"
  }
}
```

---

### 2. Check Single Product Out-of-Stock

**Endpoint:** `GET /api/notifications/out-of-stock/:productId`  
**Access:** Admin only

**Request:**
```bash
curl -X GET http://localhost:5000/api/notifications/out-of-stock/PRODUCT_ID_HERE \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

**Response (Product Out of Stock):**
```json
{
  "success": true,
  "outOfStock": true,
  "adminPhoneNumber": "+91-9876543210",
  "notification": {
    "adminPhoneNumber": "+91-9876543210",
    "adminName": "Admin User",
    "adminEmail": "admin@electrostore.com",
    "productName": "PlayStation 5",
    "productId": "674fd1234567890abcdef123",
    "currentStock": 0,
    "category": "Gaming",
    "price": 49999,
    "message": "🚨 URGENT: PRODUCT OUT OF STOCK 🚨\n\nProduct Details:\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n• Product Name: PlayStation 5\n• Product ID: 674fd1234567890abcdef123\n• Category: Gaming\n• Brand: Sony\n• Current Stock: 0\n• Price: ₹49999\n\nAction Required:\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nThis product is currently OUT OF STOCK and requires immediate attention.\nPlease restock as soon as possible to avoid lost sales.\n\nAdmin Contact:\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n• Name: Admin User\n• Email: admin@electrostore.com\n• Phone: +91-9876543210\n\nTimestamp: 12/5/2025, 10:30:45 AM\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
    "timestamp": "2025-12-05T05:00:45.123Z",
    "formattedMessage": "Attention: The product \"PlayStation 5\" is currently out of stock. Immediate action is required. Contact Admin: Admin User at +91-9876543210"
  },
  "message": "Attention: The product \"PlayStation 5\" is currently out of stock. Immediate action is required. Contact Admin: Admin User at +91-9876543210"
}
```

**Response (Product In Stock):**
```json
{
  "success": true,
  "inStock": true,
  "productName": "iPhone 15 Pro",
  "currentStock": 25,
  "message": "Product \"iPhone 15 Pro\" is in stock with 25 units available."
}
```

---

### 3. Get All Out-of-Stock Products

**Endpoint:** `GET /api/notifications/out-of-stock-all`  
**Access:** Admin only

**Request:**
```bash
curl -X GET http://localhost:5000/api/notifications/out-of-stock-all \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "outOfStockCount": 3,
  "adminPhoneNumber": "+91-9876543210",
  "adminName": "Admin User",
  "adminEmail": "admin@electrostore.com",
  "notifications": [
    {
      "adminPhoneNumber": "+91-9876543210",
      "adminName": "Admin User",
      "adminEmail": "admin@electrostore.com",
      "productName": "PlayStation 5",
      "productId": "674fd1234567890abcdef123",
      "currentStock": 0,
      "category": "Gaming",
      "price": 49999,
      "message": "...",
      "timestamp": "2025-12-05T05:00:45.123Z",
      "formattedMessage": "Attention: The product \"PlayStation 5\" is currently out of stock..."
    }
    // ... more products
  ],
  "summary": "3 product(s) are out of stock. Admin contact: Admin User at +91-9876543210"
}
```

---

### 4. Get All Admin Contacts

**Endpoint:** `GET /api/notifications/admin-contacts`  
**Access:** Admin only

**Request:**
```bash
curl -X GET http://localhost:5000/api/notifications/admin-contacts \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "count": 2,
  "admins": [
    {
      "name": "Admin User",
      "email": "admin@electrostore.com",
      "phoneNumber": "+91-9876543210"
    },
    {
      "name": "Secondary Admin",
      "email": "admin2@electrostore.com",
      "phoneNumber": "+91-9876543211"
    }
  ]
}
```

---

## 🧪 Testing Examples

### Example 1: Check PlayStation 5 Stock

Assuming PlayStation 5 has `productId: 674fd1234567890abcdef123` and is out of stock:

```bash
# Get admin token first (login as admin)
TOKEN="your_admin_token_here"

# Check product stock
curl -X GET http://localhost:5000/api/notifications/out-of-stock/674fd1234567890abcdef123 \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Output:**
```
Admin Phone Number: +91-9876543210
Message: "Attention: The product PlayStation 5 is currently out of stock. Immediate action is required. Contact Admin: Admin User at +91-9876543210"
```

---

### Example 2: Get All Out-of-Stock Products

```bash
curl -X GET http://localhost:5000/api/notifications/out-of-stock-all \
  -H "Authorization: Bearer $TOKEN"
```

**Console Output Format:**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚨 OUT OF STOCK ALERT SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total Out of Stock: 3 products
Admin Contact: Admin User
Phone: +91-9876543210
Email: admin@electrostore.com

Products Requiring Attention:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. PlayStation 5 (Gaming) - ₹49,999
2. MacBook Pro M3 (Laptops) - ₹1,99,999
3. AirPods Pro 2 (Audio) - ₹24,999
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 📝 Output Format Specification

### Formatted Message Structure

```
Admin Phone Number: [Phone Number]
Message: "Attention: The product [Product Name] is currently out of stock. Immediate action is required. Contact Admin: [Admin Name] at [Phone Number]"
```

### Detailed Notification Object

```javascript
{
  adminPhoneNumber: "+91-9876543210",
  adminName: "Admin User",
  adminEmail: "admin@electrostore.com",
  productName: "Product Name",
  productId: "product_id_here",
  currentStock: 0,
  category: "Category Name",
  price: 12345,
  message: "Full formatted message with all details",
  timestamp: "ISO 8601 timestamp",
  formattedMessage: "Concise message for SMS/immediate dispatch"
}
```

---

## 🔐 Security & Compliance

### Data Protection:
✅ Admin-only endpoints (requires authentication)  
✅ Phone numbers stored securely in database  
✅ No exposure of sensitive data to non-admin users  
✅ Audit trail via MongoDB timestamps  

### Privacy Compliance:
✅ Phone numbers only accessible to authorized admins  
✅ Data retrieval follows authentication protocols  
✅ Optional field - admins choose to provide phone number  

---

## 🎯 Use Cases

### 1. Real-time Stock Monitoring
Admin dashboard can poll the API to check critical products:
```javascript
// Check high-demand product
const response = await fetch(`/api/notifications/out-of-stock/${productId}`, {
  headers: { 'Authorization': `Bearer ${adminToken}` }
});
```

### 2. Automated Alert System
Integrate with order processing to trigger notifications:
```javascript
// After order reduces stock to 0
if (product.stock === 0) {
  const alert = await checkProductStockAndNotify(product._id);
  sendSMS(alert.adminPhoneNumber, alert.notification.formattedMessage);
}
```

### 3. Daily Stock Report
Schedule daily check for all out-of-stock products:
```bash
# Cron job: Every day at 9 AM
0 9 * * * curl http://localhost:5000/api/notifications/out-of-stock-all \
  -H "Authorization: Bearer $ADMIN_TOKEN" | mail -s "Daily Stock Report" admin@company.com
```

---

## 🛠️ Integration Examples

### Frontend Integration (React)

```javascript
// AdminDashboard.jsx
async function checkOutOfStockProducts() {
  const token = localStorage.getItem('adminToken');
  const response = await fetch(`${API}/api/notifications/out-of-stock-all`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  const data = await response.json();
  
  if (data.success && data.outOfStockCount > 0) {
    showAlert(`${data.outOfStockCount} products are out of stock!`);
    showAdminContact(data.adminPhoneNumber);
  }
}
```

### SMS Integration (Twilio Example)

```javascript
const twilio = require('twilio');
const client = twilio(ACCOUNT_SID, AUTH_TOKEN);

async function sendOutOfStockSMS(productId) {
  const notification = await checkProductStockAndNotify(productId);
  
  if (notification.outOfStock) {
    await client.messages.create({
      body: notification.notification.formattedMessage,
      from: '+1234567890',
      to: notification.adminPhoneNumber
    });
  }
}
```

---

## 📊 Example Scenarios

### Scenario 1: Product Goes Out of Stock

**Trigger:** Customer places order, reduces stock to 0

**System Response:**
1. ✅ Detects stock = 0
2. ✅ Retrieves admin contact from database
3. ✅ Formats professional notification message
4. ✅ Returns formatted output for dispatch

**Output:**
```
Admin Phone Number: +91-9876543210
Message: "Attention: The product iPhone 15 Pro is currently out of stock. Immediate action is required. Contact Admin: Store Manager at +91-9876543210"
```

---

### Scenario 2: Admin Dashboard Check

**Trigger:** Admin logs in and views dashboard

**System Response:**
1. ✅ Calls `/api/notifications/out-of-stock-all`
2. ✅ Retrieves all products with stock = 0
3. ✅ Fetches admin contact information
4. ✅ Displays alert badge with count

**Dashboard Display:**
```
🚨 ALERTS: 3 products out of stock
📞 Contact: +91-9876543210
```

---

## 🔧 Troubleshooting

### Issue: "No admin contact found"

**Solution:** Run the setup script to add phone number:
```bash
node scripts/setupAdminPhone.js
```

### Issue: "Product not found"

**Solution:** Verify product ID is correct:
```bash
curl http://localhost:5000/api/products/:productId
```

### Issue: Authentication error

**Solution:** Ensure you're logged in as admin and using correct token:
```bash
# Login as admin first
curl -X POST http://localhost:5000/api/auth/admin-login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"password","adminKey":"admin123secret"}'
```

---

## 📈 Future Enhancements

### Planned Features:
- 📧 Email notifications alongside SMS
- 🔔 Push notifications to admin mobile app
- 📊 Analytics dashboard for stock alerts
- 🤖 ML-based predictive restocking alerts
- 📱 Multi-channel notification (SMS, Email, Slack, etc.)

---

## 🎓 API Response Examples

### Example 1: Successful Out-of-Stock Check
```json
{
  "success": true,
  "outOfStock": true,
  "adminPhoneNumber": "+91-9876543210",
  "notification": {
    "adminPhoneNumber": "+91-9876543210",
    "adminName": "Admin User",
    "adminEmail": "admin@electrostore.com",
    "productName": "PlayStation 5",
    "productId": "674fd1234567890abcdef123",
    "currentStock": 0,
    "category": "Gaming",
    "price": 49999,
    "formattedMessage": "Attention: The product \"PlayStation 5\" is currently out of stock. Immediate action is required. Contact Admin: Admin User at +91-9876543210"
  }
}
```

### Example 2: Product In Stock (No Alert)
```json
{
  "success": true,
  "inStock": true,
  "productName": "iPhone 15 Pro",
  "currentStock": 25,
  "message": "Product \"iPhone 15 Pro\" is in stock with 25 units available."
}
```

### Example 3: No Admin Contact Available
```json
{
  "success": false,
  "error": true,
  "outOfStock": true,
  "productName": "PlayStation 5",
  "message": "Product is out of stock but no admin contact information available.",
  "details": {
    "productId": "674fd1234567890abcdef123",
    "productName": "PlayStation 5",
    "category": "Gaming",
    "currentStock": 0
  }
}
```

---

## ✅ Implementation Checklist

- [x] Enhanced User model with phone number field
- [x] Created admin notification utility functions
- [x] Implemented REST API endpoints
- [x] Added authentication and authorization
- [x] Created admin setup script
- [x] Formatted professional notification messages
- [x] Implemented error handling and validation
- [x] Added comprehensive documentation
- [x] Provided testing examples
- [x] Ensured privacy and security compliance

---

## 📞 Contact

For questions or support regarding this system:
- **Documentation:** This file
- **API Testing:** Use Postman or curl with provided examples
- **Setup Help:** Run `node scripts/setupAdminPhone.js`

---

**Last Updated:** December 5, 2025  
**Version:** 1.0.0  
**Status:** ✅ Production Ready
