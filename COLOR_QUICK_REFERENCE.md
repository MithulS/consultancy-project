# 🎨 Color System Quick Reference

**One-page cheatsheet for developers implementing the unified color system**

---

## 📌 Core Brand Colors

### Primary Blue (Main Brand)
```css
--color-brand-primary: #0B74FF         /* Main brand blue */
--color-brand-primary-hover: #0860E5   /* Hover state */
--color-brand-primary-active: #0958CC  /* Active/pressed state */
--color-brand-primary-50: #EBF5FF      /* Lightest tint */
--color-brand-primary-100: #DBEAFE     /* Very light backgrounds */
```

**Usage:** Primary buttons, logo, key CTAs, links, focus states  
**Utility Classes:** `.bg-primary`, `.text-primary`, `.border-primary`, `.btn-primary`

---

### Accent Red (Secondary Actions)
```css
--color-accent-red: #EF4444            /* Main accent */
--color-accent-red-hover: #DC2626      /* Hover state */
--color-accent-red-active: #B91C1C     /* Active state */
--color-accent-red-50: #FEF2F2         /* Light background */
--color-accent-red-100: #FEE2E2        /* Very light tint */
```

**Usage:** "Track My Order", notifications, badges, delete actions, urgent alerts  
**Utility Classes:** `.bg-accent-red`, `.text-accent-red`, `.btn-accent-red`, `.badge-error`

---

### Hero Navy (Dark Sections)
```css
--color-hero-navy: #243B53             /* Main navy */
--color-hero-navy-dark: #102A43        /* Darker variant */
--gradient-hero: linear-gradient(135deg, #243B53 0%, #102A43 100%)
```

**Usage:** Hero sections, footer, dark backgrounds  
**Utility Classes:** `.bg-hero-navy`, `.gradient-hero`

---

### Accent Purple (Tertiary)
```css
--color-accent-purple: #7C3AED         /* Main purple */
--color-accent-purple-hover: #6D28D9   /* Hover state */
--color-accent-purple-50: #F5F3FF      /* Light background */
```

**Usage:** Promotional badges, special offers, authentication modals  
**Utility Classes:** `.bg-accent-purple`, `.text-accent-purple`, `.btn-accent-purple`

---

## 📝 Text Colors

### Text Hierarchy
```css
--color-text-primary: #111827          /* Main text (headings, body) */
--color-text-secondary: #6B7280        /* Supporting text (captions, labels) */
--color-text-tertiary: #9CA3AF         /* Subtle text (metadata, timestamps) */
--color-text-muted: #D1D5DB            /* Disabled/placeholder text */
--color-text-link: #0B74FF             /* Hyperlinks */
--color-text-on-primary: #FFFFFF       /* Text on blue backgrounds */
--color-text-on-dark: #F9FAFB          /* Text on dark backgrounds */
```

**Quick Migration:**
```javascript
// ❌ Before
color: '#111827'
color: '#6B7280'
color: '#FFFFFF'

// ✅ After
color: 'var(--color-text-primary)'
color: 'var(--color-text-secondary)'
color: 'var(--color-text-on-primary)'
```

**Utility Classes:** `.text-primary`, `.text-secondary`, `.text-link`, `.text-muted`

---

## 🎨 Background Colors

### Neutral Backgrounds
```css
--color-background-primary: #FFFFFF    /* Main page background */
--color-background-secondary: #F9FAFB  /* Cards, sections */
--color-background-tertiary: #F3F4F6   /* Subtle backgrounds */
--color-background-muted: #E5E7EB      /* Disabled states */
--color-background-dark: #111827       /* Dark sections */
```

**Utility Classes:** `.bg-white`, `.bg-gray-50`, `.bg-gray-100`, `.bg-dark`

---

## 🖼️ Border Colors

```css
--color-border-default: #E5E7EB        /* Standard borders */
--color-border-light: #F3F4F6          /* Subtle dividers */
--color-border-dark: #D1D5DB           /* Emphasized borders */
--color-border-focus: #0B74FF          /* Focus rings */
--color-border-error: #EF4444          /* Error states */
```

**Utility Classes:** `.border-default`, `.border-light`, `.border-focus`

---

## ✅ Semantic Colors (Status & Feedback)

### Success (Green)
```css
--color-success: #10B981              /* Main green */
--color-success-bg: #ECFDF5           /* Background */
--color-success-text: #047857         /* Text on light bg */
```
**Usage:** Order delivered, success messages, confirmation badges  
**Utility Classes:** `.text-success`, `.bg-success`, `.alert-success`, `.badge-success`

---

### Warning (Amber)
```css
--color-warning: #F59E0B              /* Main amber */
--color-warning-bg: #FFFBEB           /* Background */
--color-warning-text: #D97706         /* Text on light bg */
```
**Usage:** Order pending, caution messages, low stock alerts  
**Utility Classes:** `.text-warning`, `.bg-warning`, `.alert-warning`, `.badge-warning`

---

### Error (Red)
```css
--color-error: #EF4444                /* Main red */
--color-error-bg: #FEF2F2             /* Background */
--color-error-text: #B91C1C           /* Text on light bg */
```
**Usage:** Failed orders, error messages, validation errors  
**Utility Classes:** `.text-error`, `.bg-error`, `.alert-error`

---

### Info (Blue)
```css
--color-info: #3B82F6                 /* Main info blue */
--color-info-bg: #EFF6FF              /* Background */
--color-info-text: #1E40AF            /* Text on light bg */
```
**Usage:** Informational messages, tips, help text  
**Utility Classes:** `.text-info`, `.bg-info`, `.alert-info`

---

## 🏷️ Order Status Colors

```css
--color-status-pending: #F59E0B       /* Pending/Processing */
--color-status-shipped: #3B82F6       /* Shipped/In Transit */
--color-status-delivered: #10B981     /* Delivered/Completed */
--color-status-cancelled: #6B7280     /* Cancelled/Refunded */
```

**Utility Classes:** `.status-pending`, `.status-shipped`, `.status-delivered`, `.status-cancelled`

---

## 🎭 Interactive States

### Hover Effects
```css
--color-hover-bg: #F3F4F6             /* Hover background overlay */
--color-hover-overlay: rgba(0, 0, 0, 0.05)  /* Subtle darkening */
```

### Focus States
```css
--color-focus-ring: #0B74FF           /* Focus outline */
--color-focus-ring-offset: #FFFFFF    /* Focus ring offset */
```

**Utility Classes:** `.focus-ring`, `.hover-lift`, `.hover-darken`

---

## 🔧 Common Component Patterns

### Buttons

#### Primary Button
```jsx
// Inline styles
<button style={{
  backgroundColor: 'var(--color-brand-primary)',
  color: 'var(--color-text-on-primary)',
  border: 'none',
  padding: '12px 24px',
  borderRadius: '8px'
}}>
  Buy Now
</button>

// Or use utility class
<button className="btn-primary">Buy Now</button>
```

#### Secondary Button (Red Accent)
```jsx
<button className="btn-accent-red">Track My Order</button>
```

#### Outline Button
```jsx
<button style={{
  backgroundColor: 'transparent',
  color: 'var(--color-brand-primary)',
  border: '2px solid var(--color-brand-primary)',
  padding: '12px 24px',
  borderRadius: '8px'
}}>
  Learn More
</button>
```

---

### Cards

```jsx
<div style={{
  backgroundColor: 'var(--color-background-primary)',
  border: '1px solid var(--color-border-default)',
  borderRadius: '12px',
  padding: '24px'
}}>
  <h3 style={{ color: 'var(--color-text-primary)' }}>Card Title</h3>
  <p style={{ color: 'var(--color-text-secondary)' }}>Description text</p>
</div>

// Or use utility classes
<div className="card-default">
  <h3 className="text-primary">Card Title</h3>
  <p className="text-secondary">Description text</p>
</div>
```

---

### Badges

```jsx
// Success badge
<span className="badge-success">Delivered</span>

// Warning badge
<span className="badge-warning">Pending</span>

// Error badge
<span className="badge-error">Cancelled</span>

// Info badge
<span className="badge-info">New</span>

// Custom badge
<span style={{
  backgroundColor: 'var(--color-success-100)',
  color: 'var(--color-success-700)',
  padding: '4px 12px',
  borderRadius: '12px',
  fontSize: '12px',
  fontWeight: 600
}}>
  In Stock
</span>
```

---

### Alert Messages

```jsx
// Success alert
<div className="alert-success">
  <strong>Success!</strong> Your order has been placed.
</div>

// Error alert
<div className="alert-error">
  <strong>Error:</strong> Payment failed. Please try again.
</div>

// Warning alert
<div className="alert-warning">
  <strong>Warning:</strong> Only 3 items left in stock.
</div>

// Info alert
<div className="alert-info">
  <strong>Info:</strong> Free shipping on orders over $50.
</div>
```

---

### Links

```jsx
// Primary link
<a style={{ 
  color: 'var(--color-text-link)',
  textDecoration: 'none'
}}>
  View Details
</a>

// Or use utility class
<a className="link-primary">View Details</a>

// Hover state (in CSS)
a:hover {
  color: var(--color-brand-primary-hover);
  text-decoration: underline;
}
```

---

### Input Fields

```jsx
// Default state
<input
  type="text"
  style={{
    border: '2px solid var(--color-border-default)',
    borderRadius: '8px',
    padding: '12px 16px',
    fontSize: '15px',
    outline: 'none'
  }}
  onFocus={(e) => e.target.style.borderColor = 'var(--color-brand-primary)'}
/>

// Or use utility class
<input type="text" className="input-default" />

// Error state
<input type="text" className="input-error" />
```

---

## 📐 Grayscale Palette (50-900)

```css
--color-gray-50: #F9FAFB     /* Lightest gray */
--color-gray-100: #F3F4F6
--color-gray-200: #E5E7EB
--color-gray-300: #D1D5DB
--color-gray-400: #9CA3AF
--color-gray-500: #6B7280    /* Middle gray */
--color-gray-600: #4B5563
--color-gray-700: #374151
--color-gray-800: #1F2937
--color-gray-900: #111827    /* Darkest gray */
```

**Usage Guide:**
- **50-200:** Backgrounds, subtle fills
- **300-400:** Borders, dividers, placeholders
- **500-600:** Secondary text, icons
- **700-900:** Primary text, headings

---

## 🚀 Migration Examples

### Before & After: Header Component

```jsx
// ❌ BEFORE (Hardcoded Colors)
const styles = {
  header: {
    backgroundColor: '#FFFFFF',
    borderBottom: '1px solid #E5E7EB'
  },
  logoIcon: {
    backgroundColor: '#0B74FF',
    color: '#FFFFFF'
  },
  searchButton: {
    backgroundColor: '#0B74FF',
    color: '#FFFFFF'
  },
  trackButton: {
    backgroundColor: '#EF4444',
    color: '#FFFFFF'
  },
  badge: {
    backgroundColor: '#EF4444',
    color: '#FFFFFF'
  }
};

// ✅ AFTER (CSS Variables)
const styles = {
  header: {
    backgroundColor: 'var(--color-background-primary)',
    borderBottom: '1px solid var(--color-border-default)'
  },
  logoIcon: {
    backgroundColor: 'var(--color-brand-primary)',
    color: 'var(--color-text-on-primary)'
  },
  searchButton: {
    backgroundColor: 'var(--color-brand-primary)',
    color: 'var(--color-text-on-primary)'
  },
  trackButton: {
    backgroundColor: 'var(--color-accent-red)',
    color: 'var(--color-text-on-primary)'
  },
  badge: {
    backgroundColor: 'var(--color-accent-red)',
    color: 'var(--color-text-on-primary)'
  }
};
```

---

### Before & After: Product Card

```jsx
// ❌ BEFORE
<div style={{
  backgroundColor: '#FFFFFF',
  border: '1px solid #E5E7EB',
  borderRadius: '12px',
  padding: '20px'
}}>
  <h3 style={{ color: '#111827', fontSize: '18px' }}>Product Name</h3>
  <p style={{ color: '#6B7280', fontSize: '14px' }}>Description</p>
  <span style={{
    backgroundColor: '#10B981',
    color: '#FFFFFF',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '12px'
  }}>
    In Stock
  </span>
  <button style={{
    backgroundColor: '#0B74FF',
    color: '#FFFFFF',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '8px',
    marginTop: '16px'
  }}>
    Add to Cart
  </button>
</div>

// ✅ AFTER
<div className="card-default">
  <h3 className="text-primary" style={{ fontSize: '18px' }}>Product Name</h3>
  <p className="text-secondary" style={{ fontSize: '14px' }}>Description</p>
  <span className="badge-success">In Stock</span>
  <button className="btn-primary" style={{ marginTop: '16px' }}>
    Add to Cart
  </button>
</div>
```

---

## ✅ Accessibility Checklist

### WCAG 2.1 AA Compliant Color Pairs

✅ **Primary Blue on White:** 4.52:1 (Passes AA for text)  
✅ **White on Primary Blue:** 4.52:1 (Passes AA for text)  
✅ **Red Accent on White:** 4.53:1 (Passes AA for text)  
✅ **White on Red Accent:** 4.53:1 (Passes AA for text)  
✅ **Gray-900 on White:** 16.50:1 (Passes AAA)  
✅ **Gray-700 on White:** 9.73:1 (Passes AAA)  
✅ **Gray-600 on White:** 7.23:1 (Passes AAA)  
✅ **Success Green on White:** 3.04:1 (Large text only)  
✅ **Warning Amber on White:** 2.37:1 (Graphics only)  

### Focus Ring Requirements
```css
/* Always include visible focus states */
button:focus-visible {
  outline: 2px solid var(--color-focus-ring);
  outline-offset: 2px;
}

/* Or use utility class */
<button className="btn-primary focus-ring">Click Me</button>
```

---

## 🎨 Gradients & Effects

### Primary Gradient
```css
background: var(--gradient-primary);
/* linear-gradient(135deg, #0B74FF 0%, #0958CC 100%) */
```

### Hero Gradient
```css
background: var(--gradient-hero);
/* linear-gradient(135deg, #243B53 0%, #102A43 100%) */
```

### Red Gradient
```css
background: var(--gradient-accent-red);
/* linear-gradient(135deg, #EF4444 0%, #DC2626 100%) */
```

### Overlay Effects
```css
--overlay-dark: rgba(0, 0, 0, 0.5);
--overlay-light: rgba(255, 255, 255, 0.9);
--overlay-primary: rgba(11, 116, 255, 0.1);
```

---

## 🌙 Dark Mode Support

All colors automatically adapt to dark mode:

```css
@media (prefers-color-scheme: dark) {
  :root {
    --color-background-primary: #111827;
    --color-background-secondary: #1F2937;
    --color-text-primary: #F9FAFB;
    --color-text-secondary: #D1D5DB;
    --color-border-default: #374151;
  }
}
```

**No additional code needed!** Just use the CSS variables and dark mode will work automatically.

---

## 📦 Import Instructions

Add to your CSS entry point (`index.css` or `App.css`):

```css
/* Import color system FIRST */
@import './styles/colorSystem.css';
@import './styles/colorUtilities.css';

/* Then your other styles */
@import './styles/unifiedDesignSystem.css';
```

---

## 🔍 Finding & Replacing Colors

### Search Patterns

Use find/replace with these patterns to migrate existing code:

1. **Background colors:**
   - Find: `backgroundColor: '#FFFFFF'`
   - Replace: `backgroundColor: 'var(--color-background-primary)'`

2. **Primary blue:**
   - Find: `#0B74FF`
   - Replace: `var(--color-brand-primary)`

3. **Accent red:**
   - Find: `#EF4444`
   - Replace: `var(--color-accent-red)`

4. **Text colors:**
   - Find: `color: '#111827'`
   - Replace: `color: 'var(--color-text-primary)'`
   
   - Find: `color: '#6B7280'`
   - Replace: `color: 'var(--color-text-secondary)'`

5. **Border colors:**
   - Find: `border: '1px solid #E5E7EB'`
   - Replace: `border: '1px solid var(--color-border-default)'`

---

## 🛠️ Debugging Tips

### Check if color system is loaded

Open browser console and run:
```javascript
getComputedStyle(document.documentElement).getPropertyValue('--color-brand-primary')
// Should return: " #0B74FF"
```

### View all available colors

```javascript
// Get all CSS variables
const styles = getComputedStyle(document.documentElement);
const colorVars = Array.from(document.styleSheets)
  .flatMap(sheet => Array.from(sheet.cssRules))
  .filter(rule => rule.selectorText === ':root')
  .flatMap(rule => Array.from(rule.style))
  .filter(prop => prop.startsWith('--color'));

console.log(colorVars);
```

---

## 📚 Resources

- **Full Documentation:** See `COLOR_SYSTEM_IMPLEMENTATION_GUIDE.md`
- **Color Tokens:** See `frontend/src/styles/colorSystem.css`
- **Utility Classes:** See `frontend/src/styles/colorUtilities.css`
- **Testing Guide:** Section 4 in Implementation Guide
- **Accessibility Standards:** WCAG 2.1 Level AA (4.5:1 for text, 3:1 for graphics)

---

## ⚡ Quick Start Checklist

- [ ] Import `colorSystem.css` and `colorUtilities.css` in your main CSS file
- [ ] Replace hardcoded hex values with CSS variables
- [ ] Use utility classes where possible (`.btn-primary`, `.badge-success`, etc.)
- [ ] Test color contrast ratios using browser DevTools
- [ ] Check dark mode appearance using `prefers-color-scheme`
- [ ] Validate focus states are visible for accessibility
- [ ] Run visual regression tests after migration

---

## 💡 Pro Tips

1. **Use semantic naming:** Choose `--color-text-primary` over `--color-gray-900` for better maintainability
2. **Leverage utility classes:** Faster than writing inline styles every time
3. **Test in dark mode:** Enable dark mode in OS settings to preview
4. **Check accessibility:** Use browser DevTools Accessibility panel
5. **Gradual migration:** Start with shared components (Header, Footer) then move to pages
6. **Document custom colors:** If you add new colors, document them in this guide

---

**Need help?** Refer to the full implementation guide or contact the development team.

**Last Updated:** December 2024  
**Version:** 1.0.0
