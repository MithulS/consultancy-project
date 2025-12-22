import React, { useState, useEffect } from 'react';

const UrgencyIndicators = ({ product, recentPurchases = 0 }) => {
  const [timeLeft, setTimeLeft] = useState(null);

  // Simulate sale countdown (example: ends in 24 hours)
  useEffect(() => {
    if (product.onSale) {
      const endTime = new Date().getTime() + 24 * 60 * 60 * 1000;
      
      const interval = setInterval(() => {
        const now = new Date().getTime();
        const distance = endTime - now;
        
        if (distance < 0) {
          clearInterval(interval);
          setTimeLeft(null);
        } else {
          const hours = Math.floor(distance / (1000 * 60 * 60));
          const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((distance % (1000 * 60)) / 1000);
          setTimeLeft({ hours, minutes, seconds });
        }
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [product.onSale]);

  return (
    <div className="urgency-indicators">
      {/* Low Stock Warning */}
      {product.stock < 10 && product.stock > 0 && (
        <div className="urgency-banner low-stock">
          <span className="urgency-icon">⚠️</span>
          <span className="urgency-text">
            <strong>Only {product.stock} left in stock</strong> - Order soon!
          </span>
        </div>
      )}

      {/* Out of Stock */}
      {product.stock === 0 && (
        <div className="urgency-banner out-of-stock">
          <span className="urgency-icon">❌</span>
          <span className="urgency-text">
            <strong>Out of Stock</strong> - Notify me when available
          </span>
        </div>
      )}

      {/* Social Proof */}
      {recentPurchases > 5 && (
        <div className="urgency-banner social-proof">
          <span className="urgency-icon">🔥</span>
          <span className="urgency-text">
            <strong>{recentPurchases} people</strong> bought this in the last 24 hours
          </span>
        </div>
      )}

      {/* Sale Countdown */}
      {product.onSale && timeLeft && (
        <div className="urgency-banner sale-countdown">
          <span className="urgency-icon">⏰</span>
          <span className="urgency-text">
            <strong>Sale ends in:</strong> {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
          </span>
        </div>
      )}

      {/* Fast Shipping */}
      {product.stock > 0 && (
        <div className="urgency-banner fast-shipping">
          <span className="urgency-icon">🚀</span>
          <span className="urgency-text">
            Order in the next <strong>2 hours</strong> for delivery by tomorrow
          </span>
        </div>
      )}

      <style>{`
        .urgency-indicators {
          margin: 1rem 0;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .urgency-banner {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.875rem 1rem;
          border-radius: 8px;
          font-size: 0.9rem;
          animation: slideIn 0.3s ease-out;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .urgency-icon {
          font-size: 1.25rem;
          flex-shrink: 0;
        }

        .urgency-text {
          color: #2d3748;
          line-height: 1.4;
        }

        .urgency-text strong {
          font-weight: 700;
        }

        .low-stock {
          background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
          border: 2px solid #f59e0b;
        }

        .out-of-stock {
          background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
          border: 2px solid #ef4444;
        }

        .social-proof {
          background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
          border: 2px solid #3b82f6;
        }

        .sale-countdown {
          background: linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%);
          border: 2px solid #ec4899;
        }

        .fast-shipping {
          background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
          border: 2px solid #10b981;
        }

        @media (max-width: 768px) {
          .urgency-banner {
            padding: 0.75rem;
            font-size: 0.85rem;
          }

          .urgency-icon {
            font-size: 1.1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default UrgencyIndicators;
