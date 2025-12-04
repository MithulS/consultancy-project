// E2E Tests - Authentication and Product Management
describe('Authentication Flow', () => {
  beforeEach(() => {
    cy.visit('http://localhost:5173');
  });

  describe('User Registration', () => {
    it('should register a new user successfully', () => {
      cy.get('a[href="#register"]').click();
      
      cy.get('input[name="username"]').type('testuser');
      cy.get('input[name="name"]').type('Test User');
      cy.get('input[name="email"]').type(`test${Date.now()}@example.com`);
      cy.get('input[name="password"]').type('Test@1234');
      
      cy.get('button[type="submit"]').click();
      
      // Should show OTP verification screen
      cy.contains(/OTP|verify/i, { timeout: 10000 }).should('be.visible');
    });

    it('should reject registration with weak password', () => {
      cy.get('a[href="#register"]').click();
      
      cy.get('input[name="username"]').type('testuser');
      cy.get('input[name="name"]').type('Test User');
      cy.get('input[name="email"]').type('test@example.com');
      cy.get('input[name="password"]').type('weak');
      
      cy.get('button[type="submit"]').click();
      
      // Should show error
      cy.contains(/password|invalid/i).should('be.visible');
    });

    it('should reject registration with duplicate email', () => {
      const email = 'duplicate@example.com';
      
      // First registration
      cy.get('a[href="#register"]').click();
      cy.get('input[name="username"]').type('user1');
      cy.get('input[name="name"]').type('User 1');
      cy.get('input[name="email"]').type(email);
      cy.get('input[name="password"]').type('Test@1234');
      cy.get('button[type="submit"]').click();
      
      cy.wait(2000);
      
      // Second registration with same email
      cy.visit('http://localhost:5173/#register');
      cy.get('input[name="username"]').type('user2');
      cy.get('input[name="name"]').type('User 2');
      cy.get('input[name="email"]').type(email);
      cy.get('input[name="password"]').type('Test@1234');
      cy.get('button[type="submit"]').click();
      
      // Should show error
      cy.contains(/already registered|exists/i).should('be.visible');
    });
  });

  describe('User Login', () => {
    it('should login with valid credentials', () => {
      cy.get('a[href="#login"]').click();
      
      // Use test account (should exist in test DB)
      cy.get('input[name="email"]').type('testuser@example.com');
      cy.get('input[name="password"]').type('Test@1234');
      
      cy.get('button[type="submit"]').click();
      
      // Should redirect to dashboard
      cy.url({ timeout: 10000 }).should('include', '#dashboard');
    });

    it('should reject login with invalid credentials', () => {
      cy.get('a[href="#login"]').click();
      
      cy.get('input[name="email"]').type('invalid@example.com');
      cy.get('input[name="password"]').type('WrongPassword');
      
      cy.get('button[type="submit"]').click();
      
      // Should show error
      cy.contains(/invalid|incorrect/i).should('be.visible');
    });

    it('should reject login for unverified user', () => {
      cy.get('a[href="#login"]').click();
      
      cy.get('input[name="email"]').type('unverified@example.com');
      cy.get('input[name="password"]').type('Test@1234');
      
      cy.get('button[type="submit"]').click();
      
      // Should show verification error
      cy.contains(/not verified|verify email/i).should('be.visible');
    });
  });

  describe('Admin Login', () => {
    it('should login as admin with valid credentials', () => {
      cy.visit('http://localhost:5173/#secret-admin-login');
      
      cy.get('input[name="email"]').type('admin@test.com');
      cy.get('input[name="password"]').type('Admin@123');
      
      cy.get('button[type="submit"]').click();
      
      // Should redirect to admin dashboard
      cy.url({ timeout: 10000 }).should('include', '#admin-dashboard');
    });

    it('should reject admin login from regular user', () => {
      cy.visit('http://localhost:5173/#secret-admin-login');
      
      cy.get('input[name="email"]').type('user@test.com');
      cy.get('input[name="password"]').type('User@123');
      
      cy.get('button[type="submit"]').click();
      
      // Should show error
      cy.contains(/invalid|unauthorized/i).should('be.visible');
    });
  });
});

describe('Admin Product Management', () => {
  beforeEach(() => {
    // Login as admin first
    cy.visit('http://localhost:5173/#secret-admin-login');
    cy.get('input[name="email"]').type('admin@test.com');
    cy.get('input[name="password"]').type('Admin@123');
    cy.get('button[type="submit"]').click();
    cy.url({ timeout: 10000 }).should('include', '#admin-dashboard');
  });

  describe('Image Upload', () => {
    it('should upload product image from device', () => {
      cy.contains('Add Product').click();
      
      // Wait for modal
      cy.contains('Upload from Device', { timeout: 5000 }).should('be.visible');
      
      // Upload file
      cy.get('input[type="file"]').selectFile({
        contents: 'cypress/fixtures/test-image.jpg',
        fileName: 'test.jpg',
        mimeType: 'image/jpeg'
      });
      
      // Should show preview
      cy.get('img[alt*="preview"]', { timeout: 5000 }).should('be.visible');
    });

    it('should reject file larger than 5MB', () => {
      cy.contains('Add Product').click();
      
      // Create 6MB file
      const largeFile = new Blob(['x'.repeat(6 * 1024 * 1024)], { type: 'image/jpeg' });
      
      cy.get('input[type="file"]').selectFile({
        contents: largeFile,
        fileName: 'large.jpg',
        mimeType: 'image/jpeg'
      });
      
      // Should show error
      cy.contains(/5MB|too large/i).should('be.visible');
    });

    it('should reject invalid file types', () => {
      cy.contains('Add Product').click();
      
      cy.get('input[type="file"]').selectFile({
        contents: 'cypress/fixtures/test-document.pdf',
        fileName: 'test.pdf',
        mimeType: 'application/pdf'
      });
      
      // Should show error
      cy.contains(/JPG|PNG|GIF|WEBP/i).should('be.visible');
    });
  });

  describe('Product CRUD', () => {
    it('should add a new product', () => {
      cy.contains('Add Product').click();
      
      cy.get('input[name="name"]').type('Test Product');
      cy.get('textarea[name="description"]').type('This is a test product description with at least ten characters.');
      cy.get('input[name="price"]').type('999');
      cy.get('input[name="category"]').type('Electronics');
      cy.get('input[name="stock"]').type('10');
      
      cy.get('button[type="submit"]').click();
      
      // Should show success message
      cy.contains(/success|added/i, { timeout: 10000 }).should('be.visible');
      
      // Product should appear in list
      cy.contains('Test Product').should('be.visible');
    });

    it('should edit an existing product', () => {
      // Assume product exists
      cy.contains('Test Product').parents('tr').find('button').contains('✏️').click();
      
      // Modal should open with product data
      cy.get('input[name="name"]').should('have.value', 'Test Product');
      
      // Change name
      cy.get('input[name="name"]').clear().type('Updated Product');
      
      cy.get('button[type="submit"]').click();
      
      // Should show success
      cy.contains(/updated|success/i).should('be.visible');
      
      // Updated name should appear
      cy.contains('Updated Product').should('be.visible');
    });

    it('should delete a product', () => {
      // Assume product exists
      cy.contains('Test Product').parents('tr').find('button').contains('🗑️').click();
      
      // Confirm deletion
      cy.on('window:confirm', () => true);
      
      // Product should be removed
      cy.contains('Test Product').should('not.exist');
    });
  });

  describe('Input Validation', () => {
    it('should reject product with empty required fields', () => {
      cy.contains('Add Product').click();
      
      cy.get('button[type="submit"]').click();
      
      // Should show validation errors
      cy.contains(/required/i).should('be.visible');
    });

    it('should reject product with negative price', () => {
      cy.contains('Add Product').click();
      
      cy.get('input[name="name"]').type('Test');
      cy.get('textarea[name="description"]').type('Test description');
      cy.get('input[name="price"]').type('-100');
      cy.get('input[name="category"]').type('Test');
      cy.get('input[name="stock"]').type('10');
      
      cy.get('button[type="submit"]').click();
      
      // Should show error
      cy.contains(/invalid|positive/i).should('be.visible');
    });

    it('should sanitize XSS attempts in product name', () => {
      cy.contains('Add Product').click();
      
      cy.get('input[name="name"]').type('<script>alert("XSS")</script>');
      cy.get('textarea[name="description"]').type('Test description');
      cy.get('input[name="price"]').type('999');
      cy.get('input[name="category"]').type('Test');
      cy.get('input[name="stock"]').type('10');
      
      cy.get('button[type="submit"]').click();
      
      cy.wait(2000);
      
      // Script tag should not be rendered
      cy.get('body').should('not.contain', '<script>');
    });
  });

  describe('Currency Display', () => {
    it('should display all prices in INR (₹)', () => {
      // Check product prices
      cy.get('body').should('contain', '₹');
      
      // Check stats
      cy.contains('Total Inventory Value').parent().should('contain', '₹');
    });
  });
});

describe('User Dashboard', () => {
  beforeEach(() => {
    // Login as regular user
    cy.visit('http://localhost:5173/#login');
    cy.get('input[name="email"]').type('user@test.com');
    cy.get('input[name="password"]').type('User@123');
    cy.get('button[type="submit"]').click();
    cy.url({ timeout: 10000 }).should('include', '#dashboard');
  });

  it('should display products list', () => {
    cy.get('[data-testid="product-card"]', { timeout: 10000 }).should('have.length.greaterThan', 0);
  });

  it('should filter products by category', () => {
    cy.contains('Electronics').click();
    
    // Should show only electronics
    cy.get('[data-testid="product-card"]').each($card => {
      cy.wrap($card).should('contain', 'Electronics');
    });
  });

  it('should search products', () => {
    cy.get('input[placeholder*="Search"]').type('iPhone');
    
    cy.wait(1000);
    
    // Should show only matching products
    cy.get('[data-testid="product-card"]').each($card => {
      cy.wrap($card).should('contain', 'iPhone');
    });
  });

  it('should display prices in INR', () => {
    cy.get('[data-testid="product-card"]').first().should('contain', '₹');
  });

  it('should display product images', () => {
    cy.get('[data-testid="product-card"] img').should('be.visible');
    cy.get('[data-testid="product-card"] img').should('have.attr', 'src');
  });
});

describe('Security Tests', () => {
  it('should prevent access to admin dashboard without authentication', () => {
    cy.visit('http://localhost:5173/#admin-dashboard');
    
    // Should redirect to login
    cy.url().should('include', '#secret-admin-login');
  });

  it('should clear session on logout', () => {
    // Login first
    cy.visit('http://localhost:5173/#login');
    cy.get('input[name="email"]').type('user@test.com');
    cy.get('input[name="password"]').type('User@123');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '#dashboard');
    
    // Logout
    cy.contains('Logout').click();
    
    // Try to access dashboard
    cy.visit('http://localhost:5173/#dashboard');
    
    // Should redirect to login
    cy.url().should('include', '#login');
  });

  it('should handle expired tokens gracefully', () => {
    // Set expired token
    localStorage.setItem('token', 'expired-token');
    
    cy.visit('http://localhost:5173/#dashboard');
    
    // Should show error or redirect
    cy.url().should('not.include', '#dashboard');
  });
});
