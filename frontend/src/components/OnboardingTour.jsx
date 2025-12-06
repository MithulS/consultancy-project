// User Onboarding Tour Component
import React, { useState, useEffect } from 'react';

export default function OnboardingTour({ userType = 'customer' }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    // Check if user has completed onboarding
    const onboardingKey = `onboarding_${userType}_completed`;
    const hasCompleted = localStorage.getItem(onboardingKey);
    
    if (!hasCompleted) {
      // Show tour after 1 second
      setTimeout(() => setIsActive(true), 1000);
    }
  }, [userType]);

  const customerSteps = [
    {
      title: 'Welcome to ElectroStore! 🛒',
      description: 'Discover amazing electronics at great prices. Let\'s take a quick tour!',
      target: null,
      position: 'center'
    },
    {
      title: 'Browse Products 📱',
      description: 'Explore our wide range of electronics. Use filters and search to find exactly what you need.',
      target: '.product-grid',
      position: 'bottom'
    },
    {
      title: 'Add to Cart 🛍️',
      description: 'Found something you like? Click "Add to Cart" to save it for checkout.',
      target: '.add-to-cart-btn',
      position: 'top'
    },
    {
      title: 'View Your Cart 🛒',
      description: 'Check your cart anytime to review items and proceed to checkout.',
      target: 'button[style*="Cart"]',
      position: 'bottom'
    },
    {
      title: 'Track Orders 📦',
      description: 'View your order history and track deliveries from "My Orders".',
      target: 'button[style*="Orders"]',
      position: 'bottom'
    },
    {
      title: 'You\'re All Set! ✨',
      description: 'Start shopping and enjoy our seamless experience. Happy shopping!',
      target: null,
      position: 'center'
    }
  ];

  const adminSteps = [
    {
      title: 'Welcome to Admin Panel! 🛡️',
      description: 'Manage your store efficiently. Let\'s explore the key features!',
      target: null,
      position: 'center'
    },
    {
      title: 'Product Management 📦',
      description: 'Add, edit, and delete products. Keep your inventory up to date.',
      target: '.product-table',
      position: 'top'
    },
    {
      title: 'Sales Analytics 📊',
      description: 'Track your sales performance and revenue insights.',
      target: 'button[style*="Analytics"]',
      position: 'bottom'
    },
    {
      title: 'Admin Settings ⚙️',
      description: 'Update your profile, change passwords, and manage notifications.',
      target: 'button[style*="Settings"]',
      position: 'bottom'
    },
    {
      title: 'Ready to Manage! ✨',
      description: 'You\'re all set to efficiently manage your store. Let\'s get started!',
      target: null,
      position: 'center'
    }
  ];

  const steps = userType === 'admin' ? adminSteps : customerSteps;
  const step = steps[currentStep];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeTour();
    }
  };

  const handleSkip = () => {
    completeTour();
  };

  const completeTour = () => {
    setIsActive(false);
    localStorage.setItem(`onboarding_${userType}_completed`, 'true');
  };

  if (!isActive || !step) return null;

  const styles = {
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.7)',
      zIndex: 9997,
      animation: 'fadeIn 0.3s ease-out'
    },
    tooltip: {
      position: 'fixed',
      background: 'white',
      borderRadius: '16px',
      padding: '24px',
      maxWidth: '400px',
      boxShadow: '0 24px 80px rgba(0, 0, 0, 0.3)',
      zIndex: 9998,
      animation: 'scaleIn 0.3s ease-out',
      ...(step.position === 'center' && {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)'
      })
    },
    header: {
      marginBottom: '16px'
    },
    title: {
      fontSize: '20px',
      fontWeight: '700',
      color: '#1f2937',
      marginBottom: '8px'
    },
    description: {
      fontSize: '15px',
      color: '#64748b',
      lineHeight: '1.6',
      marginBottom: '24px'
    },
    progress: {
      display: 'flex',
      gap: '6px',
      marginBottom: '20px'
    },
    progressDot: {
      width: '8px',
      height: '8px',
      borderRadius: '50%',
      backgroundColor: '#e5e7eb',
      transition: 'all 0.3s ease'
    },
    progressDotActive: {
      backgroundColor: '#667eea',
      width: '24px',
      borderRadius: '4px'
    },
    buttonGroup: {
      display: 'flex',
      gap: '12px',
      justifyContent: 'flex-end'
    },
    button: {
      padding: '10px 20px',
      borderRadius: '10px',
      border: 'none',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease'
    },
    skipButton: {
      background: 'transparent',
      color: '#64748b',
      border: '1px solid #e5e7eb'
    },
    nextButton: {
      background: 'linear-gradient(135deg, #667eea, #764ba2)',
      color: 'white',
      boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
    }
  };

  return (
    <>
      <div style={styles.overlay} onClick={handleSkip}></div>
      <div style={styles.tooltip} role="dialog" aria-labelledby="tour-title">
        <div style={styles.header}>
          <h2 id="tour-title" style={styles.title}>{step.title}</h2>
        </div>
        
        <p style={styles.description}>{step.description}</p>
        
        <div style={styles.progress} role="progressbar" aria-valuenow={currentStep + 1} aria-valuemin="1" aria-valuemax={steps.length}>
          {steps.map((_, index) => (
            <div
              key={index}
              style={{
                ...styles.progressDot,
                ...(index === currentStep && styles.progressDotActive)
              }}
            />
          ))}
        </div>
        
        <div style={styles.buttonGroup}>
          <button
            style={{...styles.button, ...styles.skipButton}}
            onClick={handleSkip}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f3f4f6';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            Skip Tour
          </button>
          <button
            style={{...styles.button, ...styles.nextButton}}
            onClick={handleNext}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.3)';
            }}
          >
            {currentStep < steps.length - 1 ? 'Next' : 'Get Started'}
          </button>
        </div>
      </div>
      
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: ${step.position === 'center' ? 'translate(-50%, -50%) scale(0.9)' : 'scale(0.9)'};
          }
          to {
            opacity: 1;
            transform: ${step.position === 'center' ? 'translate(-50%, -50%) scale(1)' : 'scale(1)'};
          }
        }
      `}</style>
    </>
  );
}

// Helper function to restart tour
export function restartOnboarding(userType) {
  localStorage.removeItem(`onboarding_${userType}_completed`);
  window.location.reload();
}
