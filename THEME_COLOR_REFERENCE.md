# 🎨 Theme Color Reference - Quick Guide

## Color Swatches

### 🔵 Navy/Blue Theme (Current)

```
████████  #1F2937  Navy Darkest    → Backgrounds, hero sections
████████  #374151  Navy Dark       → Gradients, overlays
████████  #4B5563  Navy Medium     → Gradient highlights
████████  #1e3a8a  Brand Primary   → Logos, headings, buttons
████████  #3b82f6  Blue Bright     → CTAs, links, accents
████████  #2563eb  Blue Dark       → Button hover states
```

### 🔴 Red Accents

```
████████  #EF4444  Red Primary     → Register, important CTAs
████████  #DC2626  Red Dark        → Hover states
████████  #F87171  Red Light       → Subtle highlights
```

### 🟠 Orange (Buy Now)

```
████████  #f59e0b  Orange Primary  → Buy Now buttons
████████  #d97706  Orange Dark     → Hover state
```

---

## Before & After Comparison

### Dashboard Page

#### ❌ BEFORE (Purple Theme)
```css
/* Background */
background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);

/* Logo */
color: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

/* Buttons */
background: linear-gradient(135deg, #667eea, #764ba2);
box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);

/* Category Active */
background: linear-gradient(135deg, #667eea, #764ba2);

/* Product Price */
color: linear-gradient(135deg, #667eea, #764ba2);
```

#### ✅ AFTER (Navy/Blue Theme)
```css
/* Background */
background: linear-gradient(180deg, #F9FAFB 0%, #FFFFFF 100%);

/* Logo */
color: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);

/* Buttons */
background: linear-gradient(135deg, #3b82f6, #2563eb);
box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);

/* Category Active */
background: linear-gradient(135deg, #1e3a8a, #3b82f6);

/* Product Price */
color: linear-gradient(135deg, #1e3a8a, #3b82f6);
```

---

### Profile Page

#### ❌ BEFORE (Purple Theme)
```css
/* Background */
background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);

/* Stat Values */
color: linear-gradient(135deg, #667eea, #764ba2);

/* Primary Button */
background: linear-gradient(135deg, #667eea, #764ba2);
box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);

/* Secondary Button */
color: var(--color-accent-purple);
border: 2px solid var(--color-accent-purple);
```

#### ✅ AFTER (Navy/Blue Theme)
```css
/* Background */
background: linear-gradient(135deg, #1F2937 0%, #374151 50%, #4B5563 100%);

/* Stat Values */
color: linear-gradient(135deg, #1e3a8a, #3b82f6);

/* Primary Button */
background: linear-gradient(135deg, #3b82f6, #2563eb);
box-shadow: 0 4px 15px rgba(59, 130, 246, 0.4);

/* Secondary Button */
color: var(--color-brand-primary);  /* #1e3a8a */
border: 2px solid var(--color-brand-primary);
```

---

## Button Color Guide

### 🔵 Add to Cart (Blue)
```
Normal:  ████████  linear-gradient(135deg, #3b82f6, #2563eb)
Hover:   ████████  Lift + stronger shadow
Shadow:  0 4px 15px rgba(59, 130, 246, 0.3)
```

### 🔴 Register / Important (Red)
```
Normal:  ████████  linear-gradient(135deg, #EF4444, #DC2626)
Hover:   ████████  Lift + stronger shadow
Shadow:  0 4px 15px rgba(239, 68, 68, 0.3)
```

### 🟠 Buy Now (Orange)
```
Normal:  ████████  linear-gradient(135deg, #f59e0b, #d97706)
Hover:   ████████  Lift
Shadow:  0 4px 15px rgba(217, 119, 6, 0.3)
```

### ⚫ Admin / Secondary (Navy)
```
Normal:  ████████  linear-gradient(135deg, #1e3a8a, #1e40af)
Hover:   ████████  Lift + stronger shadow
Shadow:  0 4px 15px rgba(30, 58, 138, 0.3)
```

### ⚪ Secondary / Outline (White + Navy)
```
Background: #FFFFFF
Border:     2px solid #1e3a8a
Color:      #1e3a8a
Hover:      Background → #F9FAFB
```

---

## Text Color Hierarchy

```
Primary Text:    ████████  #111827  (Headings, important text)
Secondary Text:  ████████  #6B7280  (Body text, descriptions)
Tertiary Text:   ████████  #9CA3AF  (Hints, captions)
Inverse Text:    ████████  #FFFFFF  (Text on dark backgrounds)
Muted Text:      ████████  #D1D5DB  (Disabled, placeholder)
```

---

## Background Colors

```
Primary:     ████████  #FFFFFF   White backgrounds
Secondary:   ████████  #F9FAFB   Light gray
Tertiary:    ████████  #F3F4F6   Subtle gray
Dark:        ████████  #1F2937   Navy backgrounds
```

---

## Shadow Colors (by intensity)

```css
/* Navy Shadows */
--shadow-navy-sm:  0 2px 8px rgba(31, 41, 55, 0.1)   /* Subtle */
--shadow-navy-md:  0 4px 16px rgba(31, 41, 55, 0.15)  /* Medium */
--shadow-navy-lg:  0 8px 32px rgba(31, 41, 55, 0.2)   /* Strong */
--shadow-navy-xl:  0 12px 48px rgba(31, 41, 55, 0.25) /* Extra strong */

/* Blue Glow Shadows */
--shadow-blue-glow:     0 4px 15px rgba(59, 130, 246, 0.3)   /* Buttons */
--shadow-blue-glow-lg:  0 8px 32px rgba(59, 130, 246, 0.4)   /* Hover */

/* Red Glow Shadows */
--shadow-red-glow:      0 4px 15px rgba(239, 68, 68, 0.3)    /* CTAs */
--shadow-red-glow-lg:   0 8px 32px rgba(239, 68, 68, 0.4)    /* Hover */
```

---

## Gradient Recipes

### Navy Hero Section
```css
background: linear-gradient(135deg, #1F2937 0%, #374151 50%, #4B5563 100%);
```

### Blue Button
```css
background: linear-gradient(135deg, #3b82f6, #2563eb);
```

### Navy Logo/Heading
```css
background: linear-gradient(135deg, #1e3a8a, #3b82f6);
-webkit-background-clip: text;
-webkit-text-fill-color: transparent;
```

### Red CTA
```css
background: linear-gradient(135deg, #EF4444, #DC2626);
```

### Orange Buy Now
```css
background: linear-gradient(135deg, #f59e0b, #d97706);
```

### Light Product Background
```css
background: linear-gradient(180deg, #F9FAFB 0%, #FFFFFF 100%);
```

---

## Usage Examples

### Logo (Navy/Blue gradient text)
```jsx
<h1 style={{
  fontSize: '28px',
  fontWeight: '800',
  background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent'
}}>
  🔨 HomeHardware
</h1>
```

### Product Price (Navy/Blue gradient)
```jsx
<span style={{
  fontSize: '28px',
  fontWeight: '800',
  background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent'
}}>
  $99.99
</span>
```

### Add to Cart Button (Blue gradient)
```jsx
<button style={{
  padding: '14px 32px',
  background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
  color: 'white',
  border: 'none',
  borderRadius: '12px',
  fontWeight: '700',
  boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)',
  cursor: 'pointer'
}}>
  🛒 Add to Cart
</button>
```

### Register Button (Red gradient)
```jsx
<button style={{
  padding: '16px 32px',
  background: 'linear-gradient(135deg, #EF4444, #DC2626)',
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  fontWeight: '600',
  boxShadow: '0 4px 15px rgba(239, 68, 68, 0.3)',
  cursor: 'pointer'
}}>
  Register Now
</button>
```

---

## CSS Variable Quick Reference

```css
/* Use these in your components */
var(--color-brand-primary)        /* #1e3a8a - Navy blue */
var(--color-accent-blue)          /* #3b82f6 - Bright blue */
var(--color-accent-red)           /* #EF4444 - Red */
var(--gradient-blue-bright)       /* Blue button gradient */
var(--gradient-red-primary)       /* Red CTA gradient */
var(--gradient-navy-primary)      /* Navy hero gradient */
var(--shadow-blue-glow)           /* Blue button shadow */
var(--shadow-red-glow)            /* Red button shadow */
var(--shadow-card)                /* Card shadow */
```

---

## Print this page for quick reference while coding! 🎨
