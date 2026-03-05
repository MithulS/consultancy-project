// Script to generate tracking numbers for existing orders that don't have one
const mongoose = require('mongoose');
require('dotenv').config();
const Order = require('../models/order');

async function generateTrackingNumbers() {
  await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
  
  const ordersNoTracking = await Order.find({
    $or: [
      { trackingNumber: null },
      { trackingNumber: '' },
      { trackingNumber: { $exists: false } }
    ]
  });
  
  console.log('Orders without tracking numbers:', ordersNoTracking.length);
  
  for (const order of ordersNoTracking) {
    const prefix = 'TRK';
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    const trackingNumber = `${prefix}${timestamp}${random}`;
    
    order.trackingNumber = trackingNumber;
    if (!order.trackingHistory || order.trackingHistory.length === 0) {
      order.trackingHistory = [{
        status: 'pending',
        location: 'Order System',
        description: 'Order placed successfully',
        timestamp: order.createdAt || new Date(),
        updatedBy: order.user
      }];
    }
    
    await order.save();
    console.log('  Order', order._id.toString(), '-> Tracking:', trackingNumber);
    
    // Small delay to ensure unique timestamps
    await new Promise(resolve => setTimeout(resolve, 50));
  }
  
  console.log('Done! Generated tracking numbers for', ordersNoTracking.length, 'orders');
  await mongoose.disconnect();
}

generateTrackingNumbers().catch(e => { console.error(e); process.exit(1); });
