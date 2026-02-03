# 🎨 Dark Navy Theme - Quick Visual Reference

## Color Palette at a Glance

### 🌑 Navy Background Colors
```
████ #0a1628  --navy-darkest    Main background
████ #101e35  --navy-darker     Section backgrounds
████ #1a2942  --navy-dark       Card backgrounds
████ #243750  --navy-medium     Hover states
████ #2d455e  --navy-light      Borders
████ #3a5472  --navy-lighter    Subtle highlights
```

### 🔴 Red Accent Colors (Urgency & Action)
```
████ #ff4757  --accent-red-primary   Main red
████ #ff3838  --accent-red-hover     Hover state
████ #ee2a3a  --accent-red-active    Active state
```
**When to Use**: Track Order, Register, Flash Sales, Urgent Actions

### 🔵 Blue Accent Colors (Trust & Security)
```
████ #2e86de  --accent-blue-primary  Main blue
████ #2980d9  --accent-blue-hover    Hover state
████ #2472c4  --accent-blue-active   Active state
```
**When to Use**: Login, Profile, View Details, Information

### 🟠 Orange Accent (Commerce)
```
████ #ff9f43  --accent-orange        Buy Now
████ #ff8c1a  --accent-orange-hover  Hover state
```
**When to Use**: Buy Now, Checkout, Purchase Actions

### 🟣 Purple Accent (Add to Cart)
```
████ #7c5cde  --accent-purple        Add to Cart
████ #6147c4  --accent-purple-hover  Hover state
```
**When to Use**: Add to Cart, Wishlist, Save for Later

### ⚪ Text Colors
```
████ #ffffff  --text-primary     Headings (15.5:1 ⭐)
████ #c5d0de  --text-secondary   Body text (9.2:1 ⭐)
████ #8fa3b8  --text-tertiary    Captions (5.8:1 ✓)
████ #6b7f94  --text-muted       Placeholders (4.6:1 ✓)
```

---

## Button Visual Guide

### Primary Action Buttons

#### Red Button (Urgency)
```
┌──────────────────────────────┐
│   🚚  TRACK YOUR ORDER       │  ← Red gradient (#ff4757 → #ee2a3a)
└──────────────────────────────┘
    Glow: rgba(255, 71, 87, 0.5)
    Use: Urgent actions, track order
```

#### Blue Button (Trust)
```
┌──────────────────────────────┐
│   👤  MY PROFILE             │  ← Blue gradient (#2e86de → #2472c4)
└──────────────────────────────┘
    Glow: rgba(46, 134, 222, 0.5)
    Use: Login, profile, secure actions
```

#### Orange Buy Now (Commerce)
```
┌──────────────────────────────┐
│   🛒  BUY NOW                │  ← Orange gradient (#ff9f43 → #f77f00)
└──────────────────────────────┘
    Glow: rgba(255, 159, 67, 0.5)
    Use: Purchase, checkout, immediate action
```

#### Purple Add to Cart
```
┌──────────────────────────────┐
│   🛍️  ADD TO CART           │  ← Purple gradient (#7c5cde → #6147c4)
└──────────────────────────────┘
    Use: Add items, save for later
```

### Secondary Buttons

#### Outline Red
```
┌──────────────────────────────┐
│   LEARN MORE                 │  ← Transparent bg, red border
└──────────────────────────────┘
    Hover: Fills with red gradient
```

#### Outline Blue
```
┌──────────────────────────────┐
│   VIEW DETAILS               │  ← Transparent bg, blue border
└──────────────────────────────┘
    Hover: Fills with blue gradient
```

#### Ghost Button
```
┌──────────────────────────────┐
│   View All                   │  ← Subtle background, minimal
└──────────────────────────────┘
    Use: Low-priority actions
```

---

## Component Layouts

### Product Card Structure
```
┌─────────────────────────────────────┐
│                                     │
│         [Product Image]             │ ← 280px height
│                                     │
│  -15%  ←───────────────────────────┐│ ← Discount badge
│                                     ││
├─────────────────────────────────────┤
│  TOOLS              ← Category      │
│  20V MAX Brushless Drill            │ ← Title
│  Professional cordless drill...     │ ← Description
│                                     │
│  ⭐⭐⭐⭐⭐ 4.8 (124)                │ ← Rating
│                                     │
│  ✓ 45 in stock    ← Stock status   │
│                                     │
│  ₹2,499  ₹3,999  SAVE 38%          │ ← Price
│                                     │
│  ┌───────────────────────────────┐ │
│  │   🛒 BUY NOW                  │ │ ← Orange button
│  └───────────────────────────────┘ │
│  ┌───────────────────────────────┐ │
│  │   🛍️ ADD TO CART              │ │ ← Purple button
│  └───────────────────────────────┘ │
│                                     │
│       ❤️    ⚖️    🔗              │ ← Icon actions
└─────────────────────────────────────┘
```

### Header Layout
```
┌────────────────────────────────────────────────────────────┐
│  🔨 HomeHardware    Home Products Categories Deals Contact │
│                                                              │
│                          🔍  ❤️(3)  🛒(5)  [Login]         │
└────────────────────────────────────────────────────────────┘
│← Logo with gradient    Navigation links →│← Icon buttons →│
```

### Hero Section
```
┌────────────────────────────────────────────────────────────┐
│                                                              │
│                   Premium Hardware Store                     │ ← White gradient text
│                                                              │
│        Discover top-quality tools at unbeatable prices      │ ← Light gray
│                                                              │
│         ┌─────────────┐    ┌─────────────┐                 │
│         │ 🛍️ Shop Now │    │ 📦 Track    │                 │
│         └─────────────┘    └─────────────┘                 │
│             Orange             Blue                          │
│                                                              │
└────────────────────────────────────────────────────────────┘
     Background: Navy gradient with subtle glows
```

### Category Cards
```
┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
│    ⚡    │  │    🚰    │  │    🔧    │  │    🛠️    │
│          │  │          │  │          │  │          │
│Electrical│  │ Plumbing │  │ Hardware │  │  Tools   │
│245 items │  │189 items │  │356 items │  │412 items │
└──────────┘  └──────────┘  └──────────┘  └──────────┘
    Glassmorphism effect with hover lift animation
```

---

## Gradient Examples

### Primary Navy Gradient (Main Background)
```
  Dark ──────────────────────────────────► Light
#0a1628         #1a2942            #243750
██████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
```
**Angle**: 135deg  
**Usage**: Full page backgrounds, hero sections

### Card Gradient (Product Cards, Modals)
```
  Darker ─────────────────────────► Lighter
#1a2942                       #243750
███████░░░░░░░░░░░░░░░░░░░░░░░░░░░
```
**Angle**: 145deg  
**Usage**: Product cards, overlay panels

### Button Gradients

**Red:**
```
#ff4757 ──────────► #ee2a3a
███████░░░░░░░░░░░░
```

**Blue:**
```
#2e86de ──────────► #2472c4
███████░░░░░░░░░░░░
```

**Orange:**
```
#ff9f43 ──────────► #f77f00
███████░░░░░░░░░░░░
```

---

## Spacing Scale

```
--spacing-xs:   4px   ▪
--spacing-sm:   8px   ▪▪
--spacing-md:  16px   ▪▪▪▪
--spacing-lg:  24px   ▪▪▪▪▪▪
--spacing-xl:  32px   ▪▪▪▪▪▪▪▪
--spacing-2xl: 48px   ▪▪▪▪▪▪▪▪▪▪▪▪
--spacing-3xl: 64px   ▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪
```

---

## Border Radius Scale

```
--radius-sm:   8px   ◜◝◟◞
--radius-md:  12px   ◜  ◝◟  ◞
--radius-lg:  16px   ◜    ◝◟    ◞
--radius-xl:  24px   ◜      ◝◟      ◞
--radius-full: 9999px  ●  (Perfect circle)
```

---

## Shadow System

### Card Shadows
```
--shadow-sm:  0 2px 8px rgba(0,0,0,0.3)   ░
--shadow-md:  0 4px 16px rgba(0,0,0,0.4)  ░░
--shadow-lg:  0 8px 32px rgba(0,0,0,0.5)  ░░░
--shadow-xl:  0 16px 48px rgba(0,0,0,0.6) ░░░░
```

### Glow Effects
```
Blue:    0 0 20px rgba(46, 134, 222, 0.5)   ⭕ Blue aura
Red:     0 0 20px rgba(255, 71, 87, 0.5)    🔴 Red aura
Orange:  0 0 20px rgba(255, 159, 67, 0.5)   🟠 Orange aura
Green:   0 0 20px rgba(46, 204, 113, 0.4)   🟢 Green aura
```

---

## Typography Scale

```
.heading-1    48-64px   ████████  Extra Bold (800)
.heading-2    32-48px   ██████    Bold (700)
.heading-3    24-32px   ████      Semi-Bold (600)
.text-large   20px      ███       Regular (400)
.body-text    16px      ██        Regular (400)
.text-small   14px      ██        Regular (400)
.text-xs      12px      █         Regular (400)
```

---

## Interactive States

### Button Hover Effect
```
Normal:  ┌──────────┐
         │  Button  │  ← Base position
         └──────────┘
           Shadow: 0 4px 15px

Hover:   ┌──────────┐
         │  Button  │  ← Lifts -2px
         └──────────┘
           Shadow: 0 8px 25px (enhanced glow)
           
Active:  ┌──────────┐
         │  Button  │  ← Returns to base
         └──────────┘
           Shadow: 0 2px 10px (pressed)
```

### Card Hover Effect
```
Normal:  ┌──────────┐
         │   Card   │  ← Base position
         └──────────┘
           Shadow: 0 8px 32px

Hover:   ┌──────────┐
         │   Card   │  ← Lifts -8px
         └──────────┘
           Shadow: 0 12px 48px
           Border color brightens
```

---

## Accessibility Visual Guide

### Contrast Ratios
```
AAA (7:1+)  ███████████████████ ⭐ Excellent
AA (4.5:1+) ██████████████      ✓ Good
Fail (<4.5) ███████             ✗ Poor
```

**Current Theme:**
- Headings: 15.5:1 ⭐⭐⭐
- Body: 9.2:1 ⭐⭐
- Captions: 5.8:1 ✓
- All pass WCAG standards!

### Focus States
```
Normal:   [  Button  ]

Focused:  [  Button  ]  ← 3px blue outline
          ▔▔▔▔▔▔▔▔▔▔     2px offset
          Blue glow (#2e86de)
```

---

## Glassmorphism Effect

```
┌─────────────────────────────────┐
│ ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒ │ ← Frosted glass
│ ▒▒  Card Content Here      ▒▒ │
│ ▒▒  Blurred background     ▒▒ │
│ ▒▒  through transparent    ▒▒ │
│ ▒▒  overlay                ▒▒ │
│ ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒ │
└─────────────────────────────────┘
  Background: rgba(26, 41, 66, 0.7)
  Backdrop-filter: blur(20px)
  Border: 1px solid rgba(255, 255, 255, 0.1)
```

---

## Responsive Grid

### Desktop (1024px+)
```
┌────┐ ┌────┐ ┌────┐ ┌────┐
│    │ │    │ │    │ │    │
└────┘ └────┘ └────┘ └────┘
    4 columns
```

### Tablet (768-1023px)
```
┌────┐ ┌────┐ ┌────┐
│    │ │    │ │    │
└────┘ └────┘ └────┘
    3 columns
```

### Mobile (480-767px)
```
┌────┐ ┌────┐
│    │ │    │
└────┘ └────┘
  2 columns
```

### Small Mobile (<480px)
```
┌──────────┐
│          │
└──────────┘
  1 column
```

---

## Quick Reference: When to Use What

| Element | Use Case | Class |
|---------|----------|-------|
| 🔴 **Red Button** | Track Order, Register, Urgent Actions | `.btn-red` |
| 🔵 **Blue Button** | Login, Profile, Information | `.btn-blue` |
| 🟠 **Orange Button** | Buy Now, Checkout | `.btn-buy-now` |
| 🟣 **Purple Button** | Add to Cart, Wishlist | `.btn-add-cart` |
| ⚪ **Ghost Button** | Cancel, View All, Low Priority | `.btn-ghost` |
| 🖼️ **Product Card** | Display products | `<DarkThemeProductCard>` |
| 🏠 **Full Page** | Complete homepage | `<DarkNavyHomePage>` |
| 📦 **Category Card** | Category navigation | `.category-card` |
| 🎯 **Hero Section** | Landing page hero | `.hero` |

---

## Class Reference Cheatsheet

### Layout
```css
.container          /* Max-width 1400px, centered */
.section            /* 80px vertical padding */
.grid               /* CSS Grid, 24px gap */
.flex-center        /* Centered flex container */
.text-center        /* Centered text */
```

### Typography
```css
.heading-1          /* 2.5-4rem, 800 weight */
.heading-2          /* 2-3rem, 700 weight */
.heading-3          /* 1.5-2rem, 600 weight */
.body-text          /* 1rem, normal */
.text-large         /* 1.25rem */
.text-small         /* 0.875rem */
.text-xs            /* 0.75rem */
```

### Buttons
```css
.btn-red            /* Red accent button */
.btn-blue           /* Blue accent button */
.btn-buy-now        /* Orange commerce button */
.btn-add-cart       /* Purple add to cart */
.btn-outline-red    /* Outline red */
.btn-outline-blue   /* Outline blue */
.btn-ghost          /* Minimal ghost button */
.btn-sm             /* Small size */
.btn-lg             /* Large size */
.btn-xl             /* Extra large size */
```

### Components
```css
.product-card       /* Product card container */
.category-card      /* Category card */
.header             /* Header navigation */
.hero               /* Hero section */
.icon-button        /* Icon-only button */
.badge              /* Badge/label */
.loading-spinner    /* Loading indicator */
```

---

**Version**: 1.0.0  
**Last Updated**: January 2, 2026

💡 **Tip**: Print this page and keep it as a desk reference while implementing the dark navy theme!
