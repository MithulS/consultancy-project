// Cloudinary configuration for image storage
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

/**
 * Upload image to Cloudinary
 * @param {string} filePath - Local file path
 * @param {object} options - Upload options
 * @returns {Promise<object>} - Upload result with secure_url
 */
const uploadToCloudinary = async (filePath, options = {}) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: options.folder || 'products',
      transformation: [
        {
          width: options.width || 1200,
          height: options.height || 1200,
          crop: 'limit',
          quality: 'auto:good',
          fetch_format: 'auto' // Automatically use WebP if supported
        }
      ],
      ...options
    });

    return {
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Delete image from Cloudinary
 * @param {string} publicId - Cloudinary public ID
 * @returns {Promise<object>} - Deletion result
 */
const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return {
      success: result.result === 'ok',
      result: result.result
    };
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Get optimized image URL with transformations
 * @param {string} publicId - Cloudinary public ID
 * @param {object} options - Transformation options
 * @returns {string} - Transformed image URL
 */
const getOptimizedUrl = (publicId, options = {}) => {
  return cloudinary.url(publicId, {
    width: options.width || 800,
    height: options.height || 800,
    crop: options.crop || 'fill',
    quality: options.quality || 'auto',
    fetch_format: 'auto',
    secure: true
  });
};

/**
 * Generate responsive image URLs
 * @param {string} publicId - Cloudinary public ID
 * @returns {object} - Object with different sizes
 */
const getResponsiveUrls = (publicId) => {
  return {
    thumbnail: getOptimizedUrl(publicId, { width: 150, height: 150 }),
    small: getOptimizedUrl(publicId, { width: 400, height: 400 }),
    medium: getOptimizedUrl(publicId, { width: 800, height: 800 }),
    large: getOptimizedUrl(publicId, { width: 1200, height: 1200 }),
    original: cloudinary.url(publicId, { secure: true })
  };
};

module.exports = {
  cloudinary,
  uploadToCloudinary,
  deleteFromCloudinary,
  getOptimizedUrl,
  getResponsiveUrls
};
