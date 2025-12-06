// Example Output Generator - Shows exact format as requested
require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/product');
const User = require('../models/user');

async function generateExampleOutput() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    console.log('\n' + '='.repeat(80));
    console.log('📋 OUT-OF-STOCK NOTIFICATION - EXAMPLE OUTPUT');
    console.log('='.repeat(80) + '\n');

    // Example admin
    const exampleAdmin = {
      name: 'Store Manager',
      email: 'admin@electrostore.com',
      phoneNumber: '+91-9876543210'
    };

    // Example out-of-stock product
    const exampleProduct = {
      _id: '674fd1234567890abcdef123',
      name: 'PlayStation 5',
      category: 'Gaming',
      brand: 'Sony',
      stock: 0,
      price: 49999
    };

    // Generate formatted output as per task requirements
    console.log('━'.repeat(80));
    console.log('FORMATTED OUTPUT (As Per Task Requirements):');
    console.log('━'.repeat(80));
    console.log('');
    console.log(`Admin Phone Number: ${exampleAdmin.phoneNumber}`);
    console.log('');
    console.log(`Message: "Attention: The product ${exampleProduct.name} is currently out of stock. Immediate action is required. Contact Admin: ${exampleAdmin.name} at ${exampleAdmin.phoneNumber}"`);
    console.log('');
    console.log('━'.repeat(80));
    console.log('');

    // Additional detailed notification
    console.log('DETAILED NOTIFICATION MESSAGE:');
    console.log('━'.repeat(80));
    console.log('');
    console.log('🚨 URGENT: PRODUCT OUT OF STOCK 🚨');
    console.log('');
    console.log('Product Details:');
    console.log('━'.repeat(80));
    console.log(`• Product Name: ${exampleProduct.name}`);
    console.log(`• Product ID: ${exampleProduct._id}`);
    console.log(`• Category: ${exampleProduct.category}`);
    console.log(`• Brand: ${exampleProduct.brand}`);
    console.log(`• Current Stock: ${exampleProduct.stock}`);
    console.log(`• Price: ₹${exampleProduct.price.toLocaleString('en-IN')}`);
    console.log('');
    console.log('Action Required:');
    console.log('━'.repeat(80));
    console.log('This product is currently OUT OF STOCK and requires immediate attention.');
    console.log('Please restock as soon as possible to avoid lost sales.');
    console.log('');
    console.log('Admin Contact:');
    console.log('━'.repeat(80));
    console.log(`• Name: ${exampleAdmin.name}`);
    console.log(`• Email: ${exampleAdmin.email}`);
    console.log(`• Phone: ${exampleAdmin.phoneNumber}`);
    console.log('');
    console.log(`Timestamp: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`);
    console.log('━'.repeat(80));
    console.log('');

    // JSON format (for API response)
    console.log('JSON FORMAT (For API Integration):');
    console.log('━'.repeat(80));
    console.log(JSON.stringify({
      adminPhoneNumber: exampleAdmin.phoneNumber,
      message: `Attention: The product ${exampleProduct.name} is currently out of stock. Immediate action is required. Contact Admin: ${exampleAdmin.name} at ${exampleAdmin.phoneNumber}`,
      details: {
        adminName: exampleAdmin.name,
        adminEmail: exampleAdmin.email,
        productName: exampleProduct.name,
        productId: exampleProduct._id,
        category: exampleProduct.category,
        currentStock: exampleProduct.stock,
        price: exampleProduct.price,
        timestamp: new Date().toISOString()
      }
    }, null, 2));
    console.log('');
    console.log('━'.repeat(80));
    console.log('');

    console.log('✅ Example output generated successfully!');
    console.log('');
    console.log('💡 To get real data, use:');
    console.log('   node scripts/demonstrateNotifications.js');
    console.log('');
    console.log('📚 For complete documentation, see:');
    console.log('   - OUT_OF_STOCK_NOTIFICATION_SYSTEM.md');
    console.log('   - QUICK_START_NOTIFICATIONS.md');
    console.log('   - IMPLEMENTATION_SUMMARY.md');
    console.log('');
    console.log('='.repeat(80) + '\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

generateExampleOutput();
