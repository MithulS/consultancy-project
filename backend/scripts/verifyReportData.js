const mongoose = require('mongoose');
require('dotenv').config();
const db = require('../config/db');
const Order = require('../models/order');
const Product = require('../models/product');

(async () => {
  await db();
  
  // Get all orders this month
  const start = new Date(2026, 2, 1); // March 2026
  const end = new Date();
  
  const orders = await Order.find({ createdAt: { $gte: start, $lte: end } }).lean();
  console.log('=== ORDERS THIS MONTH ===');
  console.log('Total orders:', orders.length);
  
  orders.forEach((o, i) => {
    console.log('\nOrder', i+1, '- ID:', o._id);
    console.log('  Status:', o.status);
    console.log('  Payment Status:', o.paymentStatus);
    console.log('  Total Amount:', o.totalAmount);
    console.log('  Created:', o.createdAt);
    console.log('  Items:');
    o.items.forEach(item => {
      console.log('    Product:', item.product, '| Name:', item.name, '| Price:', item.price, '| Qty:', item.quantity);
    });
  });
  
  // Also check all orders (any date)
  const allOrders = await Order.find().lean();
  console.log('\n=== ALL ORDERS (ALL TIME) ===');
  console.log('Total orders:', allOrders.length);
  allOrders.forEach((o, i) => {
    console.log('\nOrder', i+1, '- Status:', o.status, '| Payment:', o.paymentStatus, '| Total:', o.totalAmount, '| Date:', o.createdAt);
    o.items.forEach(item => {
      console.log('    Product:', item.product, '| Name:', item.name, '| Price:', item.price, '| Qty:', item.quantity);
    });
  });
  
  // Get product stats
  const products = await Product.find().lean();
  console.log('\n=== PRODUCT STATS ===');
  console.log('Total products:', products.length);
  const totalStockValue = products.reduce((sum, p) => sum + (p.stock * p.price), 0);
  console.log('Total stock value:', totalStockValue.toFixed(2));
  const inStock = products.filter(p => p.stock > 0).length;
  const outOfStock = products.filter(p => p.stock === 0).length;
  const lowStock = products.filter(p => p.stock > 0 && p.stock <= 10).length;
  console.log('In Stock (>10):', inStock - lowStock);
  console.log('Low Stock (<=10):', lowStock);
  console.log('Out of Stock:', outOfStock);
  
  // Show all product names and prices
  console.log('\n=== ALL PRODUCTS ===');
  products.forEach((p, i) => {
    console.log((i+1) + '. ' + p.name + ' | Price: ' + p.price + ' | Stock: ' + p.stock + ' | StockVal: ' + (p.stock * p.price).toFixed(2) + ' | Category: ' + p.category);
  });
  
  process.exit(0);
})();
