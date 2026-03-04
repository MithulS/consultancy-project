/**
 * Migrate product images from local disk → MongoDB GridFS
 * ─────────────────────────────────────────────────────────
 * Reads every JPG/PNG in  backend/uploads/products/
 * Optimises with Sharp
 * Uploads to the "productImages" GridFS bucket
 * Updates each Product document so imageUrl = "/api/images/:id"
 *
 * Run once:
 *   cd backend
 *   node scripts/migrateImagesToMongoDB.js
 *
 * Safe to re-run – products already pointing at /api/images/… are skipped.
 */

require('dotenv').config();
const mongoose = require('mongoose');
const path     = require('path');
const fs       = require('fs');
const sharp    = require('sharp');
const Product  = require('../models/product');

const LOCAL_DIR = path.join(__dirname, '../uploads/products');
const BUCKET    = 'productImages';

/* ── helpers ──────────────────────────────────────────────────────────────── */
function saveToGridFS(bucket, buffer, filename) {
  return new Promise((resolve, reject) => {
    const stream = bucket.openUploadStream(filename, { contentType: 'image/jpeg' });
    stream.end(buffer);
    stream.on('finish', () => resolve(stream.id));
    stream.on('error',  reject);
  });
}

/* ── main ─────────────────────────────────────────────────────────────────── */
async function migrate() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅  Connected to MongoDB\n');

  const db     = mongoose.connection.db;
  const bucket = new mongoose.mongo.GridFSBucket(db, { bucketName: BUCKET });

  // Load all products
  const products = await Product.find({}).select('_id name imageUrl');
  console.log(`📦  ${products.length} products found\n`);

  // Build a map: filename → [product doc]  (multiple products can share a file)
  const filenameToProducts = new Map();
  for (const p of products) {
    if (!p.imageUrl) continue;
    const fname = path.basename(p.imageUrl);
    if (!filenameToProducts.has(fname)) filenameToProducts.set(fname, []);
    filenameToProducts.get(fname).push(p);
  }

  // List local image files
  let files = [];
  try {
    files = fs.readdirSync(LOCAL_DIR).filter(f => /\.(jpe?g|png|gif|webp)$/i.test(f));
  } catch {
    console.error(`❌  Directory not found: ${LOCAL_DIR}`);
    console.error('   Run the server at least once so uploads/products/ is created.\n');
    process.exit(1);
  }

  console.log(`🖼️   ${files.length} local image files found\n`);

  let migrated = 0, skipped = 0, noProduct = 0, errors = 0;

  for (const filename of files) {
    const matchingProducts = filenameToProducts.get(filename) || [];

    // Skip if ALL products for this file already point at GridFS
    const allAlreadyMigrated = matchingProducts.length > 0 &&
      matchingProducts.every(p => p.imageUrl && p.imageUrl.startsWith('/api/images/'));

    if (allAlreadyMigrated) {
      console.log(`⏭️   Already in GridFS: ${filename}`);
      skipped += matchingProducts.length;
      continue;
    }

    const localPath = path.join(LOCAL_DIR, filename);

    try {
      // Optimise with Sharp
      const optimisedBuffer = await sharp(localPath)
        .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 85, progressive: true })
        .toBuffer();

      // Upload to GridFS
      const fileId   = await saveToGridFS(bucket, optimisedBuffer, filename);
      const imageUrl = `/api/images/${fileId}`;

      if (matchingProducts.length === 0) {
        console.log(`⚠️   No product references: ${filename} → stored as ${fileId} (orphan)`);
        noProduct++;
        continue;
      }

      // Update all products that used this filename
      for (const p of matchingProducts) {
        await Product.findByIdAndUpdate(p._id, { imageUrl });
        console.log(`✅  ${p.name}\n    ${imageUrl}`);
        migrated++;
      }

    } catch (err) {
      console.error(`❌  Failed: ${filename} — ${err.message}`);
      errors++;
    }
  }

  // Handle products whose imageUrl file doesn't exist on disk
  for (const [fname, prods] of filenameToProducts) {
    for (const p of prods) {
      if (p.imageUrl && p.imageUrl.startsWith('/api/images/')) continue; // done
      const localPath = path.join(LOCAL_DIR, fname);
      if (!fs.existsSync(localPath)) {
        console.warn(`⚠️   Disk file missing for: ${p.name} (${p.imageUrl})`);
        errors++;
      }
    }
  }

  console.log(`\n${'─'.repeat(60)}`);
  console.log(`✅  Migrated    : ${migrated} products`);
  console.log(`⏭️   Skipped     : ${skipped} (already in GridFS)`);
  console.log(`🔍  Orphan files: ${noProduct}`);
  console.log(`❌  Errors      : ${errors}`);
  console.log(`${'─'.repeat(60)}\n`);

  await mongoose.disconnect();
  console.log('🏁  Done. All product imageUrls now point to /api/images/:id');
  console.log('   You can delete uploads/products/ once you have confirmed everything works.');
}

migrate().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
