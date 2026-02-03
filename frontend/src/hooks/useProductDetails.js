/**
 * ============================================
 * USE PRODUCT DETAILS HOOK
 * ============================================
 * 
 * React hook for managing product detail state
 * Includes caching, error handling, and prefetching
 * 
 * @version 1.0.0
 * @date January 5, 2026
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  fetchProductById, 
  fetchRelatedProducts,
  prefetchProduct,
  clearCacheEntry 
} from '../services/productService';

/**
 * Hook for fetching and managing product details
 * @param {string} productId - Product ID to fetch
 * @param {object} options - Configuration options
 * @returns {object} - Product data and utility functions
 */
export function useProductDetails(productId, options = {}) {
  const {
    fetchRelated = true,
    prefetchImages = true,
    onError = null,
    onSuccess = null
  } = options;

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  
  const isMounted = useRef(true);
  const abortController = useRef(null);

  // Fetch product details
  const fetchProduct = useCallback(async (forceRefresh = false) => {
    if (!productId) return;

    try {
      setLoading(true);
      setError(null);

      // Clear cache if force refresh
      if (forceRefresh) {
        clearCacheEntry(`/api/products/${productId}`);
      }

      // Create abort controller for cleanup
      abortController.current = new AbortController();

      const productData = await fetchProductById(productId);

      if (!isMounted.current) return;

      setProduct(productData);
      setImagesLoaded(false);

      // Prefetch images
      if (prefetchImages && productData) {
        const images = [productData.imageUrl, ...(productData.images || [])].filter(Boolean);
        Promise.all(
          images.map(img => {
            return new Promise((resolve) => {
              const image = new Image();
              image.onload = resolve;
              image.onerror = resolve; // Don't fail on image errors
              image.src = img;
            });
          })
        ).then(() => {
          if (isMounted.current) {
            setImagesLoaded(true);
          }
        });
      }

      // Fetch related products
      if (fetchRelated && productData && productData.category) {
        const related = await fetchRelatedProducts(
          productData._id, 
          productData.category,
          4
        );
        
        if (isMounted.current) {
          setRelatedProducts(related);
        }
      }

      // Success callback
      if (onSuccess) {
        onSuccess(productData);
      }

    } catch (err) {
      if (!isMounted.current) return;
      
      console.error('Error fetching product:', err);
      setError(err.message);

      // Error callback
      if (onError) {
        onError(err);
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [productId, fetchRelated, prefetchImages, onSuccess, onError]);

  // Fetch on mount and when productId changes
  useEffect(() => {
    fetchProduct();

    return () => {
      isMounted.current = false;
      if (abortController.current) {
        abortController.current.abort();
      }
    };
  }, [fetchProduct]);

  // Refresh function
  const refresh = useCallback(() => {
    return fetchProduct(true);
  }, [fetchProduct]);

  // Prefetch related product
  const prefetchRelated = useCallback((relatedProductId) => {
    prefetchProduct(relatedProductId);
  }, []);

  return {
    product,
    relatedProducts,
    loading,
    error,
    imagesLoaded,
    refresh,
    prefetchRelated
  };
}

/**
 * Hook for managing product quick view state
 */
export function useProductQuickView() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const openQuickView = useCallback((product) => {
    setSelectedProduct(product);
    setIsOpen(true);
  }, []);

  const closeQuickView = useCallback(() => {
    setIsOpen(false);
    // Delay clearing product to allow for exit animation
    setTimeout(() => setSelectedProduct(null), 300);
  }, []);

  return {
    isOpen,
    selectedProduct,
    openQuickView,
    closeQuickView
  };
}

/**
 * Hook for managing product list with infinite scroll
 */
export function useProductList(initialFilters = {}) {
  const [products, setProducts] = useState([]);
  const [filters, setFilters] = useState(initialFilters);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [error, setError] = useState(null);

  const { fetchProducts } = require('../services/productService');

  const loadProducts = useCallback(async (resetPage = false) => {
    try {
      setLoading(true);
      setError(null);

      const currentPage = resetPage ? 1 : page;
      const data = await fetchProducts({
        ...filters,
        page: currentPage
      });

      setProducts(prev => resetPage ? data.products : [...prev, ...data.products]);
      setHasMore(currentPage < data.pagination.pages);
      setPage(resetPage ? 2 : page + 1);

    } catch (err) {
      console.error('Error loading products:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      loadProducts(false);
    }
  }, [loading, hasMore, loadProducts]);

  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPage(1);
    loadProducts(true);
  }, [loadProducts]);

  const reset = useCallback(() => {
    setFilters(initialFilters);
    setPage(1);
    setProducts([]);
    setHasMore(true);
    loadProducts(true);
  }, [initialFilters, loadProducts]);

  useEffect(() => {
    loadProducts(true);
  }, [filters]);

  return {
    products,
    loading,
    hasMore,
    error,
    filters,
    updateFilters,
    loadMore,
    reset
  };
}

export default useProductDetails;
