/**
 * Checkout Logic Tests – 25 Test Cases
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';

// ─── Checkout pure logic (mirrors Checkout.jsx) ───────────────────────────

const FREE_SHIPPING_THRESHOLD = 500;
const SHIPPING_COST = 99;

function calcSubtotal(cart) {
  return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

function calcShipping(subtotal) {
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
}

function calcTotal(cart) {
  const subtotal = calcSubtotal(cart);
  return subtotal + calcShipping(subtotal);
}

function validateShippingAddress(addr) {
  const errors = {};
  if (!addr.address || addr.address.trim() === '') errors.address = 'Address is required';
  if (!addr.city || addr.city.trim() === '') errors.city = 'City is required';
  if (!addr.postalCode || addr.postalCode.trim() === '') errors.postalCode = 'Postal code is required';
  if (!addr.phone || !/^\d{10}$/.test(addr.phone)) errors.phone = 'Valid 10-digit phone is required';
  if (!addr.country || addr.country.trim() === '') errors.country = 'Country is required';
  return errors;
}

function isAddressValid(addr) {
  return Object.keys(validateShippingAddress(addr)).length === 0;
}

function buildOrderPayload(cart, address, paymentMethod = 'cod') {
  return {
    items: cart.map(item => ({ productId: item._id, quantity: item.quantity })),
    shippingAddress: {
      address: address.address,
      city: address.city,
      postalCode: address.postalCode,
      country: address.country
    },
    paymentMethod
  };
}

function makeCartItem(overrides = {}) {
  return { _id: 'p1', name: 'Test Product', price: 349, quantity: 1, ...overrides };
}

function makeAddress(overrides = {}) {
  return { address: '123 Main St', city: 'Mumbai', postalCode: '400001', phone: '9876543210', country: 'India', ...overrides };
}

// ═════════════════════════════════════════════════════════════════════════════
describe('Checkout Logic', () => {

  // ── Subtotal calculation ──────────────────────────────────────────────────
  describe('Subtotal', () => {

    it('TC-CH01: subtotal is 0 for empty cart', () => {
      expect(calcSubtotal([])).toBe(0);
    });

    it('TC-CH02: subtotal for 1 item qty 1', () => {
      expect(calcSubtotal([makeCartItem({ price: 349, quantity: 1 })])).toBe(349);
    });

    it('TC-CH03: subtotal for 1 item qty 6 (Buy Now fix)', () => {
      expect(calcSubtotal([makeCartItem({ price: 349, quantity: 6 })])).toBe(2094);
    });

    it('TC-CH04: subtotal for multiple items', () => {
      const cart = [
        makeCartItem({ _id: 'p1', price: 200, quantity: 3 }),
        makeCartItem({ _id: 'p2', price: 100, quantity: 2 })
      ];
      expect(calcSubtotal(cart)).toBe(800);
    });

    it('TC-CH05: subtotal matches displayed "Qty X × ₹Y" format', () => {
      const item = makeCartItem({ price: 349, quantity: 3 });
      const lineTotal = item.price * item.quantity;
      expect(lineTotal).toBe(1047);
      expect(calcSubtotal([item])).toBe(lineTotal);
    });

  });

  // ── Shipping calculation ──────────────────────────────────────────────────
  describe('Shipping', () => {

    it('TC-CH06: shipping is ₹99 below threshold', () => {
      expect(calcShipping(349)).toBe(99);
    });

    it('TC-CH07: shipping is FREE at exactly threshold (₹500)', () => {
      expect(calcShipping(500)).toBe(0);
    });

    it('TC-CH08: shipping is FREE above threshold', () => {
      expect(calcShipping(1000)).toBe(0);
    });

    it('TC-CH09: shipping is ₹99 for single item below threshold', () => {
      const subtotal = calcSubtotal([makeCartItem({ price: 349, quantity: 1 })]);
      expect(calcShipping(subtotal)).toBe(99);
    });

    it('TC-CH10: total = subtotal + shipping when below threshold', () => {
      const cart = [makeCartItem({ price: 349, quantity: 1 })];
      expect(calcTotal(cart)).toBe(349 + 99);
    });

    it('TC-CH11: total = subtotal + 0 when above threshold', () => {
      const cart = [makeCartItem({ price: 349, quantity: 2 })];
      expect(calcTotal(cart)).toBe(698);
    });

    it('TC-CH12: Place Order button shows correct total amount', () => {
      const cart = [makeCartItem({ price: 349, quantity: 3 })];
      const total = calcTotal(cart);
      expect(`Place Order (₹${total.toFixed(2)})`).toBe('Place Order (₹1047.00)');
    });

  });

  // ── Address validation ────────────────────────────────────────────────────
  describe('Address Validation', () => {

    it('TC-CH13: valid address passes validation', () => {
      expect(isAddressValid(makeAddress())).toBe(true);
    });

    it('TC-CH14: missing address field fails validation', () => {
      const errors = validateShippingAddress(makeAddress({ address: '' }));
      expect(errors).toHaveProperty('address');
    });

    it('TC-CH15: missing city field fails validation', () => {
      const errors = validateShippingAddress(makeAddress({ city: '' }));
      expect(errors).toHaveProperty('city');
    });

    it('TC-CH16: missing postalCode field fails validation', () => {
      const errors = validateShippingAddress(makeAddress({ postalCode: '' }));
      expect(errors).toHaveProperty('postalCode');
    });

    it('TC-CH17: invalid phone (less than 10 digits) fails validation', () => {
      const errors = validateShippingAddress(makeAddress({ phone: '98765' }));
      expect(errors).toHaveProperty('phone');
    });

    it('TC-CH18: invalid phone (non-numeric) fails validation', () => {
      const errors = validateShippingAddress(makeAddress({ phone: 'abcdefghij' }));
      expect(errors).toHaveProperty('phone');
    });

    it('TC-CH19: valid 10-digit phone passes validation', () => {
      const errors = validateShippingAddress(makeAddress({ phone: '9876543210' }));
      expect(errors).not.toHaveProperty('phone');
    });

    it('TC-CH20: missing country fails validation', () => {
      const errors = validateShippingAddress(makeAddress({ country: '' }));
      expect(errors).toHaveProperty('country');
    });

    it('TC-CH21: all fields missing returns 5 errors', () => {
      const errors = validateShippingAddress({});
      expect(Object.keys(errors).length).toBe(5);
    });

  });

  // ── Order payload builder ─────────────────────────────────────────────────
  describe('Order Payload', () => {

    it('TC-CH22: buildOrderPayload maps cart items correctly', () => {
      const cart = [makeCartItem({ _id: 'p1', quantity: 3 })];
      const payload = buildOrderPayload(cart, makeAddress());
      expect(payload.items[0]).toEqual({ productId: 'p1', quantity: 3 });
    });

    it('TC-CH23: default paymentMethod is cod', () => {
      const payload = buildOrderPayload([makeCartItem()], makeAddress());
      expect(payload.paymentMethod).toBe('cod');
    });

    it('TC-CH24: shippingAddress is correctly structured in payload', () => {
      const addr = makeAddress();
      const payload = buildOrderPayload([makeCartItem()], addr);
      expect(payload.shippingAddress.city).toBe('Mumbai');
      expect(payload.shippingAddress.address).toBe('123 Main St');
    });

    it('TC-CH25: multiple cart items are all included in payload', () => {
      const cart = [
        makeCartItem({ _id: 'p1', quantity: 2 }),
        makeCartItem({ _id: 'p2', quantity: 4 })
      ];
      const payload = buildOrderPayload(cart, makeAddress());
      expect(payload.items).toHaveLength(2);
      expect(payload.items[1].quantity).toBe(4);
    });

  });
});
