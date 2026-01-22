# Token Pricing System

## Overview

This system provides real-time pricing for all tokens in the Digiko ecosystem.

**SINGLE SOURCE OF TRUTH:** `/src/services/tokenPrices.ts`

**How It Works - Cascading Price Derivation:**
1. **KLV price** is fetched from CoinGecko (external USD anchor)
2. **Tier 1 (KLV pairs):** Tokens with direct KLV pairs get USD price via pool ratio
3. **Tier 2 (DGKO pairs):** Tokens paired with DGKO derive USD via DGKO's price
4. **Tier 3 (BABYDGKO pairs):** Tokens paired with BABYDGKO derive USD via BABYDGKO's price

**Formula:** `Token USD = (Anchor Reserve / Token Reserve) × Anchor USD`

This enables pricing for ANY token that has a pair with KLV, DGKO, or BABYDGKO.

## 🔗 Related Files

| File | Purpose |
|------|---------|
| `/src/app/api/prices/route.ts` | **PRIMARY API** - Redis-cached prices with cascading |
| `/src/services/tokenPrices.ts` | Service layer for client-side price fetching |
| `/src/context/TokenPricesContext.tsx` | React context provider |
| `/src/hooks/useTokenPrices.ts` | React hooks for components |
| `/admin/tokens/prices` | Admin dashboard (shows derivation source) |
| `/src/config/tokens.ts` | Token metadata (decimals, colors) |
| `/src/types/tradingPairs.ts` | Trading pair definitions |

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    PRICE DATA FLOW                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────┐    ┌─────────────────────────────────────────┐ │
│  │  CoinGecko  │───▶│  /src/services/tokenPrices.ts           │ │
│  │  KLV: $X    │    │  (SINGLE SOURCE OF TRUTH)               │ │
│  └─────────────┘    │                                          │ │
│                     │  CASCADING PRICE DERIVATION:             │ │
│  ┌─────────────┐    │  ┌──────────────────────────────────┐   │ │
│  │  DEX Smart  │───▶│  │ Tier 1: KLV pairs (direct USD)  │   │ │
│  │  Contract   │    │  │ Tier 2: DGKO pairs (via DGKO)   │   │ │
│  └─────────────┘    │  │ Tier 3: BABYDGKO pairs          │   │ │
│                     │  └──────────────────────────────────┘   │ │
│                     └──────────────┬──────────────────────────┘ │
│                                    │                             │
│                     ┌──────────────▼──────────────┐              │
│                     │  /api/token-prices          │              │
│                     │  (API Endpoint)             │              │
│                     └──────────────┬──────────────┘              │
│                                    │                             │
│         ┌──────────────────────────┼──────────────────────┐      │
│         │                          │                      │      │
│  ┌──────▼──────┐    ┌──────────────▼─────────┐   ┌───────▼────┐ │
│  │ React Hook  │    │ Admin Dashboard        │   │ Dashboard  │ │
│  │ useAllToken │    │ /admin/tokens/prices   │   │ Components │ │
│  │ Prices()    │    │ (Shows derivation)     │   │            │ │
│  └─────────────┘    └────────────────────────┘   └────────────┘ │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Cascading Price Derivation

**Why Cascading?** Not all tokens have direct KLV pairs. Some founders prefer pairing with DGKO or BABYDGKO first.

**Priority Order:**
1. **Tier 1 (Green):** Token has direct KLV pair → Most accurate
2. **Tier 2 (Blue):** Token has DGKO pair → Uses DGKO's KLV-derived price
3. **Tier 3 (Cyan):** Token has BABYDGKO pair → Uses BABYDGKO's KLV-derived price

**Example - KID Token:**
- KID only has a DGKO/KID pair (no KLV pair)
- DGKO has price from DGKO/KLV pair
- KID price = (DGKO Reserve / KID Reserve) × DGKO USD price

## Quick Start

### 1. Use the Hook (Recommended)

```tsx
'use client';

import { useAllTokenPrices } from '@/hooks/useTokenPrices';

export function MyComponent() {
  const { 
    klvPrice,      // KLV price data
    tokenPrices,   // All DEX token prices
    loading,       // Loading state
    error,         // Error message
    getPriceUSD,   // Helper: get USD price by assetId
    calculateUSD,  // Helper: calculate USD value
    refresh        // Manual refresh function
  } = useAllTokenPrices();

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <p>KLV: ${klvPrice?.priceUSD.toFixed(6)}</p>
      <p>DGKO: ${getPriceUSD('DGKO-CXVJ').toFixed(8)}</p>
      <p>100 DGKO = ${calculateUSD('DGKO-CXVJ', 100).toFixed(2)}</p>
    </div>
  );
}
```

### 2. Use the API

```bash
# Get all token prices (uses Redis cache)
curl http://localhost:3000/api/prices

# Force refresh (clears Redis cache)
curl http://localhost:3000/api/prices?refresh=true
```

### 3. API Response Format

```json
{
  "prices": {
    "KLV": { "priceUsd": 0.00160323, "priceKlv": 1 },
    "DGKO": { "priceUsd": 0.000792, "priceKlv": 0.494, "pairId": 1, "derivedFrom": "KLV" },
    "KID": { "priceUsd": 0.01877, "priceKlv": 11.71, "pairId": 12, "derivedFrom": "DGKO" }
  },
  "updatedAt": "2025-12-21T07:45:00.000Z",
  "network": "mainnet",
  "source": "fresh"
}
```

## Price Calculation Formula

```
Token_USD_Price = (KLV_Reserve / Token_Reserve) × KLV_USD_Price
```

**Example:**
- Pool has: 20,000 KLV and 100,000 DGKO
- KLV price: $0.002903
- DGKO price = (20,000 / 100,000) × $0.002903 = **$0.0005806**

**With precision handling:**
```typescript
// Raw values from blockchain (with token precision applied)
klvReserve = 20000000000     // 20k KLV × 10^6
dgkoReserve = 1000000000000  // 100k DGKO × 10^4

// Service handles conversion automatically
const price = await fetchTokenPrice('DGKO-CXVJ');
console.log(price.priceUSD); // 0.0005806
```

## Adding New Tokens

Tokens are added automatically when you create a new trading pair:

1. Go to **Admin → Trading Pairs**
2. Click **Add Pair**
3. Configure the pair (base token, quote token, contract)
4. The token will automatically appear in prices

**The price service automatically:**
- Finds all active trading pairs
- Fetches reserves from the smart contract
- Calculates USD prices using the KLV anchor

## Caching

| Layer | Cache TTL | Notes |
|-------|-----------|-------|
| Redis (Upstash) | 5 min | Primary cache for API |
| HTTP Response | 60s | `s-maxage=60, stale-while-revalidate=300` |
| CoinGecko | Rate limited | 30 requests/min |

**Force refresh:**
```bash
# Clear Redis cache and fetch fresh
curl http://localhost:3000/api/prices?refresh=true
```

**From React:**
```typescript
import { useTokenPricesContext } from '@/context/TokenPricesContext';

const { refresh } = useTokenPricesContext();
await refresh(); // Fetches from API (uses Redis cache)
```

## Hooks Reference

### useAllTokenPrices (Recommended)

```typescript
const {
  klvPrice,       // TokenPriceData | null
  tokenPrices,    // TokenPriceData[]
  loading,        // boolean
  error,          // string | null
  refresh,        // () => Promise<void>
  getPrice,       // (assetId: string) => TokenPriceData | undefined
  getPriceUSD,    // (assetId: string) => number
  calculateUSD,   // (assetId: string, amount: number) => number
} = useAllTokenPrices(autoRefresh?, enabled?);
```

### useTokenPrice (Single Token)

```typescript
const {
  price,    // TokenPriceData | null
  loading,  // boolean
  error,    // string | null
  refresh,  // () => Promise<void>
} = useTokenPrice('DGKO-CXVJ');
```

### useKLVPrice (KLV Only)

```typescript
const {
  price,          // number
  priceChange24h, // number | null
  loading,        // boolean
  error,          // string | null
  refresh,        // () => Promise<void>
} = useKLVPrice();
```

## Troubleshooting

### "Token showing $0.00"
1. **Check cascading chain:** Token needs a pair with KLV, DGKO, or BABYDGKO
2. **Verify pair is active:** Check Admin → Trading Pairs
3. **Clear Redis cache:** Visit `/api/prices?refresh=true`
4. **Check console logs:** Look for `Processing Tier X` messages

### "No price for new token"
- Token must have a trading pair with one of: KLV, DGKO, or BABYDGKO
- If paired with DGKO, DGKO must have a KLV pair first
- Add the pair in Admin → Trading Pairs

### "Pool reserves are zero"
- The liquidity pool may be empty
- Check the pair's contract on KleverScan
- Verify the `getPairInfoPairX` function is returning data

### "Stale prices"
- Redis cache TTL is 5 minutes
- Force refresh: `/api/prices?refresh=true`
- Check if CoinGecko rate limit was hit

## Files Structure

```
src/
├── app/api/
│   └── prices/
│       └── route.ts            # ← PRIMARY API (Redis-cached, cascading)
├── context/
│   └── TokenPricesContext.tsx  # React context provider
├── services/
│   └── tokenPrices.ts          # Service layer (client-side)
├── hooks/
│   └── useTokenPrices.ts       # React hooks
├── app/admin/tokens/prices/
│   └── page.tsx                # Admin dashboard (shows derivation)
├── config/
│   └── tokens.ts               # Token metadata
└── types/
    └── tradingPairs.ts         # Trading pair types
```

---

**Pro tip:** The admin dashboard at `/admin/tokens/prices` shows the derivation source for each token (via KLV, via DGKO, or via BABYDGKO) with color coding.
