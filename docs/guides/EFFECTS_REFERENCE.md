# Effects Quick Reference

**Version:** 1.0  
**Last Updated:** January 9, 2026  
**Purpose:** Quick lookup for all visual effect classes and patterns

> **Full documentation:** [DESIGN_PHILOSOPHY.md](../DESIGN_PHILOSOPHY.md)

---

## 🌟 GLOW CLASSES

### Quick Reference Table

| Color | Small | Medium | Large |
|-------|-------|--------|-------|
| **Primary** (blue) | `glow-primary-sm` | `glow-primary` | `glow-primary-lg` |
| **Success** (green) | `glow-success-sm` | `glow-success` | `glow-success-lg` |
| **Error** (red) | `glow-error-sm` | `glow-error` | `glow-error-lg` |
| **Secondary** (purple) | `glow-secondary-sm` | `glow-secondary` | `glow-secondary-lg` |

### Intensity Values

| Size | Blur | Opacity | When to Use |
|------|------|---------|-------------|
| `sm` | 30px | 0.3 | Subtle accent, cards at rest |
| (default) | 40px | 0.3-0.4 | Primary buttons, important cards |
| `lg` | 60px | 0.5-0.6 | Hover states, CTAs, emphasis |

### Usage Pattern

```tsx
// Button with glow on hover
<button className="glow-primary hover:glow-primary-lg tr-shadow">
  Click Me
</button>

// Success card
<div className="glow-success-sm">
  Transaction Complete
</div>
```

---

## ⏱️ TRANSITION UTILITIES

### Color Transitions
```tsx
tr-colors-micro    // 150ms - fast hover
tr-colors          // 300ms - standard
tr-colors-emphasis // 500ms - important
```

### Transform Transitions
```tsx
tr-transform-micro    // 150ms
tr-transform          // 300ms
tr-transform-emphasis // 500ms
```

### Opacity Transitions
```tsx
tr-opacity-micro    // 150ms
tr-opacity          // 300ms
tr-opacity-emphasis // 500ms
```

### All Properties (use sparingly)
```tsx
tr-all-micro    // 150ms
tr-all          // 300ms
tr-all-emphasis // 500ms
```

### Combined Patterns
```tsx
tr-interactive  // color + bg + border + shadow (buttons)
tr-card         // color + bg + border + transform (cards)
tr-shadow       // box-shadow only (glows)
```

### Quick Decision

| What Changes? | Use This |
|--------------|----------|
| Only colors | `tr-colors` |
| Only scale/position | `tr-transform` |
| Only opacity | `tr-opacity` |
| Button with glow | `tr-interactive` |
| Card hover | `tr-card` |
| Multiple things | `tr-all` (last resort) |

---

## 🔄 HOVER EFFECTS

### Scale (Only 2 Values)

| Class | Scale | Use For |
|-------|-------|---------|
| `hover:scale-[1.02]` | 102% | Cards, links, subtle |
| `hover:scale-105` | 105% | CTAs, icons, emphasis |

### Common Patterns

```tsx
// Subtle card hover
<div className="tr-card hover:scale-[1.02] hover:border-white/20">

// Emphasis button
<button className="tr-transform hover:scale-105">

// Link with color change
<a className="tr-colors hover:text-blue-400">
```

---

## 🎨 GLASS MORPHISM

### Base Class
```tsx
className="glass"
// Applies: bg-overlay, backdrop-blur, border
```

### With Hover
```tsx
className="glass glass-hover"
// Adds: lift effect, blue border glow on hover
```

### Manual Glass
```tsx
className="bg-white/5 backdrop-blur-xl border border-white/10"
```

---

## ⏰ TIMING REFERENCE

| Duration | Variable | Class Suffix | Use |
|----------|----------|--------------|-----|
| 150ms | `--transition-micro` | `-micro` | Instant feedback |
| 300ms | `--transition-standard` | (default) | Most interactions |
| 500ms | `--transition-emphasis` | `-emphasis` | Important changes |
| 1000ms | `--transition-slow` | N/A | Shimmer effects only |

---

## 📐 BORDER RADIUS

| Class | Pixels | Use |
|-------|--------|-----|
| `rounded-lg` | 8px | Buttons, inputs |
| `rounded-xl` | 12px | Cards, modals |
| `rounded-2xl` | 16px | Large containers |
| `rounded-full` | 9999px | Pills, avatars |

---

## ❌ DEPRECATED PATTERNS

**Don't use these anymore:**

```tsx
// ❌ Inline shadows - use glow classes
shadow-[0_0_40px_rgba(0,102,255,0.3)]

// ❌ Inline transitions - use tr-* utilities  
transition-colors duration-300
transition-all duration-500

// ❌ Non-standard scales
hover:scale-101
hover:scale-103  
hover:scale-110  // except in Games

// ❌ Non-standard durations
duration-75
duration-200
duration-700
```

---

## 🎯 COPY-PASTE SNIPPETS

### Primary Button
```tsx
className="bg-blue-600 hover:bg-blue-500 glow-primary hover:glow-primary-lg tr-interactive"
```

### Secondary Button
```tsx
className="bg-white/10 hover:bg-white/20 tr-colors"
```

### Card with Hover
```tsx
className="glass tr-card hover:scale-[1.02] hover:border-white/20"
```

### Nav Link
```tsx
className="tr-colors hover:text-white"
```

### Icon Button
```tsx
className="tr-transform hover:scale-105"
```

### Success State
```tsx
className="glow-success-sm border-green-500/30"
```

### Error State
```tsx
className="glow-error-sm border-red-500/30"
```

---

## 📚 RELATED DOCS

- [DESIGN_PHILOSOPHY.md](../DESIGN_PHILOSOPHY.md) - Full design system documentation
- [RESPONSIVE_GUIDE.md](./RESPONSIVE_GUIDE.md) - Mobile-first patterns
- [Design System](/admin/design-system) - Live component examples

---

*Last Updated: January 9, 2026*
