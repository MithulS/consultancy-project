
const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * Helper function to get full image URL.
 * - Relative paths: prepend the configured API base.
 * - localhost: rewrite to the configured API base so the app works in
 *   every environment (dev, staging, production).
 * - Any other absolute URL (Cloudinary, S3, Unsplash, …): return as-is.
 */
export const getImageUrl = (imageUrl) => {
    if (!imageUrl) return 'https://placehold.co/300x300?text=No+Image';

    const baseUrl = API.endsWith('/') ? API.slice(0, -1) : API;

    // Normalise URLs stored with a hardcoded localhost origin
    if (/^https?:\/\/localhost(:\d+)?/.test(imageUrl)) {
        const path = imageUrl.replace(/^https?:\/\/localhost(:\d+)?/, '');
        return `${baseUrl}${path}`;
    }

    // Leave external URLs (Cloudinary, S3, Unsplash …) untouched
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
        return imageUrl;
    }

    // Relative path — prepend the API base
    const path = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`;
    return `${baseUrl}${path}`;
};
