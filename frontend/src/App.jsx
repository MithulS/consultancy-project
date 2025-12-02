import React, { useState, useEffect } from 'react';
import RegisterModern from './components/RegisterModern';
import VerifyOTPEnhanced from './components/VerifyOTPEnhanced';
import LoginModern from './components/LoginModern';
import Dashboard from './components/Dashboard';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';

export default function App() {
  const [currentPage, setCurrentPage] = useState('login');

  useEffect(() => {
    // Handle hash-based routing
    const handleHashChange = () => {
      try {
        let hash = window.location.hash.substring(1) || 'login';
        console.log('🔀 Route change:', hash);
        
        // Extract just the path part before any query parameters
        // E.g., "verify-otp?email=..." becomes "verify-otp"
        if (hash.includes('?')) {
          hash = hash.split('?')[0];
        }
        
        // Check if it's reset password page with query params
        if (window.location.search.includes('token') && window.location.search.includes('email')) {
          setCurrentPage('reset-password');
        } else {
          setCurrentPage(hash);
        }
      } catch (error) {
        console.error('❌ Route handling error:', error);
        setCurrentPage('login'); // Fallback to login on error
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const renderContent = () => {
    switch(currentPage) {
      case 'register':
        return <RegisterModern />;
      case 'verify-otp':
        return <VerifyOTPEnhanced />;
      case 'forgot-password':
        return <ForgotPassword />;
      case 'reset-password':
        return <ResetPassword />;
      case 'dashboard':
        return <Dashboard />;
      case 'login':
      default:
        return <LoginModern />;
    }
  };

  return (
    <div>
      {renderContent()}
    </div>
  );
}
