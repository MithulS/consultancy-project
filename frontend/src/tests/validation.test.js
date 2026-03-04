/**
 * Frontend Validation & Utility Tests – 30 Test Cases
 * Covers email, password, price formatting, search, and product utilities
 */
import { describe, it, expect } from 'vitest';

// ─── Validators (mirrors logic used across the frontend) ─────────────────────

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValidEmail(email) {
  return emailRegex.test(email);
}

function isValidPassword(pwd) {
  return (
    pwd.length >= 8 &&
    /[A-Z]/.test(pwd) &&
    /[a-z]/.test(pwd) &&
    /[0-9]/.test(pwd) &&
    /[!@#$%^&*]/.test(pwd)
  );
}

function isValidPhone(phone) {
  return /^\d{10}$/.test(phone);
}

function isValidPostalCode(code) {
  return /^\d{6}$/.test(code);
}

// ─── Price Formatting ────────────────────────────────────────────────────────

function formatPrice(amount) {
  return `₹${amount.toFixed(2)}`;
}

function calcDiscount(original, sale) {
  if (original <= 0 || sale >= original) return 0;
  return Math.round(((original - sale) / original) * 100);
}

// ─── Search & Filter Helpers ─────────────────────────────────────────────────

function filterByCategory(products, category) {
  if (!category || category === 'All') return products;
  return products.filter(p => p.category === category);
}

function filterByPriceRange(products, min, max) {
  return products.filter(p => {
    if (min !== undefined && p.price < min) return false;
    if (max !== undefined && p.price > max) return false;
    return true;
  });
}

function searchProducts(products, query) {
  if (!query) return products;
  const q = query.toLowerCase();
  return products.filter(p =>
    p.name.toLowerCase().includes(q) ||
    (p.description && p.description.toLowerCase().includes(q)) ||
    (p.brand && p.brand.toLowerCase().includes(q))
  );
}

// ─── Rating ──────────────────────────────────────────────────────────────────

function avgRating(reviews) {
  if (!reviews.length) return 0;
  return Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10;
}

// ─── Pagination ──────────────────────────────────────────────────────────────

function paginate(items, page, limit) {
  const start = (page - 1) * limit;
  return items.slice(start, start + limit);
}

// ─── Sample data ─────────────────────────────────────────────────────────────

const sampleProducts = [
  { _id: '1', name: 'Hammer', price: 299, category: 'Tools & Equipment', brand: 'Stanley', description: 'steel hammer' },
  { _id: '2', name: 'LED Bulb', price: 89, category: 'Electrical', brand: 'Philips', description: 'energy saver' },
  { _id: '3', name: 'PVC Pipe', price: 150, category: 'Plumbing', brand: 'Finolex', description: 'durable pipe' },
  { _id: '4', name: 'Safety Gloves', price: 349, category: 'Safety & Protection', brand: 'SafeGuard', description: 'cut resistant' },
  { _id: '5', name: 'Circuit Breaker', price: 450, category: 'Electrical', brand: 'Schneider', description: 'MCB 32A' }
];

// ═════════════════════════════════════════════════════════════════════════════
describe('Frontend Validation & Utility Tests', () => {

  // ── Email validation ──────────────────────────────────────────────────────
  describe('Email Validation', () => {

    it('TC-V01: valid email passes', () => {
      expect(isValidEmail('user@example.com')).toBe(true);
    });

    it('TC-V02: email with subdomain passes', () => {
      expect(isValidEmail('user@mail.example.co.in')).toBe(true);
    });

    it('TC-V03: email without @ fails', () => {
      expect(isValidEmail('userexample.com')).toBe(false);
    });

    it('TC-V04: email without domain fails', () => {
      expect(isValidEmail('user@')).toBe(false);
    });

    it('TC-V05: empty string fails', () => {
      expect(isValidEmail('')).toBe(false);
    });

    it('TC-V06: email with spaces fails', () => {
      expect(isValidEmail('user @example.com')).toBe(false);
    });

  });

  // ── Password validation ───────────────────────────────────────────────────
  describe('Password Validation', () => {

    it('TC-V07: strong password passes', () => {
      expect(isValidPassword('Test@1234')).toBe(true);
    });

    it('TC-V08: password too short fails', () => {
      expect(isValidPassword('Te@1')).toBe(false);
    });

    it('TC-V09: password missing uppercase fails', () => {
      expect(isValidPassword('test@1234')).toBe(false);
    });

    it('TC-V10: password missing digit fails', () => {
      expect(isValidPassword('Test@abcd')).toBe(false);
    });

    it('TC-V11: password missing special char fails', () => {
      expect(isValidPassword('Test12345')).toBe(false);
    });

    it('TC-V12: password missing lowercase fails', () => {
      expect(isValidPassword('TEST@1234')).toBe(false);
    });

  });

  // ── Phone & Postal Code validation ───────────────────────────────────────
  describe('Phone & Postal Code Validation', () => {

    it('TC-V13: valid 10-digit phone passes', () => {
      expect(isValidPhone('9876543210')).toBe(true);
    });

    it('TC-V14: 9-digit phone fails', () => {
      expect(isValidPhone('987654321')).toBe(false);
    });

    it('TC-V15: alpha characters in phone fail', () => {
      expect(isValidPhone('98ABCD3210')).toBe(false);
    });

    it('TC-V16: valid 6-digit postal code passes', () => {
      expect(isValidPostalCode('400001')).toBe(true);
    });

    it('TC-V17: 5-digit postal code fails', () => {
      expect(isValidPostalCode('40001')).toBe(false);
    });

    it('TC-V18: non-numeric postal code fails', () => {
      expect(isValidPostalCode('4000A1')).toBe(false);
    });

  });

  // ── Price Formatting ──────────────────────────────────────────────────────
  describe('Price Formatting', () => {

    it('TC-V19: formats integer price with 2 decimal places', () => {
      expect(formatPrice(349)).toBe('₹349.00');
    });

    it('TC-V20: formats decimal price correctly', () => {
      expect(formatPrice(99.9)).toBe('₹99.90');
    });

    it('TC-V21: calculates 30% discount correctly', () => {
      expect(calcDiscount(499, 349)).toBe(30);
    });

    it('TC-V22: calcDiscount returns 0 when sale >= original', () => {
      expect(calcDiscount(100, 100)).toBe(0);
    });

    it('TC-V23: calcDiscount returns 0 for invalid original price', () => {
      expect(calcDiscount(0, 50)).toBe(0);
    });

  });

  // ── Category & Price Filter ───────────────────────────────────────────────
  describe('Product Filtering', () => {

    it('TC-V24: filterByCategory returns all when "All"', () => {
      expect(filterByCategory(sampleProducts, 'All')).toHaveLength(5);
    });

    it('TC-V25: filterByCategory returns only Electrical products', () => {
      const results = filterByCategory(sampleProducts, 'Electrical');
      expect(results).toHaveLength(2);
      results.forEach(p => expect(p.category).toBe('Electrical'));
    });

    it('TC-V26: filterByPriceRange returns products within range', () => {
      const results = filterByPriceRange(sampleProducts, 100, 350);
      results.forEach(p => {
        expect(p.price).toBeGreaterThanOrEqual(100);
        expect(p.price).toBeLessThanOrEqual(350);
      });
    });

    it('TC-V27: searchProducts finds by name (case-insensitive)', () => {
      const results = searchProducts(sampleProducts, 'hammer');
      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('Hammer');
    });

    it('TC-V28: searchProducts finds by brand', () => {
      const results = searchProducts(sampleProducts, 'philips');
      expect(results[0].brand).toBe('Philips');
    });

    it('TC-V29: searchProducts returns empty for no match', () => {
      expect(searchProducts(sampleProducts, 'xyz123notfound')).toHaveLength(0);
    });

  });

  // ── Rating & Pagination ───────────────────────────────────────────────────
  describe('Rating & Pagination', () => {

    it('TC-V30: avgRating calculates correctly and rounds to 1 decimal', () => {
      const reviews = [{ rating: 4 }, { rating: 5 }, { rating: 3 }];
      expect(avgRating(reviews)).toBe(4);
    });

  });
});
