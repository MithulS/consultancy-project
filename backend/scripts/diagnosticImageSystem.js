// Image System Diagnostics - Run this to identify image display issues
require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/product');
const path = require('path');
const fs = require('fs').promises;
const http = require('http');

async function runDiagnostics() {
  console.log('\n' + '='.repeat(70));
  console.log('🔍 IMAGE SYSTEM DIAGNOSTIC REPORT');
  console.log('='.repeat(70) + '\n');

  const issues = [];
  const warnings = [];
  const successes = [];

  try {
    // 1. Check Uploads Directory
    console.log('📁 STEP 1: Checking Uploads Directory...');
    const uploadsDir = path.join(__dirname, '../uploads/products');
    
    try {
      await fs.access(uploadsDir);
      console.log('✅ Directory exists:', uploadsDir);
      successes.push('Uploads directory exists');
      
      const files = await fs.readdir(uploadsDir);
      const imageFiles = files.filter(f => /\.(jpg|jpeg|png|gif|webp)$/i.test(f));
      
      console.log(`📸 Image files found: ${imageFiles.length}`);
      
      if (imageFiles.length === 0) {
        issues.push('❌ CRITICAL: No image files in uploads directory');
        console.log('❌ No image files found!');
      } else {
        console.log('✅ Images present:');
        imageFiles.slice(0, 5).forEach(f => console.log(`   - ${f}`));
        if (imageFiles.length > 5) {
          console.log(`   ... and ${imageFiles.length - 5} more`);
        }
        successes.push(`${imageFiles.length} image files present`);
      }
    } catch (err) {
      issues.push('❌ CRITICAL: Uploads directory does not exist');
      console.log('❌ Directory missing!');
    }

    console.log('');

    // 2. Check Database Connection
    console.log('💾 STEP 2: Checking Database Connection...');
    
    try {
      await mongoose.connect(process.env.MONGO_URI);
      console.log('✅ Connected to MongoDB');
      successes.push('Database connection successful');
    } catch (err) {
      issues.push('❌ CRITICAL: Cannot connect to MongoDB');
      console.log('❌ Database connection failed:', err.message);
      return;
    }

    console.log('');

    // 3. Analyze Product Image URLs
    console.log('🗂️  STEP 3: Analyzing Product Image URLs...');
    
    const totalProducts = await Product.countDocuments();
    console.log(`📊 Total products: ${totalProducts}`);
    
    if (totalProducts === 0) {
      warnings.push('⚠️  No products in database');
      console.log('⚠️  No products found!');
    } else {
      // Count by URL type
      const placeholderCount = await Product.countDocuments({
        imageUrl: { $regex: /placeholder|placehold/i }
      });
      
      const uploadedCount = await Product.countDocuments({
        imageUrl: { $regex: /^\/uploads\// }
      });
      
      const externalCount = await Product.countDocuments({
        imageUrl: { $regex: /^https?:\/\// }
      });
      
      console.log(`   📌 Placeholder URLs: ${placeholderCount}`);
      console.log(`   📁 Uploaded files: ${uploadedCount}`);
      console.log(`   🌐 External URLs: ${externalCount}`);
      
      if (placeholderCount === totalProducts) {
        issues.push('❌ CRITICAL: All products use placeholder images');
      } else if (placeholderCount > 0) {
        warnings.push(`⚠️  ${placeholderCount} products still use placeholders`);
      }
      
      if (uploadedCount > 0) {
        successes.push(`${uploadedCount} products have uploaded images`);
      }
      
      // Sample product URLs
      console.log('\n   📋 Sample Product URLs:');
      const samples = await Product.find().limit(5).select('name imageUrl');
      samples.forEach(p => {
        const status = p.imageUrl.includes('placeholder') ? '❌' : 
                      p.imageUrl.startsWith('/uploads/') ? '✅' : '🌐';
        console.log(`   ${status} ${p.name}: ${p.imageUrl}`);
      });
    }

    console.log('');

    // 4. Check Backend Configuration
    console.log('⚙️  STEP 4: Checking Backend Configuration...');
    
    const indexPath = path.join(__dirname, '../index.js');
    const indexContent = await fs.readFile(indexPath, 'utf-8');
    
    const hasStaticMiddleware = indexContent.includes("app.use('/uploads'") || 
                                 indexContent.includes('express.static');
    const hasUploadRoute = indexContent.includes("/api/upload");
    const hasCORS = indexContent.includes('cors');
    
    console.log(`   ${hasStaticMiddleware ? '✅' : '❌'} Static file serving configured`);
    console.log(`   ${hasUploadRoute ? '✅' : '❌'} Upload route registered`);
    console.log(`   ${hasCORS ? '✅' : '❌'} CORS middleware present`);
    
    if (!hasStaticMiddleware) {
      issues.push('❌ CRITICAL: Static file middleware not configured');
    }
    if (!hasUploadRoute) {
      issues.push('❌ CRITICAL: Upload route not registered');
    }
    
    console.log('');

    // 5. Test Upload Route Exists
    console.log('🛤️  STEP 5: Checking Upload Route...');
    
    const uploadRoutePath = path.join(__dirname, '../routes/upload.js');
    try {
      await fs.access(uploadRoutePath);
      console.log('✅ Upload route file exists');
      successes.push('Upload route implemented');
    } catch {
      issues.push('❌ CRITICAL: Upload route file missing');
      console.log('❌ Upload route file not found');
    }

    console.log('');

    // 6. Environment Variables
    console.log('🔐 STEP 6: Checking Environment Variables...');
    
    const envVars = [
      { name: 'MONGO_URI', value: process.env.MONGO_URI },
      { name: 'PORT', value: process.env.PORT || '5000 (default)' },
      { name: 'CLIENT_URL', value: process.env.CLIENT_URL || 'not set' },
      { name: 'NODE_ENV', value: process.env.NODE_ENV || 'development (default)' }
    ];
    
    envVars.forEach(({ name, value }) => {
      const isSet = value && value !== 'not set';
      console.log(`   ${isSet ? '✅' : '⚠️ '} ${name}: ${isSet ? '***SET***' : 'NOT SET'}`);
    });

    console.log('');

    // 7. File Permissions (Windows-specific check)
    console.log('🔒 STEP 7: Checking Directory Permissions...');
    
    try {
      const testFile = path.join(uploadsDir, '.test-write');
      await fs.writeFile(testFile, 'test');
      await fs.unlink(testFile);
      console.log('✅ Write permissions OK');
      successes.push('Directory has write permissions');
    } catch (err) {
      issues.push('❌ CRITICAL: Cannot write to uploads directory');
      console.log('❌ Write permission denied');
    }

    console.log('');

    // Close database connection
    await mongoose.connection.close();

  } catch (error) {
    console.error('❌ Diagnostic failed:', error);
    issues.push(`❌ FATAL: ${error.message}`);
  }

  // Summary Report
  console.log('\n' + '='.repeat(70));
  console.log('📊 DIAGNOSTIC SUMMARY');
  console.log('='.repeat(70) + '\n');

  if (successes.length > 0) {
    console.log('✅ SUCCESSES:');
    successes.forEach(s => console.log(`   ${s}`));
    console.log('');
  }

  if (warnings.length > 0) {
    console.log('⚠️  WARNINGS:');
    warnings.forEach(w => console.log(`   ${w}`));
    console.log('');
  }

  if (issues.length > 0) {
    console.log('❌ CRITICAL ISSUES:');
    issues.forEach(i => console.log(`   ${i}`));
    console.log('');
  }

  // Recommendations
  console.log('💡 RECOMMENDATIONS:\n');

  if (issues.some(i => i.includes('No image files'))) {
    console.log('   1. Run: node scripts/populateSampleImages.js');
    console.log('      → Downloads sample hardware images');
  }

  if (issues.some(i => i.includes('placeholder images'))) {
    console.log('   2. Run: node scripts/updateProductImages.js');
    console.log('      → Updates product URLs to use uploaded images');
  }

  if (issues.some(i => i.includes('Static file middleware'))) {
    console.log('   3. Add to index.js:');
    console.log("      app.use('/uploads', express.static('uploads'));");
  }

  if (issues.length === 0 && warnings.length === 0) {
    console.log('   🎉 System looks healthy! Images should be displaying correctly.');
  }

  console.log('\n' + '='.repeat(70));
  console.log('✨ Diagnostic Complete!');
  console.log('='.repeat(70) + '\n');
}

// Run diagnostics
runDiagnostics().catch(console.error);
