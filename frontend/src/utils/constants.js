// Shared constants for Sri Amman Traders e-commerce platform
// Trusted hardware, electrical, plumbing, and paint materials store

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
  'Paints & Coatings',
  'Pipes & Fittings',
  'Wiring & Cables',
  'Switches & Sockets',
  'Water Tanks',
  'Tools & Equipment',
  'Safety & Protection'
];

/**
 * Category display names with icons for UI
 * Sri Amman Traders - Genuine branded products
 */
export const CATEGORY_CONFIG = {
  'Electrical': { icon: '⚡', description: 'Electrical components, MCBs, distribution boards from Havells, Anchor', placeholder: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&h=400&fit=crop' },
  'Plumbing': { icon: '🚿', description: 'Quality plumbing fixtures, faucets, and sanitary ware', placeholder: 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=400&h=400&fit=crop' },
  'Hardware': { icon: '🔩', description: 'Screws, bolts, fasteners, and general hardware items', placeholder: 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=400&h=400&fit=crop' },
  'Paints & Coatings': { icon: '🎨', description: 'Asian Paints, emulsions, enamels, primers, and painting accessories', placeholder: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=400&h=400&fit=crop' },
  'Pipes & Fittings': { icon: '🔄', description: 'Finolex pipes, PVC fittings, couplers, and connectors', placeholder: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=400&h=400&fit=crop' },
  'Wiring & Cables': { icon: '🔌', description: 'Finolex wires and cables for residential and commercial use', placeholder: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop' },
  'Switches & Sockets': { icon: '💡', description: 'Anchor, Havells switches, sockets, and modular accessories', placeholder: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop' },
  'Water Tanks': { icon: '💧', description: 'Sintex water tanks, storage solutions, and overhead tanks', placeholder: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400&h=400&fit=crop' },
  'Tools & Equipment': { icon: '🔨', description: 'Quality hand tools and power tools for professionals', placeholder: 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=400&h=400&fit=crop' },
  'Safety & Protection': { icon: '🦺', description: 'Safety gear, MCBs from Crompton, surge protectors', placeholder: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=400&h=400&fit=crop' }
};

/**
 * Featured Brands at Sri Amman Traders
 * Genuine products from trusted manufacturers
 */
export const FEATURED_BRANDS = [
  {
    name: 'Finolex',
    category: 'Wiring & Pipes',
    logo: '🔌',
    description: 'Premium wires, cables, and PVC pipes'
  },
  {
    name: 'Crompton',
    category: 'Electrical',
    logo: '⚡',
    description: 'Quality fans, lighting, and electrical solutions'
  },
  {
    name: 'Asian Paints',
    category: 'Paints',
    logo: '🎨',
    description: 'India\'s leading paint manufacturer'
  },
  {
    name: 'Havells',
    category: 'Switches & Electricals',
    logo: '💡',
    description: 'Modular switches and electrical products'
  },
  {
    name: 'Anchor',
    category: 'Switches & Sockets',
    logo: '🔆',
    description: 'Trusted switches, sockets, and accessories'
  },
  {
    name: 'Sintex',
    category: 'Water Storage',
    logo: '💧',
    description: 'Durable water tanks and storage solutions'
  }
];

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
