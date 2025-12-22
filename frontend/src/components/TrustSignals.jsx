import React from 'react';

const TrustSignals = () => {
  const signals = [
    {
      icon: '🔒',
      text: 'Secure Checkout (SSL)',
      subtext: '256-bit encryption'
    },
    {
      icon: '🚚',
      text: 'Free Shipping',
      subtext: 'On orders over $50'
    },
    {
      icon: '↩️',
      text: '30-Day Returns',
      subtext: 'Money-back guarantee'
    },
    {
      icon: '✓',
      text: '2-Year Warranty',
      subtext: 'All products covered'
    }
  ];

  return (
    <div className="trust-signals">
      {signals.map((signal, index) => (
        <div key={index} className="trust-signal">
          <span className="trust-icon">{signal.icon}</span>
          <div className="trust-content">
            <div className="trust-text">{signal.text}</div>
            <div className="trust-subtext">{signal.subtext}</div>
          </div>
        </div>
      ))}
      
      <style>{`
        .trust-signals {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin: 2rem 0;
          padding: 1.5rem;
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
          border-radius: 12px;
        }

        .trust-signal {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.5rem;
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
          transition: transform 0.2s;
        }

        .trust-signal:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }

        .trust-icon {
          font-size: 2rem;
          flex-shrink: 0;
        }

        .trust-content {
          flex: 1;
        }

        .trust-text {
          font-weight: 600;
          color: #2d3748;
          font-size: 0.9rem;
          margin-bottom: 0.2rem;
        }

        .trust-subtext {
          font-size: 0.75rem;
          color: #718096;
        }

        @media (max-width: 768px) {
          .trust-signals {
            grid-template-columns: 1fr 1fr;
            gap: 0.75rem;
            padding: 1rem;
          }

          .trust-signal {
            flex-direction: column;
            text-align: center;
            padding: 1rem 0.5rem;
          }

          .trust-icon {
            font-size: 1.5rem;
          }

          .trust-text {
            font-size: 0.8rem;
          }

          .trust-subtext {
            font-size: 0.7rem;
          }
        }
      `}</style>
    </div>
  );
};

export default TrustSignals;
