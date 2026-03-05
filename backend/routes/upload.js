/**
 * Image Upload & Delete Routes - MongoDB GridFS storage
 * POST   /api/upload/image        Admin - upload + optimise -> GridFS
 * DELETE /api/upload/image/:id    Admin - delete from GridFS by ObjectId
 * Images served via GET /api/images/:id  (routes/images.js)
 */
const express   = require('express');
const router    = express.Router();
const sharp     = require('sharp');
const mongoose  = require('mongoose');
const { upload }      = require('../config/upload');
const authMiddleware  = require('../middleware/auth');
const { verifyAdmin } = require('../middleware/auth');
const { getBucket }   = require('../config/gridfs');

console.log('Image storage: MongoDB GridFS (productImages bucket)');

function saveToGridFS(buffer, filename, mimetype) {
  return new Promise((resolve, reject) => {
    const bucket = getBucket();
    const stream = bucket.openUploadStream(filename, { contentType: mimetype });
    stream.end(buffer);
    stream.on('finish', () => resolve(stream.id));
    stream.on('error',  reject);
  });
}

router.post('/image', authMiddleware, verifyAdmin, (req, res) => {
  upload.single('image')(req, res, async (err) => {
    try {
      if (err) {
        console.error('Upload error:', err.message);
        if (err.code === 'LIMIT_FILE_SIZE')
          return res.status(400).json({ success: false, msg: 'File too large. Maximum size is 5MB.', errorType: 'FILE_TOO_LARGE' });
        if (err.message.includes('Invalid file type'))
          return res.status(400).json({ success: false, msg: err.message, errorType: 'INVALID_FILE_TYPE' });
        return res.status(400).json({ success: false, msg: 'File upload failed: ' + err.message, errorType: 'UPLOAD_ERROR' });
      }
      if (!req.file)
        return res.status(400).json({ success: false, msg: 'No file uploaded. Please select an image.', errorType: 'NO_FILE' });

      let buf, meta;
      try {
        buf  = await sharp(req.file.buffer)
          .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
          .jpeg({ quality: 85, progressive: true })
          .toBuffer();
        meta = await sharp(buf).metadata();
      } catch (pe) {
        console.error('Image processing error:', pe.message);
        return res.status(422).json({ success: false, msg: 'Invalid or corrupted image file. Please upload a valid image.', errorType: 'INVALID_IMAGE' });
      }

      const safeName   = req.file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
      const uniqueName = Date.now() + '-' + safeName;
      const fileId     = await saveToGridFS(buf, uniqueName, 'image/jpeg');
      const imageUrl   = '/api/images/' + fileId;

      console.log('Saved to MongoDB GridFS:', fileId.toString());

      return res.json({
        success: true,
        msg: 'Image uploaded to MongoDB successfully',
        imageUrl,
        fileId: fileId.toString(),
        filename: uniqueName,
        dimensions: { width: meta.width, height: meta.height },
        size: buf.length
      });
    } catch (error) {
      console.error('Upload handler error:', error);
      res.status(500).json({ success: false, msg: 'Server error during upload', errorType: 'SERVER_ERROR' });
    }
  });
});

router.delete('/image/:dir/:file', authMiddleware, verifyAdmin, (_req, res) => {
  res.status(400).json({ success: false, msg: 'Invalid image id' });
});

router.delete('/image/:id', authMiddleware, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ success: false, msg: 'Invalid image id' });
    await getBucket().delete(new mongoose.Types.ObjectId(id));
    console.log('Deleted from GridFS:', id);
    res.json({ success: true, msg: 'Image deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    if (error.message && error.message.includes('File not found'))
      return res.status(404).json({ success: false, msg: 'Image not found' });
    res.status(500).json({ success: false, msg: 'Failed to delete image' });
  }
});

module.exports = router;