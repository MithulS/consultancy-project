/**
 * EXAMPLE: REFACTORED PRODUCT CARD
 * Demonstrates how to use the reusable theme system
 */

import React from 'react';
import { useTheme } from '../hooks/useTheme';
import { ProductCard, Price, StockBadge, Button } from './StyledComponents';
import { getImageUrl } from '../utils/imageHandling';

export default function ProductCardExample({ product, onAddToCart, onBuyNow }) {
  const theme = useTheme();
  
  // Use theme utilities for custom styles
  const styles = {
    image: {
      width: '100%',
      height: '280px',
      objectFit: 'cover',
      backgroundColor: theme.colors.background.secondary,
    },
    info: {
      padding: theme.spacing.md,
      display: 'flex',
      flexDirection: 'column',
      flex: 1,
    },
    category: {
      fontSize: '12px',
      color: theme.colors.text.secondary,
      textTransform: 'uppercase',
      marginBottom: theme.spacing.sm,
      fontWeight: '600',
    },
    name: {
      fontSize: '19px',
      fontWeight: '700',
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.sm,
      lineHeight: '1.4',
    },
    description: {
      fontSize: '14px',
      color: theme.colors.text.secondary,
      marginBottom: theme.spacing.md,
      lineHeight: '1.6',
      display: '-webkit-box',
      WebkitLineClamp: 2,
      WebkitBoxOrient: 'vertical',
      overflow: 'hidden',
    },
    priceContainer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: theme.spacing.md,
    },
    buttonsContainer: {
      display: 'flex',
      flexDirection: 'column',
      gap: theme.spacing.md,
      marginTop: 'auto',
    },
  };

  return (
    <ProductCard>
      <img 
        src={getImageUrl(product.imageUrl)} 
        alt={product.name}
        style={styles.image}
      />
      
      <div style={styles.info}>
        <div style={styles.category}>{product.category}</div>
        
        <h3 style={styles.name}>{product.name}</h3>
        
        {product.description && (
          <p style={styles.description}>{product.description}</p>
        )}
        
        <div style={styles.priceContainer}>
          <Price amount={product.price} />
          <StockBadge inStock={product.stock > 0} />
        </div>
        
        <div style={styles.buttonsContainer}>
          <Button
            variant="orange"
            onClick={() => onBuyNow(product)}
            disabled={product.stock === 0}
            style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}
          >
            ⚡ Buy Now
          </Button>
          
          <Button
            variant="primary"
            onClick={() => onAddToCart(product)}
            disabled={product.stock === 0}
            style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}
          >
            🛒 Add to Cart
          </Button>
        </div>
      </div>
    </ProductCard>
  );
}
