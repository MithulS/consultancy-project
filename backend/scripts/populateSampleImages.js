// Populate Sample Images - Download free stock photos for products
const https = require('https');
const http = require('http');
const fs = require('fs');
const fsPromises = require('fs').promises;
const path = require('path');

// Free stock image URLs (Unsplash provides free high-quality images)
const sampleImages = [
  {
    name: 'electrical.jpg',
    url: 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=800&q=80',
    description: 'Electrical components and wires'
  },
  {
    name: 'plumbing.jpg',
    url: 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=800&q=80',
    description: 'Plumbing pipes and fittings'
  },
  {
    name: 'tools.jpg',
    url: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800&q=80',
    description: 'Hardware tools'
  },
  {
    name: 'hardware.jpg',
    url: 'https://images.unsplash.com/photo-1581578017093-cd30ed2d9a8f?w=800&q=80',
    description: 'Screws, bolts, and hardware'
  },
  {
    name: 'lighting.jpg',
    url: 'https://images.unsplash.com/photo-1565694769816-f3c834d04abf?w=800&q=80',
    description: 'Light bulbs and fixtures'
  },
  {
    name: 'paint.jpg',
    url: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=800&q=80',
    description: 'Paint cans and supplies'
  },
  {
    name: 'heating.jpg',
    url: 'https://images.unsplash.com/photo-1545259741-2ea3ebf61fa3?w=800&q=80',
    description: 'Heating equipment'
  },
  {
    name: 'safety.jpg',
    url: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=800&q=80',
    description: 'Safety equipment'
  }
];

/**
 * Download image from URL to local file
 */
function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    
    console.log(`📥 Downloading: ${path.basename(filepath)}...`);
    
    protocol.get(url, (response) => {
      // Handle redirects
      if (response.statusCode === 301 || response.statusCode === 302) {
        downloadImage(response.headers.location, filepath)
          .then(resolve)
          .catch(reject);
        return;
      }
      
      if (response.statusCode !== 200) {
        reject(new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`));
        return;
      }
      
      const fileStream = fs.createWriteStream(filepath);
      
      response.pipe(fileStream);
      
      fileStream.on('finish', () => {
        fileStream.close();
        console.log(`✅ Downloaded: ${path.basename(filepath)}`);
        resolve();
      });
      
      fileStream.on('error', (err) => {
        fs.unlink(filepath).catch(() => {}); // Clean up partial file
        reject(err);
      });
      
    }).on('error', (err) => {
      reject(err);
    });
  });
}

/**
 * Main function to populate sample images
 */
async function populateSampleImages() {
  console.log('\n' + '='.repeat(70));
  console.log('📸 SAMPLE IMAGES DOWNLOAD SCRIPT');
  console.log('='.repeat(70) + '\n');

  try {
    // Ensure upload directory exists
    const uploadDir = path.join(__dirname, '../uploads/products');
    
    console.log('📁 Checking uploads directory...');
    await fsPromises.mkdir(uploadDir, { recursive: true });
    console.log(`✅ Directory ready: ${uploadDir}\n`);

    // Check existing files
    const existingFiles = await fsPromises.readdir(uploadDir);
    const existingImages = existingFiles.filter(f => /\.(jpg|jpeg|png|gif|webp)$/i.test(f));
    
    if (existingImages.length > 0) {
      console.log(`📋 Existing images: ${existingImages.length}`);
      existingImages.forEach(f => console.log(`   - ${f}`));
      console.log('');
    }

    console.log('🌐 Downloading sample images from Unsplash...\n');
    console.log('💡 Using free high-quality stock photos');
    console.log('📜 Attribution: Unsplash (https://unsplash.com)\n');

    let successCount = 0;
    let failCount = 0;

    for (const image of sampleImages) {
      try {
        const filepath = path.join(uploadDir, image.name);
        
        // Check if file already exists
        try {
          await fsPromises.access(filepath);
          console.log(`⏭️  Skipped: ${image.name} (already exists)`);
          successCount++;
          continue;
        } catch {
          // File doesn't exist, proceed with download
        }
        
        await downloadImage(image.url, filepath);
        
        // Verify file was created
        const stats = await fsPromises.stat(filepath);
        const sizeKB = (stats.size / 1024).toFixed(2);
        console.log(`   Size: ${sizeKB} KB`);
        console.log(`   Description: ${image.description}\n`);
        
        successCount++;
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (error) {
        console.error(`❌ Failed: ${image.name}`);
        console.error(`   Error: ${error.message}\n`);
        failCount++;
      }
    }

    // Summary
    console.log('='.repeat(70));
    console.log('📊 DOWNLOAD SUMMARY');
    console.log('='.repeat(70));
    console.log(`✅ Successfully downloaded/verified: ${successCount} images`);
    console.log(`❌ Failed downloads: ${failCount} images`);
    
    // List final directory contents
    const finalFiles = await fsPromises.readdir(uploadDir);
    const finalImages = finalFiles.filter(f => /\.(jpg|jpeg|png|gif|webp)$/i.test(f));
    console.log(`\n📸 Total images in directory: ${finalImages.length}`);
    
    if (finalImages.length > 0) {
      console.log('\n📋 Available images:');
      finalImages.forEach(f => console.log(`   - ${f}`));
    }

    console.log('\n💡 NEXT STEPS:');
    console.log('   1. Run: node scripts/updateProductImages.js');
    console.log('      → Update product database with these images');
    console.log('   2. Start backend: npm run dev');
    console.log('   3. Test image access: http://localhost:5000/uploads/products/electrical.jpg\n');

    console.log('✨ Sample images populated successfully!\n');

  } catch (error) {
    console.error('\n❌ Error:', error);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Run the script
populateSampleImages();
