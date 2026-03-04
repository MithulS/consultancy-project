/**
 * Migrate all product images from local disk to Cloudinary.
 *
 * Prerequisites:
 *   1. Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
 *      to your .env file (free account at cloudinary.com → Settings → API Keys)
 *   2. npm install cloudinary   (already in package.json)
 *
 * Run:  node scripts/migrateToCloudinary.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

// ─── Validate Cloudinary credentials up front ───────────────────────────────
const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;
if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
  console.error('\n❌  Cloudinary credentials missing in .env\n');
  console.error('   Add these three lines to backend/.env:\n');
  console.error('   CLOUDINARY_CLOUD_NAME=your_cloud_name');
  console.error('   CLOUDINARY_API_KEY=your_api_key');
  console.error('   CLOUDINARY_API_SECRET=your_api_secret\n');
  console.error('   Get them free at: https://cloudinary.com → Settings → API Keys\n');
  process.exit(1);
}

const { uploadToCloudinary } = require('../config/cloudinary');
const Product = require('../models/product');

const LOCAL_UPLOAD_DIR = path.join(__dirname, '../uploads/products');
const CLOUDINARY_FOLDER = 'sri-amman-traders';

async function migrateImages() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅  Connected to MongoDB\n');

  const products = await Product.find({}).select('_id name imageUrl');
  console.log(`📦  Found ${products.length} products\n`);

  let migrated = 0, skipped = 0, errors = 0;

  for (const product of products) {
    const { _id, name, imageUrl } = product;

    // Already a Cloudinary URL → skip
    if (imageUrl && imageUrl.includes('cloudinary.com')) {
      console.log(`⏭️   Skipping (already Cloudinary): ${name}`);
      skipped++;
      continue;
    }

    // Derive local filename
    const filename = imageUrl ? path.basename(imageUrl) : null;
    const localPath = filename ? path.join(LOCAL_UPLOAD_DIR, filename) : null;

    if (!localPath || !fs.existsSync(localPath)) {
      console.error(`⚠️   File not found for: ${name} (${imageUrl})`);
      errors++;
      continue;
    }

    // Upload to Cloudinary
    const publicId = `${CLOUDINARY_FOLDER}/${path.parse(filename).name}`;
    const result = await uploadToCloudinary(localPath, {
      folder: CLOUDINARY_FOLDER,
      public_id: publicId,
      overwrite: true,
      width: 1200,
      height: 1200
    });

    if (!result.success) {
      console.error(`❌  Failed to upload ${name}: ${result.error}`);
      errors++;
      continue;
    }

    // Update DB with Cloudinary URL
    await Product.findByIdAndUpdate(_id, { imageUrl: result.url });
    console.log(`✅  ${name}\n    ${result.url}`);
    migrated++;
  }

  console.log(`\n${'─'.repeat(60)}`);
  console.log(`✅  Migrated : ${migrated}`);
  console.log(`⏭️   Skipped  : ${skipped}`);
  console.log(`❌  Errors   : ${errors}`);
  console.log(`${'─'.repeat(60)}\n`);

  await mongoose.disconnect();
  console.log('🏁  Done. All images are now served from Cloudinary.');
}

migrateImages().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
