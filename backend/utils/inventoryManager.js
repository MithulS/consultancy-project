// Inventory Management Utilities
const Product = require('../models/product');
const InventoryLog = require('../models/inventoryLog');

/**
 * Log inventory changes for audit trail
 */
async function logInventoryChange(data) {
  try {
    const log = new InventoryLog({
      product: data.product || data.productId,
      order: data.order || data.orderId,
      action: data.action,
      quantityChange: data.quantityChange,
      stockBefore: data.stockBefore,
      stockAfter: data.stockAfter,
      performedBy: data.performedBy || data.userId,
      reason: data.reason,
      metadata: data.metadata || {}
    });
    
    await log.save();
    return log;
  } catch (err) {
    console.error('Error logging inventory change:', err);
    throw err;
  }
}

/**
 * Reserve stock when order is placed
 */
async function reserveStock(productId, quantity, userId, orderId) {
  const product = await Product.findById(productId);
  
  if (!product) {
    throw new Error('Product not found');
  }

  if (product.stock < quantity) {
    throw new Error(`Insufficient stock. Available: ${product.stock}, Requested: ${quantity}`);
  }

  const stockBefore = product.stock;
  
  // Decrease stock
  product.stock -= quantity;
  product.inStock = product.stock > 0;
  await product.save();

  // Log the change
  await logInventoryChange({
    productId,
    orderId,
    action: 'order_placed',
    quantityChange: -quantity,
    stockBefore,
    stockAfter: product.stock,
    userId,
    reason: `Stock reserved for order ${orderId}`
  });

  return product;
}

/**
 * Confirm stock deduction when order is delivered
 */
async function confirmStockDeduction(order, userId) {
  const results = [];
  
  for (const item of order.items) {
    const product = await Product.findById(item.product);
    
    if (!product) {
      console.error(`Product not found: ${item.product}`);
      continue;
    }

    // Log delivery confirmation (stock already deducted on order creation)
    await logInventoryChange({
      productId: item.product,
      orderId: order._id,
      action: 'order_delivered',
      quantityChange: 0, // Already deducted
      stockBefore: product.stock,
      stockAfter: product.stock,
      userId,
      reason: `Order delivered - stock deduction confirmed`,
      metadata: {
        orderStatus: 'delivered',
        previousOrderStatus: order.status
      }
    });

    results.push({
      productId: item.product,
      productName: item.name,
      quantity: item.quantity,
      currentStock: product.stock,
      success: true
    });
  }

  return results;
}

/**
 * Restore stock when order is cancelled
 */
async function restoreStock(order, userId, cancelReason) {
  const results = [];
  
  for (const item of order.items) {
    const product = await Product.findById(item.product);
    
    if (!product) {
      console.error(`Product not found: ${item.product}`);
      results.push({
        productId: item.product,
        productName: item.name,
        success: false,
        error: 'Product not found'
      });
      continue;
    }

    const stockBefore = product.stock;
    
    // Restore stock
    product.stock += item.quantity;
    product.inStock = product.stock > 0;
    await product.save();

    // Log the restoration
    await logInventoryChange({
      productId: item.product,
      orderId: order._id,
      action: 'order_cancelled',
      quantityChange: item.quantity,
      stockBefore,
      stockAfter: product.stock,
      userId,
      reason: cancelReason || 'Order cancelled - stock restored',
      metadata: {
        orderStatus: 'cancelled',
        previousOrderStatus: order.status
      }
    });

    results.push({
      productId: item.product,
      productName: item.name,
      quantity: item.quantity,
      currentStock: product.stock,
      success: true
    });
  }

  return results;
}

/**
 * Check stock availability for multiple products
 */
async function checkStockAvailability(items) {
  const results = [];
  
  for (const item of items) {
    const product = await Product.findById(item.productId);
    
    if (!product) {
      results.push({
        productId: item.productId,
        available: false,
        reason: 'Product not found'
      });
      continue;
    }

    const available = product.inStock && product.stock >= item.quantity;
    
    results.push({
      productId: item.productId,
      productName: product.name,
      requestedQuantity: item.quantity,
      availableStock: product.stock,
      available,
      reason: available ? 'In stock' : `Insufficient stock. Available: ${product.stock}`
    });
  }

  return results;
}

/**
 * Get inventory statistics
 */
async function getInventoryStats(productId = null) {
  const query = productId ? { product: productId } : {};
  
  const stats = await InventoryLog.aggregate([
    { $match: query },
    {
      $group: {
        _id: '$product',
        totalOrders: {
          $sum: {
            $cond: [{ $eq: ['$action', 'order_placed'] }, 1, 0]
          }
        },
        totalDelivered: {
          $sum: {
            $cond: [{ $eq: ['$action', 'order_delivered'] }, 1, 0]
          }
        },
        totalCancelled: {
          $sum: {
            $cond: [{ $eq: ['$action', 'order_cancelled'] }, 1, 0]
          }
        },
        totalQuantitySold: {
          $sum: {
            $cond: [
              { $eq: ['$action', 'order_placed'] },
              { $abs: '$quantityChange' },
              0
            ]
          }
        },
        totalQuantityRestored: {
          $sum: {
            $cond: [
              { $eq: ['$action', 'order_cancelled'] },
              '$quantityChange',
              0
            ]
          }
        }
      }
    }
  ]);

  if (productId) {
    return stats[0] || null;
  }

  return stats;
}

/**
 * Get low stock products
 */
async function getLowStockProducts(threshold = 10) {
  const products = await Product.find({
    stock: { $lte: threshold, $gt: 0 },
    isActive: true
  }).select('name stock category price');

  return products;
}

/**
 * Get out of stock products
 */
async function getOutOfStockProducts() {
  const products = await Product.find({
    stock: 0,
    isActive: true
  }).select('name category price');

  return products;
}

module.exports = {
  logInventoryChange,
  reserveStock,
  confirmStockDeduction,
  restoreStock,
  checkStockAvailability,
  getInventoryStats,
  getLowStockProducts,
  getOutOfStockProducts
};
