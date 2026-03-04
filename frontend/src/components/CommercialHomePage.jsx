/**
 * SRI AMMAN TRADERS — REDESIGNED HOME PAGE
 */

import React, { useState, useEffect } from 'react';
import CommercialHardwareHeader from './CommercialHardwareHeader';
import CommercialHeroBanner from './CommercialHeroBanner';
import Footer from './Footer';
import Loader from './Loader';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { FEATURED_BRANDS } from '../utils/constants';
import { showToast } from './ToastNotification';
import EnhancedProductCard from './EnhancedProductCard';
import ProductQuickView from './ProductQuickView';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const TRUST_CARDS = [
  {
    icon: '✅',
    color: '#10B981',
    title: 'Genuine Products',
    text: '100% authentic goods from authorized dealers of Finolex, Havells, Asian Paints, Crompton, Anchor, and Sintex.',
  },
  {
    icon: '💰',
    color: '#F59E0B',
    title: 'Fair Pricing',
    text: 'Competitive prices for retail and wholesale. Special bulk discounts available for contractors and businesses.',
  },
  {
    icon: '🚚',
    color: '#3B82F6',
    title: 'Fast Delivery',
    text: 'Free delivery on orders above ₹999. Same‑day dispatch for in‑stock items to nearby areas.',
  },
  {
    icon: '🤝',
    color: '#8B5CF6',
    title: 'Reliable Service',
    text: 'Expert guidance and dedicated support. Building long‑term relationships with every customer.',
  },
];

const PRODUCT_CATEGORIES = ['All', 'Electrical', 'Plumbing', 'Hardware', 'Paints & Coatings', 'Pipes & Fittings', 'Wiring & Cables', 'Water Tanks', 'Tools & Equipment'];

export default function CommercialHomePage() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading]                   = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  const [titleRef, titleVisible] = useScrollAnimation();
  const [gridRef,  gridVisible]  = useScrollAnimation();
  const [aboutRef, aboutVisible] = useScrollAnimation();
  const [brandRef, brandVisible] = useScrollAnimation();

  useEffect(() => { fetchFeaturedProducts(); }, [selectedCategory]);

  async function fetchFeaturedProducts() {
    try {
      setLoading(true);
      const q   = selectedCategory !== 'All' ? `?category=${encodeURIComponent(selectedCategory)}&limit=12` : '?limit=12';
      const res = await fetch(`${API}/api/products${q}`);
      const data = await res.json();
      if (res.ok) setFeaturedProducts(data.products || []);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }

  const handleAddToCart = (product) => {
    const token = localStorage.getItem('token');
    if (!token) {
      showToast('Please login to add items to cart', 'warning');
      setTimeout(() => { window.location.hash = '#login'; }, 800);
      return;
    }
    const cart      = JSON.parse(localStorage.getItem('cart') || '[]');
    const existing  = cart.find(i => i._id === product._id);
    if (existing) { existing.quantity = Math.min((existing.quantity || 1) + 1, 99); }
    else           { cart.push({ ...product, quantity: 1 }); }
    localStorage.setItem('cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('cartUpdated'));
    showToast('Added to cart!', 'success');
  };

  return (
    <div className="dark-navy-theme" style={{ minHeight: '100vh' }}>
      <CommercialHardwareHeader />
      <CommercialHeroBanner />

      {/* ── Trust / Why Us ─────────────────────────────────────────── */}
      <section style={{ padding: '72px 0', background: 'rgba(255,255,255,.02)', borderTop: '1px solid rgba(255,255,255,.06)', borderBottom: '1px solid rgba(255,255,255,.06)' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 24px' }}>
          <h2 style={{ textAlign: 'center', fontSize: 32, fontWeight: 800, color: '#F1F5F9', marginBottom: 8, letterSpacing: '-.3px' }}>
            Why Choose Sri Amman Traders?
          </h2>
          <p style={{ textAlign: 'center', color: '#64748B', fontSize: 15, marginBottom: 48 }}>
            Serving retail &amp; wholesale customers since 1995
          </p>
          <div
            ref={aboutRef}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))',
              gap: 24,
              opacity: aboutVisible ? 1 : 0,
              transform: aboutVisible ? 'none' : 'translateY(28px)',
              transition: 'opacity .7s ease, transform .7s ease',
            }}
          >
            {TRUST_CARDS.map((c) => (
              <div
                key={c.title}
                style={{ padding: 28, borderRadius: 18, background: 'rgba(255,255,255,.03)', border: `1px solid ${c.color}30`, boxShadow: `0 0 0 0 ${c.color}00`, transition: 'all .25s' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.border = `1px solid ${c.color}70`; e.currentTarget.style.background = `${c.color}0D`; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.border = `1px solid ${c.color}30`; e.currentTarget.style.background = 'rgba(255,255,255,.03)'; }}
              >
                <div style={{ width: 52, height: 52, background: `${c.color}20`, border: `1.5px solid ${c.color}50`, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, marginBottom: 16 }} aria-hidden="true">{c.icon}</div>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: '#F1F5F9', marginBottom: 8 }}>{c.title}</h3>
                <p style={{ fontSize: 14, color: '#94A3B8', lineHeight: 1.65 }}>{c.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Brands ────────────────────────────────────────── */}
      <section style={{ padding: '72px 0' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 24px' }}>
          <h2 style={{ textAlign: 'center', fontSize: 30, fontWeight: 800, color: '#F1F5F9', marginBottom: 6, letterSpacing: '-.3px' }}>
            Trusted Brands We Carry
          </h2>
          <p style={{ textAlign: 'center', color: '#64748B', fontSize: 14, marginBottom: 44 }}>
            Authorized dealer of India's leading manufacturers
          </p>
          <div
            ref={brandRef}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))',
              gap: 16,
              opacity: brandVisible ? 1 : 0,
              transform: brandVisible ? 'none' : 'translateY(28px)',
              transition: 'opacity .7s ease .1s, transform .7s ease .1s',
            }}
          >
            {FEATURED_BRANDS.map((brand, i) => (
              <div
                key={i}
                style={{ padding: '20px 16px', borderRadius: 14, background: 'rgba(255,255,255,.025)', border: '1px solid rgba(255,255,255,.07)', textAlign: 'center', cursor: 'pointer', transition: 'all .25s' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.borderColor = 'rgba(249,115,22,.5)'; e.currentTarget.style.background = 'rgba(249,115,22,.06)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.borderColor = 'rgba(255,255,255,.07)'; e.currentTarget.style.background = 'rgba(255,255,255,.025)'; }}
                onClick={() => { setSelectedCategory(brand.category || 'All'); document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' }); }}
              >
                <div style={{ fontSize: 38, marginBottom: 10 }} aria-hidden="true">{brand.logo}</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#F1F5F9', marginBottom: 3 }}>{brand.name}</div>
                <div style={{ fontSize: 11, color: '#FB923C', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 6 }}>{brand.category}</div>
                <div style={{ fontSize: 12.5, color: '#64748B', lineHeight: 1.5 }}>{brand.description}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Products ──────────────────────────────────────── */}
      <section id="products-section" style={{ padding: '72px 0', borderTop: '1px solid rgba(255,255,255,.05)' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 24px' }}>
          {/* Section header */}
          <div ref={titleRef} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 32, opacity: titleVisible ? 1 : 0, transform: titleVisible ? 'none' : 'translateY(20px)', transition: 'opacity .6s, transform .6s' }}>
            <div>
              <h2 style={{ fontSize: 30, fontWeight: 800, color: '#F1F5F9', letterSpacing: '-.3px', marginBottom: 4 }}>
                {selectedCategory === 'All' ? 'Featured Products' : `${selectedCategory}`}
              </h2>
              <p style={{ color: '#64748B', fontSize: 14 }}>Browse our selection of genuine branded products</p>
            </div>
            <button
              style={{ padding: '9px 20px', background: 'transparent', border: '1.5px solid rgba(59,130,246,.5)', borderRadius: 20, color: '#93C5FD', fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all .2s' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(59,130,246,.1)'; e.currentTarget.style.borderColor = '#3B82F6'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(59,130,246,.5)'; }}
              onClick={() => window.location.hash = '#dashboard'}
            >View All Products →</button>
          </div>

          {/* Category filter pills */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 36 }}>
            {PRODUCT_CATEGORIES.map(cat => (
              <button
                key={cat}
                style={{
                  padding: '7px 16px',
                  borderRadius: 20,
                  border: `1.5px solid ${selectedCategory === cat ? '#3B82F6' : 'rgba(255,255,255,.09)'}`,
                  background: selectedCategory === cat ? 'rgba(59,130,246,.18)' : 'transparent',
                  color: selectedCategory === cat ? '#93C5FD' : '#94A3B8',
                  fontSize: 13, fontWeight: selectedCategory === cat ? 600 : 400,
                  cursor: 'pointer', transition: 'all .2s',
                }}
                onMouseEnter={e => { if (selectedCategory !== cat) { e.currentTarget.style.borderColor = 'rgba(255,255,255,.2)'; e.currentTarget.style.color = '#CBD5E1'; } }}
                onMouseLeave={e => { if (selectedCategory !== cat) { e.currentTarget.style.borderColor = 'rgba(255,255,255,.09)'; e.currentTarget.style.color = '#94A3B8'; } }}
                onClick={() => setSelectedCategory(cat)}
              >{cat}</button>
            ))}
          </div>

          {/* Product grid */}
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '64px 0' }}>
              <Loader size={56} />
            </div>
          ) : featuredProducts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '64px 0', color: '#64748B' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }} aria-hidden="true">📦</div>
              <p style={{ fontSize: 16 }}>No products found in this category.</p>
            </div>
          ) : (
            <div
              ref={gridRef}
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))',
                gap: 22,
                opacity: gridVisible ? 1 : 0,
                transform: gridVisible ? 'none' : 'translateY(28px)',
                transition: 'opacity .8s ease .15s, transform .8s ease .15s',
              }}
            >
              {featuredProducts.map((product, index) => (
                <EnhancedProductCard
                  key={product._id}
                  product={product}
                  index={index}
                  onAddToCart={handleAddToCart}
                  onBuyNow={(prod) => { handleAddToCart(prod); window.location.hash = '#checkout'; }}
                  onQuickView={(prod) => setQuickViewProduct(prod)}
                  onAuthRequired={() => showToast('Please login to use wishlist', 'info')}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Wholesale CTA ──────────────────────────────────────────── */}
      <section style={{ padding: '80px 24px', background: 'linear-gradient(135deg,#0A1628 0%,#0F1E38 50%,#0A1628 100%)', borderTop: '1px solid rgba(255,255,255,.06)', textAlign: 'center' }}>
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <div style={{ display: 'inline-block', padding: '4px 14px', background: 'rgba(249,115,22,.12)', border: '1px solid rgba(249,115,22,.25)', borderRadius: 20, color: '#FB923C', fontSize: 12.5, fontWeight: 600, letterSpacing: '.5px', marginBottom: 20 }}>
            WHOLESALE &amp; BULK ORDERS
          </div>
          <h2 style={{ fontSize: 36, fontWeight: 800, color: '#F1F5F9', marginBottom: 14, letterSpacing: '-.4px' }}>
            Looking for Wholesale Pricing?
          </h2>
          <p style={{ fontSize: 16, color: '#94A3B8', lineHeight: 1.7, marginBottom: 36 }}>
            We serve contractors, builders, and businesses with special bulk pricing and dedicated support. Contact us for wholesale rates and custom orders.
          </p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              style={{ padding: '13px 28px', background: 'linear-gradient(135deg,#F97316,#EF4444)', border: 'none', borderRadius: 10, color: '#fff', fontWeight: 700, fontSize: 15, cursor: 'pointer', boxShadow: '0 4px 18px rgba(249,115,22,.35)', transition: 'all .2s', display: 'flex', alignItems: 'center', gap: 8 }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(249,115,22,.45)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 18px rgba(249,115,22,.35)'; }}
              onClick={() => window.location.href = 'tel:+917904212501'}
            >📞 Call for Wholesale Rates</button>
            <button
              style={{ padding: '13px 28px', background: 'transparent', border: '1.5px solid rgba(249,115,22,.4)', borderRadius: 10, color: '#FB923C', fontWeight: 600, fontSize: 15, cursor: 'pointer', transition: 'all .2s' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(249,115,22,.08)'; e.currentTarget.style.borderColor = '#F97316'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(249,115,22,.4)'; }}
              onClick={() => window.location.hash = '#contact'}
            >📋 Submit Inquiry Form</button>
          </div>
          <div style={{ marginTop: 28, display: 'flex', gap: 28, justifyContent: 'center', flexWrap: 'wrap', fontSize: 13, color: '#64748B' }}>
            <span>✓ Bulk Discounts Available</span>
            <span>✓ Credit Terms for Regular Customers</span>
            <span>✓ Direct Factory Prices</span>
          </div>
        </div>
      </section>

      <Footer theme="dark" />

      <ProductQuickView
        isOpen={!!quickViewProduct}
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        onAddToCart={handleAddToCart}
        onBuyNow={(prod) => { handleAddToCart(prod); window.location.hash = '#checkout'; }}
      />
    </div>
  );
}
