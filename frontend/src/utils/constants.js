// Shared constants for the HomeHardware e-commerce platform
// This ensures consistency across admin panel and user-facing pages

/**
 * Product Categories
 * Used across:
 * - Backend Product model validation
 * - Admin Dashboard product form
 * - User Dashboard category filters
 * - Product listing and filtering
 */
export const PRODUCT_CATEGORIES = [
  'Electrical',
  'Plumbing',
  'Hardware',
  'Tools',
  'Lighting',
  'Paints',
  'Heating',
  'Safety',
  'Accessories'
];

/**
 * Category display names with icons for UI
 */
export const CATEGORY_CONFIG = {
  'Electrical': { icon: '⚡', description: 'Wiring, switches, outlets, and electrical components' },
  'Plumbing': { icon: '🚿', description: 'Pipes, fittings, fixtures, and plumbing supplies' },
  'Hardware': { icon: '🔩', description: 'Screws, bolts, nails, and fasteners' },
  'Tools': { icon: '🔨', description: 'Hand tools, power tools, and equipment' },
  'Lighting': { icon: '💡', description: 'Light fixtures, bulbs, and lighting accessories' },
  'Paints': { icon: '🎨', description: 'Paint, brushes, rollers, and painting supplies' },
  'Heating': { icon: '🔥', description: 'Heaters, HVAC, and temperature control' },
  'Safety': { icon: '🦺', description: 'Safety gear, protective equipment, and supplies' },
  'Accessories': { icon: '🛠️', description: 'Miscellaneous hardware and accessories' }
};

/**
 * Order statuses for order tracking system
 */
export const ORDER_STATUSES = [
  'pending',
  'confirmed',
  'processing',
  'packed',
  'shipped',
  'out_for_delivery',
  'delivered',
  'cancelled',
  'returned'
];

/**
 * Order status display configuration
 */
export const ORDER_STATUS_CONFIG = {
  pending: { label: 'Pending', color: '#FFA500', icon: '⏳' },
  confirmed: { label: 'Confirmed', color: '#4CAF50', icon: '✅' },
  processing: { label: 'Processing', color: '#2196F3', icon: '⚙️' },
  packed: { label: 'Packed', color: '#9C27B0', icon: '📦' },
  shipped: { label: 'Shipped', color: '#00BCD4', icon: '🚚' },
  out_for_delivery: { label: 'Out for Delivery', color: '#FF9800', icon: '🚛' },
  delivered: { label: 'Delivered', color: '#4CAF50', icon: '✅' },
  cancelled: { label: 'Cancelled', color: '#F44336', icon: '❌' },
  returned: { label: 'Returned', color: '#9E9E9E', icon: '↩️' }
};

/**
 * Payment methods
 */
export const PAYMENT_METHODS = [
  'COD', // Cash on Delivery
  'GPay' // Google Pay
];

/**
 * User roles
 */
export const USER_ROLES = {
  ADMIN: 'admin',
  CUSTOMER: 'customer'
};

/**
 * API endpoints base URL
 */
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * Application settings
 */
export const APP_CONFIG = {
  name: 'HomeHardware',
  tagline: 'Quality Hardware & Home Improvement',
  supportEmail: 'support@homehardware.com',
  currency: '₹',
  defaultProductImage: 'https://via.placeholder.com/300x300?text=No+Image'
};

/**
 * Generate accessible alt text for product images
 * Follows WCAG 2.1 Level AA guidelines
 * Maximum 75 characters for optimal screen reader experience
 * 
 * @param {Object} product - Product object
 * @returns {string} Alt text (max 75 chars)
 */
export const generateProductAltText = (product) => {
  if (!product) return 'Product image';
  
  const parts = [];
  
  // Product name (essential)
  if (product.name) {
    parts.push(product.name);
  }
  
  // Brand (if available and space permits)
  if (product.brand && parts.join(' ').length < 45) {
    parts.push(`by ${product.brand}`);
  }
  
  // Price (essential for shopping context)
  if (product.price) {
    parts.push(`₹${product.price}`);
  }
  
  // Stock status (important for availability)
  if (product.stock !== undefined) {
    if (product.stock === 0) {
      parts.push('Out of stock');
    } else if (product.stock < 10) {
      parts.push(`${product.stock} left`);
    } else if (product.inStock) {
      parts.push('In stock');
    }
  }
  
  // Combine and truncate to 75 characters
  let altText = parts.join(', ');
  if (altText.length > 75) {
    altText = altText.substring(0, 72) + '...';
  }
  
  return altText || 'Product image';
};

/**
 * Generate detailed alt text for admin dashboard
 * Includes all product details for management context
 * 
 * @param {Object} product - Product object
 * @returns {string} Detailed alt text
 */
export const generateAdminAltText = (product) => {
  if (!product) return 'Product thumbnail';
  
  const parts = [];
  
  if (product.name) parts.push(product.name);
  if (product.brand) parts.push(product.brand);
  if (product.category) parts.push(product.category);
  if (product.price) parts.push(`₹${product.price}`);
  if (product.originalPrice) parts.push(`was ₹${product.originalPrice}`);
  if (product.stock !== undefined) {
    parts.push(`Stock: ${product.stock}`);
  }
  
  let altText = parts.join(' - ');
  if (altText.length > 125) {
    altText = altText.substring(0, 122) + '...';
  }
  
  return altText || 'Product thumbnail';
};
