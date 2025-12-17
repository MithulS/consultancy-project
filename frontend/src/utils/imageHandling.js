
const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * Helper function to get full image URL
 * Handles absolute URLs (http/https) and relative paths (appends API URL)
 */
export const getImageUrl = (imageUrl) => {
    if (!imageUrl) return 'https://placehold.co/300x300?text=No+Image';

    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
        return imageUrl;
    }

    // Ensure we don't double slash if API ends with / and imageUrl starts with /
    const baseUrl = API.endsWith('/') ? API.slice(0, -1) : API;
    const path = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`;

    return `${baseUrl}${path}`;
};
