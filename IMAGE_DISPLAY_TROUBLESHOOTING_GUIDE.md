# 🖼️ Image Display Troubleshooting Guide
## Complete Diagnostic & Resolution Plan

**Issue:** Product images showing "No Image" placeholder despite upload system being implemented  
**Date:** December 15, 2025  
**Severity:** HIGH - Affects user experience and product presentation

---

## 📋 EXECUTIVE SUMMARY

### Root Cause Analysis

After comprehensive investigation, I've identified **THREE PRIMARY ISSUES** causing image display failures:

1. **🗂️ EMPTY UPLOADS DIRECTORY** - Critical  
   - Upload infrastructure exists but no product images are stored
   - Directory: `backend/uploads/products/` is completely empty
   - Products referencing placeholder URLs instead of actual uploads

2. **🔗 URL PATH MISMATCH** - High Priority  
   - Image URLs stored in database may not match server static file routes
   - Frontend `getImageUrl()` helper may be constructing incorrect paths
   - Backend serves static files from `/uploads` but products may have different paths

3. **💾 DATABASE RECORDS ISSUE** - Medium Priority  
   - Existing products likely still have placeholder URLs:
     - `https://via.placeholder.com/300x300?text=No+Image`
     - `https://placehold.co/300x300?text=No+Image`
   - Products created before upload feature wasn't saving uploaded image URLs

---

## 🔍 DETAILED DIAGNOSTIC FINDINGS

### 1. Backend Infrastructure Status ✅

**Upload System** (FULLY IMPLEMENTED):
- ✅ Multer configuration: `backend/config/upload.js`
- ✅ Upload routes: `backend/routes/upload.js` with Sharp processing
- ✅ Static file serving: `app.use('/uploads', express.static('uploads'))`
- ✅ Directory exists: `backend/uploads/products/` created
- ✅ Security: Admin-only access with JWT verification
- ✅ File validation: JPG, JPEG, PNG, GIF, WEBP (max 5MB)
- ✅ Image optimization: Sharp resizing to 1200x1200, 85% quality

**Upload Endpoint**:
```
POST http://localhost:5000/api/upload/image
Authorization: Bearer <adminToken>
Content-Type: multipart/form-data
Body: image file
```

**Expected Response**:
```json
{
  "success": true,
  "msg": "Image uploaded and optimized successfully",
  "imageUrl": "/uploads/products/product-1234567890-123456789.jpg",
  "filename": "product-1234567890-123456789.jpg"
}
```

### 2. Frontend Image Handling ✅

**Helper Function** (`frontend/src/utils/imageHandling.js`):
```javascript
export const getImageUrl = (imageUrl) => {
    if (!imageUrl) return 'https://placehold.co/300x300?text=No+Image';
    
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
        return imageUrl; // Absolute URL (placeholder or external)
    }
    
    // Relative path - prepend API URL
    const baseUrl = API.endsWith('/') ? API.slice(0, -1) : API;
    const path = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`;
    return `${baseUrl}${path}`;
};
```

**API Configuration**:
```javascript
const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';
```

**Image Rendering** (Dashboard.jsx):
```jsx
<img
  src={getImageUrl(product.imageUrl)}
  alt={generateProductAltText(product)}
  style={styles.productImage}
  onError={(e) => {
    e.target.src = 'https://placehold.co/300x300?text=No+Image';
  }}
/>
```

### 3. Database Product Model ✅

**Schema** (`backend/models/product.js`):
```javascript
imageUrl: {
  type: String,
  required: [true, 'Product image URL is required'],
  default: 'https://via.placeholder.com/300x300?text=No+Image'
},
imageAltText: {
  type: String,
  maxlength: [125, 'Alt text cannot exceed 125 characters']
},
images: [{
  type: String  // Additional product images
}]
```

### 4. Admin Upload Integration ✅

**Admin Dashboard** (`frontend/src/components/AdminDashboard.jsx`):
```javascript
async function uploadImage() {
  if (!imageFile) return null;
  
  setUploading(true);
  setUploadError('');
  
  try {
    const formData = new FormData();
    formData.append('image', imageFile);
    
    const token = localStorage.getItem('adminToken');
    const res = await fetch(`${API}/api/upload/image`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    });
    
    const data = await res.json();
    
    if (data.success) {
      return data.imageUrl; // Returns: "/uploads/products/filename.jpg"
    } else {
      setUploadError(data.msg);
      return null;
    }
  } catch (error) {
    setUploadError('Upload failed: ' + error.message);
    return null;
  } finally {
    setUploading(false);
  }
}
```

---

## 🚨 IDENTIFIED PROBLEMS

### Problem 1: No Physical Image Files ⚠️

**Symptom**: 
```powershell
PS> Get-ChildItem D:\consultancy\backend\uploads\products
# Result: (empty directory)
```

**Impact**: Even if products have correct URLs in database, files don't exist on server

**Why This Happens**:
1. Products created before upload feature was implemented
2. Admin used placeholder URLs instead of uploading images
3. Development database reset without re-uploading images
4. File system cleanup removed uploaded files

### Problem 2: Database Contains Placeholder URLs ⚠️

**Symptom**: Products in MongoDB have:
```javascript
imageUrl: "https://via.placeholder.com/300x300?text=No+Image"
// or
imageUrl: "https://placehold.co/300x300?text=No+Image"
```

**Impact**: Frontend correctly displays these placeholders, but no real product images

**How to Verify**:
```javascript
// Check one product in MongoDB
db.products.findOne({}, { name: 1, imageUrl: 1 })
```

### Problem 3: Potential URL Format Mismatch ⚠️

**Scenario A - Database URL**: `/uploads/products/file.jpg`  
**Backend serves from**: `http://localhost:5000/uploads/products/file.jpg`  
**Frontend constructs**: `http://localhost:5000/uploads/products/file.jpg` ✅ CORRECT

**Scenario B - Database URL**: `uploads/products/file.jpg` (missing leading `/`)  
**Frontend constructs**: `http://localhost:5000/uploads/products/file.jpg` ✅ CORRECT (helper adds `/`)

**Scenario C - Database URL**: `http://localhost:5000/uploads/products/file.jpg`  
**Frontend returns**: `http://localhost:5000/uploads/products/file.jpg` ✅ CORRECT (absolute URL)

**Conclusion**: URL handling logic is sound, but **files must exist** and **URLs must be correct in DB**

---

## 🛠️ COMPREHENSIVE SOLUTION PLAN

### PHASE 1: Diagnostic Verification (5 minutes)

#### Step 1.1: Check Current Product Data
```javascript
// Run in MongoDB shell or backend script
const Product = require('./backend/models/product');

// Count products
const totalProducts = await Product.countDocuments();
console.log('Total products:', totalProducts);

// Check how many use placeholders
const placeholderCount = await Product.countDocuments({
  imageUrl: { $regex: /placeholder|placehold/i }
});
console.log('Products with placeholders:', placeholderCount);

// Sample product image URLs
const sampleProducts = await Product.find({})
  .limit(10)
  .select('name imageUrl');
console.log('Sample products:', sampleProducts);
```

#### Step 1.2: Verify Server Static File Serving
```bash
# Terminal 1 - Start backend
cd backend
npm run dev

# Terminal 2 - Test static file serving
# This should work if backend is running
curl http://localhost:5000/uploads/products/test.jpg
# Expect: 404 (file not found) or 200 (if file exists)

# Check server logs for static middleware
# Should see: app.use('/uploads', express.static('uploads'))
```

#### Step 1.3: Test Upload Functionality
```javascript
// Use Postman or curl to test upload
// 1. Get admin token
POST http://localhost:5000/api/auth/admin-login
{
  "email": "admin@example.com",
  "password": "yourpassword",
  "secretKey": "your-secret-key"
}

// 2. Upload test image
POST http://localhost:5000/api/upload/image
Headers:
  Authorization: Bearer <token-from-step-1>
Body (form-data):
  image: <select-image-file>

// Expected response:
{
  "success": true,
  "imageUrl": "/uploads/products/test-1234567890-123456789.jpg"
}

// 3. Verify file was created
ls backend/uploads/products/
# Should see the uploaded file

// 4. Access uploaded image
GET http://localhost:5000/uploads/products/test-1234567890-123456789.jpg
# Should return the image
```

---

### PHASE 2: Quick Fix - Sample Product Images (15 minutes)

If uploads directory is empty, we need to populate it with sample images.

#### Option A: Download Sample Hardware Images

Create a script to download sample images from free stock photo sites:

```javascript
// backend/scripts/populateSampleImages.js
const fs = require('fs').promises;
const path = require('path');
const https = require('https');

const sampleImages = [
  {
    name: 'electrical.jpg',
    url: 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=800' // Electrical components
  },
  {
    name: 'plumbing.jpg',
    url: 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=800' // Pipes
  },
  {
    name: 'tools.jpg',
    url: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800' // Tools
  },
  {
    name: 'hardware.jpg',
    url: 'https://images.unsplash.com/photo-1581578017093-cd30ed2d9a8f?w=800' // Screws/bolts
  },
  {
    name: 'lighting.jpg',
    url: 'https://images.unsplash.com/photo-1565694769816-f3c834d04abf?w=800' // Light bulbs
  },
  {
    name: 'paint.jpg',
    url: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=800' // Paint
  },
  {
    name: 'heating.jpg',
    url: 'https://images.unsplash.com/photo-1545259741-2ea3ebf61fa3?w=800' // Radiator
  },
  {
    name: 'safety.jpg',
    url: 'https://images.unsplash.com/photo-1581578017093-cd30ed2d9a8f?w=800' // Safety gear
  }
];

async function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode === 200) {
        const fileStream = fs.createWriteStream(filepath);
        response.pipe(fileStream);
        fileStream.on('finish', () => {
          fileStream.close();
          resolve();
        });
      } else {
        reject(new Error(`Failed to download: ${response.statusCode}`));
      }
    }).on('error', reject);
  });
}

async function populateSampleImages() {
  const uploadDir = path.join(__dirname, '../uploads/products');
  
  // Ensure directory exists
  await fs.mkdir(uploadDir, { recursive: true });
  
  console.log('📸 Downloading sample images...\n');
  
  for (const image of sampleImages) {
    try {
      const filepath = path.join(uploadDir, image.name);
      await downloadImage(image.url, filepath);
      console.log(`✅ Downloaded: ${image.name}`);
    } catch (error) {
      console.error(`❌ Failed to download ${image.name}:`, error.message);
    }
  }
  
  console.log('\n✨ Sample images populated!');
}

populateSampleImages().catch(console.error);
```

Run the script:
```bash
cd backend
node scripts/populateSampleImages.js
```

#### Option B: Use Local Images

If you have product images:
```bash
# Copy images to uploads directory
cd backend
mkdir -p uploads/products
cp /path/to/your/images/* uploads/products/
```

---

### PHASE 3: Update Database with Correct Image URLs (10 minutes)

#### Step 3.1: Create Database Update Script

```javascript
// backend/scripts/updateProductImages.js
require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/product');
const path = require('path');
const fs = require('fs').promises;

async function updateProductImages() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');
    
    // Get all image files in uploads directory
    const uploadsDir = path.join(__dirname, '../uploads/products');
    const files = await fs.readdir(uploadsDir);
    const imageFiles = files.filter(f => /\.(jpg|jpeg|png|gif|webp)$/i.test(f));
    
    console.log(`📸 Found ${imageFiles.length} images in uploads directory\n`);
    
    // Get products by category
    const categories = ['Electrical', 'Plumbing', 'Hardware', 'Tools', 'Lighting', 'Paints', 'Heating', 'Safety', 'Accessories'];
    
    const categoryImageMap = {
      'Electrical': 'electrical.jpg',
      'Plumbing': 'plumbing.jpg',
      'Hardware': 'hardware.jpg',
      'Tools': 'tools.jpg',
      'Lighting': 'lighting.jpg',
      'Paints': 'paint.jpg',
      'Heating': 'heating.jpg',
      'Safety': 'safety.jpg',
      'Accessories': 'hardware.jpg' // Default
    };
    
    let updated = 0;
    
    for (const category of categories) {
      const products = await Product.find({ category });
      
      if (products.length === 0) continue;
      
      const imageName = categoryImageMap[category];
      const imageUrl = `/uploads/products/${imageName}`;
      
      // Update products in this category
      for (const product of products) {
        // Only update if currently using placeholder
        if (product.imageUrl.includes('placeholder') || product.imageUrl.includes('placehold')) {
          product.imageUrl = imageUrl;
          product.imageAltText = `${product.name} - ${category} hardware product`;
          await product.save();
          updated++;
          console.log(`✅ Updated: ${product.name} → ${imageUrl}`);
        }
      }
    }
    
    console.log(`\n🎉 Updated ${updated} products with real image URLs!`);
    
    // Show summary
    const placeholderCount = await Product.countDocuments({
      imageUrl: { $regex: /placeholder|placehold/i }
    });
    console.log(`📊 Products still with placeholders: ${placeholderCount}`);
    
    await mongoose.connection.close();
    console.log('👋 Database connection closed');
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

updateProductImages();
```

Run the script:
```bash
cd backend
node scripts/updateProductImages.js
```

---

### PHASE 4: Test Image Display (5 minutes)

#### Step 4.1: Verify Backend Serves Images

```bash
# Start backend server
cd backend
npm run dev

# In another terminal, test image access
curl -I http://localhost:5000/uploads/products/electrical.jpg
# Should return: HTTP/1.1 200 OK

# Or open in browser:
# http://localhost:5000/uploads/products/electrical.jpg
```

#### Step 4.2: Test Frontend Display

```bash
# Start frontend
cd frontend
npm run dev

# Open browser to: http://localhost:5173
# Navigate to dashboard
# Check if product images now display

# Open browser DevTools > Network tab
# Filter: Img
# Reload page
# Check if images load successfully (status 200)
```

#### Step 4.3: Check for Errors

**Browser Console Errors**:
```
❌ Failed to load resource: net::ERR_FILE_NOT_FOUND
   http://localhost:5000/uploads/products/some-image.jpg
   
✅ Fix: Ensure file exists in backend/uploads/products/
```

**CORS Errors**:
```
❌ Access to image blocked by CORS policy
   
✅ Fix: Already configured in backend/index.js
   app.use('/uploads', express.static('uploads'));
```

**404 Errors**:
```
❌ GET http://localhost:5000/uploads/products/image.jpg - 404
   
✅ Fix: Check filename matches exactly (case-sensitive)
```

---

### PHASE 5: Admin Upload Workflow Test (10 minutes)

#### Step 5.1: Test Complete Upload Flow

1. **Login as Admin**:
   ```
   Navigate to: http://localhost:5173/#secret-admin-login
   Email: admin@example.com
   Password: your-admin-password
   Secret Key: your-secret-key
   ```

2. **Add New Product**:
   - Click "Add Product" button
   - Fill in product details:
     - Name: "Test Electrical Wire"
     - Description: "High-quality electrical wire"
     - Price: 299
     - Category: Electrical
     - Stock: 50

3. **Upload Image**:
   - Click "📤 Upload from Device" button
   - Select JPG/PNG image (< 5MB)
   - Preview should appear instantly
   - Click "Save Product"

4. **Verify Upload**:
   ```bash
   # Check file was created
   ls backend/uploads/products/
   # Should see new file with timestamp

   # Check database entry
   # Product should have imageUrl: "/uploads/products/filename.jpg"
   ```

5. **View on Dashboard**:
   - Logout from admin
   - Login as regular user
   - Navigate to Dashboard
   - Product should display with uploaded image

---

## 🔧 TROUBLESHOOTING SPECIFIC SCENARIOS

### Scenario 1: Images Upload But Don't Display

**Symptoms**:
- Upload succeeds (200 OK)
- File exists in `backend/uploads/products/`
- Database has correct URL
- Frontend shows placeholder

**Diagnosis Steps**:

1. **Check exact database URL**:
   ```javascript
   const product = await Product.findOne({ name: 'Test Product' });
   console.log('Image URL:', product.imageUrl);
   // Expected: "/uploads/products/filename.jpg"
   ```

2. **Test direct access**:
   ```
   Open browser: http://localhost:5000/uploads/products/filename.jpg
   - If works: Frontend issue
   - If 404: Backend serving issue
   ```

3. **Check frontend API URL**:
   ```javascript
   // frontend/.env
   VITE_API_URL=http://localhost:5000
   
   // If not set, check import.meta.env.VITE_API_URL in browser console
   ```

4. **Verify getImageUrl() logic**:
   ```javascript
   // Test in browser console
   const imageUrl = "/uploads/products/test.jpg";
   const API = "http://localhost:5000";
   const fullUrl = `${API}${imageUrl}`;
   console.log(fullUrl);
   // Should output: http://localhost:5000/uploads/products/test.jpg
   ```

**Fix**:
```javascript
// If URL is incorrect, check frontend/src/utils/imageHandling.js
// Ensure it matches backend serving path

// Backend serves from:
app.use('/uploads', express.static('uploads'));

// Frontend should construct:
http://localhost:5000/uploads/products/filename.jpg
```

---

### Scenario 2: CORS Blocking Image Requests

**Symptoms**:
```
Access to image at 'http://localhost:5000/uploads/...' blocked by CORS policy
```

**Fix**: Update backend CORS config

```javascript
// backend/index.js
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));

// IMPORTANT: Static files middleware must be AFTER cors()
app.use('/uploads', express.static('uploads'));
```

---

### Scenario 3: Sharp Processing Fails

**Symptoms**:
```
❌ Image processing error: Input file is missing
```

**Cause**: Sharp can't process certain image formats or corrupted files

**Fix**:
```javascript
// backend/routes/upload.js
// Add better error handling

try {
  const imageInfo = await sharp(originalPath).metadata();
  console.log('📊 Image metadata:', imageInfo);
  
  if (!imageInfo.format || !['jpeg', 'jpg', 'png', 'webp', 'gif'].includes(imageInfo.format)) {
    throw new Error(`Unsupported image format: ${imageInfo.format}`);
  }
  
  await sharp(originalPath)
    .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 85, progressive: true })
    .toFile(optimizedPath);
    
} catch (processError) {
  console.error('❌ Sharp processing failed:', processError);
  
  // Fallback: Use original file without processing
  console.log('⚠️ Using original file without optimization');
  const imageUrl = `/uploads/products/${req.file.filename}`;
  return res.json({ success: true, imageUrl, msg: 'Uploaded (not optimized)' });
}
```

---

### Scenario 4: Images Display Inconsistently

**Symptoms**:
- Some products show images
- Others show placeholders
- Random pattern

**Diagnosis**:
```javascript
// Check which products have real vs placeholder URLs
const realImages = await Product.find({
  imageUrl: { $regex: /^\/uploads\// }
}).count();

const placeholders = await Product.find({
  imageUrl: { $regex: /placeholder|placehold/i }
}).count();

console.log(`Real images: ${realImages}, Placeholders: ${placeholders}`);
```

**Fix**: Run bulk update script (Phase 3) to ensure all products have proper URLs

---

## 📊 VERIFICATION CHECKLIST

After implementing fixes, verify each item:

### Backend Checklist
- [ ] `backend/uploads/products/` directory exists
- [ ] Directory contains image files (*.jpg, *.png, etc.)
- [ ] Server running on http://localhost:5000
- [ ] Static middleware configured: `app.use('/uploads', express.static('uploads'))`
- [ ] Upload route works: `POST /api/upload/image` returns imageUrl
- [ ] Direct access works: `GET /uploads/products/test.jpg` returns 200
- [ ] CORS allows frontend origin

### Database Checklist
- [ ] Products have imageUrl field populated
- [ ] URLs format: `/uploads/products/filename.jpg`
- [ ] No products with `placeholder` in imageUrl (or acceptable number)
- [ ] Sample query returns expected data:
  ```javascript
  db.products.findOne({}, { name: 1, imageUrl: 1 })
  ```

### Frontend Checklist
- [ ] `VITE_API_URL` env variable set correctly
- [ ] `getImageUrl()` helper constructs correct URLs
- [ ] Dashboard component imports `getImageUrl`
- [ ] Image tags use `getImageUrl(product.imageUrl)`
- [ ] onError handler provides fallback
- [ ] Browser DevTools > Network shows successful image loads (200)
- [ ] No console errors related to images
- [ ] Images visible on product cards

### Admin Panel Checklist
- [ ] Upload button present in add/edit product modal
- [ ] File picker opens on click
- [ ] Preview appears after file selection
- [ ] Upload progress indication works
- [ ] Success message shows uploaded imageUrl
- [ ] Saved product displays with uploaded image
- [ ] Image persists after page reload

---

## 🚀 PRODUCTION CONSIDERATIONS

### Before Going Live

1. **Image Storage Strategy**:
   - Local filesystem (current) ❌ Not scalable
   - Cloud storage (AWS S3, Cloudinary) ✅ Recommended
   
   ```javascript
   // Upgrade to Cloudinary
   const cloudinary = require('cloudinary').v2;
   
   cloudinary.config({
     cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
     api_key: process.env.CLOUDINARY_API_KEY,
     api_secret: process.env.CLOUDINARY_API_SECRET
   });
   
   // Upload to Cloudinary instead of local
   const result = await cloudinary.uploader.upload(req.file.path);
   const imageUrl = result.secure_url;
   ```

2. **CDN Configuration**:
   - Serve images through CDN (Cloudflare, AWS CloudFront)
   - Faster global delivery
   - Reduced server load

3. **Image Optimization**:
   - WebP format for modern browsers
   - Responsive images (multiple sizes)
   - Lazy loading

   ```jsx
   <img
     src={getImageUrl(product.imageUrl)}
     srcSet={`
       ${getImageUrl(product.imageUrl, 'small')} 300w,
       ${getImageUrl(product.imageUrl, 'medium')} 600w,
       ${getImageUrl(product.imageUrl, 'large')} 1200w
     `}
     sizes="(max-width: 600px) 300px, (max-width: 1200px) 600px, 1200px"
     loading="lazy"
     alt={product.imageAltText || product.name}
   />
   ```

4. **Backup Strategy**:
   ```bash
   # Automated daily backups
   #!/bin/bash
   DATE=$(date +%Y-%m-%d)
   tar -czf uploads-backup-$DATE.tar.gz backend/uploads/
   # Upload to S3 or external storage
   ```

5. **Monitoring**:
   - Track failed image loads
   - Monitor storage usage
   - Alert on upload errors

---

## 📞 SUPPORT & NEXT STEPS

### Immediate Actions (Priority Order)

1. **[5 min] Run Diagnostic** - Execute Phase 1 to understand current state
2. **[15 min] Populate Sample Images** - Use Phase 2 to get images in place
3. **[10 min] Update Database** - Run Phase 3 script to fix URLs
4. **[5 min] Test Display** - Verify Phase 4 works end-to-end
5. **[10 min] Test Admin Upload** - Ensure Phase 5 workflow succeeds

### If Issues Persist

**Get detailed diagnostic output**:
```bash
# Run comprehensive health check
cd backend
node -e "
const express = require('express');
const fs = require('fs');
const path = require('path');

console.log('🔍 IMAGE SYSTEM DIAGNOSTIC\n');
console.log('Backend Running:', process.env.PORT || 5000);

const uploadsDir = path.join(__dirname, 'uploads', 'products');
console.log('Uploads Directory:', uploadsDir);
console.log('Directory Exists:', fs.existsSync(uploadsDir));

if (fs.existsSync(uploadsDir)) {
  const files = fs.readdirSync(uploadsDir);
  console.log('Files in Directory:', files.length);
  files.forEach(f => console.log('  -', f));
}

console.log('\nEnvironment:');
console.log('  NODE_ENV:', process.env.NODE_ENV);
console.log('  MONGO_URI:', process.env.MONGO_URI ? 'Set' : 'Not set');
console.log('  CLIENT_URL:', process.env.CLIENT_URL);
"
```

**Check frontend configuration**:
```javascript
// In browser console
console.log('API URL:', import.meta.env.VITE_API_URL);
console.log('Sample image URL construction:');
const test = '/uploads/products/test.jpg';
console.log('Input:', test);
console.log('Output:', getImageUrl(test));
```

---

## 📚 ADDITIONAL RESOURCES

### Documentation References
- [Multer Documentation](https://github.com/expressjs/multer)
- [Sharp Image Processing](https://sharp.pixelplumbing.com/)
- [Express Static Files](https://expressjs.com/en/starter/static-files.html)
- [MongoDB Image Storage Best Practices](https://www.mongodb.com/basics/file-storage)

### Helpful Commands

```bash
# Check if images are accessible
curl -I http://localhost:5000/uploads/products/test.jpg

# List uploaded files with details
ls -lh backend/uploads/products/

# Check MongoDB product image URLs
mongosh "mongodb://localhost:27017/yourdb" --eval "db.products.find({}, {name:1, imageUrl:1}).limit(5)"

# Test image upload with curl
curl -X POST http://localhost:5000/api/upload/image \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "image=@/path/to/image.jpg"

# Monitor backend logs
tail -f backend/logs/server.log
```

---

## ✅ SUCCESS METRICS

### You'll know it's working when:

1. ✅ `ls backend/uploads/products/` shows image files
2. ✅ Browser can access `http://localhost:5000/uploads/products/image.jpg`
3. ✅ MongoDB products have URLs like `/uploads/products/filename.jpg`
4. ✅ Dashboard displays product images (not placeholders)
5. ✅ Admin upload workflow completes successfully
6. ✅ Browser DevTools > Network shows image requests with 200 status
7. ✅ No console errors related to images
8. ✅ New products retain images after page reload

---

**Document Version:** 1.0  
**Last Updated:** December 15, 2025  
**Status:** Ready for Implementation

For questions or issues during implementation, check the troubleshooting section or review backend logs for specific error messages.
