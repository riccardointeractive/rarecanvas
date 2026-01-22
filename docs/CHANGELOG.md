# CHANGELOG

## v1.27.0 - V5 Mainnet Upgrade (January 18, 2026)

### 🚀 Major: V5 Contract Mainnet Migration
- **V5 Contract Live on Mainnet** - Multi-pair DEX contract upgraded from legacy single-pair format
- **Mainnet Contract**: `klv1qqqqqqqqqqqqqpgq2jqc28xwmk82mng4kwpm3j9vkq3vyga8xw9qq85y6h`
- **Dynamic Pair Support** - All 20+ trading pairs now use unified V5 query format

### 🔧 API Query Format Fix (Critical)
- **`getPairInfo` with Arguments** - V5 uses `getPairInfo` + `arguments: [[pairId]]` format
- **Fixed `args` → `arguments`** - Klever API requires `arguments` key (silently ignores `args`)
- **Files Updated**:
  - `/api/prices/route.ts` - Main price fetching endpoint
  - `/api/prices/debug/route.ts` - Debug endpoint
  - `/api/cron/ai-collector/route.ts` - Cron job for data collection
  - `/services/tokenPrices.ts` - Token price service
  - `/admin/contracts/hooks/useContractQueries.ts` - Admin panel queries

### 💰 Price System Enhancements
- **Dynamic Pair Discovery** - Prices API now fetches pairs directly from contract
- **Cascading Prices Working** - CTR, KAKA, WSOL all derive prices correctly
- **Unknown Token Handling** - Swap page allows trading when USD price unavailable

### 🔗 My Created Pairs
- **Mainnet Support** - "My Created Pairs" section now visible on mainnet (was testnet-only)
- **Cache Refetch Fix** - Proper `refetchQueries` with await after pair creation

### ✨ UX Improvements
- **Empty State CTAs** - Pool and Swap pages show "Create New Pair" when no pairs exist
- **TradingPairSelector Footer** - Always-visible "Create New Pair" link
- **Liquidity Error Fix** - Skip USD check for tokens without price data

### 🐛 Bug Fixes
- **500 Errors on Mainnet** - Fixed V5 query format causing API failures
- **$0.00 Prices** - Fixed `args` vs `arguments` key issue preventing price fetching
- **Type Errors** - Fixed PairContract interface compliance, symbol type assertions

---

## v1.23.0 - Pricing System & Public API (January 11, 2026)

### 💰 Pricing Fixes
- **Multi-hop Price Propagation** - Tokens paired with DGKO (KID, WSOL, KAKA) now show correct prices
- **Dynamic Derivation Chain** - Prices flow through: KLV → DGKO → KID → WSOL
- **Removed Cron Conflict** - Eliminated duplicate cache updates that were overwriting derived prices

### 🔌 Public API
- **`/api/prices` Endpoint** - Public access to all token prices with CORS support
- **Response includes**: USD price, KLV price, derivation source, depth from KLV
- **5-minute cache** - Rate-limit friendly, planning to reduce to ~10s when possible

### 📚 Documentation
- **New "For Developers" Section** - API documentation with usage examples
- **Sidebar UX Fix** - Removed double-scroll issue on desktop

---

## v1.22.0 - Transaction History & KONG Support (January 8, 2026)

### 📜 Transaction History
- **Token Filter Pills** - Easily filter swaps by token
- **Pool Pairs Sorted** - Now sorted by liquidity for easier selection
- **Fee Visibility** - View Transaction Fees button more visible before swapping

### 🦍 New Token
- **KONG Support** - Full integration with correct decimal handling

### 🐛 Bug Fixes
- **Amount Display** - Fixed display for tokens with different decimal precision

---

## v1.19.0 - CTR Kart Racing Physics Update (January 4, 2026)

### 🏎️ Racing Physics
- **Realistic Curve Handling** - Entry slowdown (-15%) and exit acceleration (+8% boost)
- **Speed Rebalance** - Base speed +11%, max speed +12.5%, curve penalty reduced 60%
- **Maneuverability Bonus** - High-maneuver karts handle curves better

### 💨 Visual Effects
- **Wall Collision Smoke** - 3-5 smoke particles with radial gradient on wall impact
- **Canvas Kart Preview** - Real kart rendering in configurator (replaces emoji)
- **Track Preview Cards** - Updated to match in-game rendering style

### 🔄 Recovery System
- **Stuck Kart Detection** - Tracks continuous wall collision
- **Auto-Respawn** - After 5 seconds: respawn + 10 health + 0.5 speed boost

### 🔐 UX Improvements
- **Wallet-Required Config** - Kart configuration only shows after wallet connection
- Prevents losing config when connecting wallet (page reload issue)

### 🐛 Bug Fixes
- **Health Bar** - Width now matches percentage text exactly
- **Track Borders** - Clean corners and intersections (stroke-based rendering)
- **TypeScript Errors** - Fixed accent property, array access safety

### 🛠️ Maintenance
- **Planet Survival** - Added to maintenance wrapper system
- **Code Cleanup** - Removed unused variables and functions

---

## v1.17.0 - Performance Optimization (December 27, 2025)

### 🚀 Performance Improvements
- **3-4x Faster Page Load** - Swap and Pool pages now load in ~400-600ms (was ~2000ms)
- **Parallel API Calls** - Pair info now fetched in parallel instead of sequentially
- **Cached Initial Reserves** - Reserves embedded in TradingPair objects, eliminating redundant fetches
- **Instant Pair Switching** - Switching pairs is now instant (no API calls needed)

### 🔧 Technical Changes
- **`useTradingPairs.ts`** - Parallel `Promise.all()` for fetching all pair info
- **`TradingPair` type** - Added `initialReserves` field with base/quote/timestamp
- **`usePairReserves.ts`** - Uses cached reserves immediately, fresh fetch only on refresh
- **`useLiquidityProvider.ts`** - Parallel queries for LP position data
- **`SwapPage`** - Uses cached reserves for liquidity display (removed direct API calls)

### 🐛 Bug Fixes
- **SwapPriceChart NaN Error** - Fixed division by zero when prices.length=1 or all prices equal
- **Better Error Handling** - Network errors now show context (URL, CORS hints)

### 📊 Performance Metrics
| Metric | Before | After |
|--------|--------|-------|
| Initial Page Load | ~2000ms | ~400-600ms |
| Pair Switching | ~600ms | instant |
| LP Position Load | ~1500ms | ~500ms |

### 📚 Documentation
- Created `docs/dev/PERFORMANCE_AUDIT_SWAP_POOL.md`
- Created `docs/dev/lessons/LESSONS_2025_12_27.md`

---

## v1.15.2 - Cascading Price Derivation (December 21, 2025)

### 🚀 New Features
- **3-Tier Cascading Prices** - Tokens can now derive USD prices via DGKO or BABYDGKO pairs, not just KLV
- **KID Token Support** - First token using Tier 2 derivation (DGKO/KID pair → KID price via DGKO)
- **Admin Derivation Display** - Token prices admin shows source with color coding (Green: KLV, Blue: DGKO, Cyan: BABYDGKO)

### 🔧 Technical
- `/api/prices` route updated with 3-tier cascading logic
- Added `?refresh=true` parameter to force Redis cache clear
- Swap and Pool pages now use centralized `TokenPricesContext` (removed ~160 lines of duplicate price-fetching code)
- Added token precisions for KID, KUNAI, GOAT, KFI, DRG, DAXDO

### 📊 Price Derivation Priority
1. **Tier 1 (KLV pairs):** Direct USD from CoinGecko × pool ratio
2. **Tier 2 (DGKO pairs):** Derive USD via DGKO's price
3. **Tier 3 (BABYDGKO pairs):** Derive USD via BABYDGKO's price

### 📚 Documentation
- Updated `TOKEN_PRICING_SYSTEM.md` with cascading architecture
- Fixed API route references (`/api/prices` not `/api/token-prices`)

---

## v1.15.1 - Price Chart & Caching Fixes (December 20, 2025)

### 🐛 Bug Fixes
- **Price Chart Pair Filtering** - Fixed critical bug where charts showed wrong prices (e.g., 4000 KLV instead of 0.02 KLV) due to including swaps from all pairs instead of the selected pair
- **Redis Cache Sync** - Reduced sync interval from 5 minutes to 30 seconds for faster transaction updates after swaps

### 🔧 Technical
- `usePriceData.ts` now accepts `quoteToken` parameter for pair-aware filtering
- `SwapPriceChart.tsx` and `TabbedPriceChart.tsx` pass correct pair context
- Cache strategy optimized for Upstash free tier (30s interval = ~3000 calls/day)

### 📚 Documentation
- Created `LESSONS_2025_12_20.md` documenting multi-pair filtering patterns

---

## v1.15.0 - V3 DEX & Pool System Launch (December 16, 2025)

### 🚀 Major Features
- **V3 Multi-Pair DEX** - Support for multiple trading pairs (DGKO/KLV, BABYDGKO/KLV coming)
- **Community Liquidity** - Anyone can become a Liquidity Provider (LP) and earn fees
- **Pool Page** - New dedicated /pool page for LP management
- **Fee Distribution** - LPs earn 0.9% of swap fees proportional to their share
- **Pair Selector** - Easy switching between trading pairs on swap page

### 💰 LP Features
- **3-Step Deposit System** - Pending deposits to handle Klever single-token limitation
- **Add Liquidity** - Deposit tokens in correct ratio to earn fees
- **Remove Liquidity** - Withdraw any percentage of your position anytime
- **Fee Claiming** - Claim accumulated fees without removing liquidity
- **Position Tracking** - Real-time share percentage and token values

### 🔧 Smart Contract V3
- `createPair()` - Dynamic pair creation
- `depositPendingA/B()` + `finalizeLiquidity()` - Atomic LP deposits
- `removeLiquidity()` - Percentage-based withdrawal
- `claimFees()` - Fee collection for LPs
- `withdrawPending()` - Escape hatch for cancelled deposits

### 🧪 Testing
- Comprehensive testnet validation with 3 accounts (YYRN, NYTM, ENF3)
- Share calculation verification (33.3%, 45.45%, etc.)
- Fee distribution testing
- All LP flows validated

### 📚 Documentation
- New Pool section in public documentation
- Updated swap docs for V3 features
- Updated smart contracts section
- Created LESSONS_2025_12_16.md
- Updated DEX_STATUS_SUMMARY.md

---

## v1.11.0 - KLV Native Staking & Validators (December 10, 2025)

### 🚀 New Features
- **KLV Native Staking** - Stake KLV directly on the Klever blockchain
- **Validators Page** - Browse and compare 50+ network validators with match scoring
- **Delegation System** - Delegate staking buckets to validators for extra rewards
- **Smart Recommendations** - AI-powered validator matching based on stake size, APY, and reliability
- **Epoch Countdown** - Live timer showing time until next reward distribution (every 6 hours)

### 🎨 UI Improvements
- **Premium AmountInput** - Completely redesigned fintech-style input with integrated MAX button
- **Responsive Large Numbers** - Compact formatting (10M instead of 10,000,000) for mobile
- **URL Token Persistence** - Staking page remembers token selection on refresh
- **Shared Validator Components** - RankBadge, MetricBox, QuickStat for consistent design

### 🔧 Technical
- **Epoch-Based Rewards** - Shows actual claimable rewards, not estimates (KLV rewards distributed per epoch)
- **Correct Rewards API Parsing** - Properly separates staking vs delegation rewards from Klever API
- **Validator Scoring Algorithm** - Considers APY, commission, status, and competition level
- **Staking Buckets Management** - View, delegate, undelegate, unstake, and withdraw

### 📚 Documentation
- Updated staking docs with KLV native staking and validators
- Updated roadmap with completed Q4 2025 features

---

## v1.9.1 - ESLint & Code Quality Cleanup (December 8, 2025)

### 🔧 Code Quality
- **Fixed 19 files** with React hooks violations and unused variables
- **React Hooks Rules** - Fixed conditional hook calls that could cause runtime errors
- **useEffect Dependencies** - Properly handled all exhaustive-deps warnings
- **Next.js Links** - Replaced `<a>` tags with `<Link>` components for better performance
- **Type Safety** - Added proper interfaces for blockchain API responses

### 📋 ESLint Configuration Strategy
- **Critical rules as errors** - `react-hooks/rules-of-hooks` now breaks build if violated
- **Smart unused vars** - Variables prefixed with `_` are automatically ignored
- **Disabled impractical rules** - `no-explicit-any` and `no-img-element` turned off
  - Reason: Klever SDK lacks TypeScript types, dynamic CDN images incompatible with next/image

### 🎯 Result
- `npm run validate` now shows **0 warnings**
- Future critical violations will be visible (not buried in noise)
- Clean baseline for ongoing development

### 📚 Documentation
- Created `docs/dev/workflows/ESLINT_STRATEGY.md` - ESLint configuration rationale
- Updated SHIP_IT workflow references

---

## v1.6.1 - BABYDGKO Multi-Pair Support (December 7, 2025)

### 🔧 Bug Fixes
- **Token Decimals** - BABYDGKO now uses correct 8 decimals (was using 4)
- **Transaction History** - Shows correct token symbols (DGKO, BABYDGKO, KLV)
- **Price Chart** - Filters data by selected token pair
- **USD Display** - Supports micro-prices (8+ decimals for meme tokens)

### 🎨 UI Improvements
- **Token Pills** - Simplified display in swap cards (removed button styling)
- **Dynamic Pricing** - Chart shows price from swap history, not just reserves

### 🎯 Technical
- Dynamic token recognition via assetId prefixes
- `getAssetIdFromSymbol()` helper for token image lookups
- Extended price formatting for sub-cent tokens

---

## v1.5.0 - Paywall Removal & Connect Button UX (December 5, 2025)

### 🚀 UX Architecture
- **Removed Wallet Blockers** - All pages now show full content without requiring connection first
- **Action-Based Authentication** - Users connect when taking action, not when viewing pages
- **New Button Variant** - Added `connect` variant matching header wallet button styling

### 📦 Page Changes
- **Dashboard** - Shows inline connect prompt, QuickGuideSection always visible
- **Swap** - Full swap interface visible, button triggers connect when clicked
- **Games** - Full game grid visible, "Connect to Play" buttons per game
- **Roulette** - Full game visible, spin button shows "CONNECT TO SPIN" when disconnected

### 🎨 Button Component
- Added `connect` variant to Button component
- Glass effect: `bg-digiko-primary/10` with blue-tinted border
- Shimmer animation on hover (matches primary variant)
- Visual consistency with header wallet connect button

### 🎯 Files Modified
- `src/components/Button.tsx` - New connect variant
- `src/app/swap/page.tsx` - Removed blocker, pass connect props
- `src/app/swap/components/UniswapStyleSwap.tsx` - Handle connection state
- `src/app/dashboard/page.tsx` - Inline connect prompt pattern
- `src/app/games/page.tsx` - Full grid with connect buttons
- `src/app/games/roulette/page.tsx` - Full game with connect spin button

### 📚 Documentation
- Created `docs/dev/lessons/LESSONS_2025_12_05.md` - Pattern documentation

---

## v1.4.0 - Unified Badge Component System (December 3, 2025)

### 🎨 Design System
- **Unified Badge Component** - Single source of truth for all badges
- **Gradient Badge Variant** - Merged beta badge style into main component
- **ALL CAPS Enforcement** - Badges always uppercase for readability and distinction from buttons
- **8 Badge Variants**: gradient, success, error, warning, info, feature, neutral, ghost
- **Enhanced Features**: dot indicators, pulse animation, blur effect, 3 sizes (sm/md/lg)

### 📦 Component Architecture
- Created `/src/components/ui/Badge.tsx` - New modular badge component
- Updated `/src/components/Badge.tsx` - Now re-exports from ui for backward compatibility
- Integrated `FeatureBadge` helper with auto-uppercase and smart variant detection
- Triple uppercase enforcement: Tailwind class + CSS !important + inline style

### 🎯 Header & Footer
- Replaced custom beta badge with `<FeatureBadge>` component
- Header uses blur effect, footer uses standard style
- Consistent styling across all badge usage

### 📚 Documentation
- Updated Design System with connected Badge examples (auto-updates from real code)
- Added comprehensive badge showcase: all variants, sizes, states, dots, pulse
- Design principle documented: "UPPERCASE for readability, distinguishes from buttons"

### 🔧 Technical Implementation
- Added `.badge-uppercase` CSS class in globals.css with !important
- Component uses real imports from `/src/components/ui/Badge.tsx`
- Design System automatically reflects component updates (single source of truth)

### 🎯 Files Modified
- `src/components/ui/Badge.tsx` - New unified component
- `src/components/ui/index.ts` - Updated exports
- `src/components/Badge.tsx` - Backward compatibility re-export
- `src/app/layout.tsx` - Header & footer using FeatureBadge
- `src/app/admin/design-system/sections/ButtonsSection.tsx` - Connected badge examples
- `src/app/globals.css` - Added .badge-uppercase class

---

## v1.1.6 - Build Fix: Suspense Boundary (November 28, 2025)

### 🔧 Critical Fix
- **Fixed Vercel build failure** - Wrapped DebugMenu in Suspense boundary
- **Issue**: `useSearchParams()` was causing prerender errors on all pages
- **Solution**: Added `<Suspense fallback={null}>` wrapper around DebugMenu component
- **Impact**: All pages now build successfully for static generation

### 📝 Technical Details
- Next.js 14 requires Suspense boundaries for components using `useSearchParams()`
- DebugMenu component was in layout.tsx without Suspense, breaking static generation
- Build now completes without errors on Vercel

---

## v1.1.5 - Mobile UX Overhaul (November 28, 2025)

### 🎨 Mobile-Responsive Typography
- Added comprehensive mobile font scale (10 sizes: mobile-xs through mobile-6xl)
- Created responsive utility classes: text-responsive-h1, balance-display, token-name-mobile
- Optimized heading sizes for mobile: H1 48px→32px, H2 36px→28px, H3 30px→24px
- Token names now scale properly: 20px desktop → 14px mobile
- Fixed BABYDGKO overflow on mobile with flex-wrap pattern

### 📐 Mobile Spacing Optimization
- Reduced mobile spacing by ~40% following fintech standards (Revolut, Coinbase)
- Container padding: 32px → 16px mobile
- Glass cards: 32px → 20px mobile
- Stats cards: 24px → 16px mobile
- Card gaps: 32px → 16px mobile
- Section margins: 48px → 24px mobile

### 🎯 Visual Polish
- Text color minimalism: removed decorative blue text
- All informational text now white/gray only
- Blue reserved for interactive elements only
- Fixed NumberInput focus state (removed unwanted inner rectangle)
- Centered "How It Works" section on mobile for better symmetry

### 🐛 Debug & Error Logging
- Integrated debug mode with floating red bug button (?debug=true)
- Test error types: Wallet, Transaction, API, Network, Invalid Input
- Enhanced error logging with "Copy Debug Log" button in all error modals
- Comprehensive debug logs: error details, timestamp, route, user info, app version

### 🔧 Technical Fixes
- Fixed Klever API endpoints: api.klever.org → api.mainnet.klever.org
- Added version number to mobile menu footer
- All 6 locations now show version: header, footer, admin, dashboard, mobile menu, desktop menu

### 📚 Documentation
- Updated design_guide.md to v1.8 with comprehensive mobile-responsive section
- Added 11 new project rules (RULE 40-50) covering mobile-first development
- Created LESSONS_2025_11_28.md documenting all learnings
- Updated Updates page with v1.1.5 entry
- Added mobile testing standards and production readiness checklist

### 🎯 Files Modified
- tailwind.config.js - Mobile font sizes
- globals.css - Responsive utilities
- MobileMenu.tsx - Added version display
- StakingHeader.tsx, StakeCard.tsx, UnstakingCard.tsx - Responsive spacing
- StakingStatsGrid.tsx, RewardsCard.tsx - Mobile padding
- HowItWorksSection.tsx - Centered layout
- NumberInput.tsx - Focus state fix
- BABYDGKOHeader.tsx - Flex-wrap for overflow
- UnstakingQueueItem.tsx - Text color cleanup
- design_guide.md - v1.8 with mobile section (+400 lines)
- PROJECT_RULES.md - v1.8 with 11 new rules (+350 lines)
- updates.config.ts - Added v1.1.5 entry

---

## v1.1.0 - API Endpoint Fix (November 28, 2025)

### 🔧 Critical Fixes
- Fixed Klever API endpoint from api.klever.org to api.mainnet.klever.org
- All blockchain queries now working correctly
- DNS resolution verified

---

## v1.0.1 - Analytics Integration (November 28, 2025)

### 📊 Features
- Integrated Vercel Analytics for visitor tracking
- Privacy-friendly analytics with GDPR compliance
- Automatic tracking of page views and unique visitors
- Web Vitals monitoring for performance metrics

---

## v1.0.0 - Platform Launch (November 28, 2025)

### 🚀 Initial Release
- Official platform launch at digiko.io
- DGKO staking operational (10% APR)
- BABYDGKO staking operational (10% APR)
- Dashboard with KLV balance tracking
- Dedicated token pages with live statistics
- Klever Wallet integration
- Premium glass morphism UI
- Mobile-responsive design
- Public documentation

---
