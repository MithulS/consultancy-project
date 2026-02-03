/**
 * ============================================
 * PRODUCT DETAIL PAGE
 * ============================================
 * 
 * Dedicated product page for:
 * - Deep linking (shareable URLs)
 * - SEO optimization
 * - Better analytics tracking
 * - Full-page experience
 * 
 * @version 1.0.0
 * @date January 5, 2026
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ProductDetailModal from './ProductDetailModal';
import SEOHead from './SEOHead';
import { fetchProductById } from '../services/productService';

const ProductDetailPage = ({ onAddToCart, onBuyNow }) => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const productData = await fetchProductById(productId);
        setProduct(productData);
        
        // Track page view
        if (window.gtag) {
          window.gtag('event', 'page_view', {
            page_path: `/product/${productId}`,
            page_title: productData.name
          });
        }
      } catch (err) {
        console.error('Error loading product:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      loadProduct();
    }
  }, [productId]);

  const handleClose = () => {
    navigate(-1); // Go back to previous page
  };

  const handleAddToCart = (product, quantity) => {
    onAddToCart(product, quantity);
  };

  const handleBuyNow = (product, quantity) => {
    onBuyNow(product, quantity);
  };

  return (
    <>
      {product && (
        <SEOHead
          title={`${product.name} | HomeHardware`}
          description={product.description}
          image={product.imageUrl}
          url={`/product/${productId}`}
          type="product"
          price={product.price}
          currency="USD"
          availability={product.stock > 0 ? 'in stock' : 'out of stock'}
        />
      )}

      <ProductDetailModal
        productId={productId}
        product={product}
        isOpen={true}
        onClose={handleClose}
        onAddToCart={handleAddToCart}
        onBuyNow={handleBuyNow}
      />
    </>
  );
};

export default ProductDetailPage;
