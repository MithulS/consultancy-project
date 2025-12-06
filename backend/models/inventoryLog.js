// Inventory Log model - Track all stock changes
const mongoose = require('mongoose');

const inventoryLogSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  action: {
    type: String,
    enum: [
      'order_placed',        // Stock reserved when order is created
      'order_delivered',     // Stock confirmed sold on delivery
      'order_cancelled',     // Stock restored when order is cancelled
      'stock_added',         // Admin adds stock
      'stock_removed',       // Admin removes stock
      'stock_adjustment'     // Manual adjustment
    ],
    required: true
  },
  quantityChange: {
    type: Number,
    required: true
  },
  stockBefore: {
    type: Number,
    required: true
  },
  stockAfter: {
    type: Number,
    required: true
  },
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reason: {
    type: String,
    maxlength: 500
  },
  metadata: {
    orderStatus: String,
    previousOrderStatus: String,
    ipAddress: String
  }
}, {
  timestamps: true
});

// Indexes for performance
inventoryLogSchema.index({ product: 1, createdAt: -1 });
inventoryLogSchema.index({ order: 1 });
inventoryLogSchema.index({ action: 1, createdAt: -1 });

module.exports = mongoose.model('InventoryLog', inventoryLogSchema);
