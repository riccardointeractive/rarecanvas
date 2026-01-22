# DIGIKO COMPONENT DOCUMENTATION

> Complete inventory of all components in the Digiko platform (excluding admin).
> Last Updated: December 6, 2025

---

## Table of Contents

- [Overview](#overview)
- [Shared Components](#shared-components)
- [Page Components](#page-components)
  - [Home Page](#home-page)
  - [Dashboard](#dashboard-page)
  - [Staking](#staking-page)
  - [Swap](#swap-page)
  - [DGKO Token](#dgko-token-page)
  - [BABYDGKO Token](#babydgko-token-page)
  - [Documentation](#documentation-page)
  - [Games Hub](#games-hub-page)
  - [Roulette Game](#roulette-game-page)
  - [Updates](#updates-page)
  - [Error Logging Test](#error-logging-test-page)
- [Summary Statistics](#summary-statistics)
- [Recent Refactoring](#recent-refactoring)

---

## Overview

The Digiko platform uses a modular component architecture with:

- **Shared Components** (`/src/components/`) - Reusable across all pages
- **Page Components** (`/src/app/[page]/components/`) - Page-specific components
- **Hooks** (`/src/app/[page]/hooks/`) - Page-specific business logic
- **Config** (`/src/app/[page]/config/`) - Page configuration and constants
- **Types** (`/src/app/[page]/types/`) - TypeScript type definitions

---

## Shared Components

**Location:** `/src/components/`

These components are used across multiple pages and provide consistent UI/UX.

### Core UI Components

| Component | File | Description |
|-----------|------|-------------|
| Button | `Button.tsx` | Primary button component with variants (primary, secondary, danger, ghost, connect) |
| Card | `Card.tsx` | Card container with glass morphism styling |
| StatCard | `Card.tsx` | Pre-configured card for statistics display |
| FeatureCard | `Card.tsx` | Pre-configured card for feature highlights |
| Badge | `Badge.tsx` | Status/label badge component |
| Input | `Input.tsx` | Form input field component |
| NumberInput | `NumberInput.tsx` | Numeric input with validation |
| IconBox | `IconBox.tsx` | Icon container with consistent styling (blue, cyan, purple, gray variants) |
| RefreshButton | `RefreshButton.tsx` | Refresh button with loading state and hover effects |
| BalanceRow | `BalanceRow.tsx` | Token balance display row with label, value, token |
| BalanceRowGroup | `BalanceRow.tsx` | Container for BalanceRow components |
| InfoTip | `InfoTip.tsx` | Informational tip box with variants (info, warning, success, neutral) |
| ActionCardHeader | `ActionCardHeader.tsx` | Card header with title and refresh button |
| SwapCard | `SwapCard.tsx` | Uniswap-inspired token swap interface |

### Section Components

| Component | File | Category | Description |
|-----------|------|----------|-------------|
| SectionTitle | `SectionTitle.tsx` | Layout | Section header with title and description |
| StatsGrid | `StatsGrid.tsx` | Layout | Statistics display in responsive grid |
| CTASection | `CTASection.tsx` | Layout | Call-to-action section with glass card (supports external links) |
| RoadmapItem | `RoadmapItem.tsx` | Layout (Timeline) | Timeline item for roadmap sections |
| FeatureLinkCard | `FeatureLinkCard.tsx` | Cards | Feature card with icon, title, desc, link |
| TokenShowcaseCard | `TokenShowcaseCard.tsx` | Cards | Token showcase with logo and stats |
| InfoCard | `InfoCard.tsx` | Cards | Centered info card with icon |
| EmptyStateCard | `EmptyStateCard.tsx` | Cards | Empty state/prompt card |
| GuideItem | `GuideItem.tsx` | Layout | Horizontal guide item with icon |

### Token Page Components (NEW)

| Component | File | Description |
|-----------|------|-------------|
| **PageHeader** | `PageHeader.tsx` | **Page header with optional icon/image and description** |
| **MetricCard** | `MetricCard.tsx` | **Activity card with icon, label, value, description** |
| **MetricCardGrid** | `MetricCard.tsx` | **Responsive grid container for MetricCards** |
| **DataGrid** | `DataGrid.tsx` | **Section with title and grid of data items** |
| **DataGridItem** | `DataGrid.tsx` | **Single data item card with label, value, action** |
| **SocialLinks** | `SocialLinks.tsx` | **Community/social media links section** |
| **DonutChart** | `DonutChart.tsx` | **Animated donut chart for distributions** |
| **DonutChartLegend** | `DonutChart.tsx` | **Legend items for DonutChart** |

### Token Page System (Dec 6, 2025)

**Location:** `/src/components/token-page/`

A unified, config-driven component system for token pages (DGKO, BABYDGKO, future tokens).

| Component | File | Description |
|-----------|------|-------------|
| TokenPage | `TokenPage.tsx` | Main orchestrator component |
| TokenPageHeader | `TokenPageHeader.tsx` | Configurable header with token image |
| StakingOverviewCard | `StakingOverviewCard.tsx` | Staking stats from config + blockchain |
| TokenActivityCards | `TokenActivityCards.tsx` | Renders config.activityMetrics |
| TokenomicsSection | `TokenomicsSection.tsx` | Donut chart + legend from config |
| OnChainDataGrid | `OnChainDataGrid.tsx` | Configurable metrics grid |
| EcosystemGrid | `EcosystemGrid.tsx` | Renders config.ecosystemFeatures |
| EcosystemCard | `EcosystemCard.tsx` | Individual feature card |
| RoadmapSection | `RoadmapSection.tsx` | Renders config.roadmap |
| TokenDetailsSection | `TokenDetailsSection.tsx` | Token info + exchange list |
| CommunitySection | `CommunitySection.tsx` | Renders config.socialLinks |
| CTASection | `CTASection.tsx` | Renders config.cta |

| Hook | File | Purpose |
|------|------|---------|
| useTokenStats | `useTokenStats.ts` | Generic hook accepting assetId + precision |

| Type | File | Purpose |
|------|------|---------|
| TokenPageConfig | `types.ts` | Master configuration interface |
| TokenStats | `types.ts` | Blockchain stats interface |

**Usage Pattern:**
```tsx
// 1. Create config file: src/app/[token]/config/token.config.tsx
export const myTokenConfig: TokenPageConfig = {
  tokenId: 'MYTOKEN',
  assetId: 'MYTOKEN-XXXX',
  precision: 100000000,
  // ... all configuration
};

// 2. Create page: src/app/[token]/page.tsx
import { TokenPage } from '@/components/token-page';
import { myTokenConfig } from './config/token.config';

export default function MyTokenPage() {
  return <TokenPage config={myTokenConfig} />;
}
```

### Design System Organization

| Category | Components |
|----------|------------|
| **Cards & Containers** | Card, StatCard, FeatureCard, IconBox, FeatureLinkCard, TokenShowcaseCard, InfoCard, EmptyStateCard, MetricCard, DataGridItem |
| **Layout** | SectionTitle, StatsGrid, CTASection, RoadmapItem, GuideItem, GuideItemList, PageHeader, DataGrid, MetricCardGrid |
| **Buttons & Badges** | Button, Badge, StatusBadge, FeatureBadge, RefreshButton |
| **Forms & Inputs** | Input, NumberInput, SwapCard |
| **Action Components** | ActionCardHeader, BalanceRow, BalanceRowGroup, InfoTip, SocialLinks |
| **Data Visualization** | DonutChart, DonutChartLegend |

### Wallet & Blockchain

| Component | File | Description |
|-----------|------|-------------|
| WalletConnect | `WalletConnect.tsx` | Wallet connection button |
| ConnectWalletPrompt | `ConnectWalletPrompt.tsx` | Full-page wallet connection CTA |
| Balance | `Balance.tsx` | Token balance display |
| NetworkSelector | `NetworkSelector.tsx` | Network selection dropdown |
| SendForm | `SendForm.tsx` | Token transfer form |
| TransactionModal | `TransactionModal.tsx` | Transaction status/error modal |

### Token Components

| Component | File | Description |
|-----------|------|-------------|
| TokenImage | `TokenImage.tsx` | Token logo/image display with fallbacks |
| TokenSelector | `TokenSelector.tsx` | Token selection dropdown |
| TokensDropdown | `TokensDropdown.tsx` | Token list dropdown menu |

### Smart Contract

| Component | File | Description |
|-----------|------|-------------|
| ContractReader | `ContractReader.tsx` | Read smart contract data |
| ContractWriter | `ContractWriter.tsx` | Write to smart contracts |

### Navigation

| Component | File | Description |
|-----------|------|-------------|
| MobileMenu | `MobileMenu.tsx` | Mobile navigation drawer |
| DesktopMoreMenu | `DesktopMoreMenu.tsx` | Desktop "More" dropdown |
| NavigationLinks | `NavigationLinks.tsx` | Navigation link components |
| ConditionalNav | `ConditionalNav.tsx` | Conditional navigation logic |

### Utility Components

| Component | File | Description |
|-----------|------|-------------|
| ExchangeList | `ExchangeList.tsx` | List of exchange platforms |
| AdminIcon | `AdminIcon.tsx` | Admin access icon (dev only) |
| DebugMenu | `DebugMenu.tsx` | Debug mode menu |
| DebugTest | `DebugTest.tsx` | Debug testing utility |

### UI Subcomponents

**Location:** `/src/components/ui/`

| Component | File | Description |
|-----------|------|-------------|
| Badge | `Badge.tsx` | Enhanced badge with variants (gradient, success, error, warning, info, feature, neutral, ghost) |
| StatusBadge | `Badge.tsx` | Pre-configured status badge with dot indicator |
| FeatureBadge | `Badge.tsx` | Pre-configured badge for feature labels (SOON, BETA, NEW, LIVE) |
| index | `index.ts` | Central component exports |

### Example Components

**Location:** `/src/components/examples/`

| Component | File | Description |
|-----------|------|-------------|
| TokenPriceExamples | `TokenPriceExamples.tsx` | Token pricing implementation examples |

---

## Page Components

---

### Home Page

**Route:** `/`
**File:** `src/app/page.tsx`

The home page has been refactored to use shared components from the design system.

#### Components Used

| Component | Source | Usage |
|-----------|--------|-------|
| Button | `@/components/ui` | CTA buttons |
| FeatureBadge | `@/components/ui` | "Coming Soon" badges |
| SectionTitle | `@/components/ui` | Section headers |
| FeatureLinkCard | `@/components/ui` | Platform feature cards |
| StatsGrid | `@/components/ui` | Platform statistics (Products, Tokens, APR) |
| RoadmapItem | `@/components/ui` | Timeline milestones |
| CTASection | `@/components/ui` | Final call-to-action |
| TokenShowcaseCard | `@/components/ui` | DGKO and BABYDGKO showcase |
| InfoCard | `@/components/ui` | "Built on Klever" features |
| TOKEN_IDS | `@/components/ui` | Token identifiers |

#### Data-Driven Sections

The homepage uses configuration arrays for data-driven rendering:

- `platformStats` - Stats grid items
- `roadmapItems` - Roadmap timeline data
- `kleverFeatures` - "Built on Klever" feature cards

#### Icon Library

Homepage icons are defined in the `Icons` object for consistency and reusability.

---

### Dashboard Page

**Route:** `/dashboard`
**File:** `src/app/dashboard/page.tsx`

**Recent Refactoring (Dec 5, 2025):**
- Replaced inline connect wallet prompt with shared `EmptyStateCard`
- `QuickGuideSection` now uses shared `GuideItem` component
- `DocumentationSection` now uses shared `GuideItem` component
- Removed unused `DashboardHeader` and `FeatureCard` components

#### Components

**Location:** `src/app/dashboard/components/`

| Component | File | Description | Status |
|-----------|------|-------------|--------|
| AccountInfoCard | `AccountInfoCard.tsx` | Connected wallet information | Active |
| PortfolioOverview | `PortfolioOverview.tsx` | Portfolio value summary | Active |
| AllTokenBalances | `AllTokenBalances.tsx` | Complete token balance list | Active |
| QuickActions | `QuickActions.tsx` | Quick action buttons (Stake, Swap, etc.) | Active |
| RecentTransactions | `RecentTransactions.tsx` | Transaction history list | Active |
| PriceChart | `PriceChart.tsx` | KLV price chart | Active |
| PerformanceChart | `PerformanceChart.tsx` | Portfolio performance graph | Active |
| SwapMetricsGrid | `SwapMetricsGrid.tsx` | Swap statistics display | Active |
| QuickGuideSection | `QuickGuideSection.tsx` | Getting started guide (uses `GuideItem`) | Active |
| ResourcesSection | `ResourcesSection.tsx` | Links & resources | Active |
| DocumentationSection | `DocumentationSection.tsx` | Documentation preview (uses `GuideItem`) | Active |
| DashboardHeader | `DashboardHeader.tsx` | Page header/title | **Deprecated** - use `SectionTitle` |
| FeatureCard | `FeatureCard.tsx` | Feature highlight card | **Deprecated** - use `GuideItem` |

#### Shared Components Used

| Component | Source | Usage |
|-----------|--------|-------|
| EmptyStateCard | `@/components/ui` | Connect wallet prompt |
| GuideItem | `@/components/ui` | QuickGuideSection, DocumentationSection |

#### Hooks

**Location:** `src/app/dashboard/hooks/`

| Hook | File | Purpose |
|------|------|---------|
| useTokenBalances | `useTokenBalances.ts` | Fetch user token balances |
| useTransactionHistory | `useTransactionHistory.ts` | Fetch transaction history |
| useSwapMetrics | `useSwapMetrics.ts` | Fetch swap statistics |
| usePortfolioStats | `usePortfolioStats.ts` | Calculate portfolio metrics |

---

### Staking Page

**Route:** `/staking`
**File:** `src/app/staking/page.tsx`

#### Components

**Location:** `src/app/staking/components/`

| Component | File | Description |
|-----------|------|-------------|
| StakingHeader | `StakingHeader.tsx` | Page header |
| StakingStatsGrid | `StakingStatsGrid.tsx` | Staking statistics display |
| StakeCard | `StakeCard.tsx` | Stake tokens interface |
| RewardsCard | `RewardsCard.tsx` | Claim rewards interface |
| UnstakingCard | `UnstakingCard.tsx` | Unstake tokens interface |
| UnstakingQueueItem | `UnstakingQueueItem.tsx` | Unstaking queue item display |
| HowItWorksSection | `HowItWorksSection.tsx` | Staking instructions |
| DevModeBanner | `DevModeBanner.tsx` | Development mode indicator |

#### Hooks

**Location:** `src/app/staking/hooks/`

| Hook | File | Purpose |
|------|------|---------|
| useStakingData | `useStakingData.ts` | Fetch staking positions |
| useStakingActions | `useStakingActions.ts` | Stake/unstake/claim actions |
| useStakingStats | `useStakingStats.ts` | Calculate staking statistics |
| useTokenBalances | `useTokenBalances.ts` | Fetch stakeable token balances |
| useModal | `useModal.ts` | Modal state management |

---

### Swap Page

**Route:** `/swap`
**File:** `src/app/swap/page.tsx`

**Recent Refactoring (Dec 5, 2025):**
- Created shared `SwapCard` component from UniswapStyleSwap
- `UniswapStyleSwap` now wraps `SwapCard` with DGKO/KLV specific logic
- SwapCard is reusable for any token swap interface

#### Components

**Location:** `src/app/swap/components/`

| Component | File | Description | Status |
|-----------|------|-------------|--------|
| SwapHeader | `SwapHeader.tsx` | Page header | Active |
| SwapInterface | `SwapInterface.tsx` | Main swap form | Active |
| UniswapStyleSwap | `UniswapStyleSwap.tsx` | Wraps shared SwapCard with DGKO/KLV logic | **Refactored** - now uses `@/components/SwapCard` |
| PoolLiquidityCard | `PoolLiquidityCard.tsx` | Liquidity pool information | Active |
| UserStatsCard | `UserStatsCard.tsx` | User swap statistics | Active |
| Markets | `Markets.tsx` | Available trading pairs | Active |
| SwapPriceChart | `SwapPriceChart.tsx` | Price chart visualization | Active |
| SwapVolumeChart | `SwapVolumeChart.tsx` | Volume chart visualization | Active |
| TransactionHistoryTable | `TransactionHistoryTable.tsx` | Swap history table | Active |
| BlockchainTransactionHistory | `BlockchainTransactionHistory.tsx` | On-chain transaction history | Active |
| HowItWorksSection | `HowItWorksSection.tsx` | Swap instructions | Active |
| FeeDetailsModal | `FeeDetailsModal.tsx` | Fee breakdown modal | Active |
| PriceDisplayExplorations | `PriceDisplayExplorations.tsx` | Price display design variants | Exploration |
| TableDesignExplorations | `TableDesignExplorations.tsx` | Table design explorations | Exploration |

#### Hooks

**Location:** `src/app/swap/hooks/`

| Hook | File | Purpose |
|------|------|---------|
| useSwapState | `useSwapState.ts` | Swap form state management |
| useSwapExecution | `useSwapExecution.ts` | Execute swap transactions |
| useSwapModal | `useSwapModal.ts` | Swap modal state |
| useSwapHistory | `useSwapHistory.ts` | Fetch swap history |
| usePriceData | `usePriceData.ts` | Fetch price data |
| useUserBalances | `useUserBalances.ts` | Fetch user balances |
| useContractReserves | `useContractReserves.ts` | Fetch DEX reserves |
| useContractTransactions | `useContractTransactions.ts` | Fetch contract transactions |

---

### DGKO Token Page

**Route:** `/dgko`
**File:** `src/app/dgko/page.tsx`

> **⚠️ REFACTORED (Dec 6, 2025):** Now uses the unified `TokenPage` component system.

#### Architecture

The DGKO page is a thin wrapper around the shared `TokenPage` component:

```tsx
// src/app/dgko/page.tsx (9 lines)
import { TokenPage } from '@/components/token-page';
import { dgkoConfig } from './config/token.config';

export default function DGKOPage() {
  return <TokenPage config={dgkoConfig} />;
}
```

#### Configuration

**Location:** `src/app/dgko/config/token.config.tsx`

All DGKO-specific data is defined in the configuration file:
- Token identifiers (`assetId: 'DGKO-CXVJ'`, `precision: 10000`)
- Display information (name, tagline, description)
- Tokenomics distribution (100M max supply)
- Roadmap items
- Exchange listings ("Where to Trade")
- Ecosystem features (Staking, Swap, NFTs, Games)
- Social links
- CTA configuration

---

### BABYDGKO Token Page

**Route:** `/babydgko`
**File:** `src/app/babydgko/page.tsx`

> **⚠️ REFACTORED (Dec 6, 2025):** Now uses the unified `TokenPage` component system.

#### Architecture

The BABYDGKO page is a thin wrapper around the shared `TokenPage` component:

```tsx
// src/app/babydgko/page.tsx (9 lines)
import { TokenPage } from '@/components/token-page';
import { babydgkoConfig } from './config/token.config';

export default function BABYDGKOPage() {
  return <TokenPage config={babydgkoConfig} />;
}
```

#### Configuration

**Location:** `src/app/babydgko/config/token.config.tsx`

BABYDGKO-specific configuration:
- Token identifiers (`assetId: 'BABYDGKO-3S67'`, `precision: 100000000`)
- Display information (meme token focus)
- Tokenomics distribution (1T max supply)
- Exchange listings ("Where to Get")
- Ecosystem features (ITO Gift, Community Events, Meme Contests)

---

### Documentation Page

**Route:** `/documentation`, `/documentation/[section]`
**Files:** `src/app/documentation/page.tsx`, `[section]/page.tsx`

#### Components

**Location:** `src/app/documentation/components/`

| Component | File | Description |
|-----------|------|-------------|
| DocumentationHeader | `DocumentationHeader.tsx` | Page header |
| DocumentationSidebar | `DocumentationSidebar.tsx` | Navigation sidebar |
| DocumentationSection | `DocumentationSection.tsx` | Section container |
| SectionContent | `SectionContent.tsx` | Content renderer |
| SectionNavigation | `SectionNavigation.tsx` | Section navigation links |
| QuickNavigation | `QuickNavigation.tsx` | Quick access navigation |
| MobileDocNav | `MobileDocNav.tsx` | Mobile navigation drawer |
| HelpFooter | `HelpFooter.tsx` | Help/support footer |

#### Doc Primitives

**Location:** `src/app/documentation/components/doc/`

| Component | File | Description |
|-----------|------|-------------|
| DocCard | `DocCard.tsx` | Information card |
| DocCode | `DocCode.tsx` | Code block with syntax highlighting |
| DocGrid | `DocGrid.tsx` | Grid layout container |
| DocHighlight | `DocHighlight.tsx` | Highlighted info box |
| DocList | `DocList.tsx` | Styled bullet list |
| DocSteps | `DocSteps.tsx` | Step-by-step guide |
| DocText | `DocText.tsx` | Text block component |
| index | `index.ts` | Component exports |

---

### Games Hub Page

**Route:** `/games`
**File:** `src/app/games/page.tsx`

The games hub uses inline components. These could be extracted for reusability.

#### Current Inline Sections

| Section | Description | Potential Component |
|---------|-------------|---------------------|
| GamesHeader | Page header with title | `GamesHeader` |
| RouletteGameCard | Roulette game card (Live) | `GameCard` |
| DiceGameCard | Dice game card (Coming Soon) | `GameCard` |
| LotteryGameCard | Lottery game card (Coming Soon) | `GameCard` |
| LiveBadge | "LIVE" status indicator | `StatusBadge` |
| ComingSoonBadge | "Coming Soon" indicator | `StatusBadge` |
| InfoSection | Features grid | `GameFeaturesGrid` |

#### Imported Components

| Component | Source |
|-----------|--------|
| Button | `@/components/Button` |

---

### Roulette Game Page

**Route:** `/games/roulette`
**File:** `src/app/games/roulette/page.tsx`

#### Components

**Location:** `src/app/games/roulette/components/`

| Component | File | Description |
|-----------|------|-------------|
| RouletteHeader | `RouletteHeader.tsx` | Game header |
| SpinningSlots | `SpinningSlots.tsx` | 3-slot spinning animation |
| RouletteWheel | `RouletteWheel.tsx` | Wheel animation component |
| EntryFeeSelector | `EntryFeeSelector.tsx` | Bet amount selection |
| PrizeDisplay | `PrizeDisplay.tsx` | Prize tier information |
| GameHistory | `GameHistory.tsx` | Previous games list |
| ResultModal | `ResultModal.tsx` | Win/lose result modal |
| RouletteSpinModal | `RouletteSpinModal.tsx` | Spinning animation modal |
| FullscreenGameModal | `FullscreenGameModal.tsx` | Fullscreen game view |
| SlotMachinePreview | `SlotMachinePreview.tsx` | Slot machine preview |
| CryptoIcon | `CryptoIcon.tsx` | Cryptocurrency token icons |

#### Hooks

**Location:** `src/app/games/roulette/hooks/`

| Hook | File | Purpose |
|------|------|---------|
| useRouletteSpin | `useRouletteSpin.ts` | Spin logic and state |
| useGameStats | `useGameStats.ts` | Game statistics tracking |

---

### Updates Page

**Route:** `/updates`
**File:** `src/app/updates/page.tsx`

#### Components

**Location:** `src/app/updates/components/`

| Component | File | Description |
|-----------|------|-------------|
| UpdatesHeader | `UpdatesHeader.tsx` | Page header |
| UpdateEntry | `UpdateEntry.tsx` | Version update card |

#### Potential Components to Extract

| Component | Description |
|-----------|-------------|
| VersionBadge | Version number badge |
| ChangeList | List of changes |
| UpdateTimestamp | Date/time display |

---

### Error Logging Test Page

**Route:** `/error-logging-test`
**File:** `src/app/error-logging-test/page.tsx`

This is a development/testing page for the error logging system.

#### Current Inline Sections

| Section | Description | Potential Component |
|---------|-------------|---------------------|
| TestScenarioCard | Test scenario trigger button | `TestScenarioCard` |
| ErrorLogPreview | Error log display | `ErrorLogPreview` |

#### Imported Components

| Component | Source |
|-----------|--------|
| TransactionModal | `@/components/TransactionModal` |

---

## Summary Statistics

### Component Count by Location

| Location | Count |
|----------|-------|
| Shared Components (`/src/components/`) | 41 (+5 action components) |
| **Token Page System (`/src/components/token-page/`)** | **15 components (NEW)** |
| Dashboard | 11 components (+2 deprecated), 4 hooks |
| Staking | 8 components (refactored to use shared), 5 hooks |
| Swap | 12 components, 8 hooks |
| DGKO | **2 files (page + config)** ⬇️ from 12 |
| BABYDGKO | **2 files (page + config)** ⬇️ from 12 |
| Documentation | 15 components |
| Games Hub | 5 inline sections |
| Roulette | 11 components, 2 hooks |
| Updates | 2 components |
| Error Test | 1 imported, 2 inline |

### Total Counts

| Category | Count |
|----------|-------|
| **Shared Components** | 56 (includes token-page system) |
| **Page-Specific Components** | 63 (reduced from 85) |
| **Custom Hooks** | 20 |
| **TOTAL COMPONENTS** | ~139 |

### Token Page System Consolidation (Dec 6, 2025) ⭐ NEW

**Problem:** DGKO and BABYDGKO pages had 90% identical components (22 duplicate files).

**Solution:** Config-driven `TokenPage` component system.

**Before:**
- DGKO: 11 components + 1 hook = 12 files
- BABYDGKO: 11 components + 1 hook = 12 files
- Total: 24 files with ~90% duplication

**After:**
- DGKO: 1 page + 1 config = 2 files
- BABYDGKO: 1 page + 1 config = 2 files
- Shared: 15 reusable components in `/src/components/token-page/`
- Total: 19 files, **0% duplication**

**Benefits:**
1. **Maintainability:** Single source of truth for token page logic
2. **Scalability:** Add unlimited tokens with just 2 config files
3. **Consistency:** All token pages use identical UI patterns
4. **Type Safety:** Full TypeScript support via `TokenPageConfig`
5. **Code Quality:** Eliminated 90% duplication

**Adding a New Token:**
```tsx
// 1. Create config: src/app/newtoken/config/token.config.tsx
export const newtokenConfig: TokenPageConfig = { ... };

// 2. Create page: src/app/newtoken/page.tsx (9 lines)
import { TokenPage } from '@/components/token-page';
import { newtokenConfig } from './config/token.config';

export default function NewTokenPage() {
  return <TokenPage config={newtokenConfig} />;
}
```

### Cleanup Tasks (After Testing)

**Files to delete (legacy token page components):**
```bash
rm -rf src/app/dgko/components/
rm -rf src/app/dgko/hooks/
rm -rf src/app/babydgko/components/
rm -rf src/app/babydgko/hooks/
rm src/app/swap/components/PriceDisplayExplorations.tsx
rm src/app/swap/components/TableDesignExplorations.tsx
```

### New Components Added (Dec 5, 2025)

The following reusable components were created during dashboard refactoring:

| Component | Purpose | Reuse Potential |
|-----------|---------|-----------------|
| EmptyStateCard | Empty states, connect wallet prompts, onboarding | High - all pages |
| GuideItem | Horizontal guide items with icons | High - guides, features |
| GuideItemList | Grid container for GuideItems | Medium - guide sections |

### Components Added (Dec 5, 2025 - Staking Refactor)

| Component | Purpose | Reuse Potential |
|-----------|---------|-----------------|
| RefreshButton | Refresh button with loading state | High - all data cards |
| BalanceRow | Token balance display row | High - staking, swap, dashboard |
| BalanceRowGroup | Container for BalanceRow components | High - balance sections |
| InfoTip | Informational tip/note boxes | High - all pages |
| ActionCardHeader | Card header with title and refresh | High - action cards |

### Previously Added Components (Dec 5, 2025 - Homepage Refactor)

| Component | Purpose | Reuse Potential |
|-----------|---------|-----------------|
| SectionTitle | Section headers with title + description | High - all pages |
| FeatureLinkCard | Feature cards with icon and link | High - landing pages |
| StatsGrid | Statistics display grid | Medium - dashboards, landing |
| RoadmapItem | Timeline milestones | Low - roadmap sections |
| CTASection | Call-to-action sections | High - all pages |
| TokenShowcaseCard | Token showcase with stats | Medium - token pages |
| InfoCard | Centered info cards with icon | High - feature sections |

### Component Reuse Patterns

~~Components shared between DGKO and BABYDGKO pages (could be consolidated):~~

**✅ CONSOLIDATED (Dec 6, 2025)**

All duplicate token page components have been unified into `/src/components/token-page/`:

| Original (duplicate in each page) | Now in token-page/ |
|-----------------------------------|-------------------|
| `OnChainDataGrid` | `OnChainDataGrid.tsx` |
| `TokenActivityCards` | `TokenActivityCards.tsx` |
| `StakingOverviewCard` | `StakingOverviewCard.tsx` |
| `TokenomicsSection` | `TokenomicsSection.tsx` |
| `TokenDetailsAndTradeSection` | `TokenDetailsSection.tsx` |
| `EcosystemGrid` | `EcosystemGrid.tsx` |
| `EcosystemCard` | `EcosystemCard.tsx` |
| `RoadmapSection` | `RoadmapSection.tsx` |
| `CommunitySection` | `CommunitySection.tsx` |
| `CTASection` | `CTASection.tsx` |
| `DGKOHeader`/`BABYDGKOHeader` | `TokenPageHeader.tsx` |
| `useTokenStats` (duplicate) | `useTokenStats.ts` (generic) |

**Result:** Config-driven architecture where all customization is in `token.config.tsx` files.

---

## Architecture Notes

### Modular Architecture Pattern

Each page follows this structure:

```
src/app/[page]/
├── page.tsx           # Main page component
├── components/        # Page-specific components
├── hooks/             # Page-specific hooks
├── config/            # Configuration and constants
└── types/             # TypeScript types
```

### Component Design Principles

1. **Single Responsibility** - Each component does one thing well
2. **Props-Driven** - Configuration via props, not internal state
3. **Composable** - Small components compose into larger ones
4. **Type-Safe** - Full TypeScript coverage
5. **Accessible** - Semantic HTML and ARIA attributes

### Styling Approach

- **Tailwind CSS** - Utility-first styling
- **Glass Morphism** - Consistent `glass` and `glass-hover` classes
- **Responsive** - Mobile-first with `md:` and `lg:` breakpoints
- **Animations** - Consistent transition durations (300ms, 500ms)

---

## Related Documentation

- [DESIGN_PHILOSOPHY.md](./DESIGN_PHILOSOPHY.md) - Design principles
- [MODULAR_ARCHITECTURE.md](./dev/architecture/MODULAR_ARCHITECTURE.md) - Architecture patterns
- [RESPONSIVE_DESIGN_SYSTEM.md](./dev/architecture/RESPONSIVE_DESIGN_SYSTEM.md) - Responsive guidelines
- [PROJECT_RULES.md](../public/docs/PROJECT_RULES.md) - Development rules

---

*Document generated: December 6, 2025*

---

## Recent Refactoring

### Token Page System Consolidation (Dec 6, 2025) ⭐ MAJOR

**Goal:** Eliminate 90% code duplication between DGKO and BABYDGKO token pages by creating a unified, config-driven component system.

**Problem Identified:**
- DGKO and BABYDGKO had 22 nearly identical files
- Only differences: token names, asset IDs, precision, content text
- Any bug fix or feature required updating both pages

**Solution: Config-Driven Architecture**

Created `/src/components/token-page/` with 15 shared components:

| Component | Purpose |
|-----------|---------|
| `TokenPage.tsx` | Main orchestrator |
| `TokenPageHeader.tsx` | Header with token image |
| `StakingOverviewCard.tsx` | Staking stats |
| `TokenActivityCards.tsx` | Activity metrics |
| `TokenomicsSection.tsx` | Donut chart + legend |
| `OnChainDataGrid.tsx` | Configurable metrics grid |
| `EcosystemGrid.tsx` | Feature grid |
| `EcosystemCard.tsx` | Individual feature |
| `RoadmapSection.tsx` | Roadmap timeline |
| `TokenDetailsSection.tsx` | Token info + exchanges |
| `CommunitySection.tsx` | Social links |
| `CTASection.tsx` | Call to action |
| `useTokenStats.ts` | Generic blockchain hook |
| `types.ts` | TypeScript interfaces |
| `index.ts` | Exports |

**Token Pages Now:**

```tsx
// src/app/dgko/page.tsx (9 lines)
import { TokenPage } from '@/components/token-page';
import { dgkoConfig } from './config/token.config';

export default function DGKOPage() {
  return <TokenPage config={dgkoConfig} />;
}
```

**Results:**
- **Before:** 24 files with 90% duplication
- **After:** 19 files with 0% duplication
- **Adding new token:** Create 2 files (page + config)

**Files Created:**
- `src/components/token-page/` (15 files)
- `src/app/dgko/config/token.config.tsx`
- `src/app/babydgko/config/token.config.tsx`

**Files to Delete (after testing):**
- `src/app/dgko/components/` (11 files)
- `src/app/dgko/hooks/` (1 file)
- `src/app/babydgko/components/` (11 files)
- `src/app/babydgko/hooks/` (1 file)

**Additional Cleanup:**
- Deleted `src/app/swap/components/PriceDisplayExplorations.tsx`
- Deleted `src/app/swap/components/TableDesignExplorations.tsx`
- Fixed `src/app/swap/components/HowItWorksSection.tsx` to use InfoCard pattern
- Fixed `src/components/ui/index.ts` duplicate TOKEN_IDS export

---

### Token Page Refactoring (Dec 5, 2025)

**Goal:** Extract common patterns from DGKO token page into shared components for reuse across token pages and the platform.

**New Shared Components Created:**

| Component | Purpose | Location |
|-----------|---------|----------|
| `PageHeader` | Page header with optional icon/image and description | `@/components/PageHeader.tsx` |
| `MetricCard` | Activity card with icon, label, value, description | `@/components/MetricCard.tsx` |
| `MetricCardGrid` | Responsive grid container for MetricCards | `@/components/MetricCard.tsx` |
| `DataGrid` | Section with title and data grid items | `@/components/DataGrid.tsx` |
| `DataGridItem` | Single data item card with label, value, action | `@/components/DataGrid.tsx` |
| `SocialLinks` | Community/social media links section | `@/components/SocialLinks.tsx` |
| `DonutChart` | Animated donut chart for distributions | `@/components/DonutChart.tsx` |
| `DonutChartLegend` | Legend items for DonutChart | `@/components/DonutChart.tsx` |

**DGKO Components Refactored:**

| Component | Changes |
|-----------|---------|
| `DGKOHeader` | Now uses shared `PageHeader` component |
| `CTASection` | Now uses shared `CTASection` component (with external link support) |
| `CommunitySection` | Now uses shared `SocialLinks` component |
| `TokenActivityCards` | Now uses `MetricCard` and `MetricCardGrid` |
| `OnChainDataGrid` | Now uses `DataGrid` and `DataGridItem` |
| `TokenomicsSection` | Now uses shared `DonutChart` and `DonutChartLegend` |
| `RoadmapSection` | Now uses shared `RoadmapItem` component |
| `EcosystemCard` | Now uses shared `StatusBadge` component |

**Shared Components Updated:**

| Component | Changes |
|-----------|---------|
| `CTASection` | Added `external` prop to CTAAction for external links |

**Components Removed (now using shared):**

| Component | Replaced By |
|-----------|-------------|
| `src/app/dgko/components/DonutChart.tsx` | `@/components/DonutChart.tsx` |

**Benefits:**
1. **Reusability:** Components can be used on BABYDGKO and other token pages
2. **Consistency:** Same patterns across all token pages
3. **Maintainability:** Single source of truth for each pattern
4. **Design System:** All components showcased with real code examples

**Related Files:**
- `src/components/PageHeader.tsx` - New component
- `src/components/MetricCard.tsx` - New component
- `src/components/DataGrid.tsx` - New component
- `src/components/SocialLinks.tsx` - New component
- `src/components/DonutChart.tsx` - New component
- `src/components/ui/index.ts` - Updated exports
- `src/components/CTASection.tsx` - Updated to support external links
- `src/app/dgko/components/*.tsx` - Refactored components
- `src/app/admin/design-system/sections/CardsSection.tsx` - Added showcases
- `docs/COMPONENTS.md` - Updated documentation

---

### Staking Page Refactoring (Dec 5, 2025)

**Goal:** Extract common patterns from staking cards into shared components for reuse across the platform.

**New Shared Components Created:**

| Component | Purpose | Location |
|-----------|---------|----------|
| `RefreshButton` | Refresh button with loading state | `@/components/RefreshButton.tsx` |
| `BalanceRow` | Token balance display row | `@/components/BalanceRow.tsx` |
| `BalanceRowGroup` | Container for BalanceRow components | `@/components/BalanceRow.tsx` |
| `InfoTip` | Informational tip boxes | `@/components/InfoTip.tsx` |
| `ActionCardHeader` | Card header with title and refresh | `@/components/ActionCardHeader.tsx` |

**Staking Components Refactored:**

| Component | Changes |
|-----------|---------|
| `StakeCard` | Now uses `ActionCardHeader`, `BalanceRow`, `BalanceRowGroup` |
| `RewardsCard` | Now uses `ActionCardHeader`, `InfoTip` |
| `UnstakingCard` | Now uses `ActionCardHeader`, `InfoTip` |
| `HowItWorksSection` | Now uses `SectionTitle`, `InfoCard` (with align="left") |
| `StakingStatsGrid` | Now uses `Card` component |

**Benefits:**
1. **Consistency:** Same refresh button, balance display, info tips across all pages
2. **Maintainability:** Single source of truth for each pattern
3. **Reduced code:** Staking cards are simpler and more focused
4. **Design System:** Components showcased with real code examples

**Related Files:**
- `src/components/RefreshButton.tsx` - New component
- `src/components/BalanceRow.tsx` - New component
- `src/components/InfoTip.tsx` - New component
- `src/components/ActionCardHeader.tsx` - New component
- `src/components/ui/index.ts` - Updated exports
- `src/app/staking/components/*.tsx` - Refactored components
- `src/app/admin/design-system/sections/CardsSection.tsx` - Added showcases

---

### Dashboard Refactoring (Dec 5, 2025)

**Goal:** Identify reusable patterns and consolidate into shared components.

**New Shared Components Created:**

| Component | Purpose | Location |
|-----------|---------|----------|
| `EmptyStateCard` | Empty state/prompt card with icon, title, description, action | `@/components/EmptyStateCard.tsx` |
| `GuideItem` | Horizontal guide item with icon, title, description, optional link | `@/components/GuideItem.tsx` |
| `GuideItemList` | Grid container for GuideItems | `@/components/GuideItem.tsx` |

**Dashboard Changes:**

| Before | After |
|--------|-------|
| Inline connect wallet prompt (35 lines) | `EmptyStateCard` component (1 line) |
| Custom guide items in QuickGuideSection | `GuideItem` component |
| Custom feature cards in DocumentationSection | `GuideItem` component |
| `DashboardHeader` component | **Deprecated** - use `SectionTitle` |
| `FeatureCard` (dashboard version) | **Deprecated** - use `GuideItem` |

**Components Added to Design System:**
- `EmptyStateCard` - with Connect Wallet and Empty State examples
- `GuideItem` - with Basic, With Link, and Grid examples

**Benefits:**
1. **Consistency:** Same patterns across all pages
2. **Maintainability:** Single source of truth for each pattern
3. **Reduced code:** Dashboard page is now simpler
4. **Design System:** Components showcased with real code examples

**Related Files:**
- `src/components/EmptyStateCard.tsx` - New component
- `src/components/GuideItem.tsx` - New component
- `src/components/ui/index.ts` - Updated exports
- `src/app/dashboard/page.tsx` - Refactored
- `src/app/dashboard/components/QuickGuideSection.tsx` - Refactored
- `src/app/dashboard/components/DocumentationSection.tsx` - Refactored
- `src/app/admin/design-system/sections/CardsSection.tsx` - Added showcases

---

### Swap Page Refactoring (Dec 5, 2025)

**Goal:** Extract the swap interface into a reusable shared component for use across the platform.

**New Shared Components Created:**

| Component | Purpose | Location |
|-----------|---------|----------|
| `SwapCard` | Uniswap-inspired token swap interface with glass morphism | `@/components/SwapCard.tsx` |

**Swap Page Changes:**

| Before | After |
|--------|-------|
| `UniswapStyleSwap` (240 lines) - full implementation | `UniswapStyleSwap` (130 lines) - wrapper around `SwapCard` |
| All swap UI logic embedded in page component | Core swap UI extracted to reusable `SwapCard` |
| Not reusable for other token pairs | `SwapCard` can be used for any token swap |

**Components Added to Design System:**
- `SwapCard` - Added to FormsSection with Basic, Disconnected, and Error State examples

**SwapCard Features:**
- Sell/Buy token input cards with glass morphism
- Flip direction button
- Balance display with MAX button
- USD value display
- Connect wallet / Swap button states
- Error message display
- Customizable token selectors
- Custom footer content (e.g., fee modal trigger)

**Benefits:**
1. **Reusability:** SwapCard can be used for any token pair swap
2. **Maintainability:** Core swap UI in single source of truth
3. **Consistency:** Same swap interface pattern across platform
4. **Design System:** Component showcased with real code examples

**Related Files:**
- `src/components/SwapCard.tsx` - New shared component
- `src/components/ui/index.ts` - Updated exports
- `src/app/swap/components/UniswapStyleSwap.tsx` - Refactored to use SwapCard
- `src/app/admin/design-system/sections/FormsSection.tsx` - Added SwapCard showcases
- `docs/COMPONENTS.md` - Updated documentation
