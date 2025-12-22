import React, { useState, useEffect } from 'react';

const ExitIntentPopup = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    // Check if popup has been shown before
    const hasShown = localStorage.getItem('exitIntentShown');
    if (hasShown) return;

    const handleMouseLeave = (e) => {
      // Detect mouse leaving viewport from top
      if (e.clientY <= 0 && !hasShown) {
        setIsVisible(true);
        localStorage.setItem('exitIntentShown', 'true');
      }
    };

    // Add delay to prevent immediate trigger
    const timeoutId = setTimeout(() => {
      document.addEventListener('mouseleave', handleMouseLeave);
    }, 5000); // Wait 5 seconds before activating

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Track the event
    if (window.gtag) {
      window.gtag('event', 'exit_intent_signup', {
        email: email
      });
    }

    // Send to backend (add your API endpoint)
    try {
      const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      await fetch(`${API}/api/marketing/exit-intent-signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
    } catch (error) {
      console.error('Exit intent signup error:', error);
    }

    setSubmitted(true);
    
    // Auto close after 3 seconds
    setTimeout(() => {
      setIsVisible(false);
    }, 3000);
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <>
      <div className="exit-intent-overlay" onClick={handleClose} />
      <div className="exit-intent-popup">
        <button className="exit-intent-close" onClick={handleClose}>
          ✕
        </button>

        {!submitted ? (
          <div className="exit-intent-content">
            <div className="exit-intent-icon">🎁</div>
            <h2>Wait! Don't Leave Empty Handed</h2>
            <p className="exit-intent-subtitle">
              Get <strong>10% OFF</strong> your first order
            </p>
            <p className="exit-intent-description">
              Join our newsletter and get exclusive deals delivered to your inbox!
            </p>

            <form onSubmit={handleSubmit} className="exit-intent-form">
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="exit-intent-input"
              />
              <button type="submit" className="exit-intent-button">
                Get My 10% Discount
              </button>
            </form>

            <p className="exit-intent-privacy">
              🔒 We respect your privacy. Unsubscribe anytime.
            </p>
          </div>
        ) : (
          <div className="exit-intent-success">
            <div className="success-icon">✓</div>
            <h2>Thank You!</h2>
            <p>Check your email for your discount code.</p>
          </div>
        )}
      </div>

      <style>{`
        .exit-intent-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.6);
          z-index: 9998;
          animation: fadeIn 0.3s;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .exit-intent-popup {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: white;
          padding: 3rem 2rem;
          border-radius: 16px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          z-index: 9999;
          max-width: 500px;
          width: 90%;
          animation: slideUp 0.4s ease-out;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translate(-50%, -40%);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -50%);
          }
        }

        .exit-intent-close {
          position: absolute;
          top: 1rem;
          right: 1rem;
          background: none;
          border: none;
          font-size: 1.5rem;
          color: #9ca3af;
          cursor: pointer;
          padding: 0.5rem;
          line-height: 1;
          transition: color 0.2s;
        }

        .exit-intent-close:hover {
          color: #ef4444;
        }

        .exit-intent-content {
          text-align: center;
        }

        .exit-intent-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
        }

        .exit-intent-popup h2 {
          font-size: 1.75rem;
          color: #1f2937;
          margin: 0 0 0.5rem 0;
          font-weight: 700;
        }

        .exit-intent-subtitle {
          font-size: 1.25rem;
          color: #059669;
          margin: 0.5rem 0;
          font-weight: 600;
        }

        .exit-intent-subtitle strong {
          font-size: 1.5rem;
          color: #dc2626;
        }

        .exit-intent-description {
          color: #6b7280;
          margin: 1rem 0 2rem 0;
          font-size: 0.95rem;
        }

        .exit-intent-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .exit-intent-input {
          padding: 1rem;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          font-size: 1rem;
          transition: border-color 0.2s;
        }

        .exit-intent-input:focus {
          outline: none;
          border-color: #3b82f6;
        }

        .exit-intent-button {
          padding: 1rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .exit-intent-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
        }

        .exit-intent-privacy {
          font-size: 0.8rem;
          color: #9ca3af;
          margin-top: 1rem;
        }

        .exit-intent-success {
          text-align: center;
        }

        .success-icon {
          width: 80px;
          height: 80px;
          background: #10b981;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 3rem;
          color: white;
          margin: 0 auto 1.5rem;
          animation: scaleIn 0.5s ease-out;
        }

        @keyframes scaleIn {
          from {
            transform: scale(0);
          }
          to {
            transform: scale(1);
          }
        }

        .exit-intent-success h2 {
          color: #10b981;
          margin-bottom: 0.5rem;
        }

        .exit-intent-success p {
          color: #6b7280;
          font-size: 1rem;
        }

        @media (max-width: 768px) {
          .exit-intent-popup {
            padding: 2rem 1.5rem;
          }

          .exit-intent-popup h2 {
            font-size: 1.5rem;
          }

          .exit-intent-icon {
            font-size: 3rem;
          }
        }
      `}</style>
    </>
  );
};

export default ExitIntentPopup;
