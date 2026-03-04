/**
 * MongoDB GridFS helper
 * ─────────────────────
 * Exposes a lazy-initialised GridFSBucket (bucket name: "productImages").
 * Call getBucket() after mongoose has connected.
 *
 * Files stored here are served via GET /api/images/:id
 */
const mongoose = require('mongoose');

let _bucket = null;

/**
 * Return the shared GridFSBucket, creating it on first call.
 * Throws if the connection isn't ready yet.
 */
const getBucket = () => {
  if (!_bucket) {
    const db = mongoose.connection.db;
    if (!db) throw new Error('MongoDB connection not established – call getBucket() after connectDB()');
    _bucket = new mongoose.mongo.GridFSBucket(db, { bucketName: 'productImages' });
  }
  return _bucket;
};

// Reset the cached bucket whenever the connection drops so the next call
// creates a fresh one against the new session.
mongoose.connection.on('disconnected', () => { _bucket = null; });
mongoose.connection.on('reconnected',  () => { _bucket = null; });

module.exports = { getBucket };
