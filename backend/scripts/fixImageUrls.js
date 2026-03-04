/**
 * Fix product imageUrls stored with a hardcoded localhost origin.
 * Strips "http://localhost:<port>" as well as "https://localhost:<port>"
 * so all imageUrls become clean relative paths like /uploads/products/...
 *
 * Run:  node scripts/fixImageUrls.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/product');

async function main() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB\n');

  const products = await Product.find({
    imageUrl: /^https?:\/\/localhost/,
  }).lean();

  console.log(`Found ${products.length} products with localhost imageUrl\n`);

  if (products.length === 0) {
    console.log('Nothing to fix.');
    return process.exit(0);
  }

  let updated = 0;
  for (const p of products) {
    const newUrl = p.imageUrl.replace(/^https?:\/\/localhost(:\d+)?/, '');
    await Product.updateOne({ _id: p._id }, { $set: { imageUrl: newUrl } });
    console.log(`Fixed: ${p.name.slice(0, 45).padEnd(45)} → ${newUrl}`);
    updated++;
  }

  console.log(`\nTotal fixed: ${updated} products`);
  await mongoose.connection.close();
  process.exit(0);
}

main().catch(e => { console.error(e.message); process.exit(1); });
