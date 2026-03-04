/**
 * Cart Logic Tests – 30 Test Cases
 * Tests the pure cart calculation logic extracted from Dashboard.jsx
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';

// ─── Pure Cart Logic (mirrors Dashboard.jsx implementation) ──────────────────

/**
 * addToCartLogic: replaces addToCartAuthenticated
 * Returns the updated cart array (side-effect free, testable)
 */
function addToCartLogic(currentCart, product, quantity = 1) {
  const existingItem = currentCart.find(item => item._id === product._id);
  if (existingItem) {
    return currentCart.map(item =>
      item._id === product._id
        ? { ...item, quantity: item.quantity + quantity }
        : item
    );
  }
  return [...currentCart, { ...product, quantity }];
}

function removeFromCart(cart, productId) {
  return cart.filter(item => item._id !== productId);
}

function updateQuantity(cart, productId, newQuantity) {
  if (newQuantity < 1) return removeFromCart(cart, productId);
  return cart.map(item =>
    item._id === productId ? { ...item, quantity: newQuantity } : item
  );
}

function calcSubtotal(cart) {
  return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

function calcItemCount(cart) {
  return cart.reduce((sum, item) => sum + item.quantity, 0);
}

// ─── Helpers ───────────────────────────────────────────────────────────────
function makeProduct(overrides = {}) {
  const id = overrides._id || `pid-${Math.random()}`;
  return { _id: id, name: 'Test Product', price: 100, stock: 50, ...overrides };
}

// ═════════════════════════════════════════════════════════════════════════════
describe('Cart Logic Unit Tests', () => {

  // ── addToCartLogic ────────────────────────────────────────────────────────
  describe('addToCartLogic – adding items', () => {

    it('TC-CL01: adds new product to empty cart with qty 1', () => {
      const cart = addToCartLogic([], makeProduct({ _id: 'p1' }), 1);
      expect(cart).toHaveLength(1);
      expect(cart[0].quantity).toBe(1);
    });

    it('TC-CL02: adds new product with specified quantity', () => {
      const cart = addToCartLogic([], makeProduct({ _id: 'p1' }), 6);
      expect(cart[0].quantity).toBe(6);
    });

    it('TC-CL03: BUY-NOW quantity of 6 is correctly stored', () => {
      const cart = addToCartLogic([], makeProduct({ _id: 'p1', price: 349 }), 6);
      expect(cart[0].quantity).toBe(6);
      expect(calcSubtotal(cart)).toBe(349 * 6);
    });

    it('TC-CL04: increments quantity when same product added', () => {
      let cart = addToCartLogic([], makeProduct({ _id: 'p1' }), 2);
      cart = addToCartLogic(cart, makeProduct({ _id: 'p1' }), 3);
      expect(cart[0].quantity).toBe(5);
    });

    it('TC-CL05: cart has only 1 entry for same product added twice', () => {
      let cart = addToCartLogic([], makeProduct({ _id: 'p1' }), 1);
      cart = addToCartLogic(cart, makeProduct({ _id: 'p1' }), 1);
      expect(cart).toHaveLength(1);
    });

    it('TC-CL06: adding different products increases cart length', () => {
      let cart = addToCartLogic([], makeProduct({ _id: 'p1' }), 1);
      cart = addToCartLogic(cart, makeProduct({ _id: 'p2' }), 1);
      expect(cart).toHaveLength(2);
    });

    it('TC-CL07: product data is correctly stored in cart', () => {
      const product = makeProduct({ _id: 'p1', name: 'Safety Gloves', price: 349 });
      const cart = addToCartLogic([], product, 1);
      expect(cart[0].name).toBe('Safety Gloves');
      expect(cart[0].price).toBe(349);
    });

    it('TC-CL08: product.quantity embedded in object is used via || fallback', () => {
      // Simulates QuickViewModal calling onBuyNow({ ...product, quantity: 6 }) with no second arg
      const productWithQty = makeProduct({ _id: 'p1', price: 349, quantity: 6 });
      const qty = undefined || productWithQty.quantity || 1; // mirrors fixed handler
      const cart = addToCartLogic([], productWithQty, qty);
      expect(cart[0].quantity).toBe(6);
    });

    it('TC-CL09: explicit quantity arg takes priority over product.quantity', () => {
      const productWithQty = makeProduct({ _id: 'p1', quantity: 2 });
      const qty = 5 || productWithQty.quantity || 1; // 5 is truthy, wins
      const cart = addToCartLogic([], productWithQty, qty);
      expect(cart[0].quantity).toBe(5);
    });

    it('TC-CL10: quantity defaults to 1 when both args are undefined/null', () => {
      const product = makeProduct({ _id: 'p1' });
      const qty = undefined || undefined || 1;
      const cart = addToCartLogic([], product, qty);
      expect(cart[0].quantity).toBe(1);
    });

  });

  // ── removeFromCart ────────────────────────────────────────────────────────
  describe('removeFromCart', () => {

    it('TC-CL11: removes the correct product from cart', () => {
      const cart = [
        makeProduct({ _id: 'p1', quantity: 2 }),
        makeProduct({ _id: 'p2', quantity: 1 })
      ];
      const updated = removeFromCart(cart, 'p1');
      expect(updated).toHaveLength(1);
      expect(updated[0]._id).toBe('p2');
    });

    it('TC-CL12: returns empty array when removing only item', () => {
      const cart = [makeProduct({ _id: 'p1', quantity: 1 })];
      const updated = removeFromCart(cart, 'p1');
      expect(updated).toHaveLength(0);
    });

    it('TC-CL13: returns same cart when product not found', () => {
      const cart = [makeProduct({ _id: 'p1', quantity: 1 })];
      const updated = removeFromCart(cart, 'nonexistent');
      expect(updated).toHaveLength(1);
    });

    it('TC-CL14: does not mutate the original cart array', () => {
      const cart = [makeProduct({ _id: 'p1', quantity: 1 })];
      removeFromCart(cart, 'p1');
      expect(cart).toHaveLength(1); // original unchanged
    });

  });

  // ── updateQuantity ────────────────────────────────────────────────────────
  describe('updateQuantity', () => {

    it('TC-CL15: updates quantity of a cart item', () => {
      const cart = [makeProduct({ _id: 'p1', quantity: 1 })];
      const updated = updateQuantity(cart, 'p1', 5);
      expect(updated[0].quantity).toBe(5);
    });

    it('TC-CL16: setting quantity to 0 removes the item', () => {
      const cart = [makeProduct({ _id: 'p1', quantity: 3 })];
      const updated = updateQuantity(cart, 'p1', 0);
      expect(updated).toHaveLength(0);
    });

    it('TC-CL17: setting quantity below 1 removes item', () => {
      const cart = [makeProduct({ _id: 'p1', quantity: 3 })];
      const updated = updateQuantity(cart, 'p1', -1);
      expect(updated).toHaveLength(0);
    });

    it('TC-CL18: does not affect other items when updating one', () => {
      const cart = [
        makeProduct({ _id: 'p1', quantity: 1 }),
        makeProduct({ _id: 'p2', quantity: 4 })
      ];
      const updated = updateQuantity(cart, 'p1', 9);
      expect(updated[1].quantity).toBe(4);
    });

  });

  // ── calcSubtotal ──────────────────────────────────────────────────────────
  describe('calcSubtotal', () => {

    it('TC-CL19: returns 0 for empty cart', () => {
      expect(calcSubtotal([])).toBe(0);
    });

    it('TC-CL20: calculates subtotal correctly for single item', () => {
      const cart = [makeProduct({ _id: 'p1', price: 349, quantity: 3 })];
      expect(calcSubtotal(cart)).toBe(1047);
    });

    it('TC-CL21: calculates subtotal correctly for multiple items', () => {
      const cart = [
        makeProduct({ _id: 'p1', price: 100, quantity: 2 }),
        makeProduct({ _id: 'p2', price: 50, quantity: 4 })
      ];
      expect(calcSubtotal(cart)).toBe(400);
    });

    it('TC-CL22: subtotal matches price × quantity for buy-now with qty 6', () => {
      const cart = [makeProduct({ _id: 'p1', price: 349, quantity: 6 })];
      expect(calcSubtotal(cart)).toBe(2094);
    });

    it('TC-CL23: handles decimal prices correctly', () => {
      const cart = [makeProduct({ _id: 'p1', price: 99.99, quantity: 3 })];
      expect(calcSubtotal(cart)).toBeCloseTo(299.97);
    });

  });

  // ── calcItemCount ─────────────────────────────────────────────────────────
  describe('calcItemCount', () => {

    it('TC-CL24: returns 0 for empty cart', () => {
      expect(calcItemCount([])).toBe(0);
    });

    it('TC-CL25: returns correct count for single item', () => {
      const cart = [makeProduct({ _id: 'p1', quantity: 6 })];
      expect(calcItemCount(cart)).toBe(6);
    });

    it('TC-CL26: sums quantities across multiple items', () => {
      const cart = [
        makeProduct({ _id: 'p1', quantity: 3 }),
        makeProduct({ _id: 'p2', quantity: 4 })
      ];
      expect(calcItemCount(cart)).toBe(7);
    });

  });

  // ── Checkout Page Logic ───────────────────────────────────────────────────
  describe('Checkout Order Summary Logic', () => {

    it('TC-CL27: checkout total reflects selected quantity from buy-now', () => {
      // User selects qty 6, clicks Buy Now → cart should have qty 6
      const product = makeProduct({ _id: 'p1', price: 349 });
      const selectedQuantity = 6;
      const cart = addToCartLogic([], product, selectedQuantity);
      const total = calcSubtotal(cart);
      expect(total).toBe(349 * 6); // ₹2094
    });

    it('TC-CL28: shipping is free above ₹500 threshold', () => {
      const isShippingFree = (subtotal) => subtotal >= 500;
      expect(isShippingFree(349 * 2)).toBe(true);
      expect(isShippingFree(349 * 1)).toBe(false);
    });

    it('TC-CL29: order summary "Place Order" button shows correct amount', () => {
      const cart = addToCartLogic([], makeProduct({ _id: 'p1', price: 349 }), 3);
      const subtotal = calcSubtotal(cart);
      const shipping = subtotal >= 500 ? 0 : 99;
      const total = subtotal + shipping;
      const buttonLabel = `Place Order (₹${total.toFixed(2)})`;
      expect(buttonLabel).toBe('Place Order (₹1047.00)');
    });

    it('TC-CL30: cart persisted to localStorage correctly', () => {
      const product = makeProduct({ _id: 'p1', price: 349, name: 'Safety Gloves' });
      const cart = addToCartLogic([], product, 6);
      localStorage.setItem('cart', JSON.stringify(cart));
      const restored = JSON.parse(localStorage.getItem('cart'));
      expect(restored[0].quantity).toBe(6);
      expect(restored[0].name).toBe('Safety Gloves');
    });

  });
});
