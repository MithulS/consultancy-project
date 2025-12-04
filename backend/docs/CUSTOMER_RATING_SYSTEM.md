# Customer Rating System Documentation

## Overview

The rating system has been redesigned to ensure that **only actual customers who have purchased products can leave ratings and reviews**. Admins cannot set ratings manually - all ratings are calculated automatically from verified customer reviews.

## Key Features

### ✅ Customer-Only Ratings
- Only users who have purchased a product can review it
- Reviews must be linked to an actual order
- One review per customer per product
- All reviews are marked as "Verified Purchase"

### ❌ Admin Cannot Set Ratings
- Admins cannot manually set `rating` or `numReviews` fields
- These fields are automatically calculated from customer reviews
- Admin attempts to set these fields are ignored

### 🔄 Automatic Rating Calculation
- Product rating is the average of all customer ratings
- `numReviews` is the count of all reviews for that product
- Ratings are recalculated whenever a review is created, updated, or deleted
- Rounded to 1 decimal place (e.g., 4.3)

## Database Models

### Order Model (`models/order.js`)
Tracks customer purchases - required for verified reviews.

**Fields:**
- `user` - Customer who placed the order
- `items` - Array of products purchased
- `totalAmount` - Total order value
- `status` - Order status (pending, processing, shipped, delivered, cancelled)
- `shippingAddress` - Delivery address
- `paymentMethod` - Payment type (card, upi, cod, netbanking)
- `paymentStatus` - Payment state
- `deliveredAt` - Delivery timestamp

### Review Model (`models/review.js`)
Stores customer reviews and ratings.

**Fields:**
- `product` - Product being reviewed (required)
- `user` - Customer who wrote the review (required)
- `order` - Order that included this product (required)
- `rating` - Rating 1-5 stars (required)
- `comment` - Review text (optional, max 1000 chars)
- `isVerifiedPurchase` - Always `true`
- `helpful` - Count of users who found review helpful
- `images` - Array of customer-uploaded review images

**Indexes:**
- Unique compound index on `(product, user)` - prevents duplicate reviews
- Index on `(product, createdAt)` - fast product review queries
- Index on `(user, createdAt)` - fast user review queries

### Product Model Updates (`models/product.js`)
The `rating` and `numReviews` fields now have comments indicating they are calculated, not set manually.

## API Endpoints

### Orders API (`/api/orders`)

#### Create Order
```
POST /api/orders
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "items": [
    {
      "productId": "product_id_here",
      "quantity": 2
    }
  ],
  "shippingAddress": {
    "address": "123 Main St",
    "city": "Mumbai",
    "postalCode": "400001",
    "country": "India"
  },
  "paymentMethod": "cod"
}
```

**Response:**
```json
{
  "success": true,
  "msg": "Order placed successfully",
  "order": { ... }
}
```

#### Get My Orders
```
GET /api/orders/my-orders?page=1&limit=10
Authorization: Bearer <token>
```

#### Get Order by ID
```
GET /api/orders/:id
Authorization: Bearer <token>
```

#### Get All Orders (Admin Only)
```
GET /api/orders?status=delivered&page=1&limit=20
Authorization: Bearer <admin_token>
```

#### Update Order Status (Admin Only)
```
PUT /api/orders/:id/status
Authorization: Bearer <admin_token>

{
  "status": "delivered"
}
```

### Reviews API (`/api/reviews`)

#### Create Review (Verified Purchase Required)
```
POST /api/reviews
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "productId": "product_id_here",
  "orderId": "order_id_here",
  "rating": 5,
  "comment": "Great product! Highly recommended.",
  "images": ["url1", "url2"]
}
```

**Validation:**
- User must have purchased the product
- Order must belong to the user
- Order must contain the product
- Rating must be 1-5
- User cannot review the same product twice

**Response:**
```json
{
  "success": true,
  "msg": "Review submitted successfully",
  "review": { ... }
}
```

#### Update Review (Own Review Only)
```
PUT /api/reviews/:id
Authorization: Bearer <token>

{
  "rating": 4,
  "comment": "Updated review text"
}
```

#### Delete Review (Own Review Only)
```
DELETE /api/reviews/:id
Authorization: Bearer <token>
```

#### Get Reviews for a Product (Public)
```
GET /api/reviews/product/:productId?page=1&limit=10&sort=-createdAt
```

**Response:**
```json
{
  "success": true,
  "reviews": [
    {
      "_id": "review_id",
      "user": {
        "name": "John Doe",
        "username": "johndoe"
      },
      "rating": 5,
      "comment": "Great product!",
      "isVerifiedPurchase": true,
      "createdAt": "2025-12-04T...",
      "images": []
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  }
}
```

#### Get My Reviews
```
GET /api/reviews/my-reviews?page=1&limit=10
Authorization: Bearer <token>
```

#### Check if Can Review
```
GET /api/reviews/can-review/:productId
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "canReview": true,
  "orderId": "order_id_to_use"
}
```

Or if cannot review:
```json
{
  "success": true,
  "canReview": false,
  "reason": "already_reviewed",
  "review": { ... }
}
```

Or:
```json
{
  "success": true,
  "canReview": false,
  "reason": "not_purchased"
}
```

## Rating Calculation

The `updateProductRating()` function automatically:

1. Finds all reviews for a product
2. Calculates average rating: `sum of all ratings / number of reviews`
3. Updates the product's `rating` field (rounded to 1 decimal)
4. Updates the product's `numReviews` field

This happens automatically when:
- A new review is created
- A review is updated
- A review is deleted

## Security Features

### Purchase Verification
- Reviews require a valid `orderId`
- System verifies the order belongs to the user
- System verifies the order contains the product
- System checks user hasn't already reviewed the product

### Admin Protection
- Admins cannot manually set ratings when creating products
- Admins cannot manually update ratings when editing products
- The `rating` and `numReviews` fields are automatically deleted from admin requests

### Review Ownership
- Users can only update/delete their own reviews
- Reviews are permanently linked to the user who created them
- Unique index prevents duplicate reviews

## Frontend Integration

### Display Product Rating
```javascript
// Product object from /api/products/:id
{
  "name": "Product Name",
  "price": 999,
  "rating": 4.3,
  "numReviews": 127,
  ...
}
```

Display as: ⭐ 4.3 (127 reviews)

### Show Review Form
1. Check if user can review: `GET /api/reviews/can-review/:productId`
2. If `canReview: true`, show review form with the returned `orderId`
3. Submit review: `POST /api/reviews` with productId, orderId, rating, comment

### Display Reviews
```javascript
// Fetch reviews
GET /api/reviews/product/:productId?page=1&limit=10

// Display each review
reviews.map(review => (
  <div>
    <div>⭐ {review.rating}/5</div>
    <div>{review.user.name} • Verified Purchase</div>
    <div>{review.comment}</div>
    <div>{new Date(review.createdAt).toLocaleDateString()}</div>
  </div>
))
```

## Testing the System

### 1. Create Test Order
```bash
POST /api/orders
{
  "items": [{"productId": "...", "quantity": 1}],
  "shippingAddress": {...},
  "paymentMethod": "cod"
}
```

### 2. Submit Review
```bash
POST /api/reviews
{
  "productId": "...",
  "orderId": "...",  # from step 1
  "rating": 5,
  "comment": "Excellent product!"
}
```

### 3. Verify Product Rating Updated
```bash
GET /api/products/:productId

# Should show:
{
  "rating": 5.0,
  "numReviews": 1,
  ...
}
```

### 4. Add More Reviews
Repeat steps 1-2 with different users. The product rating will automatically update to the average.

### 5. Try Invalid Review (Should Fail)
```bash
POST /api/reviews
{
  "productId": "some_product",
  "orderId": "fake_order_id",  # ❌ Wrong order
  "rating": 5
}

# Response: 403 Forbidden
# "Order not found or does not belong to you"
```

## Migration Notes

If you have existing products with manually set ratings:

1. **Existing ratings will remain** - The database won't automatically delete old data
2. **New reviews will override** - Once customers start reviewing, the automatic calculation takes over
3. **Manual reset** (optional):
   ```javascript
   // Reset all product ratings to 0
   await Product.updateMany({}, { rating: 0, numReviews: 0 });
   ```

## Summary

✅ **What Changed:**
- Admins can no longer set product ratings manually
- Ratings are now calculated from actual customer reviews
- Only verified purchasers can leave reviews
- One review per customer per product

✅ **Benefits:**
- Authentic customer feedback
- Prevents fake ratings
- Builds customer trust
- Automatic rating calculations

✅ **Security:**
- Purchase verification required
- Ownership validation on updates/deletes
- Duplicate prevention
- Admin protection from manual rating manipulation

---

**Last Updated:** December 4, 2025
**Status:** Production Ready
