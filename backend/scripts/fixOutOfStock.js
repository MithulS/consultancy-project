// Fix all products where stock=0 but inStock=true
require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/product');
const connectDB = require('../config/db');

async function fixProducts() {
  try {
    await connectDB();
    console.log('\n🔍 Finding products with incorrect inStock values...\n');
    
    // Find all products where stock is 0 but inStock is true
    const brokenProducts = await Product.find({ stock: 0, inStock: true });
    
    console.log(`Found ${brokenProducts.length} product(s) with stock=0 but inStock=true\n`);
    
    if (brokenProducts.length === 0) {
      console.log('✅ All products are correct!\n');
      process.exit(0);
    }
    
    // Fix each product
    for (const product of brokenProducts) {
      console.log(`🔧 Fixing: ${product.name}`);
      console.log(`   Before: stock=${product.stock}, inStock=${product.inStock}`);
      
      product.inStock = false;
      await product.save();
      
      console.log(`   After:  stock=${product.stock}, inStock=${product.inStock}`);
      console.log(`   ✅ Fixed!\n`);
    }
    
    console.log('='.repeat(60));
    console.log(`✅ Successfully fixed ${brokenProducts.length} product(s)!`);
    console.log('='.repeat(60) + '\n');
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
}

fixProducts();
