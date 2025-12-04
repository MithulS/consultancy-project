// Image Upload Routes - Secure image upload with processing
const express = require('express');
const router = express.Router();
const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;
const { upload } = require('../config/upload');
const { verifyAdmin } = require('../middleware/auth');

/**
 * @route   POST /api/upload/image
 * @desc    Upload product image (admin only)
 * @access  Admin
 */
router.post('/image', verifyAdmin, (req, res) => {
  // Use multer middleware
  upload.single('image')(req, res, async (err) => {
    try {
      // Handle multer errors
      if (err) {
        console.error('❌ Upload error:', err.message);
        
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            msg: 'File too large. Maximum size is 5MB.',
            errorType: 'FILE_TOO_LARGE'
          });
        }
        
        if (err.message.includes('Invalid file type')) {
          return res.status(400).json({
            success: false,
            msg: err.message,
            errorType: 'INVALID_FILE_TYPE'
          });
        }
        
        return res.status(400).json({
          success: false,
          msg: 'File upload failed: ' + err.message,
          errorType: 'UPLOAD_ERROR'
        });
      }
      
      // Check if file was uploaded
      if (!req.file) {
        return res.status(400).json({
          success: false,
          msg: 'No file uploaded. Please select an image.',
          errorType: 'NO_FILE'
        });
      }
      
      console.log('✅ File uploaded:', req.file.filename);
      
      // Process image with Sharp for optimization and security
      const originalPath = req.file.path;
      const optimizedFilename = 'optimized-' + req.file.filename;
      const optimizedPath = path.join(path.dirname(originalPath), optimizedFilename);
      
      try {
        // Process image: resize if too large, optimize, strip metadata (security)
        const imageInfo = await sharp(originalPath)
          .resize(1200, 1200, {
            fit: 'inside',
            withoutEnlargement: true
          })
          .jpeg({ quality: 85, progressive: true })
          .toFile(optimizedPath);
        
        console.log('🎨 Image optimized:', {
          width: imageInfo.width,
          height: imageInfo.height,
          size: imageInfo.size
        });
        
        // Delete original file, keep optimized version
        await fs.unlink(originalPath);
        
        // Rename optimized file to original filename
        await fs.rename(optimizedPath, originalPath);
        
        // Return image URL
        const imageUrl = `/uploads/products/${req.file.filename}`;
        
        res.json({
          success: true,
          msg: 'Image uploaded and optimized successfully',
          imageUrl: imageUrl,
          filename: req.file.filename,
          size: imageInfo.size,
          dimensions: {
            width: imageInfo.width,
            height: imageInfo.height
          }
        });
        
      } catch (processError) {
        console.error('❌ Image processing error:', processError);
        
        // Delete uploaded file if processing fails
        try {
          await fs.unlink(originalPath);
        } catch (unlinkError) {
          console.error('Failed to delete file:', unlinkError);
        }
        
        return res.status(400).json({
          success: false,
          msg: 'Invalid or corrupted image file. Please upload a valid image.',
          errorType: 'INVALID_IMAGE'
        });
      }
      
    } catch (error) {
      console.error('❌ Upload handler error:', error);
      res.status(500).json({
        success: false,
        msg: 'Server error during upload',
        errorType: 'SERVER_ERROR'
      });
    }
  });
});

/**
 * @route   DELETE /api/upload/image/:filename
 * @desc    Delete product image (admin only)
 * @access  Admin
 */
router.delete('/image/:filename', verifyAdmin, async (req, res) => {
  try {
    const { filename } = req.params;
    
    // Validate filename (security check)
    if (!filename || filename.includes('..') || filename.includes('/')) {
      return res.status(400).json({
        success: false,
        msg: 'Invalid filename'
      });
    }
    
    const filePath = path.join(__dirname, '../uploads/products', filename);
    
    // Check if file exists
    try {
      await fs.access(filePath);
    } catch {
      return res.status(404).json({
        success: false,
        msg: 'File not found'
      });
    }
    
    // Delete file
    await fs.unlink(filePath);
    console.log('🗑️ File deleted:', filename);
    
    res.json({
      success: true,
      msg: 'Image deleted successfully'
    });
    
  } catch (error) {
    console.error('❌ Delete error:', error);
    res.status(500).json({
      success: false,
      msg: 'Failed to delete image'
    });
  }
});

module.exports = router;
