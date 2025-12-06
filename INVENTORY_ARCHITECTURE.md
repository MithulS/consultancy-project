# Inventory Management System - Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                            │
│  (Frontend - React/Vue/Mobile App)                              │
└────────────────────────┬────────────────────────────────────────┘
                         │ HTTP Requests
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API GATEWAY LAYER                          │
│  Express.js Server (index.js)                                   │
│  - CORS Configuration                                           │
│  - Request Logging                                              │
│  - Error Handling                                               │
└────────────────────────┬────────────────────────────────────────┘
                         │
            ┌────────────┴────────────┐
            │                         │
            ▼                         ▼
┌──────────────────────┐    ┌──────────────────────┐
│   AUTHENTICATION     │    │   AUTHORIZATION      │
│   Middleware         │    │   Middleware         │
│  - verifyToken       │    │  - verifyAdmin       │
│  - JWT Validation    │    │  - Role Checking     │
└──────────┬───────────┘    └──────────┬───────────┘
           │                           │
           └───────────┬───────────────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
        ▼              ▼              ▼
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│   ORDERS    │ │  INVENTORY  │ │  PRODUCTS   │
│   ROUTES    │ │   ROUTES    │ │   ROUTES    │
└──────┬──────┘ └──────┬──────┘ └──────┬──────┘
       │               │               │
       └───────────────┼───────────────┘
                       │
        ┌──────────────┴──────────────┐
        │                             │
        ▼                             ▼
┌─────────────────┐          ┌─────────────────┐
│   INVENTORY     │          │   AUDIT         │
│   MANAGER       │◄─────────┤   LOGGER        │
│   (Business     │          │                 │
│    Logic)       │          └─────────────────┘
└────────┬────────┘
         │
         ├─────────────────────────────┐
         │                             │
         ▼                             ▼
┌─────────────────┐          ┌─────────────────┐
│   PRODUCT       │          │  INVENTORY LOG  │
│   MODEL         │          │  MODEL          │
└─────────────────┘          └─────────────────┘
         │                             │
         └──────────────┬──────────────┘
                        │
                        ▼
              ┌──────────────────┐
              │   ORDER MODEL    │
              └──────────────────┘
                        │
                        ▼
              ┌──────────────────┐
              │   MongoDB        │
              │   Database       │
              └──────────────────┘
```

## Component Breakdown

### 1. API Routes (Entry Points)

#### Orders Routes (`routes/orders.js`)
- **POST /api/orders** - Create order with stock reservation
- **GET /api/orders/my-orders** - Customer's orders
- **GET /api/orders/:id** - Single order details
- **GET /api/orders** (admin) - All orders
- **PUT /api/orders/:id/status** (admin) - Update status with inventory impact
- **PUT /api/orders/:id/cancel** - Cancel order with stock restoration
- **GET /api/orders/admin/inventory-stats** (admin) - Quick inventory stats
- **GET /api/orders/admin/order-history** (admin) - Order history with metrics

#### Inventory Routes (`routes/inventory.js`)
- **GET /api/inventory/logs/:productId** (admin) - Product-specific logs
- **GET /api/inventory/logs** (admin) - All inventory logs
- **GET /api/inventory/stats** (admin) - Comprehensive statistics
- **GET /api/inventory/alerts/low-stock** (admin) - Low stock alerts
- **GET /api/inventory/alerts/out-of-stock** (admin) - Out of stock products
- **POST /api/inventory/adjust** (admin) - Manual stock adjustment
- **GET /api/inventory/report** (admin) - Summary report

### 2. Business Logic Layer

#### Inventory Manager (`utils/inventoryManager.js`)

##### Core Functions:
```javascript
// Stock Management
reserveStock(productId, quantity, userId, orderId)
  → Validates availability
  → Decreases product.stock
  → Updates product.inStock
  → Creates inventory log
  → Throws error if insufficient

confirmStockDeduction(order, userId)
  → Logs delivery confirmation
  → Returns stock update results
  → Does NOT change stock (already reserved)

restoreStock(order, userId, cancelReason)
  → Increases product.stock
  → Updates product.inStock
  → Creates inventory logs
  → Returns restoration results

// Validation
checkStockAvailability(items)
  → Validates multiple products
  → Returns availability status
  → Includes product details

// Analytics
getInventoryStats(productId)
  → Aggregates order data
  → Returns counts and quantities
  → Optional product filter

getLowStockProducts(threshold)
  → Finds products below threshold
  → Returns sorted list

getOutOfStockProducts()
  → Finds zero-stock products
  → Returns product details

// Audit
logInventoryChange(data)
  → Creates InventoryLog entry
  → Used by all other functions
```

### 3. Data Models

#### Order Model (`models/order.js`)
```javascript
{
  user: ObjectId,
  items: [{
    product: ObjectId,
    name: String,
    imageUrl: String,
    price: Number,
    quantity: Number
  }],
  totalAmount: Number,
  status: enum,
  shippingAddress: Object,
  paymentMethod: String,
  paymentStatus: String,
  deliveredAt: Date,
  
  // NEW: Inventory Management Fields
  stockReserved: Boolean,    // default: true
  stockDeducted: Boolean,    // default: false
  cancelledAt: Date,
  cancelReason: String,
  
  createdAt: Date,
  updatedAt: Date
}
```

#### InventoryLog Model (`models/inventoryLog.js`)
```javascript
{
  product: ObjectId,
  order: ObjectId,
  action: enum [
    'order_placed',
    'order_delivered',
    'order_cancelled',
    'stock_added',
    'stock_removed',
    'stock_adjustment'
  ],
  quantityChange: Number,      // Positive = add, Negative = remove
  stockBefore: Number,
  stockAfter: Number,
  performedBy: ObjectId,
  reason: String,
  metadata: Object,
  createdAt: Date
}

// Indexes:
// - (product, createdAt)
// - order
// - (action, createdAt)
```

#### Product Model (Existing)
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,           // Managed by inventory system
  inStock: Boolean,        // Managed by inventory system
  imageUrl: String,
  rating: Number,
  numReviews: Number,
  createdAt: Date,
  updatedAt: Date
}
```

## Data Flow Examples

### Flow 1: Create Order with Stock Reservation

```
1. Customer → POST /api/orders
   Body: { items, shippingAddress, paymentMethod }

2. orders.js → checkStockAvailability(items)
   ↓
   inventoryManager.js → Queries Product collection
   ↓
   Returns: [{ productId, available: true/false, ... }]

3. orders.js → Creates Order document
   {
     stockReserved: true,
     stockDeducted: false,
     status: 'pending'
   }

4. orders.js → For each item:
   reserveStock(productId, quantity, userId, orderId)
   ↓
   inventoryManager.js:
   - Decreases Product.stock
   - Updates Product.inStock
   - Calls logInventoryChange({
       action: 'order_placed',
       quantityChange: -quantity,
       stockBefore: X,
       stockAfter: X - quantity
     })
   ↓
   Creates InventoryLog document

5. Response → { success, order, notification }
```

### Flow 2: Mark Order as Delivered

```
1. Admin → PUT /api/orders/:id/status
   Body: { status: 'delivered' }

2. orders.js → Finds Order, checks status change

3. orders.js → confirmStockDeduction(order, adminUserId)
   ↓
   inventoryManager.js:
   - For each order item:
     - Calls logInventoryChange({
         action: 'order_delivered',
         quantityChange: -quantity,
         stockBefore: X,
         stockAfter: X (no change, already deducted)
       })
     - Creates InventoryLog document

4. orders.js → Updates Order:
   {
     status: 'delivered',
     deliveredAt: now,
     stockDeducted: true
   }

5. Response → { success, order, stockUpdate, notification }
```

### Flow 3: Cancel Order with Stock Restoration

```
1. Customer → PUT /api/orders/:id/cancel
   Body: { reason: 'Changed my mind' }

2. orders.js → Validates ownership, checks status

3. orders.js → restoreStock(order, userId, reason)
   ↓
   inventoryManager.js:
   - For each order item:
     - Increases Product.stock
     - Updates Product.inStock
     - Calls logInventoryChange({
         action: 'order_cancelled',
         quantityChange: +quantity,
         stockBefore: X,
         stockAfter: X + quantity,
         reason: reason
       })
     - Creates InventoryLog document

4. orders.js → Updates Order:
   {
     status: 'cancelled',
     cancelledAt: now,
     cancelReason: reason,
     stockReserved: false
   }

5. Response → { success, order, stockUpdate, notification }
```

### Flow 4: Manual Stock Adjustment

```
1. Admin → POST /api/inventory/adjust
   Body: {
     productId,
     quantityChange: -5,
     reason: 'Damaged goods'
   }

2. inventory.js → Finds Product

3. inventory.js → Updates Product:
   {
     stock: stock + quantityChange,
     inStock: newStock > 0
   }

4. inventory.js → logInventoryChange({
     action: quantityChange > 0 ? 'stock_added' : 'stock_removed',
     quantityChange,
     stockBefore,
     stockAfter,
     reason,
     metadata: { adjustmentType: 'manual' }
   })

5. Response → { success, product: { stockBefore, stockAfter, change } }
```

## Security Architecture

### Authentication Flow
```
User Login → JWT Token → Stored in Client → Sent with each request

Request → verifyToken middleware → Extracts userId from JWT
                                 → Attaches to req.userId
                                 → Next()
```

### Authorization Flow
```
Admin Request → verifyToken → verifyAdmin → Checks user.isAdmin
                                         → 403 if not admin
                                         → Next() if admin
```

### Protected Routes
- **Customer Routes**: Require verifyToken
  - POST /api/orders
  - GET /api/orders/my-orders
  - PUT /api/orders/:id/cancel (with ownership check)

- **Admin Routes**: Require verifyAdmin
  - GET /api/orders (all orders)
  - PUT /api/orders/:id/status
  - All /api/inventory/* endpoints

## Error Handling

### Inventory-Specific Errors

1. **Insufficient Stock**
   ```javascript
   {
     success: false,
     msg: 'Some items are out of stock...',
     unavailableItems: [...]
   }
   ```

2. **Stock Reservation Failed**
   ```javascript
   {
     success: false,
     msg: 'Failed to reserve stock',
     error: 'Insufficient stock for product: X'
   }
   ```

3. **Invalid Cancellation**
   ```javascript
   {
     success: false,
     msg: 'Cannot cancel order - already delivered...'
   }
   ```

4. **Negative Stock Prevention**
   ```javascript
   {
     success: false,
     msg: 'Stock cannot be negative'
   }
   ```

## Performance Optimizations

### Database Indexes
```javascript
// InventoryLog
- { product: 1, createdAt: -1 }
- { order: 1 }
- { action: 1, createdAt: -1 }

// Order
- { user: 1, createdAt: -1 }
- { status: 1 }
- { createdAt: -1 }

// Product
- { stock: 1 }
- { inStock: 1 }
```

### Query Optimizations
- Pagination on all list endpoints
- Selective field population
- Aggregation pipelines for statistics
- Index usage in all queries

### Transaction Handling
```javascript
// If stock reservation fails, order is deleted
try {
  await order.save();
  await reserveStock(...);
} catch (error) {
  await Order.findByIdAndDelete(order._id);
  throw error;
}
```

## Monitoring & Alerts

### Key Metrics to Monitor
1. Low stock products (threshold: 10)
2. Out of stock products
3. Order fulfillment rate
4. Cancellation rate
5. Average delivery time
6. Stock-out incidents

### Log Analysis
- Track all inventory changes
- Monitor failed orders
- Analyze cancellation reasons
- Review manual adjustments

## Scalability Considerations

### Horizontal Scaling
- Stateless API (JWT-based auth)
- MongoDB sharding on product_id
- Cache frequently accessed products
- Queue system for order processing

### Vertical Scaling
- Index optimization
- Query optimization
- Connection pooling
- Load balancing

## Future Enhancements

1. **Real-time Updates**: WebSocket for live stock updates
2. **Batch Operations**: Bulk order processing
3. **Warehouse Management**: Multi-location inventory
4. **Predictive Analytics**: ML for demand forecasting
5. **Automated Reordering**: Trigger restocks automatically
6. **Barcode Integration**: Mobile scanning for warehouse
7. **Supplier Portal**: Direct supplier integration
8. **Advanced Reporting**: Custom dashboards and charts
9. **Audit Trail UI**: Visual audit log browser
10. **API Rate Limiting**: Prevent abuse

## Testing Strategy

### Unit Tests
- Test each inventoryManager function
- Mock database calls
- Test edge cases

### Integration Tests
- Test complete order flows
- Test stock availability checks
- Test cancellation flows

### End-to-End Tests
- Full user journey
- Multiple concurrent orders
- Stock race conditions

### Performance Tests
- Load testing with many orders
- Concurrent order creation
- Large inventory queries

## Deployment

### Environment Variables
```
MONGODB_URI=mongodb://...
JWT_SECRET=...
NODE_ENV=production
PORT=5000
```

### Startup Checklist
1. MongoDB connection established
2. All indexes created
3. Environment variables loaded
4. Admin user exists
5. Test products seeded
6. Health check passes

### Monitoring
- Server uptime
- Database connection
- Error rate
- Response times
- Stock levels

---

This architecture provides a robust, scalable, and maintainable inventory management system with full audit capabilities and comprehensive error handling.
