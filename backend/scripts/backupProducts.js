// Product Backup Script - Creates JSON backup before deletion
require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/product');
const fs = require('fs');
const path = require('path');

async function backupProducts() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
    });

    console.log('✅ Connected to MongoDB');

    const products = await Product.find();
    const count = products.length;

    console.log(`📦 Found ${count} products to backup`);

    // Create backup directory if it doesn't exist
    const backupDir = path.join(__dirname, '../backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    // Generate timestamp for backup file
    const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
    const backupFile = path.join(backupDir, `products-backup-${timestamp}.json`);

    // Write backup file
    fs.writeFileSync(backupFile, JSON.stringify(products, null, 2));

    console.log(`✅ Backup created: ${backupFile}`);
    console.log(`📊 Backed up ${count} products`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Backup failed:', error);
    process.exit(1);
  }
}

backupProducts();
