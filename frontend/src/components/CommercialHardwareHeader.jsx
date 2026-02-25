/**
 * SRI AMMAN TRADERS — REDESIGNED HEADER
 * Clean, professional layout: utility bar → main header → category nav
 */

import React, { useState, useEffect, useRef } from 'react';

const CATEGORIES = [
  { label: 'Electrical',         icon: '⚡', color: '#F59E0B', key: 'Electrical' },
  { label: 'Plumbing',           icon: '🚿', color: '#3B82F6', key: 'Plumbing' },
  { label: 'Hardware',           icon: '🔩', color: '#6B7280', key: 'Hardware' },
  { label: 'Paints & Coatings',  icon: '🎨', color: '#EC4899', key: 'Paints & Coatings' },
  { label: 'Pipes & Fittings',   icon: '🔧', color: '#10B981', key: 'Pipes & Fittings' },
  { label: 'Wiring & Cables',    icon: '🔌', color: '#8B5CF6', key: 'Wiring & Cables' },
  { label: 'Switches & Sockets', icon: '💡', color: '#F97316', key: 'Switches & Sockets' },
  { label: 'Water Tanks',        icon: '💧', color: '#06B6D4', key: 'Water Tanks' },
  { label: 'Tools',              icon: '🛠️', color: '#EF4444', key: 'Tools & Equipment' },
  { label: 'Safety',             icon: '🦺', color: '#84CC16', key: 'Safety & Protection' },
];

export default function CommercialHardwareHeader() {
  const [searchQuery, setSearchQuery]         = useState('');
  const [cartCount, setCartCount]             = useState(0);
  const [isScrolled, setIsScrolled]           = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [user, setUser]                       = useState(null);
  const [isListening, setIsListening]         = useState(false);
  const [voiceError, setVoiceError]           = useState('');
  const [activeCategory, setActiveCategory]   = useState(null);
  const accountMenuRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const loadUser = () => {
      try { setUser(JSON.parse(localStorage.getItem('user'))); } catch { setUser(null); }
    };
    const loadCart = () => {
      try {
        const c = JSON.parse(localStorage.getItem('cart') || '[]');
        setCartCount(c.reduce((s, i) => s + (i.quantity || 0), 0));
      } catch { setCartCount(0); }
    };
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    const handleClickOutside = (e) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(e.target))
        setShowAccountMenu(false);
    };
    loadUser(); loadCart();
    window.addEventListener('userLoggedIn', loadUser);
    window.addEventListener('userLoggedOut', () => { setUser(null); setCartCount(0); });
    window.addEventListener('cartUpdated', loadCart);
    window.addEventListener('storage', loadCart);
    window.addEventListener('scroll', handleScroll, { passive: true });
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('userLoggedIn', loadUser);
      window.removeEventListener('cartUpdated', loadCart);
      window.removeEventListener('storage', loadCart);
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) window.location.hash = `#dashboard?search=${encodeURIComponent(searchQuery)}`;
  };

  const handleVoiceSearch = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { setVoiceError('Voice search not supported in this browser.'); setTimeout(() => setVoiceError(''), 4000); return; }
    const r = new SR();
    r.lang = 'en-IN'; r.continuous = false; r.interimResults = false;
    recognitionRef.current = r;
    r.onstart  = () => setIsListening(true);
    r.onend    = () => setIsListening(false);
    r.onerror  = () => { setIsListening(false); setVoiceError('Voice error. Try again.'); setTimeout(() => setVoiceError(''), 4000); };
    r.onresult = (ev) => {
      const t = ev.results[0][0].transcript;
      setSearchQuery(t);
      setIsListening(false);
      setTimeout(() => { if (t.trim()) window.location.hash = `#dashboard?search=${encodeURIComponent(t)}`; }, 400);
    };
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(() => r.start())
      .catch(() => { setVoiceError('Microphone access denied.'); setTimeout(() => setVoiceError(''), 4000); });
  };

  const handleLogout = () => {
    ['token', 'user', 'cart'].forEach(k => localStorage.removeItem(k));
    setUser(null); setCartCount(0); setShowAccountMenu(false);
    window.dispatchEvent(new Event('userLoggedOut'));
    window.location.hash = '#home';
  };

  return (
    <>
      <style>{`
        .sat-header *, .sat-header *::before, .sat-header *::after { box-sizing: border-box; }
        .sat-search-wrap:focus-within { border-color: #3B82F6 !important; box-shadow: 0 0 0 3px rgba(59,130,246,.2) !important; }
        .sat-search-input::placeholder { color: #64748B; }
        .sat-search-input { font-family: inherit; }
        .sat-btn-base { font-family: inherit; }
        .sat-menu-item:hover { background: rgba(255,255,255,.05) !important; }
        .sat-cat-pill:hover { border-color: var(--pill-color) !important; color: #F1F5F9 !important; background: color-mix(in srgb, var(--pill-color) 12%, transparent) !important; transform: translateY(-1px); }
        @keyframes sat-down { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:translateY(0); } }
        .sat-dropdown { animation: sat-down .18s ease-out; }
        .sat-nav { scrollbar-width: none; -ms-overflow-style: none; }
        .sat-nav::-webkit-scrollbar { display: none; }
      `}</style>

      {/* ── Utility Bar ── */}
      <div className="sat-header" style={{ background: '#060E1C', borderBottom: '1px solid rgba(255,255,255,.05)', fontSize: '12px', color: '#64748B' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '5px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: 20 }}>
            <span>📞 +91 79042 12501</span>
            <span>✉️ support@sriammantraders.com</span>
          </div>
          <div style={{ display: 'flex', gap: 20 }}>
            <span style={{ color: '#34D399', fontWeight: 600 }}>✓ Free delivery above ₹999</span>
            <span style={{ cursor: 'pointer', color: '#93C5FD' }} onClick={() => window.location.hash='#tracking'}>Track Order</span>
            <span style={{ cursor: 'pointer', color: '#93C5FD' }} onClick={() => window.location.hash='#contact'}>Help</span>
          </div>
        </div>
      </div>

      {/* ── Main Header ── */}
      <header className="sat-header" style={{
        background: isScrolled ? 'rgba(10,18,36,0.96)' : 'linear-gradient(180deg, #0D1629 0%, #0F1E38 100%)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255,255,255,.07)',
        position: 'sticky', top: 0, zIndex: 1000,
        boxShadow: isScrolled ? '0 4px 24px rgba(0,0,0,.55)' : 'none',
        transition: 'background .3s, box-shadow .3s',
      }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '12px 24px', display: 'flex', alignItems: 'center', gap: 20 }}>

          {/* Logo */}
          <div onClick={() => window.location.hash='#home'} style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', flexShrink: 0, textDecoration: 'none' }}>
            <div style={{
              width: 44, height: 44,
              background: 'linear-gradient(135deg, #F97316, #EF4444)',
              borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 800, fontSize: 18, color: '#fff',
              boxShadow: '0 4px 14px rgba(249,115,22,.4)',
              letterSpacing: -1, flexShrink: 0,
            }}>SA</div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#F1F5F9', lineHeight: 1.15, letterSpacing: '-.3px', whiteSpace: 'nowrap' }}>Sri Amman Traders</div>
              <div style={{ fontSize: 10.5, color: '#475569', fontWeight: 600, letterSpacing: '.5px', marginTop: 1 }}>GENUINE BRANDED PRODUCTS</div>
            </div>
          </div>

          {/* Search */}
          <div style={{ flex: 1, maxWidth: 600, position: 'relative' }}>
            <form onSubmit={handleSearch} aria-label="Product search">
              <div className="sat-search-wrap" style={{
                display: 'flex', borderRadius: 10, overflow: 'hidden',
                border: '1.5px solid rgba(255,255,255,.1)',
                background: 'rgba(255,255,255,.04)',
                transition: 'border-color .2s, box-shadow .2s',
              }}>
                <input
                  className="sat-search-input"
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search products, brands, SKUs…"
                  style={{ flex: 1, padding: '11px 16px', border: 'none', outline: 'none', background: 'transparent', color: '#F1F5F9', fontSize: 14 }}
                  aria-label="Search products"
                  autoComplete="off"
                />
                <button
                  type="button"
                  className="sat-btn-base"
                  onClick={handleVoiceSearch}
                  aria-label={isListening ? 'Listening' : 'Voice search'}
                  style={{ padding: '0 13px', background: 'transparent', border: 'none', borderLeft: '1px solid rgba(255,255,255,.07)', cursor: 'pointer', fontSize: 16, color: isListening ? '#F59E0B' : '#475569', transition: 'color .2s' }}
                >
                  {isListening ? '🔴' : '🎙️'}
                </button>
                <button
                  type="submit"
                  className="sat-btn-base"
                  aria-label="Search"
                  style={{ padding: '0 20px', background: 'linear-gradient(135deg,#3B82F6,#2563EB)', border: 'none', color: '#fff', fontWeight: 700, fontSize: 16, cursor: 'pointer' }}
                >🔍</button>
              </div>
            </form>
            {voiceError && (
              <div role="alert" style={{ position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.25)', borderRadius: 8, padding: '9px 14px', fontSize: 13, color: '#FCA5A5', zIndex: 10 }}>{voiceError}</div>
            )}
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>

            {/* Wholesale CTA */}
            <button
              className="sat-btn-base"
              onClick={() => window.location.hash='#contact'}
              style={{ padding: '10px 16px', background: 'linear-gradient(135deg,#F97316,#EF4444)', border: 'none', borderRadius: 9, color: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer', boxShadow: '0 3px 12px rgba(249,115,22,.35)', display: 'flex', alignItems: 'center', gap: 6, transition: 'transform .15s, box-shadow .15s', whiteSpace: 'nowrap' }}
              onMouseEnter={e => { e.currentTarget.style.transform='translateY(-1px)'; e.currentTarget.style.boxShadow='0 5px 18px rgba(249,115,22,.45)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow='0 3px 12px rgba(249,115,22,.35)'; }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.67A2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92z"/></svg>
              Wholesale
            </button>

            {/* Account Menu */}
            <div ref={accountMenuRef} style={{ position: 'relative' }}>
              <button
                className="sat-btn-base"
                onClick={() => setShowAccountMenu(v => !v)}
                aria-haspopup="true"
                aria-expanded={showAccountMenu}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 14px', background: 'rgba(255,255,255,.04)', border: '1.5px solid rgba(255,255,255,.09)', borderRadius: 9, cursor: 'pointer', color: '#F1F5F9', transition: 'border-color .2s, background .2s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor='#3B82F6'; e.currentTarget.style.background='rgba(59,130,246,.08)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor='rgba(255,255,255,.09)'; e.currentTarget.style.background='rgba(255,255,255,.04)'; }}
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: 10, color: '#475569', lineHeight: 1 }}>{user ? 'Hello,' : 'Sign In /'}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.3 }}>{user ? (user.name?.split(' ')[0] || 'Account') : 'Register'}</div>
                </div>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg>
              </button>

              {showAccountMenu && (
                <div className="sat-dropdown" role="menu" style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, minWidth: 200, background: '#0F1E38', border: '1px solid rgba(255,255,255,.09)', borderRadius: 12, boxShadow: '0 16px 40px rgba(0,0,0,.55)', overflow: 'hidden', zIndex: 1100 }}>
                  {user ? (<>
                    <div style={{ padding: '13px 18px', borderBottom: '1px solid rgba(255,255,255,.06)', background: 'rgba(255,255,255,.02)' }}>
                      <div style={{ fontWeight: 700, color: '#F1F5F9', fontSize: 14 }}>{user.name}</div>
                      <div style={{ fontSize: 12, color: '#475569', marginTop: 2 }}>{user.email}</div>
                    </div>
                    {[
                      { icon: '👤', label: 'My Profile',  hash: '#profile' },
                      { icon: '📦', label: 'My Orders',   hash: '#my-orders' },
                      { icon: '❤️', label: 'Wishlist',    hash: '#wishlist' },
                    ].map(item => (
                      <div key={item.hash} className="sat-menu-item" role="menuitem" tabIndex={0}
                        style={{ padding: '11px 18px', cursor: 'pointer', fontSize: 14, color: '#CBD5E1', display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid rgba(255,255,255,.04)', transition: 'background .15s' }}
                        onClick={() => { window.location.hash = item.hash; setShowAccountMenu(false); }}
                        onKeyDown={e => e.key === 'Enter' && (window.location.hash = item.hash, setShowAccountMenu(false))}
                      >
                        <span aria-hidden="true">{item.icon}</span>{item.label}
                      </div>
                    ))}
                    <div className="sat-menu-item" role="menuitem" tabIndex={0}
                      style={{ padding: '11px 18px', cursor: 'pointer', fontSize: 14, color: '#FC8181', display: 'flex', alignItems: 'center', gap: 10, transition: 'background .15s' }}
                      onClick={handleLogout}
                      onKeyDown={e => e.key === 'Enter' && handleLogout()}
                    >
                      <span aria-hidden="true">🚪</span>Sign Out
                    </div>
                  </>) : (<>
                    <div className="sat-menu-item" role="menuitem" tabIndex={0}
                      style={{ padding: '13px 18px', cursor: 'pointer', fontSize: 14, color: '#CBD5E1', display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid rgba(255,255,255,.06)', transition: 'background .15s' }}
                      onClick={() => { window.location.hash='#login'; setShowAccountMenu(false); }}
                      onKeyDown={e => e.key === 'Enter' && (window.location.hash='#login', setShowAccountMenu(false))}
                    ><span aria-hidden="true">🔐</span>Sign In</div>
                    <div className="sat-menu-item" role="menuitem" tabIndex={0}
                      style={{ padding: '13px 18px', cursor: 'pointer', fontSize: 14, color: '#CBD5E1', display: 'flex', alignItems: 'center', gap: 10, transition: 'background .15s' }}
                      onClick={() => { window.location.hash='#register'; setShowAccountMenu(false); }}
                      onKeyDown={e => e.key === 'Enter' && (window.location.hash='#register', setShowAccountMenu(false))}
                    ><span aria-hidden="true">📝</span>Create Account</div>
                  </>)}
                </div>
              )}
            </div>

            {/* Cart */}
            <button
              className="sat-btn-base"
              onClick={() => window.location.hash='#cart'}
              aria-label={`Shopping cart, ${cartCount} item${cartCount !== 1 ? 's' : ''}`}
              style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 15px', background: 'rgba(255,255,255,.04)', border: '1.5px solid rgba(255,255,255,.09)', borderRadius: 9, cursor: 'pointer', color: '#F1F5F9', transition: 'border-color .2s, background .2s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor='#3B82F6'; e.currentTarget.style.background='rgba(59,130,246,.08)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor='rgba(255,255,255,.09)'; e.currentTarget.style.background='rgba(255,255,255,.04)'; }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/></svg>
              <span style={{ fontWeight: 600, fontSize: 14 }}>Cart</span>
              {cartCount > 0 && <span style={{ background: '#EF4444', color: '#fff', borderRadius: 12, padding: '1px 7px', fontSize: 11, fontWeight: 700, minWidth: 20, textAlign: 'center' }} aria-hidden="true">{cartCount}</span>}
            </button>
          </div>
        </div>
      </header>

      {/* ── Category Navigation ── */}
      <nav aria-label="Product categories" className="sat-nav" style={{ background: '#080F1E', borderBottom: '1px solid rgba(255,255,255,.06)', overflowX: 'auto' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', gap: 6, minHeight: 50 }}>

          <button
            className="sat-btn-base"
            style={{ padding: '6px 14px', background: 'rgba(59,130,246,.15)', border: '1.5px solid #3B82F6', borderRadius: 20, color: '#93C5FD', fontSize: 12.5, fontWeight: 600, cursor: 'pointer', flexShrink: 0, whiteSpace: 'nowrap', transition: 'all .2s' }}
            onClick={() => { setActiveCategory(null); window.location.hash='#dashboard'; }}
            aria-current={!activeCategory ? 'page' : undefined}
          >All Products</button>

          <div style={{ width: 1, height: 26, background: 'rgba(255,255,255,.07)', margin: '0 6px', flexShrink: 0 }} aria-hidden="true" />

          {CATEGORIES.map(cat => (
            <button
              key={cat.key}
              className="sat-cat-pill sat-btn-base"
              style={{
                '--pill-color': cat.color,
                display: 'flex', alignItems: 'center', gap: 5,
                padding: '6px 12px',
                background: activeCategory === cat.key ? `color-mix(in srgb, ${cat.color} 15%, transparent)` : 'transparent',
                border: `1.5px solid ${activeCategory === cat.key ? cat.color : 'rgba(255,255,255,.07)'}`,
                borderRadius: 20,
                color: activeCategory === cat.key ? '#F1F5F9' : '#94A3B8',
                fontSize: 12, fontWeight: 500, cursor: 'pointer',
                flexShrink: 0, whiteSpace: 'nowrap',
                transition: 'all .2s',
              } }
              onClick={() => { setActiveCategory(cat.key); window.location.hash=`#dashboard?category=${encodeURIComponent(cat.key)}`; }}
              aria-current={activeCategory === cat.key ? 'page' : undefined}
            >
              <span aria-hidden="true">{cat.icon}</span>
              {cat.label}
            </button>
          ))}

          <div style={{ marginLeft: 'auto', flexShrink: 0 }}>
            <button
              className="sat-btn-base"
              style={{ padding: '6px 14px', background: 'transparent', border: '1.5px solid rgba(249,115,22,.35)', borderRadius: 20, color: '#FB923C', fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all .2s' }}
              onMouseEnter={e => { e.currentTarget.style.background='rgba(249,115,22,.1)'; e.currentTarget.style.borderColor='#F97316'; }}
              onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.borderColor='rgba(249,115,22,.35)'; }}
              onClick={() => window.location.hash='#contact'}
            >📋 Wholesale Inquiry</button>
          </div>
        </div>
      </nav>
    </>
  );
}
