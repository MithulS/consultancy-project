// Admin Notification Utility - Handle out-of-stock alerts
const User = require('../models/user');
const Product = require('../models/product');

/**
 * Get all admin users with phone numbers
 * @returns {Promise<Array>} Array of admin users with contact info
 */
async function getAdminContacts() {
  try {
    const admins = await User.find(
      { isAdmin: true, phoneNumber: { $exists: true, $ne: '' } },
      'name email phoneNumber'
    ).lean();
    
    return admins;
  } catch (error) {
    console.error('❌ Error fetching admin contacts:', error);
    return [];
  }
}

/**
 * Get primary admin contact (first admin with phone number)
 * @returns {Promise<Object|null>} Admin contact info or null
 */
async function getPrimaryAdminContact() {
  try {
    const admin = await User.findOne(
      { isAdmin: true, phoneNumber: { $exists: true, $ne: '' } },
      'name email phoneNumber'
    ).lean();
    
    return admin;
  } catch (error) {
    console.error('❌ Error fetching primary admin contact:', error);
    return null;
  }
}

/**
 * Format out-of-stock notification message
 * @param {Object} product - Product object
 * @param {Object} admin - Admin object with contact info
 * @returns {Object} Formatted notification
 */
function formatOutOfStockNotification(product, admin) {
  const message = `
🚨 URGENT: PRODUCT OUT OF STOCK 🚨

Product Details:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Product Name: ${product.name}
• Product ID: ${product._id}
• Category: ${product.category}
• Brand: ${product.brand || 'N/A'}
• Current Stock: ${product.stock}
• Price: ₹${product.price}

Action Required:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
This product is currently OUT OF STOCK and requires immediate attention.
Please restock as soon as possible to avoid lost sales.

Admin Contact:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Name: ${admin.name}
• Email: ${admin.email}
• Phone: ${admin.phoneNumber}

Timestamp: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`.trim();

  return {
    adminPhoneNumber: admin.phoneNumber,
    adminName: admin.name,
    adminEmail: admin.email,
    productName: product.name,
    productId: product._id,
    currentStock: product.stock,
    category: product.category,
    price: product.price,
    message: message,
    timestamp: new Date().toISOString(),
    formattedMessage: `Attention: The product "${product.name}" is currently out of stock. Immediate action is required. Contact Admin: ${admin.name} at ${admin.phoneNumber}`
  };
}

/**
 * Check if product is out of stock and get notification
 * @param {String} productId - Product ID to check
 * @returns {Promise<Object|null>} Notification object or null
 */
async function checkProductStockAndNotify(productId) {
  try {
    // 1. Check product inventory status
    const product = await Product.findById(productId).lean();
    
    if (!product) {
      return {
        error: true,
        message: 'Product not found',
        productId
      };
    }

    // 2. If product is IN STOCK, return early
    if (product.stock > 0 || product.inStock) {
      return {
        inStock: true,
        productName: product.name,
        currentStock: product.stock,
        message: `Product "${product.name}" is in stock with ${product.stock} units available.`
      };
    }

    // 3. Product is OUT OF STOCK - retrieve admin contact
    const admin = await getPrimaryAdminContact();
    
    if (!admin) {
      return {
        error: true,
        outOfStock: true,
        productName: product.name,
        message: 'Product is out of stock but no admin contact information available.',
        details: {
          productId: product._id,
          productName: product.name,
          category: product.category,
          currentStock: product.stock
        }
      };
    }

    // 4. Format notification message
    const notification = formatOutOfStockNotification(product, admin);
    
    return {
      outOfStock: true,
      notification,
      adminPhoneNumber: admin.phoneNumber,
      message: notification.formattedMessage
    };

  } catch (error) {
    console.error('❌ Error checking product stock:', error);
    return {
      error: true,
      message: 'Server error while checking product stock',
      errorDetails: error.message
    };
  }
}

/**
 * Get all out-of-stock products with admin notification
 * @returns {Promise<Object>} All out-of-stock products with admin contact
 */
async function getAllOutOfStockNotifications() {
  try {
    // 1. Get all out-of-stock products
    const outOfStockProducts = await Product.find(
      { $or: [{ stock: 0 }, { inStock: false }] }
    ).lean();

    if (outOfStockProducts.length === 0) {
      return {
        outOfStockCount: 0,
        message: 'All products are currently in stock.',
        products: []
      };
    }

    // 2. Get admin contact
    const admin = await getPrimaryAdminContact();
    
    if (!admin) {
      return {
        error: true,
        outOfStockCount: outOfStockProducts.length,
        message: 'Products are out of stock but no admin contact available.',
        products: outOfStockProducts.map(p => ({
          id: p._id,
          name: p.name,
          category: p.category,
          stock: p.stock
        }))
      };
    }

    // 3. Format notifications for all products
    const notifications = outOfStockProducts.map(product => 
      formatOutOfStockNotification(product, admin)
    );

    return {
      outOfStockCount: outOfStockProducts.length,
      adminPhoneNumber: admin.phoneNumber,
      adminName: admin.name,
      adminEmail: admin.email,
      notifications,
      summary: `${outOfStockProducts.length} product(s) are out of stock. Admin contact: ${admin.name} at ${admin.phoneNumber}`
    };

  } catch (error) {
    console.error('❌ Error getting out-of-stock notifications:', error);
    return {
      error: true,
      message: 'Server error while fetching out-of-stock products',
      errorDetails: error.message
    };
  }
}

module.exports = {
  getAdminContacts,
  getPrimaryAdminContact,
  formatOutOfStockNotification,
  checkProductStockAndNotify,
  getAllOutOfStockNotifications
};
