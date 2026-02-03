#!/usr/bin/env node
/**
 * Search & Voice Recognition Testing Script
 * Tests all search functionality and voice recognition features
 */

const axios = require('axios');

const API_BASE = process.env.API_URL || 'http://localhost:5000';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
};

function log(type, test, result, details = '') {
  const timestamp = new Date().toISOString();
  const icon = result === 'PASS' ? '✅' : result === 'FAIL' ? '❌' : '⚠️';
  const color = result === 'PASS' ? colors.green : result === 'FAIL' ? colors.red : colors.yellow;
  
  console.log(`${color}${icon} [${type}] ${test} - ${result}${colors.reset}`);
  if (details) {
    console.log(`   ${colors.cyan}${details}${colors.reset}`);
  }
}

async function testSearchAPI() {
  console.log(`\n${colors.bold}=== TESTING SEARCH API ===${colors.reset}\n`);
  
  try {
    // Test 1: Basic Search
    const searchResponse = await axios.get(`${API_BASE}/api/products?search=hammer`);
    if (searchResponse.data.success && searchResponse.data.products) {
      log('Search API', 'Basic Search', 'PASS', `Found ${searchResponse.data.products.length} products for "hammer"`);
    } else {
      log('Search API', 'Basic Search', 'FAIL', 'Response format incorrect');
    }
    
    // Test 2: Case Insensitive Search
    const caseResponse = await axios.get(`${API_BASE}/api/products?search=HAMMER`);
    if (caseResponse.data.success && caseResponse.data.products.length > 0) {
      log('Search API', 'Case Insensitive', 'PASS', `"HAMMER" found ${caseResponse.data.products.length} results`);
    } else {
      log('Search API', 'Case Insensitive', 'FAIL', 'Case sensitivity issue detected');
    }
    
    // Test 3: Partial Match Search
    const partialResponse = await axios.get(`${API_BASE}/api/products?search=ham`);
    if (partialResponse.data.success) {
      log('Search API', 'Partial Match', 'PASS', `"ham" found ${partialResponse.data.products.length} products`);
    } else {
      log('Search API', 'Partial Match', 'FAIL', 'Partial matching not working');
    }
    
    // Test 4: Combined Category + Search
    const combinedResponse = await axios.get(`${API_BASE}/api/products?search=drill&category=Tools`);
    if (combinedResponse.data.success) {
      const allInCategory = combinedResponse.data.products.every(p => p.category === 'Tools');
      if (allInCategory) {
        log('Search API', 'Category + Search', 'PASS', `Found ${combinedResponse.data.products.length} drills in Tools`);
      } else {
        log('Search API', 'Category + Search', 'WARN', 'Some results not in correct category');
      }
    } else {
      log('Search API', 'Category + Search', 'FAIL', 'Combined filter failed');
    }
    
    // Test 5: Empty Search
    const emptyResponse = await axios.get(`${API_BASE}/api/products?search=`);
    if (emptyResponse.data.success && emptyResponse.data.products.length > 0) {
      log('Search API', 'Empty Search', 'PASS', `Returns all products (${emptyResponse.data.products.length})`);
    } else {
      log('Search API', 'Empty Search', 'FAIL', 'Empty search not handled correctly');
    }
    
    // Test 6: No Results Search
    const noResultsResponse = await axios.get(`${API_BASE}/api/products?search=xyzabc123nonexistent`);
    if (noResultsResponse.data.success && noResultsResponse.data.products.length === 0) {
      log('Search API', 'No Results', 'PASS', 'Correctly returns empty array');
    } else {
      log('Search API', 'No Results', 'FAIL', 'No results case not handled');
    }
    
    // Test 7: Special Characters
    const specialResponse = await axios.get(`${API_BASE}/api/products?search=3/4`);
    if (specialResponse.data.success) {
      log('Search API', 'Special Characters', 'PASS', `Handled "3/4" correctly`);
    } else {
      log('Search API', 'Special Characters', 'FAIL', 'Special characters caused error');
    }
    
    // Test 8: Pagination
    const paginatedResponse = await axios.get(`${API_BASE}/api/products?page=1&limit=5`);
    if (paginatedResponse.data.products.length <= 5 && paginatedResponse.data.pagination) {
      log('Search API', 'Pagination', 'PASS', `Page 1 has ${paginatedResponse.data.products.length} items`);
    } else {
      log('Search API', 'Pagination', 'FAIL', 'Pagination not working correctly');
    }
    
  } catch (error) {
    log('Search API', 'Connection', 'FAIL', `Cannot connect to backend: ${error.message}`);
    console.log(`\n${colors.yellow}⚠️ Make sure backend is running on ${API_BASE}${colors.reset}\n`);
  }
}

async function testDatabaseIndexes() {
  console.log(`\n${colors.bold}=== TESTING DATABASE INDEXES ===${colors.reset}\n`);
  
  try {
    // Check if backend can query products
    const response = await axios.get(`${API_BASE}/api/products?limit=1`);
    if (response.data.success) {
      log('Database', 'Connection', 'PASS', 'Backend connected to MongoDB');
      log('Database', 'Product Model', 'PASS', 'Product schema working');
    }
    
    // Test text index performance
    const start = Date.now();
    await axios.get(`${API_BASE}/api/products?search=tool`);
    const duration = Date.now() - start;
    
    if (duration < 200) {
      log('Database', 'Text Index Speed', 'PASS', `Search completed in ${duration}ms`);
    } else {
      log('Database', 'Text Index Speed', 'WARN', `Search took ${duration}ms (consider re-indexing)`);
    }
    
  } catch (error) {
    log('Database', 'Health Check', 'FAIL', error.message);
  }
}

function testVoiceRecognitionSupport() {
  console.log(`\n${colors.bold}=== VOICE RECOGNITION BROWSER SUPPORT ===${colors.reset}\n`);
  
  const recommendations = [
    'Chrome: ✅ Fully Supported (v25+)',
    'Edge: ✅ Fully Supported (v79+)',
    'Safari: ✅ Fully Supported (v14.1+)',
    'Firefox: ❌ Not Supported',
    'Opera: ✅ Supported (Chromium-based)',
    'Brave: ✅ Supported (Chromium-based)',
  ];
  
  recommendations.forEach(rec => {
    console.log(`   ${rec}`);
  });
  
  console.log(`\n${colors.cyan}📝 Note: Voice recognition requires HTTPS in production${colors.reset}`);
  console.log(`${colors.cyan}📝 Localhost is allowed for development${colors.reset}\n`);
}

async function testFrontendAccess() {
  console.log(`\n${colors.bold}=== TESTING FRONTEND ACCESS ===${colors.reset}\n`);
  
  try {
    const response = await axios.get(FRONTEND_URL, { timeout: 5000 });
    if (response.status === 200) {
      log('Frontend', 'Server Running', 'PASS', `Accessible at ${FRONTEND_URL}`);
    }
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      log('Frontend', 'Server Running', 'FAIL', `Not accessible at ${FRONTEND_URL}`);
      console.log(`\n${colors.yellow}⚠️ Start frontend: cd frontend && npm run dev${colors.reset}\n`);
    } else {
      log('Frontend', 'Server Status', 'WARN', error.message);
    }
  }
}

function displayManualTests() {
  console.log(`\n${colors.bold}=== MANUAL TESTS REQUIRED ===${colors.reset}\n`);
  
  const manualTests = [
    {
      test: 'Voice Search - Basic',
      steps: [
        '1. Open browser to homepage',
        '2. Click microphone icon 🎤',
        '3. Allow microphone access',
        '4. Speak: "hammer"',
        '5. Verify search results appear automatically'
      ]
    },
    {
      test: 'Voice Search - Visual Feedback',
      steps: [
        '1. Click microphone icon',
        '2. Verify button shows 🔴 pulsing',
        '3. Verify yellow background',
        '4. Speak and verify transcription',
        '5. Verify auto-redirect to results'
      ]
    },
    {
      test: 'Voice Search - Error Handling',
      steps: [
        '1. Click microphone icon',
        '2. Stay silent for 5 seconds',
        '3. Verify error toast appears',
        '4. Verify error auto-dismisses'
      ]
    },
    {
      test: 'Text Search - URL Integration',
      steps: [
        '1. Type "drill" in search',
        '2. Press Enter',
        '3. Verify URL contains ?search=drill',
        '4. Refresh page',
        '5. Verify search term persists'
      ]
    },
    {
      test: 'Combined Filters',
      steps: [
        '1. Select category "Tools"',
        '2. Search for "saw"',
        '3. Verify only saws in Tools shown',
        '4. Check URL has both parameters'
      ]
    }
  ];
  
  manualTests.forEach((test, index) => {
    console.log(`${colors.cyan}${index + 1}. ${test.test}${colors.reset}`);
    test.steps.forEach(step => {
      console.log(`   ${step}`);
    });
    console.log('');
  });
}

function displayResults() {
  console.log(`\n${colors.bold}=== TEST SUMMARY ===${colors.reset}\n`);
  console.log(`${colors.green}✅ All automated tests completed${colors.reset}`);
  console.log(`${colors.cyan}📋 Review manual tests above${colors.reset}`);
  console.log(`${colors.cyan}📖 See SEARCH_VOICE_FIX_COMPLETE.md for detailed guide${colors.reset}\n`);
}

// Main execution
async function runAllTests() {
  console.log(`${colors.bold}\n╔════════════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.bold}║   SEARCH & VOICE RECOGNITION - TEST SUITE         ║${colors.reset}`);
  console.log(`${colors.bold}╚════════════════════════════════════════════════════╝${colors.reset}\n`);
  
  await testSearchAPI();
  await testDatabaseIndexes();
  testVoiceRecognitionSupport();
  await testFrontendAccess();
  displayManualTests();
  displayResults();
}

// Run tests
runAllTests().catch(error => {
  console.error(`${colors.red}❌ Test suite error: ${error.message}${colors.reset}`);
  process.exit(1);
});
