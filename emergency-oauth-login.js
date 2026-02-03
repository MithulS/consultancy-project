/* 
 * EMERGENCY OAUTH TOKEN PROCESSOR
 * Run this in browser console (F12) if automatic processing fails
 * This manually extracts the token from URL and completes login
 */

(function emergencyOAuthLogin() {
  console.log('🔧 Emergency OAuth Token Processor Starting...');
  
  // Extract token from URL
  const hash = window.location.hash;
  const queryString = hash.includes('?') ? hash.split('?')[1] : '';
  const urlParams = new URLSearchParams(queryString);
  const token = urlParams.get('token');
  
  if (!token) {
    console.error('❌ No token found in URL');
    return;
  }
  
  console.log('✅ Token found:', token.substring(0, 20) + '...');
  
  // Clear any blocking flags
  sessionStorage.removeItem('oauth_callback_processed');
  
  // Store token
  localStorage.setItem('token', token);
  console.log('✅ Token stored in localStorage');
  
  // Fetch user profile
  const API = 'http://localhost:5000';
  
  fetch(`${API}/api/auth/me`, {
    headers: { 'Authorization': `Bearer ${token}` }
  })
    .then(res => {
      console.log('📡 API Response Status:', res.status);
      if (!res.ok) {
        throw new Error(`API returned ${res.status}`);
      }
      return res.json();
    })
    .then(data => {
      console.log('✅ User profile fetched:', data);
      
      // Store user data
      localStorage.setItem('user', JSON.stringify(data));
      console.log('✅ User data stored');
      
      // Trigger login event
      window.dispatchEvent(new CustomEvent('userLoggedIn', {
        detail: { user: data, token: token }
      }));
      
      console.log('✅ Login event dispatched');
      console.log('🎉 Login complete! Redirecting to dashboard...');
      
      // Redirect to dashboard
      setTimeout(() => {
        window.location.hash = '#dashboard';
        window.location.reload();
      }, 500);
    })
    .catch(error => {
      console.error('❌ Emergency login failed:', error);
      console.log('Trying to diagnose...');
      
      // Check if backend is running
      fetch(`${API}/health`)
        .then(res => res.json())
        .then(data => console.log('✅ Backend is running:', data))
        .catch(() => console.error('❌ Backend is not responding on port 5000'));
    });
})();

console.log('📋 If above fails, manually run:');
console.log('1. sessionStorage.clear()');
console.log('2. localStorage.clear()');  
console.log('3. location.reload()');
console.log('4. Then click "Continue with Google" again');
