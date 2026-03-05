/**
 * Image Serving Route
 * ────────────────────
 * GET /api/images/:id   — stream an image from MongoDB GridFS by its ObjectId
 *
 * Images are stored in the "productImages" GridFS bucket (see config/gridfs.js).
 * The URL is designed to be a drop-in replacement for the old
 * /uploads/products/<filename> static file serving.
 */
const express  = require('express');
const router   = express.Router();
const mongoose = require('mongoose');
const { getBucket } = require('../config/gridfs');

/* ─────────────────────────────────────────────────────────────────────────────
   GET /api/images/:id
   Public – stream image bytes from GridFS; heavy browser / CDN caching enabled
───────────────────────────────────────────────────────────────────────────── */
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  // Validate ObjectId before touching the DB
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, msg: 'Invalid image id' });
  }

  try {
    const bucket  = getBucket();
    const fileId  = new mongoose.Types.ObjectId(id);

    // Look up file metadata so we can set Content-Type correctly
    const files = await bucket.find({ _id: fileId }).toArray();
    if (!files || files.length === 0) {
      return res.status(404).json({ success: false, msg: 'Image not found' });
    }
    const file = files[0];

    // ETag for conditional requests (avoids re-streaming unchanged images)
    const etag = `"${file._id.toString()}-${file.length}"`;
    if (req.headers['if-none-match'] === etag) {
      return res.status(304).end();
    }

    // Cache for 30 days in browsers / intermediate caches
    res.set('Content-Type',  file.contentType || 'image/jpeg');
    res.set('Content-Length', file.length);
    res.set('Cache-Control',  'public, max-age=2592000, immutable');
    res.set('Last-Modified',  file.uploadDate.toUTCString());
    res.set('ETag', etag);
    // Prevent compression middleware from buffering image streams
    res.set('x-no-compression', 'true');

    // Stream from GridFS → response
    const downloadStream = bucket.openDownloadStream(fileId);
    downloadStream.on('error', (err) => {
      console.error('GridFS stream error:', err.message);
      if (!res.headersSent) {
        res.status(500).json({ success: false, msg: 'Failed to stream image' });
      }
    });
    downloadStream.pipe(res);

  } catch (error) {
    console.error('❌ Image serve error:', error);
    res.status(500).json({ success: false, msg: 'Server error' });
  }
});

module.exports = router;
