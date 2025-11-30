import React, { useState, useEffect } from 'react';
import Register from './components/register';
import RegisterModern from './components/RegisterModern';
import VerifyOTP from './components/verifyotp';
import VerifyOTPModern from './components/VerifyOTPModern';
import VerifyOTPEnhanced from './components/VerifyOTPEnhanced';
import Login from './components/login';
import LoginModern from './components/LoginModern';
import Dashboard from './components/Dashboard';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';

export default function App() {
  const [currentPage, setCurrentPage] = useState('login');

  useEffect(() => {
    // Handle hash-based routing
    const handleHashChange = () => {
      let hash = window.location.hash.substring(1) || 'login';
      
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
