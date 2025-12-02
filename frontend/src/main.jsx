import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

// Global error handlers for debugging
window.addEventListener('unhandledrejection', (event) => {
  console.error('🚨 Unhandled Promise Rejection:');
  console.error('Reason:', event.reason);
  console.error('Promise:', event.promise);
  console.error('Stack:', event.reason?.stack);
  event.preventDefault(); // Prevents default browser error handling
});

window.addEventListener('error', (event) => {
  console.error('🚨 Global Error:');
  console.error('Message:', event.message);
  console.error('Source:', event.filename);
  console.error('Line:', event.lineno);
  console.error('Column:', event.colno);
  console.error('Error:', event.error);
});

createRoot(document.getElementById('root')).render(<App />);
