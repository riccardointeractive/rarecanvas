# Digiko Design Philosophy

**Version:** 3.1  
**Last Updated:** January 16, 2026  
**Purpose:** Design principles, scalability architecture, and decision-making frameworks

> **For component implementation details,** see [Design System](/designsystem)  
> **For responsive implementation,** see [Responsive Guide](guides/RESPONSIVE_GUIDE.md)

---

## 🚨 CORE PRINCIPLE: SCALABILITY FIRST

**The #1 rule of Digiko design: Everything must be changeable in ONE place.**

If changing the brand color requires editing 50 files, the design system has failed. Every color, spacing, shadow, and effect must flow from a single source of truth.

### The Two Sources of Truth

| Source | Purpose | Location |
|--------|---------|----------|
| **CSS Variables** | Tailwind classes, CSS animations | `src/app/globals.css` |
| **JS Tokens** | Charts, canvas, dynamic styles | `src/config/design-tokens.ts` |

**These two files MUST stay in sync.** When you change a value in one, change it in the other.

### What This Means in Practice

```
Want to change brand color from blue to purple?

1. globals.css: --color-brand-primary: #7928CA;
2. design-tokens.ts: brand.primary: '#7928CA'
3. Done. Entire app updates.
```

### The Golden Rule

> **If you can't change it in 2 clicks, it's hardcoded. Hardcoded = Technical Debt.**

---

## 🚫 ABSOLUTE PROHIBITIONS

These are **non-negotiable**. Code review must reject any PR containing:

### 1. Hardcoded Colors

```tsx
// ❌ FORBIDDEN - Will be rejected
className="text-blue-500"
className="bg-emerald-400"
className="border-gray-700"
style={{ color: '#0070F3' }}
style={{ backgroundColor: 'rgb(0, 112, 243)' }}

// ✅ REQUIRED - Use semantic tokens
className="text-brand-primary"
className="bg-success"
className="border-border-default"
```

### 2. Arbitrary Values

```tsx
// ❌ FORBIDDEN - Magic numbers
className="max-w-[1200px]"
className="min-h-[85vh]"
className="text-[14px]"
className="p-[22px]"

// ✅ REQUIRED - Use tokens or add to config
className="max-w-container"    // defined in tailwind.config.js
className="min-h-hero"         // defined in tailwind.config.js
className="text-sm"            // standard Tailwind
className="p-5"                // standard Tailwind
```

### 3. Inline Styles with Colors

```tsx
// ❌ FORBIDDEN
style={{ boxShadow: '0 0 60px rgba(0, 112, 243, 0.4)' }}
style={{ background: 'linear-gradient(to-r, #0070F3, #7928CA)' }}

// ✅ REQUIRED - Use CSS variables
style={{ boxShadow: `0 0 60px var(--color-glow-primary)` }}
// Or better: use a Tailwind class
className="shadow-glow-primary"
```

### 4. Deprecated Token Names

```tsx
// ❌ FORBIDDEN - Old naming
className="text-digiko-primary"
className="bg-klever-blue"
className="glow-primary-lg"
className="glass-hover"

// ✅ REQUIRED - New semantic tokens
className="text-brand-primary"
className="bg-brand-primary"
className="shadow-lg"
className="hover:bg-bg-elevated"
```

---

## 🎨 DESIGN SYSTEM ARCHITECTURE

### CSS Variables (globals.css)

```css
:root {
  /* Backgrounds - Vercel-inspired with clear elevation steps */
  --color-bg-base: #000000;
  --color-bg-surface: #0a0a0a;
  --color-bg-elevated: #141414;
  --color-bg-hover: #1a1a1a;
  
  /* Text - improved contrast */
  --color-text-primary: #ededed;
  --color-text-secondary: #a1a1a1;
  --color-text-muted: #737373;
  
  /* Brand */
  --color-brand-primary: #0070F3;
  --color-brand-primary-hover: #005FCC;
  
  /* Semantic */
  --color-success: #00C853;
  --color-error: #FF3B30;
  --color-warning: #F5A623;
  
  /* Borders - subtle but visible */
  --color-border-default: rgba(255, 255, 255, 0.08);
  --color-border-hover: rgba(255, 255, 255, 0.12);
  
  /* Layout */
  --container-max-width: 1200px;
  --hero-min-height: 85vh;
}
```

### Tailwind Config (tailwind.config.js)

```js
colors: {
  'bg-base': 'var(--color-bg-base)',
  'bg-surface': 'var(--color-bg-surface)',
  'text-primary': 'var(--color-text-primary)',
  'brand-primary': 'var(--color-brand-primary)',
  'success': 'var(--color-success)',
  // ... all semantic tokens
}
```

### JS Tokens (design-tokens.ts)

```ts
// For charts, canvas, and dynamic JS styles
export const colors = {
  brand: {
    primary: '#0070F3',
    primaryHover: '#005FCC',
  },
  glow: {
    primary: 'rgba(0, 112, 243, 0.4)',
    primaryStrong: 'rgba(0, 112, 243, 0.6)',
  },
  chart: {
    blue: '#0070F3',
    purple: '#7928CA',
    green: '#00C853',
    // ... for Recharts, Chart.js, etc.
  }
}
```

---

## 📋 MIGRATION STATUS (v3.1)

Track which pages have been migrated to Vercel style:

### Core Platform Pages

| Page | Status | Notes |
|------|--------|-------|
| Homepage (`/`) | ✅ **DONE** | Reference implementation |
| Dashboard (`/dashboard`) | ✅ **DONE** | 20+ components migrated |
| Staking (`/staking`) | ✅ **DONE** | Cards, stats grid, how-it-works |
| Swap (`/swap`) | ✅ **DONE** | Layout, spacing, loading states |
| Pool (`/pool`) | ✅ **DONE** | Layout, card styling |
| History (`/history`) | ✅ **DONE** | Consistent with swap/pool |
| DGKO Token (`/dgko`) | ⏳ Pending | |
| BABYDGKO Token (`/babydgko`) | ⏳ Pending | |
| Token Pages (`/token/*`) | ✅ **DONE** | GenericTokenPage migrated |
| Social Media (`/social-media`) | ⏳ Pending | |

### Core DeFi Components

| Component | Status | Notes |
|-----------|--------|-------|
| StakeCard | ✅ **DONE** | Flat card, consistent padding |
| RewardsCard | ✅ **DONE** | No gradients, success variant |
| UnstakingCard | ✅ **DONE** | Flat styling, overlay backgrounds |
| StakingStatsGrid | ✅ **DONE** | StatCard variant, 2x4 grid |
| HowItWorksSection (staking) | ✅ **DONE** | w-6 h-6 icons, flat container |
| HowItWorksSection (swap) | ✅ **DONE** | w-6 h-6 icons |
| SwapPoolTabs | ✅ **DONE** | Already compliant |

### Shared Components

| Component | Status | Notes |
|-----------|--------|-------|
| FeatureLinkCard | ✅ **DONE** | |
| TokenShowcaseCard | ✅ **DONE** | |
| RoadmapItem | ✅ **DONE** | |
| InfoCard | ✅ **DONE** | |
| CTASection | ✅ **DONE** | |
| Badge | ✅ **DONE** | |
| AmountInput | ✅ **DONE** | |
| TransactionModal | ✅ **DONE** | |
| BottomSheet | ✅ **DONE** | |
| PriceChart | ✅ **DONE** | Uses design-tokens for chart colors |
| QuickActions | ✅ **DONE** | Flat icon backgrounds |
| PortfolioOverview | ✅ **DONE** | Semantic success/error colors |

### Shared Configuration

New file: `src/config/defi-pages.ts`
- Layout tokens (padding, spacing, max-width)
- Grid configurations
- Card styling tokens
- Loading state patterns
- Typography tokens
- Icon sizing standards

### Migration Checklist for Each Page

When migrating a page to Vercel style:

1. ☐ Remove ALL hardcoded colors (`blue-500`, `green-400`, etc.)
2. ☐ Replace with semantic tokens (`text-brand-primary`, `bg-success`, etc.)
3. ☐ Remove arbitrary values (`[1200px]`, `[85vh]`) - use `max-w-dashboard` etc.
4. ☐ Replace `glass` with `bg-bg-surface border border-border-default`
5. ☐ Remove gradients (`bg-gradient-to-*`)
6. ☐ Remove glow effects (`glow-*`, `shadow-[0_0_*]`)
7. ☐ Replace Lucide icons with consistent size (`w-6 h-6`, `strokeWidth={1.5}`)
8. ☐ Verify all hover states use `hover:bg-bg-elevated`
9. ☐ Standardize spacing: `gap-6 md:gap-8` for grids
10. ☐ Run audit: `grep -n "digiko-\|emerald-\|green-[0-9]" <file>`

---

## 🎯 DESIGN TERRITORIES

Digiko uses **different visual languages for different contexts**. Understanding when to use each aesthetic is critical for creating appropriate user experiences.

### Core Platform (Vercel Style) ✅ UPDATED v3.1

**Applies to:** Homepage, Dashboard, Staking, Swap, Token Pages, Documentation

**Visual Language:**
- **Color:** Monochrome with blue accent (`--color-brand-primary`)
- **Style:** Flat, minimal, Vercel-inspired
- **Typography:** Geist, tight tracking, systematic scaling
- **Effects:** NONE - no gradients, no glow, no glass morphism
- **Borders:** Subtle but visible (`rgba(255,255,255,0.08)`)
- **Hover:** Background color change only (`bg-bg-elevated`)
- **Animations:** `duration-150` - fast, professional

**Key Characteristics:**
```
✅ Flat backgrounds (bg-bg-surface, bg-bg-elevated)
✅ Visible borders (border-border-default)
✅ Simple hover states (hover:bg-bg-elevated)
✅ Blue for interactive elements ONLY
✅ Compact cards (p-5, p-6 max)
✅ Lucide icons (w-6 h-6, strokeWidth 1.5)

❌ NO gradients
❌ NO glow effects
❌ NO glass morphism (backdrop-blur)
❌ NO shadows except shadow-sm/shadow-lg
❌ NO responsive icon sizes (w-6 h-6 only)
```

**Reference Implementation:** `src/app/page.tsx` (Homepage - fully compliant)

**Psychology:** Users entrust their assets to Digiko. A clean, professional interface signals security and competence. Flat design = trustworthy. Flashy effects = suspicious.

---

### Games Section (Vegas Playful)

**Applies to:** `/games`, `/games/roulette`, future gaming features

**Visual Language:**
- **Color:** Gold, red, multi-color (`#FFD700`, `#FF6B6B`)
- **Style:** Vegas-inspired, playful, energetic
- **Typography:** Bold, wide tracking, dramatic scaling
- **Effects:** Heavy glow, shadows, particle effects
- **Animations:** Elaborate, celebratory, eye-catching
- **Mood:** Exciting, fun, rewarding

**Purpose:** Entertainment, engagement, and celebration. Games should feel thrilling and victories should be memorable.

**Psychology:** Users play for fun and excitement. Dramatic effects amplify the emotional payoff of winning.

---

### NFT Marketplace (Future)

**Visual Language:** TBD - Likely art-focused, gallery aesthetic with emphasis on visual presentation

---

### When to Use Each Territory

| Context | Territory | Why |
|---------|-----------|-----|
| Managing money | **Fintech Minimal** | Users need to trust you with their assets |
| Trading/swapping | **Fintech Minimal** | Serious financial decisions require clean UI |
| Viewing portfolio | **Fintech Minimal** | Data clarity is paramount |
| Reading documentation | **Fintech Minimal** | Information should be scannable |
| Playing games | **Vegas Playful** | Entertainment should feel fun and exciting |
| Winning prizes | **Vegas Playful** | Celebrations should be dramatic |
| Browsing NFTs | **NFT Gallery** | Art should be the focus |

---

### Design Territory Rules

**DO:**
- ✅ Use semantic color tokens EVERYWHERE
- ✅ Maintain consistent territory within a section
- ✅ Use dramatic transitions between territories (clear boundaries)
- ✅ Apply territory aesthetics to ALL elements in that section
- ✅ Document when creating new territories
- ✅ Consider user psychology (trust vs. excitement)

**DON'T:**
- ❌ Hardcode ANY color value (ever)
- ❌ Mix territories within the same page (confusing)
- ❌ Use Vegas style for financial transactions (kills trust)
- ❌ Use fintech minimal for celebrations (kills excitement)
- ❌ Create new territories without documentation
- ❌ Use gradients/glow in Core Platform territory

---

### Shared Elements Across Territories

Some elements remain consistent everywhere:

**Always Consistent:**
- Logo and branding (Digiko blue = `--color-brand-primary`)
- Navigation structure (layout, hierarchy)
- Semantic color tokens (NEVER hardcode)
- Mobile-first responsive approach
- Accessibility standards
- Font family (Geist, Geist Mono)
- Lucide icons (w-6 h-6, strokeWidth 1.5)

**Can Vary by Territory:**
- Animation intensity (subtle vs. dramatic)
- Shadow depth (none vs. heavy)
- Typography weight (medium vs. black)
- Celebration style (simple vs. elaborate)
- Color accents (blue vs. gold) - BUT always via tokens!

---

### Transitioning Between Territories

When users move from one territory to another, transitions should be:

- **Clear:** Users know they entered a different experience
- **Branded:** Still feels like Digiko
- **Intentional:** Not accidental or chaotic

**Example Pattern:**
```
Fintech Page → Transition Element → Vegas Page
    ↓               ↓                    ↓
Clean blue    Introduces gold      Full celebration
                 accent
```

---

### Why This Matters

**For Users:**
- Visual cues signal different modes (serious vs. playful)
- Appropriate aesthetics for context (trust where needed)
- Memorable experiences in the right moments

**For Developers:**
- Clear guidance on when to deviate from core style
- Freedom to be creative within boundaries
- Consistency within territories

**For Brand:**
- Professional for finance (builds trust)
- Exciting for entertainment (drives engagement)
- Cohesive overall (recognizable as Digiko)

---

## 💡 CORE DESIGN PRINCIPLES

### 1. Mobile-First Always

**Why:** 60% of users access Digiko on mobile devices

**Philosophy:**
- Design and build for mobile first
- Enhance for larger screens
- Never assume desktop is primary
- Touch targets over mouse precision
- Performance over decoration

**Impact:**
- Faster load times on mobile
- Better user experience for majority
- Simpler, cleaner interfaces
- Forces prioritization of features

---

### 2. Flat Design for Trust (NEW v3.0)

**Why:** Glass morphism and gradients look "crypto" - Digiko aims for fintech credibility

**Philosophy:**
- Flat backgrounds signal professionalism
- Subtle borders instead of shadows
- Color hierarchy through opacity, not effects
- Inspired by Linear, Vercel, Stripe
- Trust through simplicity

**Implementation:**
```tsx
// ✅ Linear style
className="bg-bg-surface border border-border-default"
className="hover:bg-bg-elevated"

// ❌ Deprecated (Games territory only)
className="glass backdrop-blur-xl"
className="bg-gradient-to-br from-..."
```

**Note:** Glass morphism is still allowed in **Games territory** where flashy effects enhance the experience.

---

### 3. Apple-Inspired Minimalism

**Why:** Digiko is a fintech platform, not a circus

**Philosophy:**
- Subtract until nothing remains to remove
- Every element must earn its place
- Whitespace is a design element
- Clarity over cleverness
- Function before form

**Questions to ask:**
- "Is this necessary?"
- "Can I remove this without losing meaning?"
- "Does this help or distract the user?"

---

### 4. Progressive Enhancement

**Why:** Build baseline experience first, add flourishes for capable devices

**Philosophy:**
- Core functionality works everywhere
- Visual effects enhance, not enable
- Animations are optional
- Performance is mandatory

**Example:**
- Button works without animations
- Animations make it feel premium
- Slow devices still get full functionality

---

### 5. Progressive Disclosure (NEW v1.20.0)

**Why:** Users should explore and understand before committing

**Philosophy:**
- Never block entire pages with "Connect Wallet" overlays
- Show the full interface with contextual empty states
- Action buttons adapt to connection state
- Let users see what they'll get before they connect

**Implementation:**
```
DON'T: Full-page blocker when wallet not connected
DO: Show page content with:
  1. Empty states in data cards ("Connect wallet to view...")
  2. Action buttons become "Connect Wallet" buttons
  3. User can see the interface before connecting
```

**Example - Pool Page:**
- All 4 cards always visible (Position, Fees, Add, Remove)
- Empty states show contextual messages
- "Add Liquidity" button → "Connect Wallet" button when not connected
- Users understand the feature before connecting

**Benefits:**
- Reduced friction for new users
- Users understand features before committing
- Consistent with modern DeFi UX patterns
- Better conversion from visitors to connected users

---

### 6. Consistency is King

**Why:** Predictability builds trust and reduces cognitive load

**Philosophy:**
- If it looks the same, it should act the same
- Reuse patterns, don't reinvent
- Document deviations
- Update all instances when patterns change

**Rule:** "Was that necessary?" If yes, document in Design System. If no, use existing pattern.

---

## 📱 MOBILE-FIRST PHILOSOPHY

### Mobile Design Commandments

**1. Content First**
- Mobile users want information, not decoration
- Maximize content density while maintaining readability
- Every pixel should serve a purpose
- Remove decoration that doesn't inform

**2. Touch-Friendly**
- All interactive elements minimum 44x44px
- Adequate spacing between touch targets
- Clear visual feedback on interaction
- Consider thumb reach zones

**3. Hierarchy Through Scale**
- Use size, not color, for hierarchy
- Numbers bigger than labels
- Headings scale proportionally
- Visual weight indicates importance

**4. Functional Color**
- Blue = interactive/actionable
- White/gray = informational
- Color guides action, not decoration
- Meaning over aesthetics

**5. Centered When Narrow**
- Center-align content on mobile
- Left-align on desktop
- Icons follow text alignment
- Balance visual weight on small screens

**6. Flexible Containers**
- Use flex-wrap for unpredictable content
- Allow line breaks for long text
- Never force single-line on mobile
- Content should breathe

**7. Focus on Performance**
- Minimize animations on mobile
- Optimize images for small screens
- Fast interactions trump fancy effects
- Latency kills trust

---

### Responsive Strategy

**Philosophy:** Three-tier scaling system (Mobile → Tablet → Desktop)

**Breakpoints:**
```
Mobile:  320px - 767px  (xs, sm)
Tablet:  768px - 1023px (md)
Desktop: 1024px+        (lg, xl, 2xl)
```

**Key Principles:**
1. Design for mobile first, then enhance for larger screens
2. Typography scales proportionally across breakpoints
3. Spacing increases systematically with screen size
4. Content density adapts to available space
5. Touch targets remain accessible on all devices

**For implementation details:** See [Responsive Guide](guides/RESPONSIVE_GUIDE.md)

---

## 📏 SPACING SCALE GUIDE

### When to Use Each Gap Size

Consistent spacing creates visual rhythm and hierarchy. Use this guide to choose the right gap size:

| Gap | Size | Use Case |
|-----|------|----------|
| `gap-1` | 4px | Tight inline elements (icon + text, badge content) |
| `gap-2` | 8px | Related items in a row (tags, pills, small buttons) |
| `gap-3` | 12px | Form elements, compact lists, button groups |
| `gap-4` | 16px | **Default** - Cards in grid, list items, form fields |
| `gap-6` | 24px | Section content, larger cards, feature grids |
| `gap-8` | 32px | Major sections, page-level spacing |
| `gap-10` | 40px | Hero sections, dramatic visual separation |

### Spacing Philosophy

**1. Vertical Rhythm**
```
Page padding:     p-4 (mobile) → p-6 (tablet) → p-8 (desktop)
Section spacing:  gap-8 (between major sections)
Card spacing:     gap-4 (mobile) → gap-6 (desktop)
List items:       gap-3 or gap-4
```

**2. Component Internal Spacing**
```
Card padding:     p-4 (mobile) → p-5 (tablet) → p-6 (desktop)
Button padding:   px-4 py-2 (default) → px-6 py-3 (large)
Input padding:    px-3 py-2 (compact) → px-4 py-3 (default)
```

**3. Relationship Rule**
- Closer elements = more related
- Further elements = less related
- Use spacing to group related content visually

### Spacing Decision Tree

```
Are elements tightly coupled (icon + label)?
  → gap-1 to gap-2

Are elements in the same group (buttons, tags)?
  → gap-2 to gap-3

Are elements list items or form fields?
  → gap-3 to gap-4

Are elements cards or sections?
  → gap-4 to gap-6

Are elements major page sections?
  → gap-6 to gap-8
```

### Responsive Spacing Pattern

Always scale spacing with screen size:
```tsx
// ✅ Correct - responsive spacing
className="gap-4 md:gap-5 lg:gap-6"
className="p-4 md:p-6 lg:p-8"

// ❌ Incorrect - fixed spacing
className="gap-6"  // Too loose on mobile
className="p-8"    // Wastes space on mobile
```

### Common Spacing Patterns

**Grid of Cards:**
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
```

**Form Fields:**
```tsx
<div className="space-y-4">
  <Input />
  <Input />
  <Button />
</div>
```

**Page Sections:**
```tsx
<main className="space-y-8 md:space-y-12">
  <HeroSection />
  <FeaturesSection />
  <CTASection />
</main>
```

**Button Group:**
```tsx
<div className="flex gap-3">
  <Button>Primary</Button>
  <Button variant="ghost">Secondary</Button>
</div>
```

---

## 🚫 ANTI-PATTERNS (Never Do This)

### Typography
- ❌ **NO** `font-bold` (700 weight) - too heavy for our minimal aesthetic
- ❌ **NO** flashing text animations - accessibility nightmare
- ❌ **NO** color cycling text - distracting and unprofessional
- ❌ **NO** animated letter-spacing - makes text unreadable
- ❌ **NO** pulsing text opacity - draws attention incorrectly

### Colors
- ❌ **NO** primary blue on non-clickable elements - blue = interactive ONLY
- ❌ **NO** blue hover on elements that weren't already blue
- ❌ **NO** blue text for active nav/sidebar items - use white + bg-white/10
- ❌ **NO** purple on blue buttons - clashes with brand
- ❌ **NO** green accents (except success states) - not part of palette
- ❌ **NO** orange/amber (except warning states) - not part of palette
- ❌ **NO** mixing purple with cyan randomly - lacks intention
- ❌ **NO** using Vegas colors in fintech sections - breaks trust

### Primary Blue Rule (CRITICAL)

**"If it's blue, it better do something when I click it."**

Primary blue (`digiko-primary`, `#0066FF`) is **sacred** - reserved exclusively for interactive elements.

| Element | Correct | Wrong |
|---------|---------|-------|
| CTA Button | `bg-digiko-primary` | ✅ |
| Text Link | `text-digiko-primary` | ✅ |
| Info Text | `text-digiko-primary` | ❌ Use `text-white` |
| Icon Background | `bg-digiko-primary/20` | ❌ Use `bg-white/10` |
| Active Nav Item | `text-digiko-primary` | ❌ Use `text-white bg-white/10` |
| Non-clickable Badge | `bg-digiko-primary` | ❌ Use `bg-white/10` |

**Hover States:**
```tsx
// ✅ Blue element → darker blue hover
className="bg-digiko-primary hover:bg-digiko-secondary"

// ✅ Non-blue element → white/opacity hover
className="text-gray-400 hover:text-white hover:bg-white/10"

// ❌ NEVER: non-blue turning blue on hover
className="text-gray-400 hover:text-digiko-primary"
```

### Animations
- ❌ **NO** pulsing animations on static elements - creates anxiety
- ❌ **NO** infinite pulse effects - annoying and distracting
- ❌ **NO** rotation animations (except loading spinners) - no purpose
- ❌ **NO** shake/wobble effects - feels amateurish
- ❌ **NO** elaborate animations on mobile - kills performance

### Layout
- ❌ **NO** inconsistent border radius - looks sloppy
- ❌ **NO** mixing px and rem units randomly - breaks responsive scaling
- ❌ **NO** inconsistent spacing between similar components - unprofessional
- ❌ **NO** desktop-only layouts - excludes 60% of users
- ❌ **NO** horizontal scrolling on mobile - terrible UX

### Territory Violations
- ❌ **NO** Vegas aesthetics on Dashboard - kills trust
- ❌ **NO** Fintech minimal on game wins - kills excitement
- ❌ **NO** mixing territories on same page - confusing
- ❌ **NO** forgetting brand colors - loses identity

---

## ✅ BEST PRACTICES

### Consistency Rules

1. **Reuse Before Creating**
   - If a button exists on homepage, reuse it everywhere
   - Check Design System before building new components
   - Document new patterns when necessary

2. **Component Hierarchy**
   - IconBox variants: blue (primary), cyan (secondary), purple (rare)
   - All numbers use `font-mono` with `tabular-nums`
   - Glass cards always use `rounded-3xl` with generous padding
   - Primary CTAs always have glow shadow and sweep animation

3. **Typography Consistency**
   - Use responsive typography classes (see Design System)
   - Geist for UI, Geist Mono for numbers/code
   - Never mix fonts arbitrarily

### Color Logic

**Hover State Philosophy:**
- Primary blue → Same blue with increased opacity/glow
- Glass elements → Lighter glass + blue border + glow
- White text → Keep white, adjust background
- Gray text → White text (increase contrast)

**Meaning:**
- Blue = Interactive, actionable
- White/Gray = Informational, passive
- Gold = Celebration, achievement (games only)
- Red = Danger, warning
- Green = Success, confirmation

### Interaction Patterns

**Hover Effects:**
- **Scale:** `hover:scale-105` (5% larger for cards/buttons)
- **Lift:** `hover:translateY(-2px)` (subtle elevation)
- **Glow:** Increase shadow opacity and blur radius
- **Border:** Increase opacity and add blue tint

**Timing:**
- Fast interactions: 150-200ms (buttons, links)
- Medium transitions: 300ms (hover states, color changes)
- Slow animations: 500ms+ (modals, page transitions)

**Easing:**
- Default: `ease-in-out` (smooth both directions)
- Entrances: `ease-out` (starts fast, ends slow)
- Exits: `ease-in` (starts slow, ends fast)

---

## 🎯 DECISION-MAKING FRAMEWORKS

### "Was That Necessary?"

**When adding any design element, ask:**

1. **Does this solve a user problem?**
   - Yes → Continue to question 2
   - No → Remove it

2. **Can it be simpler?**
   - Yes → Simplify it
   - No → Continue to question 3

3. **Does it follow existing patterns?**
   - Yes → Use existing pattern
   - No → Document the new pattern

4. **Will it work on mobile?**
   - Yes → Proceed
   - No → Redesign for mobile first

---

### Territory Selection Framework

**Question:** Which design territory should I use?

**Decision tree:**
```
Is user managing/trading money?
├─ YES → Fintech Minimal
└─ NO → Is user playing for entertainment?
    ├─ YES → Vegas Playful
    └─ NO → Is user browsing/viewing art?
        ├─ YES → NFT Gallery
        └─ NO → Default to Fintech Minimal
```

---

### Animation Decision Framework

**Question:** Should this have an animation?

**Decision tree:**
```
Does animation provide feedback?
├─ YES (button press, loading) → Animate
└─ NO → Does it guide user attention?
    ├─ YES (modal entrance, success) → Animate
    └─ NO → Is it pure decoration?
        ├─ YES → Remove it
        └─ NO → Is it enhancing experience?
            ├─ YES → Animate (keep subtle)
            └─ NO → Remove it
```

---

### Component Creation Framework

**Question:** Should I create a new component?

**Decision tree:**
```
Does similar component exist in Design System?
├─ YES → Use existing component
└─ NO → Will this be used 3+ times?
    ├─ YES → Create reusable component
    │   └─ Add to Design System
    └─ NO → Will this establish new pattern?
        ├─ YES → Create component + document
        └─ NO → Build inline for now
```

---

## 🎨 QUICK DECISION REFERENCE

### I need to...

**Build a button**
→ Use Button component from Design System
→ Choose variant based on territory (primary/secondary/danger/ghost)

**Display a statistic**
→ Use StatCard component
→ Always use monospace font for numbers
→ Include unit/label in smaller text

**Show user feedback**
→ Use Badge component for status
→ Use Input component error/success states
→ Use toast notifications for temporary feedback

**Create a new page**
→ Start with mobile layout
→ Choose design territory first (Fintech vs Vegas)
→ Follow spacing rules (generous vertical spacing)

**Add an animation**
→ Ask: "Does this provide feedback or guidance?"
→ If no, remove it
→ If yes, keep it subtle and fast (150-300ms)

---

## 🎨 CSS VARIABLES & THEMING

### Semantic Color Variables

All core colors are defined as CSS variables in `globals.css`, enabling future light mode support.

**Background Colors:**
| Variable | Dark Mode | Light Mode | Use |
|----------|-----------|------------|-----|
| `--bg-primary` | `#0A0A0C` | `#ffffff` | Page background |
| `--bg-surface` | `#141416` | `#f5f5f5` | Cards, dropdowns |
| `--bg-elevated` | `#1A1A1C` | `#fafafa` | Hover states, modals |
| `--bg-overlay` | `rgba(18,18,20,0.5)` | `rgba(255,255,255,0.9)` | Glass effect |

**Text Colors:**
| Variable | Dark Mode | Light Mode | Use |
|----------|-----------|------------|-----|
| `--text-primary` | `#ffffff` | `#0A0A0C` | Main text |
| `--text-secondary` | `#9ca3af` | `#6b7280` | Secondary text |
| `--text-muted` | `#6b7280` | `#9ca3af` | Muted/hint text |
| `--text-disabled` | `#4b5563` | `#d1d5db` | Disabled text |

**Border Colors:**
| Variable | Use |
|----------|-----|
| `--border-default` | Default borders |
| `--border-hover` | Hover state borders |
| `--border-active` | Active/focus borders |

### Using CSS Variables

**In CSS:**
```css
.my-element {
  background: var(--bg-surface);
  color: var(--text-primary);
  border: 1px solid var(--border-default);
}
```

**In Tailwind (via semantic aliases):**
```tsx
<div className="bg-surface text-text-primary border-border-default">
```

### Enabling Light Mode (Future)

Add `data-theme="light"` to the `<html>` element:
```tsx
<html data-theme="light">
```

---

## ✨ GLOW UTILITY CLASSES (⚠️ GAMES TERRITORY ONLY)

> **WARNING:** Glow effects are **DEPRECATED** for Core Platform (Linear style).
> Use ONLY in Games territory where flashy effects enhance the experience.

### When to Use Glow

| Territory | Glow Allowed? | Why |
|-----------|---------------|-----|
| Core Platform | ❌ NO | Flat design = trust |
| Games | ✅ YES | Vegas style = excitement |
| NFT Marketplace | ❓ TBD | Depends on final design |

### CSS Variables for Glow (when needed)

Defined in `globals.css` for consistency:

```css
--color-glow-primary: rgba(0, 112, 243, 0.4);
--color-glow-primary-strong: rgba(0, 112, 243, 0.6);
--color-glow-success: rgba(0, 200, 83, 0.4);
--color-glow-error: rgba(255, 59, 48, 0.4);
```

### Games Territory Usage

```tsx
// In Games territory ONLY:
className="shadow-[0_0_40px_var(--color-glow-primary)]"

// Or in CSS keyframes:
box-shadow: 0 0 60px var(--color-glow-primary);
```

### Core Platform: What to Use Instead

```tsx
// ❌ OLD (glow)
className="glow-primary hover:glow-primary-lg"

// ✅ NEW (flat)
className="bg-bg-surface border border-border-default hover:bg-bg-elevated hover:border-border-hover"
```

---

## ⏱️ TRANSITION UTILITIES

### Centralized Transition System

All transitions use CSS variables and utility classes defined in `globals.css`. **Never use inline `transition-* duration-*` classes.**

### Transition Durations

| Variable | Value | Use |
|----------|-------|-----|
| `--transition-micro` | 150ms | Micro interactions (hover states) |
| `--transition-standard` | 300ms | Standard (default for most) |
| `--transition-emphasis` | 500ms | Emphasis (modals, important changes) |
| `--transition-slow` | 1000ms | Shimmer effects only |

### Utility Classes

**Color Transitions** (nav links, tabs, backgrounds):
| Class | Duration | Example |
|-------|----------|---------|
| `tr-colors-micro` | 150ms | Fast hover feedback |
| `tr-colors` | 300ms | Standard color change |
| `tr-colors-emphasis` | 500ms | Important state change |

**Transform Transitions** (scale, rotate, translate):
| Class | Duration | Example |
|-------|----------|---------|
| `tr-transform-micro` | 150ms | Button press |
| `tr-transform` | 300ms | Card hover lift |
| `tr-transform-emphasis` | 500ms | Modal entrance |

**Opacity Transitions** (fade in/out):
| Class | Duration |
|-------|----------|
| `tr-opacity-micro` | 150ms |
| `tr-opacity` | 300ms |
| `tr-opacity-emphasis` | 500ms |

**All Properties** (use sparingly - prefer specific):
| Class | Duration | When to Use |
|-------|----------|-------------|
| `tr-all-micro` | 150ms | Multiple properties change together |
| `tr-all` | 300ms | Complex interactions |
| `tr-all-emphasis` | 500ms | Major state changes |

**Combined Patterns**:
| Class | Properties | Use |
|-------|------------|-----|
| `tr-interactive` | color, bg, border, shadow | Buttons with glow |
| `tr-card` | color, bg, border, transform | Hoverable cards |
| `tr-shadow` | box-shadow | Glow effects |

### Migration Guide

**Before (inline):**
```tsx
className="transition-colors duration-300"
className="transition-all duration-500"
```

**After (utility classes):**
```tsx
className="tr-colors"
className="tr-all-emphasis"
```

### Decision Tree

```
What property changes on interaction?
├─ Only color/background → tr-colors
├─ Only transform (scale/translate) → tr-transform
├─ Only opacity → tr-opacity
├─ Color + shadow (button) → tr-interactive
├─ Color + transform (card) → tr-card
└─ Multiple/complex → tr-all (last resort)
```

---

## 📐 BORDER RADIUS STANDARDS

### Standard Values

| Token | Value | Use |
|-------|-------|-----|
| `rounded-lg` | 8px | Buttons, inputs, small cards |
| `rounded-xl` | 12px | Standard cards, modals |
| `rounded-2xl` | 16px | Large cards, containers |
| `rounded-full` | 9999px | Pills, avatars, circular elements |

### When to Use Each

| Context | Radius |
|---------|--------|
| Buttons | `rounded-lg` |
| Input fields | `rounded-lg` |
| Small cards | `rounded-lg` or `rounded-xl` |
| Standard cards | `rounded-xl` |
| Modal containers | `rounded-xl` or `rounded-2xl` |
| Page sections | `rounded-2xl` |
| Badges/pills | `rounded-full` |
| Avatars | `rounded-full` |

### Rules

- **Consistency within context:** All cards on a page should use same radius
- **Never mix:** Don't use `rounded-lg` and `rounded-2xl` for similar elements
- **Nest smaller:** Inner elements use smaller radius than container

---

## 📏 SPACING STANDARDS

### Spacing Scale

| Class | Value | Use |
|-------|-------|-----|
| `gap-1` / `p-1` | 4px | Tight, inline elements |
| `gap-2` / `p-2` | 8px | Compact spacing |
| `gap-3` / `p-3` | 12px | Standard small |
| `gap-4` / `p-4` | 16px | Standard |
| `gap-6` / `p-6` | 24px | Comfortable |
| `gap-8` / `p-8` | 32px | Generous |
| `gap-12` / `p-12` | 48px | Section spacing |
| `gap-16` / `p-16` | 64px | Major sections |

### Spacing Territories

**Compact** (data-dense UIs):
- Card padding: `p-3` to `p-4`
- Grid gaps: `gap-2` to `gap-3`
- Use for: Tables, lists, dashboards

**Standard** (most pages):
- Card padding: `p-4` to `p-6`
- Grid gaps: `gap-4` to `gap-6`
- Use for: Forms, content, features

**Spacious** (marketing, landing):
- Card padding: `p-6` to `p-8`
- Section gaps: `gap-8` to `gap-16`
- Use for: Homepage, token pages

### Mobile Adjustments

Mobile typically uses 60-80% of desktop spacing:
```tsx
className="p-4 md:p-6 lg:p-8"
className="gap-4 md:gap-6"
```

---

## 🔄 HOVER SCALE STANDARDS

### Only 2 Values Allowed

| Value | Use | Example |
|-------|-----|---------|
| `hover:scale-[1.02]` | Subtle (cards, links) | Card hover, nav links |
| `hover:scale-105` | Emphasis (CTAs, icons) | Primary buttons, action icons |

### Rules

- **Never use:** `scale-101`, `scale-103`, `scale-110` (too subtle or too aggressive)
- **Exception:** `scale-110` only in Games territory (Vegas style)
- **Always pair with transition:** `tr-transform` or `tr-card`

### Examples

```tsx
// Card with subtle hover
<div className="tr-card hover:scale-[1.02]">

// CTA button with emphasis
<button className="tr-transform hover:scale-105">

// Icon action
<button className="tr-transform hover:scale-105">
  <Icon />
</button>
```

---

## 🔗 RELATED RESOURCES

**For component implementation:**
→ [Design System](/designsystem) - Live component library with code examples

**For responsive implementation:**
→ [Responsive Guide](guides/RESPONSIVE_GUIDE.md) - Detailed responsive patterns

**For development:**
→ [Developer Documentation](dev/README.md) - Setup, testing, deployment

---

## 📝 VERSION HISTORY

**Version 3.1** (January 16, 2026) - **ACCESSIBILITY UPDATE**
- 🎨 **IMPROVED: Border visibility** - From 3% to 8% opacity (subtle but visible)
- 🎨 **IMPROVED: Text contrast** - Secondary text from #888 to #a1a1a1
- 🎨 **IMPROVED: Surface elevation** - Clearer visual hierarchy
- 🔄 **REMOVED: Linear reference** - Now purely Vercel-inspired
- ✅ **Updated:** globals.css, design-tokens.ts, tailwind.config.js

**Version 3.0** (January 10, 2026) - **MAJOR REDESIGN**
- 🎨 **NEW: Linear/Vercel Style** - Flat design replaces glass morphism for Core Platform
- 🚨 **NEW: Scalability First principle** - Zero hardcoding tolerance
- 📐 **NEW: Design System Architecture** - Two sources of truth (CSS + JS tokens)
- 🚫 **NEW: Absolute Prohibitions** - Clear rules on what's forbidden
- ⚠️ **DEPRECATED: Glow effects** - Moved to Games territory only
- ⚠️ **DEPRECATED: Glass morphism** - Moved to Games territory only
- ✅ **Reference Implementation:** Homepage (`src/app/page.tsx`) fully compliant
- 📋 **Migration:** Other pages pending migration to Linear style

**Version 2.3** (January 9, 2026)
- Added Transition Utilities section with full class reference
- Added Border Radius Standards
- Added Spacing Standards (compact/standard/spacious)
- Added Hover Scale Standards (only 2 values)
- Complete Phase 4-6 design audit documentation

**Version 2.2** (January 9, 2026)
- Added CSS Variables & Theming section
- Added Glow Utility Classes reference
- Documented semantic color system
- Added migration guide for inline shadows

**Version 2.1** (January 6, 2026)
- Added Progressive Disclosure principle (v1.20.0 pattern)
- Documented Always-Visible Card pattern
- Added Connect Wallet UX pattern
- Renumbered principles (Consistency is now #6)

**Version 2.0** (December 1, 2025)
- Distilled from 3,731-line design_guide.md
- Removed component implementation details (moved to Design System)
- Focus on philosophy, principles, and decision-making
- Added decision frameworks
- Restructured for clarity

**Version 1.9** (November 30, 2025)
- Established generous vertical spacing system
- Standardized mobile-first approach
- Added Triple Slots game territory

---

**Last Updated:** January 16, 2026  
**Maintained by:** Riccardo & Claude  
**Supersedes:** design_guide.md v1.9 (archived)
