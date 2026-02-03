/**
 * ============================================
 * PRODUCT DATA SERVICE
 * ============================================
 * 
 * Optimized data fetching with:
 * - In-memory caching
 * - Request deduplication
 * - Lazy loading
 * - Error handling
 * - Performance monitoring
 * 
 * @version 1.0.0
 * @date January 5, 2026
 */

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// In-memory cache
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Pending requests map to prevent duplicate fetches
const pendingRequests = new Map();

/**
 * Generic fetch wrapper with caching
 */
async function fetchWithCache(url, options = {}) {
  const cacheKey = `${url}${JSON.stringify(options)}`;
  
  // Check cache first
  if (cache.has(cacheKey)) {
    const cached = cache.get(cacheKey);
    if (Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log('📦 Cache hit:', url);
      return cached.data;
    } else {
      // Remove expired cache
      cache.delete(cacheKey);
    }
  }

  // Check for pending request
  if (pendingRequests.has(cacheKey)) {
    console.log('⏳ Waiting for pending request:', url);
    return pendingRequests.get(cacheKey);
  }

  // Create new request
  const requestPromise = (async () => {
    try {
      console.log('🌐 Fetching:', url);
      const startTime = performance.now();
      
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const endTime = performance.now();
      
      console.log(`✅ Fetch complete (${Math.round(endTime - startTime)}ms):`, url);

      // Cache the result
      cache.set(cacheKey, {
        data,
        timestamp: Date.now()
      });

      return data;
    } catch (error) {
      console.error('❌ Fetch error:', url, error);
      throw error;
    } finally {
      // Remove from pending requests
      pendingRequests.delete(cacheKey);
    }
  })();

  // Store pending request
  pendingRequests.set(cacheKey, requestPromise);

  return requestPromise;
}

/**
 * Fetch product by ID
 */
export async function fetchProductById(productId) {
  if (!productId) {
    throw new Error('Product ID is required');
  }

  const data = await fetchWithCache(`${API}/api/products/${productId}`);
  
  if (!data.success) {
    throw new Error(data.msg || 'Failed to fetch product');
  }

  return data.product;
}

/**
 * Fetch products with filters
 */
export async function fetchProducts(filters = {}) {
  const {
    category,
    minPrice,
    maxPrice,
    search,
    sort = '-createdAt',
    page = 1,
    limit = 12,
    featured
  } = filters;

  const params = new URLSearchParams();
  
  if (category && category !== 'All') params.append('category', category);
  if (minPrice) params.append('minPrice', minPrice);
  if (maxPrice) params.append('maxPrice', maxPrice);
  if (search) params.append('search', search);
  if (sort) params.append('sort', sort);
  if (page) params.append('page', page);
  if (limit) params.append('limit', limit);
  if (featured) params.append('featured', 'true');

  const url = `${API}/api/products${params.toString() ? `?${params.toString()}` : ''}`;
  const data = await fetchWithCache(url);

  if (!data.success) {
    throw new Error(data.msg || 'Failed to fetch products');
  }

  return {
    products: data.products,
    pagination: data.pagination
  };
}

/**
 * Fetch related products
 */
export async function fetchRelatedProducts(productId, category, limit = 4) {
  const data = await fetchProducts({
    category,
    limit: limit + 1 // Fetch one extra to filter out current product
  });

  // Filter out the current product
  const relatedProducts = data.products.filter(p => p._id !== productId).slice(0, limit);
  
  return relatedProducts;
}

/**
 * Prefetch product data for faster loading
 */
export function prefetchProduct(productId) {
  // Fire and forget - don't wait for result
  fetchProductById(productId).catch(err => {
    console.warn('Prefetch failed for product:', productId, err);
  });
}

/**
 * Prefetch multiple products
 */
export function prefetchProducts(productIds) {
  productIds.forEach(id => prefetchProduct(id));
}

/**
 * Clear cache (useful for forcing refresh)
 */
export function clearCache() {
  cache.clear();
  pendingRequests.clear();
  console.log('🗑️ Cache cleared');
}

/**
 * Clear specific cache entry
 */
export function clearCacheEntry(url) {
  const keysToDelete = [];
  
  cache.forEach((value, key) => {
    if (key.includes(url)) {
      keysToDelete.push(key);
    }
  });

  keysToDelete.forEach(key => cache.delete(key));
  console.log(`🗑️ Cleared ${keysToDelete.length} cache entries for:`, url);
}

/**
 * Get cache statistics
 */
export function getCacheStats() {
  const stats = {
    totalEntries: cache.size,
    pendingRequests: pendingRequests.size,
    entries: []
  };

  cache.forEach((value, key) => {
    const age = Date.now() - value.timestamp;
    const expired = age > CACHE_DURATION;
    
    stats.entries.push({
      key,
      age: Math.round(age / 1000), // seconds
      expired
    });
  });

  return stats;
}

/**
 * Lazy load product images
 */
export function lazyLoadImage(imageUrl) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      resolve(imageUrl);
    };
    
    img.onerror = () => {
      reject(new Error(`Failed to load image: ${imageUrl}`));
    };
    
    img.src = imageUrl;
  });
}

/**
 * Batch fetch products (optimized for multiple IDs)
 */
export async function batchFetchProducts(productIds) {
  const promises = productIds.map(id => 
    fetchProductById(id).catch(err => {
      console.warn(`Failed to fetch product ${id}:`, err);
      return null;
    })
  );

  const results = await Promise.all(promises);
  return results.filter(Boolean); // Filter out failed fetches
}

// Export for debugging
if (import.meta.env.DEV) {
  window.__productCache__ = cache;
  window.__pendingRequests__ = pendingRequests;
  window.__getCacheStats__ = getCacheStats;
  window.__clearCache__ = clearCache;
}

export default {
  fetchProductById,
  fetchProducts,
  fetchRelatedProducts,
  prefetchProduct,
  prefetchProducts,
  clearCache,
  clearCacheEntry,
  getCacheStats,
  lazyLoadImage,
  batchFetchProducts
};
