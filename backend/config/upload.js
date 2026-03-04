// File Upload Configuration - Secure image upload with validation
const multer = require('multer');
const path = require('path');

// ── Storage ──────────────────────────────────────────────────────────────────
// Use memory storage – the route handler will:
//   1. Run Sharp optimisation on the in-memory buffer
//   2. Save the result directly to MongoDB GridFS
//
// (disk-based storage was removed; the uploads/products directory is only kept
//  as a local backup during migration)
const storage = multer.memoryStorage();

// File filter - only allow image types
const fileFilter = (req, file, cb) => {
  // Allowed file extensions
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  // Allowed MIME types
  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/gif',
    'image/webp'
  ];
  
  console.log('📸 File upload attempt:', {
    filename: file.originalname,
    mimetype: file.mimetype,
    extension: ext
  });
  
  if (allowedExtensions.includes(ext) && allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type. Allowed formats: JPG, JPEG, PNG, GIF, WEBP. You uploaded: ${ext}`), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
    files: 1 // Only 1 file at a time
  }
});

module.exports = { upload };
