# 🔧 Refactored Theme System - Developer Guide

## 📚 Overview

The theme system has been refactored to be **highly reusable and maintainable**:

✅ **Centralized Configuration** - Single source of truth  
✅ **Reusable Components** - Pre-built styled components  
✅ **React Hook** - Easy theme access with `useTheme()`  
✅ **Utility Functions** - Style merging and generators  
✅ **Type Safety** - Consistent color/spacing values  
✅ **Zero Duplication** - DRY principles throughout  

---

## 📁 File Structure

```
frontend/src/
├── utils/
│   └── theme.js              # Centralized theme configuration
├── hooks/
│   └── useTheme.js           # React hook for theme access
├── components/
│   ├── StyledComponents.jsx  # Reusable styled components
│   └── ProductCardExample.jsx # Example usage
└── styles/
    └── theme.css             # CSS variables (fallback)
```

---

## 🎨 1. Using the Theme Hook

### Basic Usage

```jsx
import { useTheme } from '../hooks/useTheme';

function MyComponent() {
  const theme = useTheme();
  
  const styles = {
    container: {
      backgroundColor: theme.colors.background.primary,
      padding: theme.spacing.xl,
      borderRadius: theme.radius.lg,
      boxShadow: theme.shadows.card,
    },
    heading: {
      color: theme.colors.brand.primary,
      fontSize: '32px',
      fontWeight: '700',
    },
  };
  
  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>Hello World</h1>
    </div>
  );
}
```

### Available Theme Properties

```jsx
const theme = useTheme();

// Colors
theme.colors.navy.darkest        // #1F2937
theme.colors.brand.primary       // #1e3a8a
theme.colors.accent.blue         // #3b82f6
theme.colors.accent.red          // #EF4444
theme.colors.text.primary        // #111827

// Gradients
theme.gradients.navyPrimary      // Navy gradient
theme.gradients.blueBright       // Blue button gradient
theme.gradients.redPrimary       // Red CTA gradient
theme.gradients.textNavyBlue     // Text gradient

// Shadows
theme.shadows.card               // Card shadow
theme.shadows.blueGlow           // Blue glow shadow
theme.shadows.navyLg             // Large navy shadow

// Spacing
theme.spacing.sm                 // 8px
theme.spacing.md                 // 16px
theme.spacing.lg                 // 24px
theme.spacing.xl                 // 32px

// Border Radius
theme.radius.sm                  // 8px
theme.radius.md                  // 12px
theme.radius.lg                  // 16px

// Transitions
theme.transitions.normal         // 0.3s ease
theme.transitions.smooth         // cubic-bezier
```

---

## 🧩 2. Using Reusable Components

### Button Components

```jsx
import { Button, PrimaryButton, RedButton, SecondaryButton } from '../components/StyledComponents';

// Generic button with variant
<Button variant="primary" onClick={handleClick}>
  Click Me
</Button>

// Shorthand components
<PrimaryButton onClick={handleSubmit}>Submit</PrimaryButton>
<RedButton onClick={handleDelete}>Delete</RedButton>
<SecondaryButton onClick={handleCancel}>Cancel</SecondaryButton>

// Custom styles
<Button 
  variant="primary" 
  style={{ width: '100%', padding: '16px' }}
>
  Full Width Button
</Button>

// Disabled state
<Button variant="primary" disabled>
  Disabled
</Button>
```

### Card Components

```jsx
import { Card, ProductCard } from '../components/StyledComponents';

// Basic card
<Card>
  <h2>Card Title</h2>
  <p>Card content goes here</p>
</Card>

// Card with hover effect
<Card hover>
  <p>Hovers and lifts on mouse over</p>
</Card>

// Product card (optimized for product display)
<ProductCard>
  <img src="..." />
  <div>Product details</div>
</ProductCard>
```

### Input Components

```jsx
import { Input, SearchInput } from '../components/StyledComponents';

// Regular input
<Input 
  type="text" 
  placeholder="Enter your name"
  value={name}
  onChange={(e) => setName(e.target.value)}
/>

// Input with icon
<Input 
  withIcon 
  placeholder="Enter email"
/>

// Search input (with built-in search icon)
<SearchInput 
  placeholder="Search products..."
  value={searchTerm}
  onChange={(e) => setSearchTerm(e.target.value)}
/>
```

### Text Components

```jsx
import { GradientText, Price } from '../components/StyledComponents';

// Gradient text (navy → blue)
<h1>
  Welcome to <GradientText>HomeHardware</GradientText>
</h1>

// Price component
<Price amount={99.99} />              // $99.99 with gradient
<Price amount={49.50} gradient={false} />  // $49.50 solid color
<Price amount={129} currency="€" />   // €129.00
```

### Badge Components

```jsx
import { Badge, StockBadge } from '../components/StyledComponents';

// Generic badges
<Badge variant="primary">New</Badge>
<Badge variant="success">Available</Badge>
<Badge variant="error">Sold Out</Badge>
<Badge variant="warning">Low Stock</Badge>

// Stock badge (automatic color based on stock)
<StockBadge inStock={product.stock > 0} />
```

### Container Components

```jsx
import { Container, PageContainer } from '../components/StyledComponents';

// Page container with variant
<Container variant="lightGradient">
  <YourContent />
</Container>

// Centered content container
<PageContainer maxWidth="1200px">
  <YourContent />
</PageContainer>
```

### Header Components

```jsx
import { Header, Logo } from '../components/StyledComponents';

// Header with variant
<Header variant="default">
  <Logo variant="gradient">🔨 HomeHardware</Logo>
  <nav>...</nav>
</Header>

// Simple header
<Header variant="simple">
  <Logo variant="solid">MyStore</Logo>
</Header>
```

### Grid Component

```jsx
import { Grid } from '../components/StyledComponents';

// Product grid
<Grid minCardWidth="280px" gap="28px">
  {products.map(product => (
    <ProductCard key={product.id}>...</ProductCard>
  ))}
</Grid>

// Custom grid
<Grid minCardWidth="200px" gap="16px">
  {items.map(item => <div key={item.id}>{item.name}</div>)}
</Grid>
```

### Utility Components

```jsx
import { Notification, LoadingContainer, LoadingSpinner } from '../components/StyledComponents';

// Notification toast
{showNotification && (
  <Notification 
    message="Item added to cart!" 
    type="success"
  />
)}

// Loading states
<LoadingContainer message="Loading products..." />
<LoadingSpinner size="64px" color="#3b82f6" />
```

---

## 🛠️ 3. Using Theme Utilities

### Merge Styles

```jsx
import { useTheme } from '../hooks/useTheme';

const theme = useTheme();

const baseButtonStyle = {
  padding: '12px 24px',
  border: 'none',
  cursor: 'pointer',
};

const primaryButton = theme.mergeStyles(
  baseButtonStyle,
  { background: theme.gradients.blueBright },
  { color: '#fff' }
);
```

### Create Button with Hover

```jsx
import { createButtonStyle } from '../utils/theme';

const { style, handlers } = createButtonStyle('primary', {
  width: '100%',
  fontSize: '18px',
});

<button style={style} {...handlers}>
  Click Me
</button>
```

### Card Hover Handlers

```jsx
import { createCardHoverHandlers } from '../utils/theme';

const hoverHandlers = createCardHoverHandlers();

<div style={cardStyle} {...hoverHandlers}>
  Card Content
</div>
```

### Grid Layout

```jsx
import { createGridLayout } from '../utils/theme';

const gridStyle = createGridLayout('300px', '32px');

<div style={gridStyle}>
  {items.map(item => <Card key={item.id}>{item.name}</Card>)}
</div>
```

---

## 📖 4. Common Patterns

### Product Listing Page

```jsx
import { useTheme } from '../hooks/useTheme';
import { Container, Header, Logo, SearchInput, Grid, ProductCard } from '../components/StyledComponents';

function ProductsPage() {
  const theme = useTheme();
  
  return (
    <Container variant="lightGradient">
      <Header variant="default">
        <Logo variant="gradient">🔨 HomeHardware</Logo>
      </Header>
      
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '32px' }}>
        <SearchInput 
          placeholder="Search products..."
          style={{ marginBottom: theme.spacing.xl }}
        />
        
        <Grid minCardWidth="280px" gap="28px">
          {products.map(product => (
            <ProductCard key={product.id}>
              {/* Product content */}
            </ProductCard>
          ))}
        </Grid>
      </div>
    </Container>
  );
}
```

### Form Page

```jsx
import { useTheme } from '../hooks/useTheme';
import { Container, Card, Input, PrimaryButton, SecondaryButton } from '../components/StyledComponents';

function LoginPage() {
  const theme = useTheme();
  
  return (
    <Container variant="navyGradient">
      <Card style={{ 
        maxWidth: '400px', 
        margin: '100px auto',
        padding: theme.spacing.xl 
      }}>
        <h2 style={{ marginBottom: theme.spacing.lg }}>Login</h2>
        
        <Input 
          type="email" 
          placeholder="Email"
          style={{ marginBottom: theme.spacing.md }}
        />
        
        <Input 
          type="password" 
          placeholder="Password"
          style={{ marginBottom: theme.spacing.lg }}
        />
        
        <div style={{ display: 'flex', gap: theme.spacing.md }}>
          <PrimaryButton style={{ flex: 1 }}>Login</PrimaryButton>
          <SecondaryButton>Cancel</SecondaryButton>
        </div>
      </Card>
    </Container>
  );
}
```

### Dashboard with Stats

```jsx
import { useTheme } from '../hooks/useTheme';
import { Container, Grid, Card, GradientText } from '../components/StyledComponents';

function Dashboard() {
  const theme = useTheme();
  
  const statCardStyle = {
    padding: theme.spacing.lg,
    textAlign: 'center',
  };
  
  return (
    <Container variant="default">
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: theme.spacing.xl }}>
        <h1>Dashboard</h1>
        
        <Grid minCardWidth="200px" gap="24px">
          <Card style={statCardStyle}>
            <GradientText style={{ fontSize: '48px', fontWeight: '800' }}>
              124
            </GradientText>
            <p>Total Orders</p>
          </Card>
          
          <Card style={statCardStyle}>
            <GradientText style={{ fontSize: '48px', fontWeight: '800' }}>
              $12,450
            </GradientText>
            <p>Revenue</p>
          </Card>
        </Grid>
      </div>
    </Container>
  );
}
```

---

## 🎯 5. Customization Guide

### Add New Color

Edit `frontend/src/utils/theme.js`:

```js
export const colors = {
  // ... existing colors
  
  // Add your custom color
  custom: {
    purple: '#8b5cf6',
    purpleDark: '#7c3aed',
  },
};
```

Use it:

```jsx
const theme = useTheme();

<div style={{ color: theme.colors.custom.purple }}>
  Custom colored text
</div>
```

### Add New Gradient

```js
export const gradients = {
  // ... existing gradients
  
  // Add custom gradient
  customPurple: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
};
```

### Add New Component Style

```js
export const commonStyles = {
  // ... existing styles
  
  // Add new pattern
  myCustomCard: {
    backgroundColor: colors.background.primary,
    padding: spacing.lg,
    borderRadius: radius.lg,
    boxShadow: shadows.card,
  },
};
```

### Create New Styled Component

Edit `frontend/src/components/StyledComponents.jsx`:

```jsx
export function MyCustomButton({ children, ...props }) {
  const theme = useTheme();
  
  const style = {
    ...theme.commonStyles.button.base,
    background: theme.gradients.customPurple,
    color: theme.colors.text.inverse,
  };
  
  return <button style={style} {...props}>{children}</button>;
}
```

---

## ✅ Benefits of Refactored System

### Before (Old Approach)

```jsx
// ❌ Duplicated across every component
const styles = {
  button: {
    background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
    color: 'white',
    padding: '14px 32px',
    borderRadius: '12px',
    boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)',
  }
};
```

### After (New Approach)

```jsx
// ✅ Reusable and consistent
import { PrimaryButton } from '../components/StyledComponents';

<PrimaryButton>Click Me</PrimaryButton>
```

### Advantages

| Aspect | Before | After |
|--------|--------|-------|
| **Code Duplication** | High - styles repeated in every file | Zero - import once, use everywhere |
| **Maintainability** | Hard - update 20+ files | Easy - update one theme file |
| **Consistency** | Low - manual color values | High - centralized colors |
| **Type Safety** | None | Better - defined structure |
| **Bundle Size** | Larger | Smaller - shared code |
| **Developer Experience** | Tedious | Fast - autocomplete ready |

---

## 🚀 Migration Guide

### Step 1: Import Theme

```jsx
// Before
const styles = {
  button: { background: '#3b82f6' }
};

// After
import { useTheme } from '../hooks/useTheme';
const theme = useTheme();
const styles = {
  button: { background: theme.colors.accent.blue }
};
```

### Step 2: Replace Inline Styles

```jsx
// Before
<button style={{
  background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
  color: 'white',
  padding: '14px 32px',
  borderRadius: '12px',
}}>
  Click Me
</button>

// After
import { PrimaryButton } from '../components/StyledComponents';
<PrimaryButton>Click Me</PrimaryButton>
```

### Step 3: Use Common Patterns

```jsx
// Before
const cardStyle = {
  backgroundColor: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(20px)',
  borderRadius: '16px',
  boxShadow: '0 8px 32px rgba(31, 41, 55, 0.12)',
  // ... more properties
};

// After
import { Card } from '../components/StyledComponents';
<Card hover>Your content</Card>
```

---

## 📚 Complete Example

See `frontend/src/components/ProductCardExample.jsx` for a complete example of using the refactored theme system.

---

## 🆘 Troubleshooting

### Theme values not updating?

Make sure you're using `useTheme()` hook:

```jsx
import { useTheme } from '../hooks/useTheme';

function MyComponent() {
  const theme = useTheme(); // ✅ Correct
  // Not: import theme from '../utils/theme'; ❌
}
```

### Button hover not working?

Use `createButtonStyle` utility:

```jsx
import { createButtonStyle } from '../utils/theme';

const { style, handlers } = createButtonStyle('primary');

<button style={style} {...handlers}>Hover Me</button>
```

### Need custom colors?

Extend the theme in `theme.js`:

```js
export const colors = {
  // ... existing
  custom: { myColor: '#123456' }
};
```

---

**The theme system is now fully refactored and production-ready!** 🎉

See also:
- `THEME_IMPLEMENTATION_GUIDE.md` - Original implementation
- `THEME_COLOR_REFERENCE.md` - Color swatches
- `THEME_QUICK_START.md` - Testing guide
