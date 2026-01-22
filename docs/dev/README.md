# Digiko Internal Development Documentation
## 🔒 CONFIDENTIAL - For Development Use Only

**Project:** Digiko Web3 DApp  
**Blockchain:** Klever  
**Framework:** Next.js 15 + TypeScript + Tailwind CSS  
**Last Updated:** January 19, 2026  
**Version:** 1.21.0 (DEXscan Integration + Digiko AI v2)

---

## 📚 Documentation Structure

This documentation is split into focused files for easier navigation:

### **Core Documentation**

1. **[🔧 Klever Integration](KLEVER_INTEGRATION.md)**
   - Critical addresses & asset IDs
   - Token configuration (DGKO, BABYDGKO, USDT)
   - Klever SDK integration patterns
   - Transaction workflows (stake, swap, claim)
   - API routes & CORS handling

2. **[📜 Smart Contract Development](smart-contracts/CONTRACT_DEVELOPMENT.md)**
   - Contract structure & setup
   - Build process & configuration
   - Deployment guide (testnet & mainnet)
   - **ABI Encoding for Function Calls** ⭐ NEW (Dec 4, 2025)
   - **Frontend Integration Challenges** ⚠️ NEW
   - Lessons learned & debugging

2a. **[🔐 ABI Encoding Guide](smart-contracts/ABI_ENCODING_GUIDE.md)** ⭐ **NEW - VALIDATED BY KLEVER**
   - Official encoding patterns (confirmed by Klever team)
   - Parameterless functions (our swap functions)
   - Functions with parameters (future admin functions)
   - Complete examples & troubleshooting
   - Reference implementation (Crowdfunding dApp)
   - Type mappings & common mistakes

3. **[🌐 Klever APIs Complete Guide](KLEVER_API_COMPARISON.md)** ⭐ **NEW - START HERE**
   - **[API Comparison](KLEVER_API_COMPARISON.md)** - Proxy vs Node vs SDK
   - **[Proxy API Overview](KLEVER_PROXY_API_OVERVIEW.md)** - 80+ endpoints (analytics)
   - **[Node Server API](KLEVER_NODE_SERVER_API.md)** - 38 endpoints (direct access)
   - **[Smart Contract Queries](KLEVER_PROXY_SMART_CONTRACTS.md)** - Query via HTTP
   - **[Staking Endpoints](KLEVER_PROXY_STAKING.md)** - Rewards & claims
   - **[DEX & Pools](KLEVER_PROXY_DEX.md)** - Pool data for swaps
   - **[Action Plan](KLEVER_PROXY_API_SUMMARY.md)** - Implementation guide
   - Specs: `contract/klever-proxy-api-spec.json` + `klever-node-api-spec.json`
   - Revolutionary: HTTP alternatives to SDK for many operations

3a. **[📊 DEXscan API Integration](DEXSCAN_INTEGRATION.md)** ⭐ **NEW - Jan 2026**
   - VIEW PRICES from aggregated market data (Digiko, Swopus, SAME Dex)
   - Two-price system: VIEW PRICE (display) vs RESERVE PRICE (execution)
   - TanStack Query hooks for client-side usage
   - API routes for server-side fetching
   - Price comparison utilities for arbitrage detection
   - Config: `src/config/dexscan.ts`

4. **[🏗️ Modular Architecture](architecture/MODULAR_ARCHITECTURE.md)**
   - Complete guide to page refactoring
   - Directory structure patterns
   - File naming conventions
   - Lessons learned from refactors
   - Reusability strategies
   - **Roadmap Component Redesign** ⭐ NEW
   - Vertical timeline with quarterly milestones

5. **[🎨 Token Images & Logos](reference/TOKEN_IMAGES.md)**
   - Klever API token images
   - Custom logo configuration
   - 3-tier fallback system
   - Troubleshooting guide
   - Best practices

5a. **[🪙 Token Architecture & Precision](TOKEN_ARCHITECTURE.md)** ⭐ **CRITICAL**
   - ⚠️ **MUST update TWO files when adding tokens**
   - `tokens.ts` + `NetworkTokensContext.tsx`
   - Precision/decimals reference table
   - Common bugs & how to avoid them
   - Step-by-step guide for new tokens

6. **[🎨 Design System](DESIGN_SYSTEM.md)**
   - Glass morphism patterns
   - Color palette & typography
   - Component guidelines
   - Animation standards

7. **[🐛 Enhanced Error Logging](ERROR_LOGGING_SYSTEM.md)** ⭐ NEW
   - Comprehensive error capture system
   - Debug mode for testing
   - User-friendly error reporting
   - Complete debugging information
   - Integration patterns & examples

### **Session Documentation (Lessons Learned)**

7a. **[📡 Network Architecture - Dec 11, 2025](lessons/LESSONS_2025_12_11.md)** ⭐ **NEW**
   - Network-aware architecture for testnet/mainnet support
   - 141 hardcoded references refactored to centralized context
   - Telegram notification HTML entity escaping fix
   - KLV rewards discrepancy bug fix (allowance vs stakingRewards)
   - Feature branch workflow for major refactors

7b. **[🔐 KLV Staking & Security - Dec 10, 2025](lessons/LESSONS_2025_12_10.md)** ⭐ **NEW**
   - Complete KLV native staking (buckets, validators, delegation)
   - Critical security audit: Admin password was in source code!
   - PBKDF2 authentication with 100,000 iterations
   - Serverless session persistence challenges
   - Wallet page redesign with flat hierarchy
   - Blog section creation with premium design

7c. **[⚡ Validators Page - Dec 9, 2025](lessons/LESSONS_2025_12_09.md)** ⭐ **NEW**
   - Validator scoring algorithm (5-factor weighted system)
   - Klever API scaling quirks (commission/100, rating/100000)
   - Pagination fix (default limit=10)
   - Bucket size vs validator matching recommendations

7d. **[🎉 PRODUCTION READY - Dec 4, 2025](lessons/LESSONS_2025_12_04.md)**
   - **SWAP PAGE PRODUCTION READY:** 7 major fixes applied
   - SVG gradient ID collision bug (most interesting!)
   - HTML tooltip overlay solution (no more stretched text)
   - Component abstraction vs direct class consistency
   - Klever auto-reconnect anti-pattern removed
   - API consolidation (duplicate endpoints unified)
   - Professional pagination system (10 per page)
   - Complete KLV chart feature parity
   - **BREAKTHROUGH:** Official Klever forum confirmation on ABI encoding
   - Validated encoding patterns for parameterless functions
   - Official reference: Crowdfunding dApp example
   - Clear path for future admin functions with parameters

8. **[🔥 CRITICAL LESSONS - Dec 1, 2025](lessons/LESSONS_2025_12_01.md)** ⭐ **MUST READ**
   - **MAJOR BUG FIX:** Contract bug preventing KLV → DGKO swaps discovered and fixed!
   - Native KLV vs KDA token distinction (critical learning)
   - Transaction history analysis technique
   - Complete debugging journey (10+ attempts)
   - Contract upgrade on mainnet
   - First successful KLV → DGKO swap
   - Full bi-directional DEX now operational
   - Comprehensive technical documentation
   - One of the most critical sessions in Digiko history

9. **[🚀 BREAKTHROUGH - Nov 30, 2025](LESSONS_2025_11_30.md)** 
   - ~~BREAKTHROUGH: Swap smart contract now working!~~ (Partial - only DGKO → KLV)
   - First successful mainnet swap transaction (DGKO → KLV)
   - callValue payload structure discovery (map vs array)
   - Real-time reserve fetching implementation
   - SetAccountName investigation & limitations
   - Browser console import errors & solutions
   - KleverScan verification feature discovery
   - **UPDATE:** Dec 1 revealed KLV → DGKO was broken - see Dec 1 lessons

10. **[📝 DEX Frontend Integration Attempts](SESSION_2025-11-27_DEX_Frontend_Integration.md)**
   - Complete chronology of integration attempts
   - Technical barriers encountered
   - Klever Web SDK limitations (overcame on Nov 30)
   - Protobuf encoding challenges
   - Decision rationale & path forward
   - 7-hour session detailed breakdown
   - Anti-patterns to avoid
   - **NOTE:** Fully resolved - DEX fully operational as of Dec 1

11. **[🔒 Admin Panel](ADMIN_PANEL.md)**
   - Security implementation
   - Password management
   - Session handling
   - Admin features
   - Localhost-only access

7. **[🐛 Troubleshooting](TROUBLESHOOTING.md)**
   - Common bugs & solutions
   - Build errors & fixes
   - API issues
   - Klever SDK problems
   - Next.js quirks

8. **[💻 Development Guide](DEVELOPMENT_GUIDE.md)**
   - Code patterns & conventions
   - Git workflow
   - File organization
   - Testing checklist
   - Deployment procedures

---

## 🚀 Quick Reference

### Critical Asset IDs
```typescript
DGKO:     'DGKO-CXVJ'      // 4 decimals (10000)
BABYDGKO: 'BABYDGKO-3S67'  // 8 decimals (100000000)
USDT:     'USDT-ODW7'      // 6 decimals (1000000)
```

### Network Endpoints
```typescript
Mainnet:    'https://api.mainnet.klever.org'
Testnet:    'https://api.testnet.klever.org'
DEXscan:    'https://api.dexscan.klever.io'  // VIEW PRICES
```

### Platform Addresses
```typescript
Fee Address: 'klv1slqck0vnxuj9uk0dp6rcv00xv2exnv3wcpf3286jquu79czyxw9qccyyrn'
DGKO Pool:   'klv1pvckvh3yshmjulq4ntnkd0rmf94la6c37ykswvrcm5sy03neh3lq8dnv2h'
```

### Environment Variables
```bash
# .env.local
DEXSCAN_API_KEY=your_api_key_here
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...
```

### Key Commands
```bash
# Development
npm run dev              # Start dev server
npm run build            # Production build
rm -rf .next             # Clear cache (important!)

# Contract Build
cd contract/meta
cargo run build          # Build smart contract
cargo run clean          # Clean build artifacts

# Git Workflow
git add .
git commit -m "type(scope): message"
git push

# Testing
open http://localhost:3000/[page]
# Check browser console
# Verify Network tab
```

### App Configuration (Centralized)
**Location:** `src/config/app.ts`

```typescript
export const APP_CONFIG = {
  version: '0.20.2',
  name: 'Digiko',
  status: 'Beta',
  network: 'Testnet',
  platformDisplay: 'Digiko v0.20.2',  // getter
  versionDisplay: 'v0.20.2',          // getter
}
```

**Usage:**
```typescript
import { APP_CONFIG } from '@/config/app';

// Automatic updates everywhere:
<p>{APP_CONFIG.versionDisplay}</p>  // "v0.20.2"
<p>{APP_CONFIG.name}</p>             // "Digiko"
<p>{APP_CONFIG.status}</p>           // "Beta"
<p>{APP_CONFIG.network}</p>          // "Testnet"
```

**Benefits:**
- ✅ Update version once → reflects in 6 locations automatically
- ✅ No missed updates (navigation, footer, admin, dashboard, menus)
- ✅ Type-safe with TypeScript
- ✅ Consistent app info across entire platform

**When releasing new version:** Only edit `src/config/app.ts`

---

## 📦 Project Structure

```
digiko/
├── contract/                      # 📜 Smart contracts
│   ├── src/
│   │   └── lib.rs                 # Main contract logic
│   ├── wasm/                      # WASM build
│   ├── meta/                      # Build system
│   ├── output/                    # Compiled contracts
│   │   ├── digiko-swap.wasm       # Contract bytecode
│   │   └── digiko-swap.abi.json   # Contract interface
│   ├── README.md                  # Contract docs
│   ├── INTEGRATION.md             # Frontend integration
│   └── Cargo.toml                 # Rust package config
│
├── docs/
│   ├── dev/                       # 📚 Development docs (you are here)
│   │   ├── README.md              # Main index
│   │   ├── CONTRACT_DEVELOPMENT.md # 📜 Smart contract guide
│   │   ├── MODULAR_ARCHITECTURE.md
│   │   ├── KLEVER_INTEGRATION.md
│   │   ├── DESIGN_SYSTEM.md
│   │   ├── ADMIN_PANEL.md
│   │   ├── TROUBLESHOOTING.md
│   │   └── DEVELOPMENT_GUIDE.md
│   └── [other]/                   # Other documentation
│
├── src/
│   ├── app/                       # Next.js pages
│   │   ├── staking/               # ✅ MODULAR (15 files)
│   │   ├── dgko/                  # ✅ MODULAR (16 files)
│   │   ├── babydgko/              # ✅ MODULAR (16 files)
│   │   ├── swap/                  # ✅ MODULAR (13 files)
│   │   ├── dashboard/             # ✅ MODULAR (6 files)
│   │   ├── updates/               # ✅ MODULAR (5 files)
│   │   ├── documentation/         # ✅ MODULAR (7 files)
│   │   ├── admin/                 # ✅ MODULAR (6 files) 🔒 Password protected
│   │   └── ...
│   ├── components/                # Reusable components
│   ├── config/                    # 🆕 App configuration
│   │   └── app.ts                 # Version, name, status, network
│   ├── context/                   # State management
│   └── utils/                     # Utilities
│
├── design_guide.md                # v1.7 Design reference
└── package.json                   # Dependencies
```

---

## 🎯 Current Status (v1.21.0 - DEXscan Integration + Digiko AI v2)

### ✅ v1.21.0 Updates (Jan 19, 2026) 🚀

**DEXscan API Integration**
- VIEW PRICES from aggregated market data across 3 DEXes
- Two-price architecture: VIEW (display) vs RESERVE (execution)
- TanStack Query hooks: `useViewPrices()`, `useDexScanToken()`
- API routes: `/api/dexscan/overview`, `/api/dexscan/view-prices`
- Price comparison utilities for arbitrage detection
- Config: `src/config/dexscan.ts` | Types: `src/types/dexscan.ts`

**Digiko AI v2**
- Pool vs market rate comparison using DEXscan data
- Reverse direction analysis: "Selling CTR for DGKO works better here"
- Slippage detection: "Both directions bad = liquidity issue"
- Fee-adjusted quality assessment
- Stablecoin context awareness
- Historical 7-day average fallback

**Files:**
```
src/config/dexscan.ts           # API config, thresholds
src/types/dexscan.ts            # TypeScript types
src/lib/dexscan.ts              # Server-side client
src/hooks/useDexScan.ts         # TanStack Query hooks
src/app/api/dexscan/            # API routes
src/app/swap/components/DigikoAICard.tsx  # AI component
src/app/swap/hooks/useSwapAnalysis.ts     # Analysis logic
src/app/swap/hooks/useViewPriceComparison.ts  # DEXscan comparison
```

### ✅ v1.20.0 Updates (Jan 2026)

**Pool Page Redesign**
- 2-column layout: Position + Fees | Add + Remove
- Always-visible cards with contextual empty states
- Progressive disclosure - no more full-page wallet blockers
- Connect Wallet button pattern in action cards

**Mobile Bottom Navigation**
- App-style 5-icon bottom nav
- Wallet, Staking, Swap, Games, Menu
- Fixed position at bottom on mobile
- Replaces floating burger menu

**UX Patterns Documented**
- Progressive Disclosure principle added to Design Philosophy
- Always-Visible Card pattern in Design System
- Connect Wallet UX pattern documented

### ✅ V3 DEX Launch (Dec 2025) 🚀

**Multi-Pair DEX V3**
- Community liquidity - anyone can become an LP
- Multiple trading pairs (DGKO/KLV, BABYDGKO/KLV planned)
- Fee distribution: LPs earn 0.9% of swap fees
- Pool page (/pool) for LP management
- Pair selector on swap page

**Pool System**
- 3-step pending deposit system (Klever limitation workaround)
- Add/remove liquidity at any time
- Fee claiming interface
- Share tracking and proportional rewards

**Testnet Validation**
- Complete test coverage with 3 accounts (YYRN, NYTM, ENF3)
- Share calculations validated
- Fee distribution verified
- All LP flows tested

### ✅ Previously Completed

**KLV Native Staking**
- Complete bucket management (stake, delegate, undelegate, unstake, withdraw)
- Validator selection with scoring algorithm
- Epoch-based reward claiming

**Network-Aware Architecture**
- Centralized NetworkTokensContext for testnet/mainnet
- Dynamic token ID resolution
- Both testnet and mainnet contracts deployed

### 🎯 Coming Next
- BABYDGKO/KLV pair launch
- Additional trading pairs
- LP analytics dashboard

---

## 🔥 Most Important Things

### 1. File Extensions Matter!
```typescript
// ❌ WRONG
config/icons.ts  // Contains JSX

// ✅ CORRECT
config/icons.tsx // Contains JSX
```

### 2. Always Clear Cache
```bash
rm -rf .next  # After any structural changes!
```

### 3. Asset IDs Must Be Exact
```typescript
'DGKO-CXVJ'  // ✅ Correct
'DGKO'       // ❌ Won't work
```

### 4. Precision Is Critical
```typescript
DGKO:     value / 10000      // 4 decimals
BABYDGKO: value / 100000000  // 8 decimals
```

### 5. Main Files Should Be Small
```
Target:  50-200 lines (orchestrator only)
Maximum: 300 lines
If larger: Refactor to modular
```

---

## 🆘 Need Help?

**Find It Fast:**
- Klever issues? → [KLEVER_INTEGRATION.md](KLEVER_INTEGRATION.md)
- Smart contracts? → [CONTRACT_DEVELOPMENT.md](CONTRACT_DEVELOPMENT.md)
- Refactoring? → [MODULAR_ARCHITECTURE.md](MODULAR_ARCHITECTURE.md)
- Design question? → [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md)
- Build error? → [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
- Code patterns? → [DEVELOPMENT_GUIDE.md](DEVELOPMENT_GUIDE.md)
- Admin stuff? → [ADMIN_PANEL.md](ADMIN_PANEL.md)

---

## 📊 Version History

| Version | Date | Highlights |
|---------|------|------------|
| 0.21.0 | Nov 26, 2025 | Eliminated auto-refresh (4 sources), manual refresh UI, dashboard UX overhaul |
| 0.18.0 | Nov 26, 2025 | Modular architecture (Staking, DGKO), split docs |
| 0.17.0 | Nov 25, 2025 | Admin panel, Design System page |
| 0.16.0 | Nov 25, 2025 | TransactionModal, Legendary UI |
| 0.15.0 | Nov 25, 2025 | Swap feature launch |
| 0.14.0 | Nov 25, 2025 | BABYDGKO page, Tokens dropdown |
| 0.13.0 | Nov 24, 2025 | DGKO page redesign |

---

*This documentation is for internal development use only.*  
*Contains sensitive configuration data.*  
*Last Updated: January 19, 2026 | v1.21.0 (DEXscan Integration + Digiko AI v2)*
