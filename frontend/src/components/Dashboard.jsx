// Modern E-Commerce Dashboard - Product Showcase
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import AuthModal from './AuthModal';
import SmartButton from './SmartButton';
import Footer from './Footer';
import SkeletonLoader from './SkeletonLoader';
import ProductRating from './ProductRating';
import EmptyState from './EmptyState';
import SearchSuggestions from './SearchSuggestions';
import EnhancedSearchBar from './EnhancedSearchBar';
import OptimizedImage from './OptimizedImage';
import CartDrawer from './CartDrawer';
import PriceDisplay from './PriceDisplay';
import WishlistButton from './WishlistButton';
import ProductFilters from './ProductFilters';
import EnhancedProductCard from './EnhancedProductCard';
import RecentlyViewed, { addToRecentlyViewed } from './RecentlyViewed';
import QuickViewModal from './QuickViewModal';
import LoadingBar from './LoadingBar';
import analytics from '../utils/analytics';
import { PRODUCT_CATEGORIES, CATEGORY_CONFIG, generateProductAltText } from '../utils/constants';
const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';
import { getImageUrl } from '../utils/imageHandling';
import { useTheme } from '../hooks/useTheme';
import { 
  Container, 
  Header, 
  Logo, 
  Button, 
  SearchInput, 
  Grid, 
  ProductCard, 
  Price, 
  StockBadge, 
  Notification,
  LoadingContainer 
} from './StyledComponents';

// Inject CSS animations for modern UI
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  @keyframes slideDown {
    from { opacity: 0; transform: translateY(-20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes scaleIn {
    from { opacity: 0; transform: scale(0.95); }
    to { opacity: 1; transform: scale(1); }
  }
  @keyframes shimmer {
    0% { background-position: -1000px 0; }
    100% { background-position: 1000px 0; }
  }
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
  }
  @keyframes gradientFlow {
    0%, 100% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.9; transform: scale(1.02); }
  }
  @keyframes slideInRight {
    from { opacity: 0; transform: translateX(30px); }
    to { opacity: 1; transform: translateX(0); }
  }
`;
if (!document.querySelector('[data-dashboard-styles]')) {
  styleSheet.setAttribute('data-dashboard-styles', 'true');
  document.head.appendChild(styleSheet);
}

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [cart, setCart] = useState([]);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingProduct, setPendingProduct] = useState(null);
  const [pendingBuyNow, setPendingBuyNow] = useState(false);
  const [firstTimeUser, setFirstTimeUser] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [showCartDrawer, setShowCartDrawer] = useState(false);
  const [sortBy, setSortBy] = useState('featured');
  const [filters, setFilters] = useState({
    priceRange: [0, 10000],
    rating: 0,
    inStockOnly: false
  });
  const [useEnhancedCards, setUseEnhancedCards] = useState(true); // Toggle for enhanced UI
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [showQuickView, setShowQuickView] = useState(false);
  
  // Refs for debouncing and preventing race conditions
  const searchDebounceRef = useRef(null);
  const analyticsDebounceRef = useRef(null);
  const abortControllerRef = useRef(null);

  // Use shared categories from constants
  const categories = ['All', ...PRODUCT_CATEGORIES];

  // Extract search query from URL on component mount
  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes('?')) {
      const queryString = hash.split('?')[1];
      const params = new URLSearchParams(queryString);
      const searchParam = params.get('search');
      const categoryParam = params.get('category');
      
      if (searchParam) {
        setSearchTerm(searchParam);
        console.log('🔍 Search parameter from URL:', searchParam);
      }
      
      if (categoryParam && categories.includes(categoryParam)) {
        setSelectedCategory(categoryParam);
        console.log('📋 Category parameter from URL:', categoryParam);
      }
    }
  }, []);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (token && userData) {
      setUser(JSON.parse(userData));
      analytics.setUser(JSON.parse(userData)._id || JSON.parse(userData).id, 'customer');
      analytics.pageView('dashboard-authenticated');
    } else {
      // Track as guest user
      setFirstTimeUser(true);
      analytics.pageView('dashboard-guest');
    }

    fetchProfile();
    fetchProducts();
    loadCart();

    // Check if there's a pending product from Google OAuth
    const pendingCartProduct = sessionStorage.getItem('pendingCartProduct');
    if (pendingCartProduct && token) {
      const product = JSON.parse(pendingCartProduct);
      addToCartAuthenticated(product);
      sessionStorage.removeItem('pendingCartProduct');
    }

    // Check if user just logged in
    const justLoggedIn = sessionStorage.getItem('justLoggedIn');
    if (justLoggedIn === 'true' && user) {
      setShowWelcome(true);
      sessionStorage.removeItem('justLoggedIn');

      setTimeout(() => {
        setShowWelcome(false);
      }, 4000);
    }

    // Track page load for analytics
    if (token) {
      analytics.track('dashboard_loaded_authenticated');
    } else {
      analytics.track('dashboard_loaded_guest');
    }
  }, []);

  // ============================================
  // OPTIMIZED SEARCH DEBOUNCING
  // Prevents search execution on every keystroke
  // Implements 400ms delay for optimal UX
  // ============================================
  useEffect(() => {
    // Clear previous debounce timer
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }

    // Set new debounce timer
    searchDebounceRef.current = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 400); // 400ms delay - sweet spot for UX

    // Cleanup function to prevent memory leaks
    return () => {
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
      }
    };
  }, [searchTerm]);

  // ============================================
  // FETCH PRODUCTS - Triggered by debounced search
  // Only executes after user stops typing
  // Implements request cancellation for race conditions
  // ============================================
  useEffect(() => {
    // Cancel any pending requests to prevent race conditions
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    fetchProducts();

    // Cleanup: cancel request if component unmounts or dependencies change
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [selectedCategory, debouncedSearchTerm]);

  // ============================================
  // ANALYTICS TRACKING - Separate debouncing
  // Tracks search after user finishes typing
  // ============================================
  useEffect(() => {
    // Clear previous analytics timer
    if (analyticsDebounceRef.current) {
      clearTimeout(analyticsDebounceRef.current);
    }

    // Only track if there's a search term
    if (debouncedSearchTerm) {
      analyticsDebounceRef.current = setTimeout(() => {
        analytics.search(debouncedSearchTerm, products.length);
        console.log(`📊 Analytics: Search for "${debouncedSearchTerm}" - ${products.length} results`);
      }, 500);
    }

    return () => {
      if (analyticsDebounceRef.current) {
        clearTimeout(analyticsDebounceRef.current);
      }
    };
  }, [debouncedSearchTerm, products.length]);

  async function fetchProfile() {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const res = await fetch(`${API}/api/auth/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setUser(data.user);
    } catch (err) {
      console.error('Profile error:', err);
    }
  }

  // ============================================
  // OPTIMIZED FETCH PRODUCTS with useCallback
  // Prevents function recreation on every render
  // Implements request cancellation
  // ============================================
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      // Create new abort controller for this request
      abortControllerRef.current = new AbortController();

      const query = new URLSearchParams();
      if (selectedCategory !== 'All') query.append('category', selectedCategory);
      if (debouncedSearchTerm) query.append('search', debouncedSearchTerm);

      // Timeout for better UX (8 seconds)
      const timeoutId = setTimeout(() => {
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }
      }, 8000);

      const res = await fetch(`${API}/api/products?${query}`, {
        signal: abortControllerRef.current.signal
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        throw new Error(`Server error: ${res.status}`);
      }

      const data = await res.json();

      if (data.success) {
        setProducts(data.products);
        setError('');
      } else {
        throw new Error(data.msg || 'Failed to load products');
      }
      setLoading(false);
    } catch (err) {
      // Don't show error for intentional request cancellation
      if (err.name === 'AbortError') {
        console.log('🚫 Request cancelled (user typing or navigating)');
        return;
      }

      console.error('Fetch products error:', err);

      // Provide helpful error messages based on error type
      if (err.message.includes('Failed to fetch')) {
        setError('🔌 Cannot connect to server. Please ensure backend is running on port 5000.');
      } else {
        setError(`⚠️ ${err.message || 'Failed to load products. Please refresh the page.'}`);
      }
      setLoading(false);
    }
  }, [selectedCategory, debouncedSearchTerm]); // Only recreate if these change

  function loadCart() {
    const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
    setCart(savedCart);
  }

  function getCartItemCount() {
    return cart.reduce((total, item) => total + item.quantity, 0);
  }

  // Cart interceptor - prompts for login/register on first add to cart
  function addToCart(product, buyNow = false) {
    const token = localStorage.getItem('token');

    // Check if user is logged in
    if (!token) {
      // Track cart abandonment attempt
      analytics.track('cart_abandoned_auth_required', {
        product: product.name,
        price: product.price,
        category: product.category,
        intent: buyNow ? 'buy_now' : 'add_to_cart'
      });

      // Store pending product and show auth modal
      setPendingProduct(product);
      setPendingBuyNow(buyNow);
      setShowAuthModal(true);

      // Show notification
      setNotificationMsg('⚠️ Please login or sign up to add items to cart');
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 4000);

      return;
    }

    // User is logged in, proceed with adding to cart
    addToCartAuthenticated(product, buyNow);
  }

  // Actually add product to cart (used when user is authenticated)
  function addToCartAuthenticated(product, buyNow = false) {
    const existingItem = cart.find(item => item._id === product._id);
    let updatedCart;

    if (existingItem) {
      updatedCart = cart.map(item =>
        item._id === product._id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
    } else {
      updatedCart = [...cart, { ...product, quantity: 1 }];
    }

    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));

    // Track successful add to cart
    analytics.track('add_to_cart', {
      product: product.name,
      price: product.price,
      category: product.category,
      intent: buyNow ? 'buy_now' : 'add_to_cart'
    });

    if (buyNow) {
      window.location.href = '/checkout';
    } else {
      setNotificationMsg(`✅ ${product.name} added to cart!`);
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
    }
  }

  // Wrapper functions for EnhancedProductCard compatibility
  const handleAddToCart = useCallback((product) => {
    addToCart(product, false);
  }, [cart]);

  const handleBuyNow = useCallback((product) => {
    addToCart(product, true);
  }, [cart]);

  // Quick View Handler
  const handleQuickView = useCallback((product) => {
    setQuickViewProduct(product);
    setShowQuickView(true);
    addToRecentlyViewed(product);
    analytics.track('product_quick_view', {
      product: product.name,
      category: product.category,
      price: product.price
    });
  }, []);

  // Cart drawer handlers
  function updateCartQuantity(productId, newQuantity) {
    if (newQuantity < 1) {
      removeFromCart(productId);
      return;
    }
    const updatedCart = cart.map(item =>
      item._id === productId ? { ...item, quantity: newQuantity } : item
    );
    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  }

  function removeFromCart(productId) {
    const updatedCart = cart.filter(item => item._id !== productId);
    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    if (updatedCart.length === 0) {
      setShowCartDrawer(false);
    }
  }

  // Filter and sort handlers
  function handleFilterChange(newFilters) {
    setFilters(newFilters);
  }

  function handleSortChange(newSort) {
    setSortBy(newSort);
  }

  // Apply filters and sorting to products
  const filteredAndSortedProducts = useMemo(() => {
    let result = [...products];

    // Apply price filter
    result = result.filter(p => 
      p.price >= filters.priceRange[0] && p.price <= filters.priceRange[1]
    );

    // Apply rating filter
    if (filters.rating > 0) {
      result = result.filter(p => (p.rating || 0) >= filters.rating);
    }

    // Apply stock filter
    if (filters.inStockOnly) {
      result = result.filter(p => p.stock > 0);
    }

    // Apply sorting
    switch(sortBy) {
      case 'price-low':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'newest':
        result.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        break;
      case 'popular':
        result.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0));
        break;
      default:
        // featured - keep original order
        break;
    }

    return result;
  }, [products, filters, sortBy]);

  // Handle successful authentication from modal
  function handleAuthSuccess(userData) {
    setUser(userData);
    setShowAuthModal(false);
    analytics.setUser(userData._id || userData.id, 'customer');
    analytics.track('user_authenticated_from_cart', {
      method: 'email',
      firstTimeUser: firstTimeUser
    });

    // Add the pending product to cart
    if (pendingProduct) {
      addToCartAuthenticated(pendingProduct, pendingBuyNow);
      setPendingProduct(null);
      setPendingBuyNow(false);
    }
  }

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('cart');

    // Dispatch logout event
    window.dispatchEvent(new CustomEvent('userLoggedOut'));

    // Track logout
    analytics.track('user_logged_out');

    setUser(null);
    setCart([]);

    setTimeout(() => {
      window.location.hash = '#login';
    }, 100);
  }

  // ============================================
  // OPTIMIZED SEARCH HANDLER with useCallback
  // Prevents function recreation on every render
  // Immediately updates searchTerm (for UI responsiveness)
  // Debouncing happens in useEffect
  // ============================================
  const handleSearchChange = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []); // No dependencies - function never needs to be recreated

  // ============================================
  // OPTIMIZED CATEGORY HANDLER with useCallback
  // ============================================
  const handleCategoryChange = useCallback((category) => {
    setSelectedCategory(category);
  }, []);

  // Use theme hook for consistent styling
  const theme = useTheme();

  const styles = {
    container: theme.commonStyles.container.lightGradient,
    content: {
      maxWidth: '1400px',
      margin: '0 auto',
      padding: '0 24px'
    },
    header: theme.commonStyles.header.default,
    logo: {
      ...theme.commonStyles.logo.gradient,
      margin: 0,
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    userSection: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    // Primary Cart Button - Most Prominent
    cartBtn: {
      position: 'relative',
      padding: '12px 24px',
      backgroundImage: 'linear-gradient(135deg, #10b981, #059669)',
      color: 'white',
      border: 'none',
      borderRadius: '10px',
      cursor: 'pointer',
      fontSize: '15px',
      fontWeight: '600',
      boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)',
      transition: 'all 0.3s ease',
      display: 'flex',
      alignItems: 'center',
      gap: '6px'
    },
    cartBadge: {
      position: 'absolute',
      top: '-8px',
      right: '-8px',
      backgroundColor: '#ef4444',
      color: 'white',
      borderRadius: '50%',
      width: '24px',
      height: '24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '12px',
      fontWeight: '700',
      boxShadow: '0 2px 8px rgba(239, 68, 68, 0.4)'
    },
    // Secondary Actions - Ghost/Outline Buttons
    ghostBtn: {
      padding: '10px 20px',
      backgroundColor: 'transparent',
      color: '#6b7280',
      border: '2px solid #d1d5db',
      borderRadius: '10px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '600',
      transition: 'all 0.3s ease'
    },
    profileBtn: {
      padding: '10px 20px',
      backgroundColor: 'transparent',
      color: '#6b7280',
      border: '2px solid #d1d5db',
      borderRadius: '10px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '600',
      transition: 'all 0.3s ease',
      display: 'flex',
      alignItems: 'center',
      gap: '6px'
    },
    logoutLink: {
      position: 'absolute',
      top: '-4px',
      right: '-4px',
      width: '20px',
      height: '20px',
      borderRadius: '50%',
      backgroundColor: '#fee2e2',
      color: '#ef4444',
      border: 'none',
      fontSize: '11px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.2s ease',
      fontWeight: '600'
    },
    userName: {
      fontSize: '14px',
      color: 'var(--color-text-primary)',
      fontWeight: '500'
    },
    button: {
      padding: '8px 16px',
      borderRadius: '8px',
      border: 'none',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500',
      transition: 'all 0.2s'
    },
    adminBtn: {
      backgroundImage: 'linear-gradient(135deg, #4285F4, #3367D6)',
      color: 'white',
      boxShadow: '0 4px 15px rgba(30, 58, 138, 0.3)'
    },

    filtersSection: {
      backgroundColor: '#ffffff',
      padding: '24px 32px',
      margin: '24px auto',
      borderRadius: '12px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
      maxWidth: '1400px',
      border: '1px solid #e5e7eb'
    },
    searchBar: {
      width: '100%',
      padding: '14px 20px 14px 48px',
      fontSize: '16px',
      border: '2px solid rgba(59, 130, 246, 0.2)',
      borderRadius: '12px',
      marginBottom: '20px',
      outline: 'none',
      transition: 'all 0.3s ease',
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'20\' height=\'20\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%233b82f6\' stroke-width=\'2\'%3E%3Ccircle cx=\'11\' cy=\'11\' r=\'8\'/%3E%3Cpath d=\'m21 21-4.35-4.35\'/%3E%3C/svg%3E")',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: '16px center',
      backgroundSize: '20px'
    },
    categoryContainer: {
      display: 'flex',
      gap: '12px',
      flexWrap: 'wrap'
    },
    categoryBtn: {
      padding: '10px 24px',
      borderRadius: '24px',
      borderWidth: '2px',
      borderStyle: 'solid',
      borderColor: 'rgba(59, 130, 246, 0.3)',
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '600',
      transition: 'all 0.3s ease',
      backdropFilter: 'blur(10px)',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
    },
    categoryBtnActive: {
      backgroundImage: 'linear-gradient(135deg, #1e3a8a, #3b82f6)',
      color: 'white',
      borderColor: 'transparent',
      boxShadow: '0 4px 15px rgba(59, 130, 246, 0.4)',
      transform: 'translateY(-2px)'
    },
    productsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '24px',
      padding: '0 32px 48px',
      maxWidth: '1400px',
      margin: '0 auto'
    },
    productCard: {
      backgroundColor: '#ffffff',
      borderRadius: '12px',
      overflow: 'hidden',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      cursor: 'pointer',
      border: '1px solid #e5e7eb',
      animation: 'scaleIn 0.5s ease-out backwards',
      display: 'flex',
      flexDirection: 'column',
      height: '100%'
    },
    productImage: {
      width: '100%',
      height: '240px',
      objectFit: 'cover',
      backgroundColor: '#f9fafb'
    },
    productInfo: {
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      flex: 1,
      gap: '8px'
    },
    productCategory: {
      fontSize: '11px',
      color: '#6b7280',
      textTransform: 'uppercase',
      fontWeight: '600',
      letterSpacing: '0.5px',
      display: 'inline-block',
      padding: '4px 8px',
      backgroundColor: '#f3f4f6',
      borderRadius: '4px',
      width: 'fit-content'
    },
    productName: {
      fontSize: '16px',
      fontWeight: '600',
      color: '#111827',
      lineHeight: '1.5',
      marginTop: '4px',
      display: '-webkit-box',
      WebkitLineClamp: 2,
      WebkitBoxOrient: 'vertical',
      overflow: 'hidden',
      minHeight: '48px'
    },
    productDescription: {
      fontSize: '13px',
      color: '#6b7280',
      lineHeight: '1.5',
      display: '-webkit-box',
      WebkitLineClamp: 2,
      WebkitBoxOrient: 'vertical',
      overflow: 'hidden',
      minHeight: '40px'
    },
    priceContainer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '12px'
    },
    price: {
      fontSize: '20px',
      fontWeight: '700',
      color: '#111827',
      letterSpacing: '-0.01em'
    },
    stockBadge: {
      fontSize: '11px',
      padding: '3px 8px',
      borderRadius: '4px',
      fontWeight: '500'
    },
    inStock: {
      backgroundColor: '#d1fae5',
      color: '#065f46',
      border: '1px solid #6ee7b7'
    },
    outOfStock: {
      backgroundImage: 'linear-gradient(135deg, var(--color-error-100), var(--color-error-200))',
      color: 'var(--color-error-700)',
      boxShadow: '0 2px 8px rgba(239, 68, 68, 0.2)'
    },
    buyNowBtn: {
      width: '100%',
      padding: '12px 16px',
      backgroundColor: '#3b82f6',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      marginBottom: '8px',
      marginTop: 'auto'
    },
    addToCartBtn: {
      width: '100%',
      padding: '12px 16px',
      backgroundColor: '#3b82f6',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.2s ease'
    },
    emptyState: {
      textAlign: 'center',
      padding: '60px 20px',
      color: 'var(--color-text-secondary)'
    },
    notification: {
      position: 'fixed',
      top: '90px',
      right: '32px',
      backgroundImage: 'linear-gradient(135deg, #10b981, #059669)',
      color: 'white',
      padding: '18px 28px',
      borderRadius: '16px',
      boxShadow: '0 8px 32px rgba(16, 185, 129, 0.4)',
      backdropFilter: 'blur(10px)',
      zIndex: 1000,
      animation: 'slideInRight 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
      fontWeight: '600',
      fontSize: '15px',
      border: '1px solid rgba(255, 255, 255, 0.2)'
    }
  };

  if (loading || isTransitioning) {
    return (
      <div style={styles.container}>
        {/* Loading Progress Bar */}
        <LoadingBar isLoading={true} color="gradient" />
        
        <div style={styles.header}>
          <h1 style={styles.logo}>🔨 HomeHardware</h1>
        </div>
        <div style={{ ...styles.content, maxWidth: '1400px', margin: '0 auto', padding: '32px' }}>
          {isTransitioning && (
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <h2 style={{ color: 'var(--color-brand-primary)' }}>Welcome back! Loading your dashboard...</h2>
            </div>
          )}
          <div className="products-grid">
            <SkeletonLoader type="product" count={8} variant="shimmer" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Loading Progress Bar - Shows during transitions */}
      <LoadingBar isLoading={isTransitioning} color="gradient" />
      
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.logo}>🔨 HomeHardware</h1>
        <div style={styles.userSection}>
          {user && <span style={styles.userName}>👤 {user.name}</span>}
          {/* Secondary Actions - Ghost/Outline Buttons */}
          <button
            style={styles.ghostBtn}
            onClick={() => window.location.hash = '#my-orders'}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
              e.currentTarget.style.borderColor = '#3b82f6';
              e.currentTarget.style.color = '#2563eb';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.borderColor = '#d1d5db';
              e.currentTarget.style.color = '#6b7280';
            }}
          >
            📦 My Orders
          </button>
          {/* Primary Action - Cart Button */}
          <button
            style={styles.cartBtn}
            onClick={() => setShowCartDrawer(true)}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(16, 185, 129, 0.5)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(16, 185, 129, 0.3)';
            }}
          >
            🛒 Cart
            {getCartItemCount() > 0 && (
              <span style={styles.cartBadge}>{getCartItemCount()}</span>
            )}
          </button>
          {/* Profile with Dropdown for Logout */}
          <div style={{ position: 'relative' }}>
            <button
              style={styles.profileBtn}
              onClick={() => window.location.hash = '#profile'}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
                e.currentTarget.style.borderColor = '#3b82f6';
                e.currentTarget.style.color = '#2563eb';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.borderColor = '#d1d5db';
                e.currentTarget.style.color = '#6b7280';
              }}
              title="View Profile (Click for more options)"
            >
              👤 Profile
            </button>
            {/* Subtle logout link - can be moved to profile page */}
            <button
              style={styles.logoutLink}
              onClick={logout}
              title="Logout"
            >
              ⎋
            </button>
          </div>
        </div>
      </div>

      {/* Welcome Message */}
      {showWelcome && user && (
        <div style={{
          ...styles.notification,
          backgroundImage: 'linear-gradient(135deg, #10b981, #059669)',
          fontSize: '16px',
          padding: '16px 24px',
          animation: 'slideDown 0.5s ease-out'
        }}>
          🎉 Welcome back, {user.name}! Happy shopping!
        </div>
      )}

      {/* Notification */}
      {showNotification && (
        <div style={styles.notification}>
          ✅ {notificationMsg}
        </div>
      )}

      {/* Filters Section */}
      <div style={styles.filtersSection}>
        <div style={{ position: 'relative', width: '100%', maxWidth: '600px' }}>
          <EnhancedSearchBar
            searchTerm={searchTerm}
            onSearchChange={(value) => setSearchTerm(value)}
            onCategorySelect={(category) => {
              setSelectedCategory(category);
              setSearchTerm('');
            }}
            placeholder="🔍 Search products..."
          />
        </div>
        <div style={styles.categoryContainer} role="group" aria-label="Product categories">
          {categories.map(cat => (
            <button
              key={cat}
              style={{
                ...styles.categoryBtn,
                ...(selectedCategory === cat ? styles.categoryBtnActive : {})
              }}
              onClick={() => handleCategoryChange(cat)}
              aria-pressed={selectedCategory === cat}
              aria-label={`Filter by ${cat} category`}
              onMouseOver={(e) => {
                if (selectedCategory !== cat) {
                  e.currentTarget.style.borderColor = '#667eea';
                  e.currentTarget.style.backgroundColor = 'rgba(102, 126, 234, 0.1)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }
              }}
              onMouseOut={(e) => {
                if (selectedCategory !== cat) {
                  e.currentTarget.style.borderColor = 'rgba(102, 126, 234, 0.3)';
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Product Filters and Sort */}
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 32px' }}>
        <ProductFilters
          onFilterChange={handleFilterChange}
          onSortChange={handleSortChange}
          categories={categories}
          selectedCategory={selectedCategory}
          totalProducts={filteredAndSortedProducts.length}
        />
      </div>

      {/* Products Grid */}
      {filteredAndSortedProducts.length === 0 ? (
        <EmptyState 
          type={searchTerm || selectedCategory !== 'All' ? 'search' : 'noProducts'}
          title={searchTerm ? 'No results found' : 'No products available'}
          description={searchTerm ? `No products match "${searchTerm}"` : 'Check back soon for new items'}
          actionLabel="Clear Search"
          onAction={() => {
            setSearchTerm('');
            setSelectedCategory('All');
          }}
        />
      ) : (
        <div className="grid-enhanced grid-products" style={styles.productsGrid}>
          {useEnhancedCards ? (
            // Enhanced Product Cards with modern UI/UX
            filteredAndSortedProducts.map((product, index) => (
              <EnhancedProductCard
                key={product._id}
                product={product}
                index={index}
                onAddToCart={handleAddToCart}
                onBuyNow={handleBuyNow}
                onQuickView={handleQuickView}
                onAuthRequired={() => setShowAuthModal(true)}
              />
            ))
          ) : (
            // Original Product Cards
            filteredAndSortedProducts.map((product, index) => (
            <div
              key={product._id}
              style={{
                ...styles.productCard,
                animationDelay: `${filteredAndSortedProducts.indexOf(product) * 0.05}s`,
                position: 'relative'
              }}
              onClick={() => addToRecentlyViewed(product)}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 12px 24px rgba(0, 0, 0, 0.12)';
                e.currentTarget.style.borderColor = '#d1d5db';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.08)';
                e.currentTarget.style.borderColor = '#e5e7eb';
              }}
            >
              {/* Wishlist Button */}
              <div style={{ position: 'absolute', top: '12px', right: '12px', zIndex: 10 }}>
                <WishlistButton 
                  productId={product._id}
                  size="medium"
                  onAuthRequired={() => setShowAuthModal(true)}
                />
              </div>

              <div style={{ overflow: 'hidden', height: '240px', backgroundColor: '#f9fafb' }}>
                <OptimizedImage
                  src={getImageUrl(product.imageUrl)}
                  alt={generateProductAltText(product)}
                  title={`${product.name}${product.brand ? ' by ' + product.brand : ''} - ₹${product.price}`}
                  width={300}
                  height={300}
                  priority={index < 4}
                  style={{
                    transition: 'transform 0.4s ease'
                  }}
                  onMouseOver={(e) => e.currentTarget.querySelector('img').style.transform = 'scale(1.1)'}
                  onMouseOut={(e) => e.currentTarget.querySelector('img').style.transform = 'scale(1)'}
                />
              </div>
              <div style={styles.productInfo}>
                <div style={styles.productCategory}>{product.category}</div>
                <h3 style={styles.productName}>{product.name}</h3>
                
                {/* Product Rating */}
                {product.rating && product.rating > 0 && (
                  <div style={{ marginBottom: '8px' }}>
                    <ProductRating 
                      rating={product.rating} 
                      reviewCount={product.reviewCount || 0}
                      size="small"
                    />
                  </div>
                )}

                {/* Price with Discount */}
                <div style={{ ...styles.priceContainer, marginTop: 'auto', paddingTop: '12px' }}>
                  <PriceDisplay 
                    price={product.price}
                    originalPrice={product.originalPrice}
                    discount={product.discount}
                    size="medium"
                  />
                  <span style={{
                    ...styles.stockBadge,
                    ...(product.inStock ? styles.inStock : styles.outOfStock)
                  }}>
                    {product.inStock ? 'In Stock' : 'Out of Stock'}
                  </span>
                </div>
                <button
                  style={{
                    ...styles.addToCartBtn,
                    backgroundColor: product.inStock ? '#4285F4' : '#9ca3af',
                    cursor: product.inStock ? 'pointer' : 'not-allowed'
                  }}
                  disabled={!product.inStock}
                  onClick={() => product.inStock && addToCart(product)}
                  aria-label={`Add ${product.name} to cart - ₹${product.price}`}
                  aria-disabled={!product.inStock}
                  onMouseOver={(e) => {
                    if (product.inStock) {
                      e.currentTarget.style.backgroundColor = '#2563eb';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (product.inStock) {
                      e.currentTarget.style.backgroundColor = '#4285F4';
                    }
                  }}
                >
                  {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                </button>
              </div>
            </div>
          ))
          )}
        </div>
      )}

      {/* Auth Modal - Shows when user tries to add to cart without login */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => {
          setShowAuthModal(false);
          setPendingProduct(null);
          analytics.track('auth_modal_closed', { hadPendingProduct: !!pendingProduct });
        }}
        onAuthSuccess={handleAuthSuccess}
        pendingProduct={pendingProduct}
      />

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={showCartDrawer}
        onClose={() => setShowCartDrawer(false)}
        cart={cart}
        onUpdateQuantity={updateCartQuantity}
        onRemoveItem={removeFromCart}
      />

      {/* Product Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        isOpen={showQuickView}
        onClose={() => {
          setShowQuickView(false);
          setQuickViewProduct(null);
        }}
        onAddToCart={handleAddToCart}
        onBuyNow={handleBuyNow}
      />

      {/* Recently Viewed Products */}
      <RecentlyViewed
        onProductClick={(product) => {
          addToRecentlyViewed(product);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Professional Footer */}
      <Footer theme="dark" />
    </div>
  );
}
