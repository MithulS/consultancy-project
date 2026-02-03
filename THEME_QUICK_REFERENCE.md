# 🎨 Theme System - Quick Reference Card

## 📦 Import What You Need

```jsx
// Theme Hook
import { useTheme } from '../hooks/useTheme';

// Styled Components (pick what you need)
import { 
  // Containers
  Container, PageContainer, Section,
  
  // Layout
  Header, Logo, Grid,
  
  // Buttons
  Button, PrimaryButton, RedButton, OrangeButton, SecondaryButton,
  
  // Cards
  Card, ProductCard,
  
  // Inputs
  Input, SearchInput,
  
  // Text
  GradientText, Price,
  
  // Badges
  Badge, StockBadge,
  
  // Utility
  Notification, LoadingSpinner, LoadingContainer
} from '../components/StyledComponents';
```

---

## 🎯 Quick Examples

### 1. Basic Page Layout
```jsx
<Container variant="lightGradient">
  <Header variant="default">
    <Logo variant="gradient">🔨 Store</Logo>
  </Header>
  <PageContainer>
    <YourContent />
  </PageContainer>
</Container>
```

### 2. Product Grid
```jsx
<Grid minCardWidth="280px" gap="28px">
  {products.map(p => (
    <ProductCard key={p.id}>
      <img src={p.image} />
      <Price amount={p.price} />
      <PrimaryButton>Add to Cart</PrimaryButton>
    </ProductCard>
  ))}
</Grid>
```

### 3. Form
```jsx
<Card style={{ maxWidth: '400px', margin: '0 auto', padding: '32px' }}>
  <Input placeholder="Email" type="email" />
  <Input placeholder="Password" type="password" />
  <PrimaryButton style={{ width: '100%' }}>Login</PrimaryButton>
</Card>
```

### 4. Using Theme Hook
```jsx
const theme = useTheme();

<div style={{
  color: theme.colors.brand.primary,
  padding: theme.spacing.xl,
  borderRadius: theme.radius.lg,
  boxShadow: theme.shadows.card
}}>
  Content
</div>
```

---

## 🎨 Colors Quick Access

```jsx
const theme = useTheme();

// Brand Colors
theme.colors.brand.primary        // #1e3a8a (navy)
theme.colors.brand.primaryLight   // #3b82f6 (blue)

// Accent Colors
theme.colors.accent.blue          // #3b82f6
theme.colors.accent.red           // #EF4444
theme.colors.accent.orange        // #f59e0b

// Text Colors
theme.colors.text.primary         // #111827
theme.colors.text.secondary       // #6B7280

// Backgrounds
theme.colors.background.primary   // #FFFFFF
theme.colors.background.secondary // #F9FAFB
```

---

## 🌈 Gradients

```jsx
const theme = useTheme();

theme.gradients.blueBright     // Blue buttons
theme.gradients.redPrimary     // Red CTAs
theme.gradients.orange         // Buy Now buttons
theme.gradients.navyPrimary    // Navy backgrounds
theme.gradients.textNavyBlue   // Text gradients
```

---

## 📏 Spacing

```jsx
const theme = useTheme();

theme.spacing.sm    // 8px
theme.spacing.md    // 16px
theme.spacing.lg    // 24px
theme.spacing.xl    // 32px
theme.spacing['2xl'] // 48px
```

---

## 🔘 Button Variants

```jsx
<Button variant="primary">Primary</Button>    // Blue
<Button variant="red">Danger</Button>         // Red
<Button variant="orange">Buy Now</Button>     // Orange
<Button variant="navy">Admin</Button>         // Navy
<Button variant="secondary">Cancel</Button>   // White + Border

// Or use shorthand
<PrimaryButton>Primary</PrimaryButton>
<RedButton>Delete</RedButton>
<OrangeButton>Buy Now</OrangeButton>
<SecondaryButton>Cancel</SecondaryButton>
```

---

## 🃏 Card Variants

```jsx
// Basic card
<Card>Content</Card>

// With hover effect
<Card hover>Content</Card>

// Product card (optimized)
<ProductCard>
  <img />
  <div>Details</div>
</ProductCard>
```

---

## 📝 Input Types

```jsx
// Regular input
<Input type="text" placeholder="Name" />

// With icon space
<Input withIcon placeholder="Email" />

// Search input (with built-in icon)
<SearchInput placeholder="Search..." />
```

---

## 🏷️ Badges

```jsx
<Badge variant="primary">New</Badge>
<Badge variant="success">Active</Badge>
<Badge variant="error">Sold Out</Badge>
<Badge variant="warning">Low Stock</Badge>

// Stock-specific
<StockBadge inStock={true} />  // Green "✓ In Stock"
<StockBadge inStock={false} /> // Red "✗ Out of Stock"
```

---

## 💰 Price Display

```jsx
// With gradient (default)
<Price amount={99.99} />           // $99.99 (blue gradient)

// Solid color
<Price amount={49.50} gradient={false} />

// Custom currency
<Price amount={129} currency="€" />  // €129.00
```

---

## 🎨 Text Styling

```jsx
// Gradient text
<GradientText>Featured Product</GradientText>

// Using theme colors
const theme = useTheme();
<span style={{ color: theme.colors.brand.primary }}>
  Navy text
</span>
```

---

## 📦 Container Variants

```jsx
<Container variant="default">...</Container>        // White
<Container variant="lightGradient">...</Container>  // Light gradient
<Container variant="navyGradient">...</Container>   // Navy gradient
```

---

## 🎯 Grid Layouts

```jsx
// Standard product grid
<Grid minCardWidth="280px" gap="28px">
  {items}
</Grid>

// Custom grid
<Grid minCardWidth="200px" gap="16px">
  {items}
</Grid>
```

---

## 🔔 Notifications

```jsx
{showNotif && (
  <Notification 
    message="Success!" 
    type="success"  // or "error", "warning"
  />
)}
```

---

## ⏳ Loading States

```jsx
// Full loading container
<LoadingContainer message="Loading products..." />

// Just spinner
<LoadingSpinner size="48px" color="#3b82f6" />
```

---

## 🛠️ Utility Functions

```jsx
import { 
  mergeStyles, 
  createButtonStyle,
  createCardHoverHandlers,
  createGridLayout 
} from '../utils/theme';

// Merge styles
const combined = mergeStyles(style1, style2, style3);

// Button with auto-hover
const { style, handlers } = createButtonStyle('primary');
<button style={style} {...handlers}>Hover Me</button>

// Card hover
const hoverHandlers = createCardHoverHandlers();
<div {...hoverHandlers}>Card</div>

// Grid layout
const gridStyle = createGridLayout('300px', '32px');
<div style={gridStyle}>{items}</div>
```

---

## 📐 Common Style Patterns

```jsx
const theme = useTheme();

// Use pre-built patterns
theme.commonStyles.container.lightGradient
theme.commonStyles.header.default
theme.commonStyles.logo.gradient
theme.commonStyles.button.primary
theme.commonStyles.card.default
theme.commonStyles.input.default
theme.commonStyles.price.gradient
```

---

## 🎪 Complete Component Example

```jsx
import { useTheme } from '../hooks/useTheme';
import { 
  Container, 
  Header, 
  Logo, 
  Grid, 
  ProductCard, 
  Price, 
  PrimaryButton 
} from '../components/StyledComponents';

function ProductsPage() {
  const theme = useTheme();
  
  return (
    <Container variant="lightGradient">
      <Header variant="default">
        <Logo variant="gradient">🔨 MyStore</Logo>
      </Header>
      
      <div style={{ 
        maxWidth: '1400px', 
        margin: '0 auto', 
        padding: theme.spacing.xl 
      }}>
        <Grid minCardWidth="280px" gap="28px">
          {products.map(product => (
            <ProductCard key={product.id}>
              <img src={product.image} style={{ width: '100%' }} />
              <div style={{ padding: theme.spacing.md }}>
                <h3>{product.name}</h3>
                <Price amount={product.price} />
                <PrimaryButton style={{ width: '100%', marginTop: '16px' }}>
                  Add to Cart
                </PrimaryButton>
              </div>
            </ProductCard>
          ))}
        </Grid>
      </div>
    </Container>
  );
}
```

---

## ✅ Best Practices

1. ✅ **Always use `useTheme()` hook** for theme access
2. ✅ **Use styled components** for common UI elements
3. ✅ **Use theme.spacing** instead of hardcoded pixel values
4. ✅ **Use theme.colors** instead of hex codes
5. ✅ **Extend theme** for custom colors, don't override
6. ✅ **Merge styles** with `mergeStyles()` utility
7. ✅ **Use button variants** instead of custom button styles

---

## 🚫 Avoid

1. ❌ Don't hardcode colors: `color: '#3b82f6'`
2. ❌ Don't duplicate button styles across components
3. ❌ Don't use magic numbers: `padding: '23px'`
4. ❌ Don't import theme directly: use `useTheme()` hook
5. ❌ Don't create new button components, use variants

---

## 📚 Documentation

- **Full Guide**: `THEME_REFACTOR_GUIDE.md`
- **Implementation**: `THEME_IMPLEMENTATION_GUIDE.md`
- **Colors**: `THEME_COLOR_REFERENCE.md`
- **Quick Start**: `THEME_QUICK_START.md`

---

**Print this card and keep it handy while coding!** 🎨✨
