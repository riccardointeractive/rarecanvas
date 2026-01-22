# DEXscan API Integration

## Overview

This integration adds **VIEW PRICES** from DEXscan - aggregated market data from multiple Klever DEXes (Digiko, Swopus, SAME Dex).

## Two Price System

| Type | Source | Use Case |
|------|--------|----------|
| **VIEW PRICE** | DEXscan (this integration) | Display, portfolio, charts, market comparison |
| **RESERVE PRICE** | Our pool reserves | Actual swap execution |

## Files Created

```
src/
├── config/
│   └── dexscan.ts          # Configuration (API URL, cache TTL, thresholds)
├── types/
│   └── dexscan.ts          # TypeScript types for all responses
├── lib/
│   └── dexscan.ts          # Core API client (server-side)
├── hooks/
│   └── useDexScan.ts       # TanStack Query hooks (client-side)
└── app/api/dexscan/
    ├── overview/route.ts   # GET /api/dexscan/overview
    ├── view-prices/route.ts # GET /api/dexscan/view-prices
    ├── asset/[ticker]/route.ts # GET /api/dexscan/asset/{ticker}
    └── liquidity/route.ts  # GET /api/dexscan/liquidity
```

## Setup Required

### 1. Add API Key to Environment

```bash
# .env.local
DEXSCAN_API_KEY=f5b0193326cadb54572fa5711e25dff8fd760ee845fd1c11d9e3c39f9fb37212
```

Also add to Vercel environment variables for production.

### 2. That's it! The integration is ready to use.

## Usage Examples

### Client-Side (React Components)

```tsx
import { useViewPrices, useDexScanToken, useDexScanOverview } from '@/hooks';

// Get all VIEW PRICES as a map
function PriceDisplay() {
  const { data: prices, isLoading } = useViewPrices();
  
  if (isLoading) return <Spinner />;
  
  return (
    <div>
      <p>DGKO: ${prices?.DGKO?.priceUsd.toFixed(6)}</p>
      <p>24h Change: {prices?.DGKO?.priceChange24h.toFixed(2)}%</p>
    </div>
  );
}

// Get single token data
function TokenStats({ ticker }: { ticker: string }) {
  const { data: token } = useDexScanToken(ticker);
  
  return (
    <div>
      <p>Price: ${token?.price.current}</p>
      <p>TVL: ${token?.liquidity.tvl_usd.toLocaleString()}</p>
      <p>24h Volume: ${token?.volume.usd_24h.toLocaleString()}</p>
    </div>
  );
}

// Get tokens sorted by TVL
function TopTokens() {
  const { data: tokens } = useDexScanTokensSorted('tvl', 'desc');
  
  return (
    <ul>
      {tokens?.slice(0, 10).map(t => (
        <li key={t.ticker}>{t.ticker}: ${t.liquidity.tvl_usd}</li>
      ))}
    </ul>
  );
}
```

### Server-Side (API Routes)

```ts
import { fetchTokensOverview, fetchAssetFull, comparePrices } from '@/lib/dexscan';

// In an API route or server component
const overview = await fetchTokensOverview();
const dgkoData = await fetchAssetFull('DGKO-CXVJ');

// Compare VIEW PRICE with RESERVE PRICE
const comparison = comparePrices(
  'DGKO',
  0.000624,  // VIEW PRICE from DEXscan
  0.000580,  // RESERVE PRICE from our pool
  'DGKO/KLV',
  8056       // Pool TVL
);

console.log(comparison);
// {
//   token: 'DGKO',
//   viewPrice: 0.000624,
//   reservePrice: 0.000580,
//   gapPercent: -7.05,
//   gapDirection: 'below',
//   signal: 'buy',
//   confidence: 'high',
//   reason: 'Trading 7.1% below market price on Digiko'
// }
```

## API Endpoints

### GET /api/dexscan/overview
Returns all tokens with full stats (price, volume, TVL, changes).

### GET /api/dexscan/view-prices
Returns processed VIEW PRICES map keyed by symbol.

### GET /api/dexscan/asset/{ticker}
Returns price for single asset.

### GET /api/dexscan/asset/{ticker}?full=true
Returns full asset data including pools.

### GET /api/dexscan/liquidity
Returns all liquidity pools across DEXes.

## Available Hooks

| Hook | Description |
|------|-------------|
| `useViewPrices()` | VIEW PRICES map - primary for display |
| `useDexScanOverview()` | Full tokens overview |
| `useDexScanToken(ticker)` | Single token from overview |
| `useDexScanAssetPrice(ticker)` | Simple price fetch |
| `useDexScanAssetFull(ticker)` | Full asset with pools |
| `useDexScanLiquidity()` | All pools overview |
| `useDexScanTokensSorted(by, order)` | Sorted tokens list |
| `useDexScanTokensByDex(dex)` | Filter by primary DEX |
| `useKlvViewPrice()` | Just KLV price |
| `useIsTokenTracked(ticker)` | Check if token exists |
| `useInvalidateDexScan()` | Cache invalidation helpers |

## Data Available Per Token

```ts
interface TokenOverviewItem {
  ticker: string;           // "DGKO-CXVJ"
  price: {
    current: number;        // Current USD price
    high_24h: number;
    low_24h: number;
  };
  price_changes: {
    change_30m: number;
    change_1h: number;
    change_4h: number;
    change_24h: number;
  };
  volume: {
    usd_24h: number;        // 24h volume in USD
    tokens_24h: number;     // 24h volume in tokens
  };
  activity: {
    txns_24h: number;       // Transaction count
    makers_24h: number;     // Unique addresses
  };
  liquidity: {
    tvl_usd: number;        // Total value locked
    pools_count: number;    // Number of pools
    primary_dex: string;    // Main DEX for this token
  };
  mcap: number;             // Market cap
}
```

## Next Steps

1. **Add API key** to `.env.local` and Vercel
2. **Test the endpoints** at `/api/dexscan/overview`
3. **Integrate with Digiko AI** for price comparisons
4. **Update portfolio** to show VIEW PRICES alongside positions

## For Digiko AI Integration

Use the `comparePrices()` function to analyze opportunities:

```ts
import { comparePrices } from '@/lib/dexscan';

// AI can use this to generate insights:
// - "DGKO is 7% below market - good entry point"
// - "CTR is 15% above market on low liquidity - use caution"
```
