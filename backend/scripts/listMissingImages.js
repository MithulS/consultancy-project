// List Missing Images - Shows exact files that need to be restored
require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/product');
const path = require('path');
const fs = require('fs').promises;

async function listMissingImages() {
  console.log('\n' + '='.repeat(70));
  console.log('🔍 MISSING IMAGE FILES REPORT');
  console.log('='.repeat(70) + '\n');

  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get all products with uploaded image URLs
    const products = await Product.find({
      imageUrl: { $regex: /^\/uploads\// }
    }).select('name category imageUrl');

    console.log(`📊 Found ${products.length} products with uploaded images\n`);

    if (products.length === 0) {
      console.log('ℹ️  No products found with uploaded image URLs');
      console.log('   (All products may be using placeholders or external URLs)\n');
      await mongoose.connection.close();
      return;
    }

    const uploadsDir = path.join(__dirname, '../uploads/products');
    
    let existingCount = 0;
    let missingCount = 0;
    const missingFiles = [];

    console.log('🔎 Checking each product image file...\n');

    for (const product of products) {
      // Extract filename from URL
      const filename = product.imageUrl.split('/').pop();
      const filepath = path.join(uploadsDir, filename);

      try {
        await fs.access(filepath);
        console.log(`✅ EXISTS: ${product.name}`);
        console.log(`   File: ${filename}`);
        existingCount++;
      } catch {
        console.log(`❌ MISSING: ${product.name}`);
        console.log(`   URL: ${product.imageUrl}`);
        console.log(`   Expected: ${filepath}`);
        missingCount++;
        missingFiles.push({
          product: product.name,
          category: product.category,
          url: product.imageUrl,
          filename: filename,
          filepath: filepath
        });
      }
      console.log('');
    }

    // Summary
    console.log('='.repeat(70));
    console.log('📊 SUMMARY');
    console.log('='.repeat(70));
    console.log(`✅ Files exist: ${existingCount}`);
    console.log(`❌ Files missing: ${missingCount}`);
    console.log('');

    if (missingCount > 0) {
      console.log('📋 MISSING FILES LIST:\n');
      missingFiles.forEach((item, index) => {
        console.log(`${index + 1}. ${item.product} (${item.category})`);
        console.log(`   Filename: ${item.filename}`);
      });
      console.log('');

      console.log('💡 RECOVERY OPTIONS:\n');
      console.log('Option 1: Re-upload through Admin Dashboard');
      console.log('   - Login to: http://localhost:5173/#secret-admin-login');
      console.log('   - Edit each product and upload new image');
      console.log('');
      console.log('Option 2: Use sample stock photos');
      console.log('   - Run: node scripts/populateSampleImages.js');
      console.log('   - Run: node scripts/updateProductImages.js');
      console.log('');
      console.log('Option 3: Restore from backup (if available)');
      console.log('   - Copy files to: D:\\consultancy\\backend\\uploads\\products\\');
      console.log('   - Filenames must match exactly');
      console.log('');

      // Export missing files list
      const outputPath = path.join(__dirname, '../missing-images.json');
      await fs.writeFile(outputPath, JSON.stringify(missingFiles, null, 2));
      console.log(`📄 Detailed list exported to: ${outputPath}\n`);
    } else {
      console.log('🎉 All product images are present!\n');
    }

    await mongoose.connection.close();
    console.log('👋 Database connection closed\n');

  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  }
}

listMissingImages();
