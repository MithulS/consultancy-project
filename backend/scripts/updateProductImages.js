// Update Product Images - Replace placeholder URLs with uploaded images
require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/product');
const path = require('path');
const fs = require('fs').promises;

async function updateProductImages() {
  console.log('\n' + '='.repeat(70));
  console.log('🔄 PRODUCT IMAGE URL UPDATE SCRIPT');
  console.log('='.repeat(70) + '\n');

  try {
    // Connect to database
    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get all image files in uploads directory
    const uploadsDir = path.join(__dirname, '../uploads/products');
    
    let imageFiles = [];
    try {
      const files = await fs.readdir(uploadsDir);
      imageFiles = files.filter(f => /\.(jpg|jpeg|png|gif|webp)$/i.test(f));
      console.log(`📸 Found ${imageFiles.length} images in uploads directory`);
      
      if (imageFiles.length === 0) {
        console.log('\n⚠️  No images found in uploads directory!');
        console.log('💡 Run "node scripts/populateSampleImages.js" first\n');
        await mongoose.connection.close();
        return;
      }
    } catch (err) {
      console.log('\n❌ Error reading uploads directory:', err.message);
      console.log('💡 Ensure backend/uploads/products/ exists\n');
      await mongoose.connection.close();
      return;
    }

    // Category to image mapping
    const categoryImageMap = {
      'Electrical': ['electrical.jpg', 'wire.jpg', 'switch.jpg'],
      'Plumbing': ['plumbing.jpg', 'pipe.jpg', 'valve.jpg'],
      'Hardware': ['hardware.jpg', 'screw.jpg', 'nail.jpg'],
      'Tools': ['tools.jpg', 'hammer.jpg', 'drill.jpg'],
      'Lighting': ['lighting.jpg', 'bulb.jpg', 'lamp.jpg'],
      'Paints': ['paint.jpg', 'brush.jpg', 'roller.jpg'],
      'Heating': ['heating.jpg', 'radiator.jpg', 'heater.jpg'],
      'Safety': ['safety.jpg', 'helmet.jpg', 'gloves.jpg'],
      'Accessories': ['hardware.jpg', 'accessories.jpg']
    };

    // Get products that need updating
    const productsToUpdate = await Product.find({
      $or: [
        { imageUrl: { $regex: /placeholder|placehold/i } },
        { imageUrl: { $regex: /^https?:\/\/(via\.placeholder|placehold\.co)/ } },
        { imageUrl: '' },
        { imageUrl: null }
      ]
    });

    console.log(`\n🔍 Found ${productsToUpdate.length} products with placeholder images\n`);

    if (productsToUpdate.length === 0) {
      console.log('✅ All products already have proper image URLs!\n');
      await mongoose.connection.close();
      return;
    }

    let updated = 0;
    let skipped = 0;

    // Helper function to find suitable image for category
    function findImageForCategory(category, imageFiles) {
      const candidates = categoryImageMap[category] || categoryImageMap['Hardware'];
      
      for (const candidate of candidates) {
        if (imageFiles.includes(candidate)) {
          return candidate;
        }
      }
      
      // Fallback: use any available image
      return imageFiles[0];
    }

    // Update each product
    for (const product of productsToUpdate) {
      const imageName = findImageForCategory(product.category, imageFiles);
      
      if (!imageName) {
        console.log(`⚠️  Skipped: ${product.name} (no image available)`);
        skipped++;
        continue;
      }

      const oldUrl = product.imageUrl;
      const newUrl = `/uploads/products/${imageName}`;
      
      product.imageUrl = newUrl;
      product.imageAltText = `${product.name} - ${product.category} product from HomeHardware`;
      
      await product.save();
      
      console.log(`✅ Updated: ${product.name}`);
      console.log(`   Old: ${oldUrl}`);
      console.log(`   New: ${newUrl}\n`);
      
      updated++;
    }

    console.log('='.repeat(70));
    console.log('📊 UPDATE SUMMARY');
    console.log('='.repeat(70));
    console.log(`✅ Successfully updated: ${updated} products`);
    console.log(`⚠️  Skipped: ${skipped} products`);
    console.log(`📸 Available images: ${imageFiles.length}`);
    
    // Final verification
    const remainingPlaceholders = await Product.countDocuments({
      imageUrl: { $regex: /placeholder|placehold/i }
    });
    
    console.log(`\n🔍 Products still with placeholders: ${remainingPlaceholders}`);
    
    if (remainingPlaceholders === 0) {
      console.log('🎉 All products now have proper image URLs!\n');
    }

    await mongoose.connection.close();
    console.log('👋 Database connection closed\n');

  } catch (error) {
    console.error('\n❌ Error during update:', error);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Run the update
updateProductImages();
