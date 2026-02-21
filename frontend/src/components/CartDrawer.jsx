// Cart Drawer - Slide-out Shopping Cart
import React, { useState, useEffect } from 'react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const getImageUrl = (imageUrl) => {
  if (!imageUrl) return 'https://placehold.co/60x60?text=No+Image';
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  return `${API}${imageUrl}`;
};

export default function CartDrawer({ isOpen, onClose, cart, onUpdateQuantity, onRemoveItem }) {
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 300);
  };

  const getTotalAmount = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const handleCheckout = () => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
      // Save the redirect destination
      sessionStorage.setItem('redirectAfterLogin', '#checkout');
      // Close drawer and show login
      onClose();
      setTimeout(() => {
        window.location.hash = '#login';
      }, 300);
      return;
    }
    // Navigate to checkout page
    onClose();
    setTimeout(() => {
      window.location.hash = '#checkout';
    }, 300);
  };

  if (!isOpen && !isClosing) return null;

  const styles = {
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      backdropFilter: 'var(--glass-blur)',
      zIndex: 9998,
      animation: isClosing ? 'fadeOut 0.3s ease-out' : 'fadeIn 0.3s ease-out',
      cursor: 'pointer'
    },
    drawer: {
      position: 'fixed',
      top: 0,
      right: 0,
      bottom: 0,
      width: '100%',
      maxWidth: '450px',
      backgroundColor: 'var(--navy-darkest)',
      boxShadow: '-4px 0 24px rgba(0, 0, 0, 0.3)',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      animation: isClosing ? 'slideOut 0.3s ease-out' : 'slideIn 0.3s ease-out',
      cursor: 'default'
    },
    header: {
      padding: '24px',
      borderBottom: '1px solid var(--border-subtle)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: 'transparent'
    },
    title: {
      fontSize: '20px',
      fontWeight: '700',
      color: 'var(--text-primary)',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    badge: {
      backgroundColor: 'var(--accent-blue-primary)',
      color: '#ffffff',
      fontSize: '12px',
      fontWeight: '600',
      padding: '4px 8px',
      borderRadius: '12px',
      minWidth: '24px',
      textAlign: 'center'
    },
    closeBtn: {
      width: '36px',
      height: '36px',
      border: 'none',
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      color: 'var(--text-secondary)',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.2s ease',
      fontWeight: '500'
    },
    content: {
      flex: 1,
      overflowY: 'auto',
      padding: '16px',
      backgroundColor: 'transparent'
    },
    emptyState: {
      textAlign: 'center',
      padding: '60px 20px',
      color: 'var(--text-secondary)'
    },
    emptyIcon: {
      fontSize: '64px',
      marginBottom: '16px',
      opacity: 0.3,
      animation: 'float 3s ease-in-out infinite'
    },
    emptyText: {
      fontSize: '18px',
      fontWeight: '600',
      color: 'var(--text-primary)',
      marginBottom: '8px'
    },
    emptySubtext: {
      fontSize: '14px',
      color: 'var(--text-secondary)'
    },
    cartItem: {
      backgroundColor: 'var(--glass-background-light)',
      border: '1px solid var(--border-secondary)',
      borderRadius: '12px',
      padding: '16px',
      marginBottom: '12px',
      display: 'flex',
      gap: '12px',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      animation: 'slideInItem 0.4s ease-out'
    },
    itemImage: {
      width: '80px',
      height: '80px',
      objectFit: 'cover',
      borderRadius: '8px',
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      flexShrink: 0
    },
    itemDetails: {
      flex: 1,
      minWidth: 0
    },
    itemName: {
      fontSize: '14px',
      fontWeight: '600',
      color: 'var(--text-primary)',
      marginBottom: '4px',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    },
    itemPrice: {
      fontSize: '16px',
      fontWeight: '700',
      color: 'var(--accent-blue-primary)',
      marginBottom: '8px'
    },
    quantityRow: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    },
    quantityControl: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    quantityBtn: {
      width: '28px',
      height: '28px',
      border: '1px solid var(--border-secondary)',
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      color: 'var(--text-primary)',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '16px',
      fontWeight: '600',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.2s ease'
    },
    quantity: {
      fontSize: '14px',
      fontWeight: '600',
      color: 'var(--text-primary)',
      minWidth: '20px',
      textAlign: 'center'
    },
    removeBtn: {
      backgroundColor: 'transparent',
      border: 'none',
      color: 'var(--accent-red-primary)',
      cursor: 'pointer',
      fontSize: '18px',
      padding: '4px',
      transition: 'all 0.2s ease'
    },
    footer: {
      padding: '24px',
      borderTop: '1px solid var(--border-subtle)',
      backgroundColor: 'var(--navy-darkest)'
    },
    subtotal: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: '16px',
      fontSize: '16px',
      color: 'var(--text-secondary)'
    },
    total: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: '20px',
      fontSize: '20px',
      fontWeight: '700',
      color: 'var(--text-primary)',
      paddingTop: '16px',
      borderTop: '1px solid var(--border-subtle)'
    },
    checkoutBtn: {
      width: '100%',
      padding: '16px',
      background: 'linear-gradient(135deg, var(--accent-blue-primary) 0%, var(--accent-blue-active) 100%)',
      color: '#ffffff',
      border: 'none',
      borderRadius: '12px',
      fontSize: '16px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      boxShadow: '0 4px 12px var(--accent-blue-glow)'
    },
    continueBtn: {
      width: '100%',
      padding: '12px',
      backgroundColor: 'transparent',
      color: 'var(--text-secondary)',
      border: '1px solid var(--border-secondary)',
      borderRadius: '10px',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
      marginTop: '12px',
      transition: 'all 0.2s ease'
    }
  };

  return (
    <>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fadeOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }
        @keyframes slideIn {
          0% { transform: translateX(100%); opacity: 0; }
          60% { transform: translateX(-10px); }
          100% { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
          0% { transform: translateX(0); opacity: 1; }
          100% { transform: translateX(100%); opacity: 0; }
        }
        @keyframes slideInItem {
          from { 
            opacity: 0;
            transform: translateX(30px);
          }
          to { 
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes scaleIn {
          0% { transform: scale(0.8); opacity: 0; }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); opacity: 1; }
        }
        .cart-drawer-close-btn:hover {
          background-color: rgba(255, 255, 255, 0.1) !important;
        }
        .cart-drawer-quantity-btn:hover {
          background-color: rgba(255, 255, 255, 0.1) !important;
          border-color: var(--accent-blue-primary) !important;
        }
        .cart-drawer-quantity-btn:active {
          transform: scale(0.95);
        }
        .cart-drawer-remove-btn:hover {
          transform: scale(1.1);
        }
        .cart-drawer-checkout-btn:hover {
          background: linear-gradient(135deg, var(--accent-blue-hover) 0%, var(--accent-blue-primary) 100%) !important;
          transform: translateY(-2px);
          box-shadow: 0 8px 20px var(--accent-blue-glow) !important;
        }
        .cart-drawer-checkout-btn:active {
          transform: translateY(0);
        }
        .cart-drawer-continue-btn:hover {
          background-color: rgba(255, 255, 255, 0.05) !important;
          border-color: var(--text-primary) !important;
          color: var(--text-primary) !important;
        }
        .cart-item:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3) !important;
          border-color: var(--border-primary) !important;
        }
        @media (max-width: 640px) {
          .cart-drawer {
            max-width: 100% !important;
          }
        }
      `}</style>

      <div style={styles.overlay} onClick={handleClose} />
      <div style={styles.drawer} className="cart-drawer" onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <div style={styles.title}>
            Shopping Cart
            {cart.length > 0 && <span style={styles.badge}>{getTotalItems()}</span>}
          </div>
          <button
            style={styles.closeBtn}
            className="cart-drawer-close-btn"
            onClick={handleClose}
          >
            ✕
          </button>
        </div>

        <div style={styles.content}>
          {cart.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>🛒</div>
              <div style={styles.emptyText}>Your cart is empty</div>
              <div style={styles.emptySubtext}>Add items to get started</div>
            </div>
          ) : (
            cart.map(item => (
              <div key={item._id} style={styles.cartItem} className="cart-item">
                <img
                  src={getImageUrl(item.image)}
                  alt={item.name}
                  style={styles.itemImage}
                  loading="lazy"
                />
                <div style={styles.itemDetails}>
                  <div style={styles.itemName}>{item.name}</div>
                  <div style={styles.itemPrice}>${item.price.toFixed(2)}</div>
                  <div style={styles.quantityRow}>
                    <div style={styles.quantityControl}>
                      <button
                        style={styles.quantityBtn}
                        className="cart-drawer-quantity-btn"
                        onClick={() => onUpdateQuantity(item._id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >
                        −
                      </button>
                      <span style={styles.quantity}>{item.quantity}</span>
                      <button
                        style={styles.quantityBtn}
                        className="cart-drawer-quantity-btn"
                        onClick={() => onUpdateQuantity(item._id, item.quantity + 1)}
                      >
                        +
                      </button>
                    </div>
                    <button
                      style={styles.removeBtn}
                      className="cart-drawer-remove-btn"
                      onClick={() => onRemoveItem(item._id)}
                      title="Remove item"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div style={styles.footer}>
            <div style={styles.subtotal}>
              <span>Subtotal ({getTotalItems()} items)</span>
              <span>${getTotalAmount().toFixed(2)}</span>
            </div>
            <div style={styles.total}>
              <span>Total</span>
              <span>${getTotalAmount().toFixed(2)}</span>
            </div>
            <button
              style={styles.checkoutBtn}
              className="cart-drawer-checkout-btn"
              onClick={handleCheckout}
            >
              Proceed to Checkout
            </button>
            <button
              style={styles.continueBtn}
              className="cart-drawer-continue-btn"
              onClick={handleClose}
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </>
  );
}
