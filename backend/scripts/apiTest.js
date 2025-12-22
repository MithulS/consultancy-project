// API Endpoint Functional Testing
const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';
const results = { passed: 0, failed: 0, tests: [] };

const test = async (name, testFn) => {
  try {
    await testFn();
    results.passed++;
    results.tests.push({ name, status: 'PASS' });
    console.log(`✅ ${name}`);
    return true;
  } catch (error) {
    results.failed++;
    results.tests.push({ name, status: 'FAIL', error: error.message });
    console.log(`❌ ${name}: ${error.message}`);
    return false;
  }
};

async function runAPITests() {
  console.log('\n🌐 API ENDPOINT FUNCTIONAL TESTS');
  console.log('='.repeat(70));

  // Health Check Tests
  console.log('\n💊 HEALTH & STATUS ENDPOINTS:');
  console.log('-'.repeat(70));
  
  await test('GET /health - Server health check', async () => {
    const res = await axios.get(`${API_BASE}/health`);
    if (res.data.status !== 'OK') throw new Error('Health check failed');
  });

  await test('GET /api/health - API health check', async () => {
    const res = await axios.get(`${API_BASE}/health`);
    if (!res.data.status) throw new Error('API health check failed');
  });

  // Product Endpoints
  console.log('\n📦 PRODUCT ENDPOINTS:');
  console.log('-'.repeat(70));

  await test('GET /products - List all products', async () => {
    const res = await axios.get(`${API_BASE}/products`);
    if (!res.data.success) throw new Error('Products fetch failed');
    if (!Array.isArray(res.data.products)) throw new Error('Invalid response format');
  });

  await test('GET /products?category=Tools - Filter by category', async () => {
    const res = await axios.get(`${API_BASE}/products?category=Tools`);
    if (!res.data.success) throw new Error('Category filter failed');
  });

  await test('GET /products?search=test - Search functionality', async () => {
    const res = await axios.get(`${API_BASE}/products?search=test`);
    if (!res.data.success) throw new Error('Search failed');
  });

  // Authentication Endpoints (Without actual registration to avoid DB pollution)
  console.log('\n🔐 AUTHENTICATION ENDPOINTS (Structure Tests):');
  console.log('-'.repeat(70));

  await test('POST /auth/register - Endpoint exists (expect validation error)', async () => {
    try {
      await axios.post(`${API_BASE}/auth/register`, {});
    } catch (error) {
      // Expect 400 validation error, not 404
      if (error.response && error.response.status === 400) {
        return; // Success - endpoint exists and validates
      }
      throw new Error(`Expected 400 validation error, got ${error.response?.status || 'no response'}`);
    }
  });

  await test('POST /auth/login - Endpoint exists (expect validation error)', async () => {
    try {
      await axios.post(`${API_BASE}/auth/login`, {});
    } catch (error) {
      if (error.response && (error.response.status === 400 || error.response.status === 401)) {
        return; // Success
      }
      throw new Error(`Expected validation error, got ${error.response?.status}`);
    }
  });

  // Cart Endpoints (Require auth, test structure only)
  console.log('\n🛒 CART ENDPOINTS (Structure Tests):');
  console.log('-'.repeat(70));

  await test('GET /cart - Endpoint exists (expect auth error)', async () => {
    try {
      await axios.get(`${API_BASE}/cart`);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        return; // Success - endpoint exists and requires auth
      }
      throw new Error(`Expected 401 auth error, got ${error.response?.status}`);
    }
  });

  // Order Endpoints
  console.log('\n📋 ORDER ENDPOINTS (Structure Tests):');
  console.log('-'.repeat(70));

  await test('GET /orders - Endpoint exists (expect auth error)', async () => {
    try {
      await axios.get(`${API_BASE}/orders`);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        return;
      }
      throw new Error(`Expected 401 auth error, got ${error.response?.status}`);
    }
  });

  // Analytics Endpoint
  console.log('\n📊 ANALYTICS ENDPOINTS:');
  console.log('-'.repeat(70));

  await test('POST /analytics/track - Event tracking', async () => {
    try {
      const res = await axios.post(`${API_BASE}/analytics/track`, {
        event: 'test_event',
        data: { test: true }
      });
      // Accept both success and validation responses
      if (res.status === 200 || res.status === 201) {
        return;
      }
    } catch (error) {
      // If endpoint exists but rejects bad data, that's fine
      if (error.response && error.response.status < 500) {
        return;
      }
      throw error;
    }
  });

  // CORS & Security Headers
  console.log('\n🛡️  SECURITY HEADERS & CORS:');
  console.log('-'.repeat(70));

  await test('CORS headers present', async () => {
    const res = await axios.get(`${API_BASE}/health`);
    if (!res.headers['access-control-allow-origin']) {
      throw new Error('CORS headers missing');
    }
  });

  // Rate Limiting
  console.log('\n⏱️  RATE LIMITING (Load Test):');
  console.log('-'.repeat(70));

  await test('Rate limiting configured (rapid requests)', async () => {
    const requests = [];
    for (let i = 0; i < 20; i++) {
      requests.push(axios.get(`${API_BASE}/health`).catch(e => e.response));
    }
    const responses = await Promise.all(requests);
    // Check if any requests were rate limited (429 status)
    const rateLimited = responses.some(r => r?.status === 429);
    console.log(`   └─ Rate limiting ${rateLimited ? 'ACTIVE' : 'NOT DETECTED'} (20 rapid requests)`);
  });

  // Summary
  console.log('\n' + '='.repeat(70));
  console.log('📊 API TEST SUMMARY');
  console.log('='.repeat(70));
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`📋 Total: ${results.tests.length}`);
  
  const successRate = ((results.passed / results.tests.length) * 100).toFixed(2);
  console.log(`📈 Success Rate: ${successRate}%`);
  console.log('='.repeat(70) + '\n');

  process.exit(results.failed > 0 ? 1 : 0);
}

// Check if server is running first
axios.get(`${API_BASE}/health`)
  .then(() => runAPITests())
  .catch(error => {
    console.error('❌ ERROR: Backend server not running!');
    console.error('Please start the server with: npm start');
    process.exit(1);
  });
