import React, { useState, useEffect } from 'react';
import SmartButton from './SmartButton';

const ProductRecommendations = ({ 
  currentProduct = null,
  userId = null,
  category = null,
  limit = 4,
  title = '🔥 You May Also Like'
}) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchRecommendations();
  }, [currentProduct, userId, category]);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      
      // Build query based on available data
      let endpoint = '/api/products?';
      const params = new URLSearchParams();
      
      if (currentProduct) {
        // Get products from same category
        params.append('category', currentProduct.category);
        params.append('limit', limit);
      } else if (category) {
        params.append('category', category);
        params.append('limit', limit);
      } else {
        // Get featured products as fallback
        params.append('featured', 'true');
        params.append('limit', limit);
      }

      const response = await fetch(`${API}${endpoint}${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        // Filter out current product if viewing product page
        let products = data.products;
        if (currentProduct) {
          products = products.filter(p => p._id !== currentProduct._id);
        }
        
        // Shuffle and limit
        const shuffled = products.sort(() => 0.5 - Math.random());
        setRecommendations(shuffled.slice(0, limit));
      }
    } catch (error) {
      console.error('Failed to fetch recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProductClick = (product) => {
    // Track recommendation click
    if (window.gtag) {
      window.gtag('event', 'select_item', {
        item_list_id: 'recommendations',
        item_list_name: 'Product Recommendations',
        items: [{
          item_id: product._id,
          item_name: product.name,
          price: product.price
        }]
      });
    }
  };

  const addToCart = async (product, e) => {
    e.stopPropagation();
    
    try {
      const token = localStorage.getItem('token');
      
      if (token) {
        const response = await fetch(`${API}/api/cart/add`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            productId: product._id,
            quantity: 1
          })
        });

        if (response.ok) {
          alert('✅ Added to cart!');
          window.dispatchEvent(new Event('cartUpdated'));
        }
      } else {
        // Guest cart
        const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
        const existingItem = guestCart.find(item => item.productId === product._id);
        
        if (existingItem) {
          existingItem.quantity += 1;
        } else {
          guestCart.push({
            productId: product._id,
            name: product.name,
            price: product.price,
            imageUrl: product.imageUrl,
            quantity: 1
          });
        }
        
        localStorage.setItem('guestCart', JSON.stringify(guestCart));
        alert('✅ Added to cart!');
        window.dispatchEvent(new Event('cartUpdated'));
      }

      // Track add to cart
      if (window.gtag) {
        window.gtag('event', 'add_to_cart', {
          currency: 'USD',
          value: product.price,
          items: [{
            item_id: product._id,
            item_name: product.name,
            price: product.price,
            quantity: 1
          }]
        });
      }
    } catch (error) {
      console.error('Add to cart error:', error);
      alert('❌ Failed to add to cart');
    }
  };

  if (loading) {
    return (
      <div className="recommendations-loading">
        <div className="skeleton-grid">
          {[...Array(limit)].map((_, i) => (
            <div key={i} className="skeleton-card" />
          ))}
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <div className="product-recommendations">
      <h2 className="recommendations-title">{title}</h2>
      
      <div className="recommendations-grid">
        {recommendations.map(product => (
          <div 
            key={product._id} 
            className="recommendation-card"
            onClick={() => handleProductClick(product)}
          >
            <div className="recommendation-image">
              <img 
                src={product.imageUrl} 
                alt={product.name}
                loading="lazy"
              />
              {product.stock < 5 && product.stock > 0 && (
                <div className="low-stock-badge">Only {product.stock} left</div>
              )}
              {product.stock === 0 && (
                <div className="out-of-stock-overlay">Out of Stock</div>
              )}
            </div>
            
            <div className="recommendation-content">
              <h3 className="recommendation-name">{product.name}</h3>
              
              <div className="recommendation-price">
                {product.originalPrice && (
                  <span className="original-price">${product.originalPrice}</span>
                )}
                <span className="current-price">${product.price}</span>
                {product.originalPrice && (
                  <span className="discount-badge">
                    {Math.round((1 - product.price / product.originalPrice) * 100)}% OFF
                  </span>
                )}
              </div>

              {product.rating > 0 && (
                <div className="recommendation-rating">
                  <span className="stars">{'⭐'.repeat(Math.round(product.rating))}</span>
                  <span className="rating-count">({product.numReviews})</span>
                </div>
              )}
              
              <SmartButton
                onClick={async (e) => {
                  addToCart(product, e);
                  return true;
                }}
                disabled={product.stock === 0}
                variant="primary"
                size="small"
                style={{ width: '100%' }}
              >
                {product.stock === 0 ? 'Out of Stock' : '🛒 Add to Cart'}
              </SmartButton>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        .product-recommendations {
          margin: 3rem 0;
          padding: 2rem;
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
          border-radius: 16px;
        }

        .recommendations-title {
          font-size: 1.75rem;
          font-weight: 700;
          color: #2d3748;
          margin-bottom: 1.5rem;
          text-align: center;
        }

        .recommendations-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 1.5rem;
        }

        .recommendation-card {
          background: white;
          border-radius: 12px;
          overflow: hidden;
          cursor: pointer;
          transition: transform 0.3s, box-shadow 0.3s;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .recommendation-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.15);
        }

        .recommendation-image {
          position: relative;
          width: 100%;
          height: 250px;
          overflow: hidden;
          background: #f3f4f6;
        }

        .recommendation-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s;
        }

        .recommendation-card:hover .recommendation-image img {
          transform: scale(1.05);
        }

        .low-stock-badge {
          position: absolute;
          top: 10px;
          left: 10px;
          background: #f59e0b;
          color: white;
          padding: 0.375rem 0.75rem;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .out-of-stock-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,0.7);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.25rem;
          font-weight: 700;
        }

        .recommendation-content {
          padding: 1.25rem;
        }

        .recommendation-name {
          font-size: 1rem;
          font-weight: 600;
          color: #2d3748;
          margin-bottom: 0.75rem;
          height: 2.5rem;
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }

        .recommendation-price {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.75rem;
        }

        .original-price {
          text-decoration: line-through;
          color: #9ca3af;
          font-size: 0.875rem;
        }

        .current-price {
          font-size: 1.5rem;
          font-weight: 700;
          color: #059669;
        }

        .discount-badge {
          background: #dc2626;
          color: white;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .recommendation-rating {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 1rem;
          font-size: 0.875rem;
        }

        .stars {
          color: #f59e0b;
        }

        .rating-count {
          color: #6b7280;
        }

        .add-to-cart-btn {
          width: 100%;
          padding: 0.75rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .add-to-cart-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }

        .add-to-cart-btn:disabled {
          background: #d1d5db;
          cursor: not-allowed;
        }

        .recommendations-loading,
        .skeleton-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 1.5rem;
        }

        .skeleton-card {
          height: 400px;
          background: linear-gradient(
            90deg,
            #f0f0f0 25%,
            #e0e0e0 50%,
            #f0f0f0 75%
          );
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 12px;
        }

        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }

        @media (max-width: 768px) {
          .product-recommendations {
            padding: 1.5rem 1rem;
          }

          .recommendations-title {
            font-size: 1.5rem;
          }

          .recommendations-grid {
            grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
            gap: 1rem;
          }

          .recommendation-image {
            height: 150px;
          }

          .recommendation-content {
            padding: 0.875rem;
          }

          .recommendation-name {
            font-size: 0.875rem;
            height: 2.25rem;
          }

          .current-price {
            font-size: 1.25rem;
          }
        }
      `}</style>
    </div>
  );
};

export default ProductRecommendations;
