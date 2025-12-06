# Inventory Management System Documentation

## Overview

This inventory management system provides comprehensive tracking of stock levels through the complete order lifecycle. It includes automatic stock reservation, confirmation on delivery, restoration on cancellation, and full audit logging.

## Core Features

### 1. Stock Reservation on Order Placement
- When a customer places an order, stock is immediately reserved
- Validates stock availability before order creation
- Returns detailed error messages for insufficient stock
- Logs all stock changes to audit trail

### 2. Stock Confirmation on Delivery
- When admin marks order as "delivered", stock deduction is confirmed
- Creates permanent inventory log entry
- Updates order with `stockDeducted: true` flag
- Prevents double-deduction through status tracking

### 3. Stock Restoration on Cancellation
- Returns stock to inventory when order is cancelled
- Works for both customer cancellations and admin cancellations
- Logs the restoration with reason
- Only allows cancellation of pending/processing orders

### 4. Comprehensive Audit Logging
- Every stock change is logged with:
  - Action type (order_placed, order_delivered, order_cancelled, etc.)
  - Quantity change
  - Stock before and after
  - User who performed the action
  - Reason for change
  - Order reference
  - Timestamp

### 5. Performance Metrics & Monitoring
- Track total orders, delivered, cancelled
- Calculate quantities sold and restored
- Monitor low stock alerts
- Identify out-of-stock products
- Generate inventory reports

## Database Models

### InventoryLog
```javascript
{
  product: ObjectId,           // Reference to Product
  order: ObjectId,             // Reference to Order (optional)
  action: String,              // enum: order_placed, order_delivered, order_cancelled, 
                               //       stock_added, stock_removed, stock_adjustment
  quantityChange: Number,      // Positive for additions, negative for deductions
  stockBefore: Number,         // Stock level before change
  stockAfter: Number,          // Stock level after change
  performedBy: ObjectId,       // User who performed the action
  reason: String,              // Why this change occurred (max 500 chars)
  metadata: Object,            // Additional context (orderStatus, ipAddress, etc.)
  createdAt: Date              // When this change occurred
}
```

### Order (Updated)
```javascript
{
  // Existing fields...
  stockReserved: Boolean,      // default: true - stock is reserved
  stockDeducted: Boolean,      // default: false - set to true on delivery
  cancelledAt: Date,           // When order was cancelled
  cancelReason: String         // Why order was cancelled
}
```

## API Endpoints

### Order Management (with Inventory Integration)

#### POST /api/orders
Create new order with stock reservation
- **Authentication**: Required (customer)
- **Stock Action**: Reserves stock immediately
- **Validation**: Checks stock availability before order
- **Error Handling**: Returns unavailable items with details

**Request:**
```json
{
  "items": [
    {
      "productId": "507f1f77bcf86cd799439011",
      "quantity": 2
    }
  ],
  "shippingAddress": {
    "address": "123 Main St",
    "city": "New York",
    "postalCode": "10001",
    "country": "USA"
  },
  "paymentMethod": "cod"
}
```

**Success Response:**
```json
{
  "success": true,
  "msg": "Order placed successfully. Stock has been reserved.",
  "order": { /* order object */ },
  "notification": "Your order has been received and is being processed. Inventory has been updated."
}
```

**Error Response (Insufficient Stock):**
```json
{
  "success": false,
  "msg": "Some items are out of stock or have insufficient quantity",
  "unavailableItems": [
    {
      "product": "Premium Laptop",
      "requested": 5,
      "available": 2,
      "reason": "Insufficient stock"
    }
  ]
}
```

#### PUT /api/orders/:id/status
Update order status (admin only)
- **Authentication**: Required (admin)
- **Stock Action on Delivered**: Confirms stock deduction, logs delivery
- **Stock Action on Cancelled**: Restores stock to inventory

**Request:**
```json
{
  "status": "delivered",
  "cancelReason": "Optional - required if status is cancelled"
}
```

**Success Response (Delivered):**
```json
{
  "success": true,
  "msg": "Order marked as delivered. Stock deduction confirmed.",
  "order": { /* order object */ },
  "stockUpdate": [
    {
      "product": "507f1f77bcf86cd799439011",
      "productName": "Premium Laptop",
      "quantityDeducted": 2,
      "stockBefore": 10,
      "stockAfter": 8
    }
  ],
  "notification": "Inventory has been updated. Customer has been notified of delivery."
}
```

**Success Response (Cancelled):**
```json
{
  "success": true,
  "msg": "Order cancelled. Stock has been restored to inventory.",
  "order": { /* order object */ },
  "stockUpdate": [
    {
      "product": "507f1f77bcf86cd799439011",
      "productName": "Premium Laptop",
      "quantityRestored": 2,
      "stockBefore": 8,
      "stockAfter": 10
    }
  ],
  "notification": "Customer has been notified. Stock returned to inventory."
}
```

#### PUT /api/orders/:id/cancel
Customer cancels their own order
- **Authentication**: Required (customer, owns order)
- **Stock Action**: Restores stock to inventory
- **Validation**: Only pending/processing orders can be cancelled

**Request:**
```json
{
  "reason": "Changed my mind"
}
```

**Success Response:**
```json
{
  "success": true,
  "msg": "Order cancelled successfully. Stock has been restored.",
  "order": { /* order object */ },
  "stockUpdate": [ /* restored stock details */ ],
  "notification": "Your order has been cancelled. Stock returned to inventory."
}
```

#### GET /api/orders/admin/inventory-stats
Get comprehensive inventory statistics
- **Authentication**: Required (admin)
- **Returns**: Order stats, low stock alerts, out of stock products

**Response:**
```json
{
  "success": true,
  "inventoryStats": {
    "totalOrders": 150,
    "totalDelivered": 120,
    "totalCancelled": 10,
    "totalQuantitySold": 450,
    "totalQuantityRestored": 30
  },
  "alerts": {
    "lowStock": 5,
    "outOfStock": 2,
    "lowStockProducts": [ /* products with stock <= 10 */ ],
    "outOfStockProducts": [ /* products with stock = 0 */ ]
  }
}
```

#### GET /api/orders/admin/order-history
Get order history with metrics
- **Authentication**: Required (admin)
- **Query Parameters**: startDate, endDate, page, limit
- **Returns**: Orders with inventory impact metrics

### Inventory Management Endpoints

#### GET /api/inventory/logs/:productId
Get inventory logs for specific product
- **Authentication**: Required (admin)
- **Query Parameters**: page, limit, action
- **Returns**: Paginated logs with product details

#### GET /api/inventory/logs
Get all inventory logs
- **Authentication**: Required (admin)
- **Query Parameters**: page, limit, action, startDate, endDate
- **Returns**: Paginated logs across all products

#### GET /api/inventory/stats
Get comprehensive inventory statistics
- **Authentication**: Required (admin)
- **Query Parameters**: productId (optional)
- **Returns**: Overview stats, order stats, alerts

**Response:**
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
    "totalOrders": 200,
    "totalDelivered": 180,
    "totalCancelled": 20,
    "totalQuantitySold": 600,
    "totalQuantityRestored": 50
  },
  "alerts": {
    "lowStockProducts": [ /* array */ ],
    "outOfStockProducts": [ /* array */ ]
  }
}
```

#### GET /api/inventory/alerts/low-stock
Get products with low stock
- **Authentication**: Required (admin)
- **Query Parameters**: threshold (default: 10)
- **Returns**: Products below threshold

#### GET /api/inventory/alerts/out-of-stock
Get products that are out of stock
- **Authentication**: Required (admin)
- **Returns**: Products with stock = 0

#### POST /api/inventory/adjust
Manual stock adjustment
- **Authentication**: Required (admin)
- **Use Cases**: Damaged goods, theft, manual restock
- **Action**: Updates stock and creates audit log

**Request:**
```json
{
  "productId": "507f1f77bcf86cd799439011",
  "quantityChange": -5,
  "reason": "5 units damaged in warehouse"
}
```

**Success Response:**
```json
{
  "success": true,
  "msg": "Stock adjusted successfully",
  "product": {
    "id": "507f1f77bcf86cd799439011",
    "name": "Premium Laptop",
    "stockBefore": 50,
    "stockAfter": 45,
    "change": -5
  }
}
```

#### GET /api/inventory/report
Get inventory summary report
- **Authentication**: Required (admin)
- **Query Parameters**: startDate, endDate
- **Returns**: Action summary and top products by activity

## Utility Functions

### reserveStock(productId, quantity, userId, orderId)
- Validates stock availability
- Decreases product stock
- Updates product.inStock flag
- Creates inventory log
- Throws error if insufficient stock

### confirmStockDeduction(order, userId)
- Logs delivery confirmation for all order items
- Returns array of stock update results
- Does NOT change stock (already reserved)

### restoreStock(order, userId, cancelReason)
- Returns stock to inventory for all order items
- Updates product stock and inStock flag
- Creates inventory logs
- Returns array of restoration results

### checkStockAvailability(items)
- Validates stock for multiple products
- Returns availability status for each item
- Includes product name, requested/available quantities

### getInventoryStats(productId)
- Aggregates order statistics
- Can filter by specific product or all products
- Returns order counts and quantities

### getLowStockProducts(threshold)
- Finds products with stock <= threshold
- Returns product details sorted by stock level

### getOutOfStockProducts()
- Finds products with stock = 0
- Returns product details

### logInventoryChange(data)
- Creates audit log entry
- Used internally by other functions

## Error Handling

### Insufficient Stock
```json
{
  "success": false,
  "msg": "Some items are out of stock or have insufficient quantity",
  "unavailableItems": [ /* details */ ]
}
```

### Stock Reservation Failed
```json
{
  "success": false,
  "msg": "Failed to reserve stock",
  "error": "Insufficient stock for product: Premium Laptop"
}
```

### Invalid Cancellation
```json
{
  "success": false,
  "msg": "Cannot cancel order - already delivered and stock deducted"
}
```

### Negative Stock Prevention
```json
{
  "success": false,
  "msg": "Stock cannot be negative"
}
```

## User Notifications

All inventory-impacting operations include a `notification` field in the response:

- **Order Placed**: "Your order has been received and is being processed. Inventory has been updated."
- **Order Delivered**: "Inventory has been updated. Customer has been notified of delivery."
- **Order Cancelled (Admin)**: "Customer has been notified. Stock returned to inventory."
- **Order Cancelled (Customer)**: "Your order has been cancelled. Stock returned to inventory."

## Performance Metrics Tracked

1. **Total Orders**: All orders in the system
2. **Total Delivered**: Successfully delivered orders
3. **Total Cancelled**: Cancelled orders
4. **Total Quantity Sold**: Sum of all delivered order quantities
5. **Total Quantity Restored**: Sum of all cancelled order quantities
6. **Low Stock Count**: Products below threshold
7. **Out of Stock Count**: Products with zero stock
8. **Stock-Out Incidents**: Times products went out of stock

## Workflow Examples

### Successful Order Flow
```
1. Customer creates order
   → checkStockAvailability() validates stock
   → Order created with stockReserved: true
   → reserveStock() decreases inventory
   → Log: action="order_placed"

2. Admin marks as delivered
   → confirmStockDeduction() logs delivery
   → Order updated with stockDeducted: true
   → Log: action="order_delivered"
```

### Cancelled Order Flow
```
1. Customer creates order
   → Stock reserved
   → Log: action="order_placed"

2. Customer cancels order
   → restoreStock() returns inventory
   → Order updated with status="cancelled"
   → Log: action="order_cancelled"
```

### Manual Stock Adjustment
```
1. Admin adjusts stock
   → Stock updated directly
   → Log: action="stock_adjustment"
   → Reason stored for audit
```

## Security Considerations

- All admin endpoints require `verifyAdmin` middleware
- Customer cancellations verify ownership
- Stock adjustments require reason for audit
- All changes tracked with user IDs
- Timestamps on all log entries

## Testing Recommendations

1. Test stock reservation on order creation
2. Test insufficient stock handling
3. Test delivery confirmation
4. Test customer cancellation with stock restoration
5. Test admin cancellation with stock restoration
6. Test duplicate delivery prevention
7. Test manual stock adjustments
8. Test low stock alerts
9. Test inventory reports
10. Test concurrent order scenarios

## Migration Notes

If upgrading from previous version:
1. Existing orders won't have stockReserved/stockDeducted flags (defaults apply)
2. No historical inventory logs will exist
3. Consider running data migration to backfill order tracking fields
4. Monitor first week for any stock discrepancies

## Support

For issues or questions:
- Check inventory logs: GET /api/inventory/logs
- Check specific product logs: GET /api/inventory/logs/:productId
- Review order history: GET /api/orders/admin/order-history
- Monitor alerts: GET /api/inventory/alerts/low-stock
