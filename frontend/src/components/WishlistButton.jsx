// Wishlist Button Component
import React, { useState, useEffect } from 'react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function WishlistButton({ 
  productId, 
  size = 'medium',
  onAuthRequired,
  showLabel = false 
}) {
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    checkWishlistStatus();
  }, [productId]);

  const checkWishlistStatus = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const res = await fetch(`${API}/api/wishlist`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        const inWishlist = data.items?.some(item => 
          item.productId?._id === productId || item.productId === productId
        );
        setIsInWishlist(inWishlist);
      }
    } catch (error) {
      console.error('Error checking wishlist:', error);
    }
  };

  const toggleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const token = localStorage.getItem('token');
    if (!token) {
      if (onAuthRequired) {
        onAuthRequired();
      }
      return;
    }

    setIsLoading(true);
    setIsAnimating(true);

    try {
      if (isInWishlist) {
        // Remove from wishlist
        const res = await fetch(`${API}/api/wishlist/remove/${productId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          setIsInWishlist(false);
        }
      } else {
        // Add to wishlist
        const res = await fetch(`${API}/api/wishlist/add`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ productId })
        });
        if (res.ok) {
          setIsInWishlist(true);
        }
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
    } finally {
      setIsLoading(false);
      setTimeout(() => setIsAnimating(false), 600);
    }
  };

  const sizes = {
    small: { button: '32px', icon: '16px', label: '12px' },
    medium: { button: '40px', icon: '20px', label: '14px' },
    large: { button: '48px', icon: '24px', label: '16px' }
  };

  const currentSize = sizes[size] || sizes.medium;

  const styles = {
    button: {
      width: showLabel ? 'auto' : currentSize.button,
      height: currentSize.button,
      padding: showLabel ? '0 16px' : '0',
      border: 'none',
      backgroundColor: isInWishlist ? '#fef2f2' : '#ffffff',
      borderRadius: showLabel ? '12px' : '50%',
      cursor: isLoading ? 'not-allowed' : 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: showLabel ? '8px' : '0',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      boxShadow: isInWishlist 
        ? '0 2px 8px rgba(239, 68, 68, 0.2)' 
        : '0 2px 8px rgba(0, 0, 0, 0.1)',
      transform: isAnimating ? 'scale(1.1)' : 'scale(1)',
      position: 'relative',
      overflow: 'hidden'
    },
    icon: {
      fontSize: currentSize.icon,
      transition: 'all 0.3s ease',
      transform: isAnimating ? 'scale(1.2) rotate(12deg)' : 'scale(1) rotate(0deg)'
    },
    label: {
      fontSize: currentSize.label,
      fontWeight: '600',
      color: isInWishlist ? '#ef4444' : '#6b7280'
    },
    ripple: {
      position: 'absolute',
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(239, 68, 68, 0.3)',
      borderRadius: '50%',
      animation: isAnimating ? 'ripple 0.6s ease-out' : 'none',
      pointerEvents: 'none'
    }
  };

  return (
    <>
      <style>{`
        @keyframes ripple {
          0% { transform: scale(0); opacity: 1; }
          100% { transform: scale(2.5); opacity: 0; }
        }
        @keyframes heartBurst {
          0% { transform: scale(0.8) rotate(-5deg); }
          50% { transform: scale(1.3) rotate(5deg); }
          100% { transform: scale(1) rotate(0deg); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
        @keyframes particle {
          0% { transform: translate(0, 0) scale(1); opacity: 1; }
          100% { transform: translate(var(--tx), var(--ty)) scale(0); opacity: 0; }
        }
        .wishlist-btn {
          position: relative;
        }
        .wishlist-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3) !important;
          animation: float 1s ease-in-out infinite;
        }
        .wishlist-btn:active {
          transform: scale(0.95);
        }
        .wishlist-btn.liked {
          animation: heartBurst 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }
      `}</style>
      <button
        style={styles.button}
        className="wishlist-btn"
        onClick={toggleWishlist}
        disabled={isLoading}
        title={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
        aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
      >
        {isAnimating && <div style={styles.ripple} />}
        <span style={styles.icon}>
          {isInWishlist ? '❤️' : '🤍'}
        </span>
        {showLabel && (
          <span style={styles.label}>
            {isInWishlist ? 'Saved' : 'Save'}
          </span>
        )}
      </button>
    </>
  );
}
