// Check product image URLs in database
require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/product');

async function checkImageUrls() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    const products = await Product.find({}, 'name imageUrl');
    
    console.log('📦 Products and their image URLs:\n');
    products.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name}`);
      console.log(`   ImageURL: ${product.imageUrl || '(none)'}`);
      console.log('');
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkImageUrls();
