# Responsive Design Implementation Guide

**Version:** 2.0 (Consolidated)  
**Last Updated:** December 1, 2025  
**Purpose:** Complete guide to implementing Digiko's responsive design system

> **For design philosophy,** see [Design Philosophy](../DESIGN_PHILOSOPHY.md)  
> **For component details,** see [Design System](/designsystem)

---

## 🎯 OVERVIEW

Digiko uses a **mobile-first, three-tier scaling system** based on fintech industry standards (Revolut, Coinbase, Linear, Vercel).

**Key Achievement:** Mathematical precision in typography and spacing across all breakpoints.

---

## 📐 BREAKPOINT SYSTEM

### Three-Tier Strategy

```
Mobile:  320px - 767px   (xs, sm breakpoints)
Tablet:  768px - 1023px  (md breakpoint)
Desktop: 1024px+         (lg, xl, 2xl breakpoints)
```

**Philosophy:**
1. Design for mobile first, then enhance for larger screens
2. Typography scales proportionally across breakpoints
3. Spacing increases systematically with screen size
4. Content density adapts to available space
5. Touch targets remain accessible on all devices

---

## 📝 RESPONSIVE TYPOGRAPHY

### Typography Scale

All typography follows a **mathematical progression** across breakpoints:

| Element | Mobile (375px) | Tablet (768px) | Desktop (1024px+) | Tailwind Classes |
|---------|----------------|----------------|-------------------|------------------|
| **Display** | 40px | 56px | 72px | `text-mobile-5xl md:text-tablet-5xl lg:text-5xl` |
| **H1** | 32px | 44px | 48px | `text-mobile-4xl md:text-tablet-4xl lg:text-4xl` |
| **H2** | 28px | 36px | 36px | `text-mobile-3xl md:text-tablet-3xl lg:text-3xl` |
| **H3** | 24px | 28px | 30px | `text-mobile-2xl md:text-tablet-2xl lg:text-2xl` |
| **H4** | 20px | 22px | 24px | `text-mobile-xl md:text-tablet-xl lg:text-xl` |
| **Body XL** | 16px | 17px | 20px | `text-mobile-lg md:text-tablet-lg lg:text-lg` |
| **Body Base** | 14px | 15px | 16px | `text-mobile-base md:text-tablet-base lg:text-base` |
| **Body Small** | 12px | 13px | 14px | `text-mobile-sm md:text-tablet-sm lg:text-sm` |
| **Caption** | 10px | 11px | 12px | `text-mobile-xs md:text-tablet-xs lg:text-xs` |

### Custom Typography Classes

Use custom responsive classes for automatic scaling:

```tsx
// Automatic responsive scaling
<h1 className="text-responsive-h1">Page Title</h1>
<h2 className="text-responsive-h2">Section Header</h2>
<p className="text-responsive-xl">Large body text</p>
<p className="text-responsive-base">Standard text</p>

// Manual control when needed
<h1 className="text-mobile-4xl md:text-tablet-4xl lg:text-4xl">
  Custom scaling
</h1>
```

### Typography Rules

**DO:**
- ✅ Use responsive classes for all headings
- ✅ Scale systematically (mobile → tablet → desktop)
- ✅ Use `font-mono` for numbers with `tabular-nums`
- ✅ Keep line-height consistent (1.2 for headings, 1.5 for body)

**DON'T:**
- ❌ Use same size across all breakpoints
- ❌ Jump sizes arbitrarily
- ❌ Use `font-bold` (700 weight) - too heavy
- ❌ Mix responsive and non-responsive classes

---

## 📏 RESPONSIVE SPACING

### Spacing Scale

Spacing follows **generous vertical spacing** system established Nov 30, 2025:

| Use Case | Mobile | Tablet/Desktop | Tailwind Classes | Notes |
|----------|--------|----------------|------------------|-------|
| **Page Padding (X)** | 16px | 24px / 32px | `px-4 md:px-6 lg:px-8` | Horizontal container |
| **Page Padding (Y)** | 32px | 40px / 48px | `py-8 md:py-10 lg:py-12` | Vertical container |
| **Section Spacing** | 48px | 48px / 56px | `mb-12 md:mb-12 lg:mb-14` | Major sections |
| **Section Titles** | 20px | 20px | `mb-5 md:mb-5` | Consistent |
| **Large Cards** | 40px | 40px | `p-10 md:p-10` | Glass cards |
| **Feature Grid** | 24px | 32px | `gap-6 md:gap-8` | 2-col cards |
| **Element Spacing** | 40px | varies | `mb-10` | Icons, images |
| **Text Spacing** | 32px | 32px | `mb-8 md:mb-8` | Paragraphs |
| **Small Spacing** | 20px | 20px | `mb-5 md:mb-5` | Labels, small |

### Spacing Philosophy

**Mobile:**
- Generous spacing creates premium feel
- Adequate touch targets (44px minimum)
- Breathing room prevents cramped UI
- Section spacing: 48px minimum

**Desktop:**
- Even more generous spacing
- Utilize extra space for comfort
- Maintain premium aesthetic
- Section spacing: 56px+

---

## 🎨 RESPONSIVE PATTERNS

### Pattern 1: Page Title

```tsx
<div className="mb-12 md:mb-12 lg:mb-14">
  <h1 className="text-mobile-5xl md:text-tablet-5xl lg:text-5xl font-semibold text-white mb-5">
    Page Title
  </h1>
  <p className="text-mobile-base md:text-tablet-base lg:text-base text-gray-400">
    Page description
  </p>
</div>
```

### Pattern 2: Section Header

```tsx
<div className="mb-8 md:mb-8">
  <h2 className="text-mobile-3xl md:text-tablet-3xl lg:text-3xl font-semibold text-white mb-3">
    Section Title
  </h2>
  <p className="text-mobile-sm md:text-tablet-sm lg:text-sm text-gray-400">
    Section description
  </p>
</div>
```

### Pattern 3: Stat Card

```tsx
<div className="glass p-10 rounded-3xl">
  <div className="text-mobile-sm md:text-tablet-sm lg:text-sm text-gray-400 mb-2">
    Label
  </div>
  <div className="text-mobile-4xl md:text-tablet-4xl lg:text-4xl font-mono font-semibold text-white">
    $1,234.56
  </div>
  <div className="text-mobile-xs md:text-tablet-xs lg:text-xs text-gray-500 mt-1">
    ≈ 1,234 DGKO
  </div>
</div>
```

### Pattern 4: Two-Column Grid

```tsx
<div className="grid md:grid-cols-2 gap-6 md:gap-8">
  <div className="glass p-6 rounded-2xl">
    Card 1
  </div>
  <div className="glass p-6 rounded-2xl">
    Card 2
  </div>
</div>
```

### Pattern 5: Button Group

```tsx
<div className="flex flex-col md:flex-row gap-3 md:gap-4">
  <button className="w-full md:w-auto px-6 py-4 bg-digiko-primary rounded-2xl">
    Primary
  </button>
  <button className="w-full md:w-auto px-6 py-4 bg-white/5 rounded-2xl">
    Secondary
  </button>
</div>
```

---

## 🔄 MIGRATION GUIDE

### Step-by-Step Process

**1. Audit Current Code**
```bash
# Find all headings
grep -r "className.*text-[0-9]xl" src/

# Find all padding/margin
grep -r "className.*p-[0-9]" src/

# Find all grids
grep -r "className.*grid" src/
```

**2. Replace Typography**
```tsx
// BEFORE
<h1 className="text-4xl">Title</h1>

// AFTER
<h1 className="text-mobile-4xl md:text-tablet-4xl lg:text-4xl">Title</h1>
```

**3. Replace Spacing**
```tsx
// BEFORE
<div className="mb-6">Section</div>

// AFTER
<div className="mb-12 md:mb-12 lg:mb-14">Section</div>
```

**4. Replace Grids**
```tsx
// BEFORE
<div className="grid grid-cols-2 gap-4">

// AFTER
<div className="grid md:grid-cols-2 gap-6 md:gap-8">
```

**5. Test on Real Devices**
- Mobile: 375px, 414px
- Tablet: 768px, 834px
- Desktop: 1440px, 1920px

---

## ✅ TESTING CHECKLIST

### Visual Testing

**Mobile (320px - 767px):**
- [ ] All text is readable (minimum 14px)
- [ ] Touch targets minimum 44x44px
- [ ] No horizontal scrolling
- [ ] Images scale appropriately
- [ ] Buttons stack vertically
- [ ] Generous spacing (48px sections)
- [ ] Cards use full width

**Tablet (768px - 1023px):**
- [ ] Typography scales up appropriately
- [ ] Two-column grids work properly
- [ ] Spacing increases from mobile
- [ ] Navigation adapts correctly
- [ ] Images display properly

**Desktop (1024px+):**
- [ ] Maximum scaling reached
- [ ] Multi-column layouts work
- [ ] Hover states function
- [ ] Content doesn't stretch too wide
- [ ] Premium spacing maintained

### Device Testing

**Physical Devices:**
- [ ] iPhone SE (375px)
- [ ] iPhone 12/13/14 (390px)
- [ ] iPhone 12/13/14 Pro Max (428px)
- [ ] iPad (768px)
- [ ] iPad Pro (1024px)
- [ ] Desktop (1440px)

**Browsers:**
- [ ] Chrome
- [ ] Safari (iOS + macOS)
- [ ] Firefox
- [ ] Edge

---

## 🎯 COMMON PATTERNS

### Navigation

```tsx
{/* Mobile: Hamburger menu */}
<nav className="md:hidden">
  <button className="p-2">☰</button>
</nav>

{/* Desktop: Full menu */}
<nav className="hidden md:flex gap-6">
  <a href="/dashboard">Dashboard</a>
  <a href="/staking">Staking</a>
  <a href="/swap">Swap</a>
</nav>
```

### Hero Section

```tsx
<section className="py-12 md:py-16 lg:py-20 text-center md:text-left">
  <h1 className="text-mobile-5xl md:text-tablet-5xl lg:text-5xl font-semibold mb-5">
    Hero Title
  </h1>
  <p className="text-mobile-lg md:text-tablet-lg lg:text-lg text-gray-400 mb-8">
    Hero description that scales beautifully
  </p>
  <button className="w-full md:w-auto px-8 py-4 bg-digiko-primary rounded-2xl">
    Get Started
  </button>
</section>
```

### Feature Cards

```tsx
<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
  {features.map(feature => (
    <div key={feature.id} className="glass p-6 md:p-8 rounded-2xl">
      <div className="mb-4">
        <IconBox icon={feature.icon} variant="blue" size="lg" />
      </div>
      <h3 className="text-mobile-xl md:text-tablet-xl lg:text-xl font-semibold mb-2">
        {feature.title}
      </h3>
      <p className="text-mobile-sm md:text-tablet-sm lg:text-sm text-gray-400">
        {feature.description}
      </p>
    </div>
  ))}
</div>
```

---

## 🚫 COMMON MISTAKES

### Mistake 1: Forgetting Mobile

❌ **Wrong:**
```tsx
<h1 className="text-4xl">Title</h1>
```

✅ **Correct:**
```tsx
<h1 className="text-mobile-4xl md:text-tablet-4xl lg:text-4xl">Title</h1>
```

### Mistake 2: Same Spacing Everywhere

❌ **Wrong:**
```tsx
<div className="mb-6">Section</div>
```

✅ **Correct:**
```tsx
<div className="mb-12 md:mb-12 lg:mb-14">Section</div>
```

### Mistake 3: Fixed Width on Mobile

❌ **Wrong:**
```tsx
<button className="w-64">Button</button>
```

✅ **Correct:**
```tsx
<button className="w-full md:w-auto">Button</button>
```

### Mistake 4: Desktop-First Grid

❌ **Wrong:**
```tsx
<div className="grid-cols-3 md:grid-cols-1">
```

✅ **Correct:**
```tsx
<div className="grid md:grid-cols-2 lg:grid-cols-3">
```

---

## 📱 MOBILE-SPECIFIC GUIDELINES

### Touch Targets

**Minimum Size:**
- Buttons: 44x44px minimum
- Links: 44px height with padding
- Icons: 24px minimum (with 44px touch area)

**Implementation:**
```tsx
// Button with proper touch target
<button className="px-6 py-4 min-h-[44px]">
  Button
</button>

// Icon with touch area
<button className="p-3 min-w-[44px] min-h-[44px]">
  <Icon className="w-6 h-6" />
</button>
```

### Content Priority

**Mobile users need:**
1. Critical information first
2. Clear calls to action
3. Minimal decoration
4. Fast loading
5. Easy navigation

**Hide on Mobile When:**
- Not essential to task
- Decoration only
- Can be accessed elsewhere
- Takes up too much space

```tsx
{/* Hide decorative element on mobile */}
<div className="hidden md:block">
  <DecorativeElement />
</div>
```

---

## 💻 DESKTOP-SPECIFIC GUIDELINES

### Multi-Column Layouts

```tsx
{/* 3-column on desktop, 2 on tablet, 1 on mobile */}
<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
  {items.map(item => <Card key={item.id} {...item} />)}
</div>
```

### Sidebar Layouts

```tsx
<div className="flex flex-col lg:flex-row gap-8">
  {/* Main content */}
  <main className="flex-1">
    <Content />
  </main>
  
  {/* Sidebar (stacks on mobile) */}
  <aside className="lg:w-80">
    <Sidebar />
  </aside>
</div>
```

### Hover States

```tsx
{/* Only show hover effects on devices that support it */}
<button className="bg-digiko-primary hover:bg-digiko-secondary md:hover:scale-105">
  Button
</button>
```

---

## 🔧 TAILWIND CONFIG

### Custom Breakpoints

Located in `tailwind.config.js`:

```js
theme: {
  screens: {
    'xs': '375px',
    'sm': '640px',
    'md': '768px',
    'lg': '1024px',
    'xl': '1280px',
    '2xl': '1536px',
  }
}
```

### Custom Typography

```js
theme: {
  extend: {
    fontSize: {
      // Mobile sizes
      'mobile-xs': ['10px', '16px'],
      'mobile-sm': ['12px', '18px'],
      'mobile-base': ['14px', '21px'],
      'mobile-lg': ['16px', '24px'],
      'mobile-xl': ['20px', '28px'],
      'mobile-2xl': ['24px', '32px'],
      'mobile-3xl': ['28px', '36px'],
      'mobile-4xl': ['32px', '40px'],
      'mobile-5xl': ['40px', '48px'],
      
      // Tablet sizes
      'tablet-xs': ['11px', '17px'],
      'tablet-sm': ['13px', '19px'],
      'tablet-base': ['15px', '23px'],
      // ... (continue pattern)
    }
  }
}
```

---

## 📊 BEFORE/AFTER EXAMPLES

### Example 1: Page Title

**Before (Non-Responsive):**
```tsx
<h1 className="text-5xl font-bold mb-4">
  Dashboard
</h1>
```
- Mobile: 60px (too large)
- Tablet: 60px (too large)
- Desktop: 60px (correct)

**After (Responsive):**
```tsx
<h1 className="text-mobile-4xl md:text-tablet-4xl lg:text-4xl font-semibold mb-5 md:mb-5">
  Dashboard
</h1>
```
- Mobile: 32px (perfect)
- Tablet: 44px (perfect)
- Desktop: 48px (perfect)

### Example 2: Feature Grid

**Before (Non-Responsive):**
```tsx
<div className="grid grid-cols-3 gap-4">
  {features.map(...)}
</div>
```
- Mobile: Cramped, unreadable
- Tablet: OK
- Desktop: Good

**After (Responsive):**
```tsx
<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
  {features.map(...)}
</div>
```
- Mobile: Single column, generous spacing
- Tablet: Two columns
- Desktop: Three columns

---

## 🎓 LEARNING RESOURCES

### Internal Resources
- [Design Philosophy](../DESIGN_PHILOSOPHY.md) - Why we design this way
- [Design System](/designsystem) - Live component examples
- [Developer Docs](../dev/README.md) - Technical setup

### External References
- [Tailwind Responsive Design](https://tailwindcss.com/docs/responsive-design)
- [MDN: Responsive Design](https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout/Responsive_Design)
- [A Complete Guide to Flexbox](https://css-tricks.com/snippets/css/a-guide-to-flexbox/)

---

## 📝 CHANGELOG

**Version 2.0** (December 1, 2025)
- Consolidated from 5 separate documents
- Removed redundancy
- Added decision frameworks
- Updated examples to match current system

**Version 1.0** (November 28, 2025)
- Initial responsive system
- Three-tier scaling established
- Typography and spacing standardized

---

**Last Updated:** December 1, 2025  
**Maintained by:** Digiko Team  
**Questions?** Check [docs/README.md](../README.md) for help
