# Inventory Management System - Quick Test Guide

## Prerequisites
- Backend server running on http://localhost:5000
- MongoDB connected
- At least one admin user and one customer user
- Products in the database with stock

## Test Sequence

### 1. Test Stock Reservation on Order Creation

**Endpoint:** POST /api/orders

**Headers:**
```
Authorization: Bearer <customer_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "items": [
    {
      "productId": "<your_product_id>",
      "quantity": 2
    }
  ],
  "shippingAddress": {
    "address": "123 Test Street",
    "city": "New York",
    "postalCode": "10001",
    "country": "USA"
  },
  "paymentMethod": "cod"
}
```

**Expected Result:**
- Order created successfully
- Stock decreased by 2
- Inventory log created with action="order_placed"
- Response includes notification message
- Order has stockReserved=true, stockDeducted=false

**Verification:**
```bash
# Check product stock decreased
GET /api/products/<product_id>

# Check inventory log created
GET /api/inventory/logs/<product_id> (admin token required)
```

---

### 2. Test Insufficient Stock Handling

**Endpoint:** POST /api/orders

**Request Body:**
```json
{
  "items": [
    {
      "productId": "<product_id>",
      "quantity": 999999
    }
  ],
  "shippingAddress": {
    "address": "123 Test Street",
    "city": "New York"
  }
}
```

**Expected Result:**
- 400 Bad Request
- Response includes unavailableItems array
- Shows requested vs available quantities
- No order created
- No stock changed

---

### 3. Test Order Delivery - Stock Confirmation

**Endpoint:** PUT /api/orders/:orderId/status

**Headers:**
```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "status": "delivered"
}
```

**Expected Result:**
- Order status changed to "delivered"
- Order.stockDeducted set to true
- Inventory log created with action="order_delivered"
- Response includes stockUpdate array showing confirmed deductions
- Notification message included

**Verification:**
```bash
# Check order updated
GET /api/orders/<order_id> (admin or owner token)

# Check inventory log
GET /api/inventory/logs/<product_id> (admin token)

# Should see two logs:
# 1. action="order_placed" (when order created)
# 2. action="order_delivered" (just now)
```

---

### 4. Test Customer Order Cancellation - Stock Restoration

**Endpoint:** PUT /api/orders/:orderId/cancel

**Headers:**
```
Authorization: Bearer <customer_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "reason": "Changed my mind"
}
```

**Expected Result:**
- Order status changed to "cancelled"
- Stock restored to inventory
- Product stock increased
- Inventory log created with action="order_cancelled"
- Response includes stockUpdate array showing restored quantities

**Verification:**
```bash
# Check product stock increased back
GET /api/products/<product_id>

# Check inventory logs
GET /api/inventory/logs/<product_id> (admin token)

# Should see three logs:
# 1. action="order_placed" (stock decreased)
# 2. action="order_cancelled" (stock restored)
```

---

### 5. Test Admin Order Cancellation

**Endpoint:** PUT /api/orders/:orderId/status

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Request Body:**
```json
{
  "status": "cancelled",
  "cancelReason": "Product unavailable"
}
```

**Expected Result:**
- Order cancelled
- Stock restored
- cancelReason saved
- Inventory log created

---

### 6. Test Inventory Statistics

**Endpoint:** GET /api/inventory/stats

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Expected Result:**
```json
{
  "success": true,
  "overview": {
    "totalProducts": 50,
    "inStockCount": 45,
    "outOfStockCount": 5,
    "lowStockCount": 8
  },
  "orderStats": {
    "totalOrders": 10,
    "totalDelivered": 5,
    "totalCancelled": 2,
    "totalQuantitySold": 50,
    "totalQuantityRestored": 10
  },
  "alerts": {
    "lowStockProducts": [...],
    "outOfStockProducts": [...]
  }
}
```

---

### 7. Test Low Stock Alerts

**Endpoint:** GET /api/inventory/alerts/low-stock?threshold=10

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Expected Result:**
- List of products with stock <= 10
- Products sorted by stock level

---

### 8. Test Manual Stock Adjustment

**Endpoint:** POST /api/inventory/adjust

**Headers:**
```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "productId": "<product_id>",
  "quantityChange": -5,
  "reason": "5 units damaged in warehouse"
}
```

**Expected Result:**
- Stock decreased by 5
- Inventory log created with action="stock_removed"
- Reason stored in log

**Test Adding Stock:**
```json
{
  "productId": "<product_id>",
  "quantityChange": 20,
  "reason": "New shipment received"
}
```

**Expected Result:**
- Stock increased by 20
- Inventory log created with action="stock_added"

---

### 9. Test Inventory Logs Query

**Endpoint:** GET /api/inventory/logs/:productId

**Query Parameters:**
- page=1
- limit=50
- action=order_placed (optional filter)

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Expected Result:**
- Paginated list of all stock changes for the product
- Each log includes:
  - action type
  - quantityChange
  - stockBefore and stockAfter
  - performedBy user details
  - reason
  - timestamp

---

### 10. Test Order History Report

**Endpoint:** GET /api/orders/admin/order-history

**Query Parameters:**
- startDate=2024-01-01
- endDate=2024-12-31
- page=1
- limit=50

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Expected Result:**
- Paginated order list
- Metrics: totalOrders, delivered, cancelled, pending, processing, shipped
- Date range applied

---

## Common Test Scenarios

### Scenario A: Complete Order Lifecycle
1. Create order → Stock reserved
2. Admin marks as delivered → Stock confirmed
3. Check logs → See both actions

### Scenario B: Order Cancellation
1. Create order → Stock reserved
2. Customer cancels → Stock restored
3. Check product → Stock back to original

### Scenario C: Prevent Double Delivery
1. Create order
2. Mark as delivered (works)
3. Try to mark as delivered again → Already delivered
4. Verify stock only deducted once

### Scenario D: Cannot Cancel Delivered Order
1. Create order
2. Mark as delivered
3. Try to cancel → Error: cannot cancel delivered order

### Scenario E: Multiple Items
1. Create order with 3 different products
2. Verify all 3 products have stock decreased
3. Verify 3 inventory logs created
4. Cancel order
5. Verify all 3 products have stock restored
6. Verify 3 more inventory logs created

---

## Verification Checklist

After running tests, verify:

- [ ] Stock levels are accurate in Product collection
- [ ] Every order has corresponding inventory logs
- [ ] stockReserved and stockDeducted flags are correct
- [ ] Cancelled orders have stock restored
- [ ] Inventory logs have correct quantityChange signs
- [ ] Low stock alerts are accurate
- [ ] Out of stock products are identified
- [ ] Statistics match actual data
- [ ] All logs have user references
- [ ] Timestamps are correct

---

## Testing with Postman

Import these endpoints into Postman:

1. Create Environment:
   - base_url: http://localhost:5000
   - admin_token: <your_admin_jwt>
   - customer_token: <your_customer_jwt>
   - product_id: <test_product_id>

2. Create Collection with all endpoints above

3. Run tests in sequence

---

## Troubleshooting

### Stock not decreasing
- Check if reserveStock() is being called
- Check for errors in console
- Verify product exists
- Check MongoDB connection

### Logs not created
- Verify InventoryLog model is imported
- Check logInventoryChange() function
- Look for errors in server logs

### Cannot cancel order
- Check order status (only pending/processing can be cancelled)
- Verify stockDeducted is false
- Check user ownership

### Statistics incorrect
- Clear and recreate test data
- Verify aggregation queries
- Check date ranges

---

## Performance Testing

Test with multiple concurrent orders:

```javascript
// Create 10 orders simultaneously
for (let i = 0; i < 10; i++) {
  fetch('http://localhost:5000/api/orders', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + token,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(orderData)
  });
}
```

Verify:
- No race conditions
- Stock accurately decreased
- All logs created
- No duplicate entries

---

## Next Steps After Testing

1. Test with real product data
2. Test edge cases (zero stock, negative quantities)
3. Test with large order volumes
4. Performance test with concurrent requests
5. Test error recovery scenarios
6. Create automated test suite with Jest/Supertest
