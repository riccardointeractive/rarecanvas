# Digiko AI Enhancement - DEXscan Integration

## Overview

Digiko AI now uses **VIEW PRICES** from DEXscan for true market comparison:

```
┌────────────────────────────────────────────────────────────────────────┐
│                       DIGIKO AI ANALYSIS FLOW                          │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  User enters swap: 1000 DGKO → KLV                                    │
│                        │                                               │
│                        ▼                                               │
│  ┌──────────────────────────────────────────┐                         │
│  │ RESERVE PRICE (What you get)             │                         │
│  │ From: Our pool reserves                  │                         │
│  │ Rate: 1 DGKO = 334 KLV                   │                         │
│  └──────────────────────────────────────────┘                         │
│                        │                                               │
│                        ▼                                               │
│  ┌──────────────────────────────────────────┐                         │
│  │ VIEW PRICE (What it's worth)             │ ◀── DEXscan API         │
│  │ Aggregated: Digiko + Swopus + SAME       │                         │
│  │ Market rate: 1 DGKO = 310 KLV            │                         │
│  └──────────────────────────────────────────┘                         │
│                        │                                               │
│                        ▼                                               │
│  ┌──────────────────────────────────────────┐                         │
│  │ COMPARISON                               │                         │
│  │ Gap: +7.7% (you get MORE on Digiko!)     │                         │
│  │ Signal: 🎯 ARBITRAGE OPPORTUNITY         │                         │
│  └──────────────────────────────────────────┘                         │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

## New Files Created

```
src/app/swap/
├── hooks/
│   ├── useViewPriceComparison.ts   # VIEW vs RESERVE price comparison
│   └── useSwapAnalysisV2.ts        # Enhanced analysis with DEXscan
├── components/
│   └── DigikoAICardV2.tsx          # New UI with arbitrage alerts
├── config/
│   └── swap-analysis.config.ts     # Updated with DEXscan thresholds
└── types/
    └── ai-data.types.ts            # Updated with VIEW PRICE types
```

## Analysis Priority

1. **DEXscan VIEW PRICES** (preferred)
   - Real market data from 3 DEXes
   - True price discovery
   - Arbitrage detection

2. **Historical Data** (fallback)
   - 7-day average from our swaps
   - Used when DEXscan unavailable

3. **Insufficient Data** (last resort)
   - "Gathering data..." message
   - Improves over time

## New Features

### 1. Arbitrage Detection
```typescript
if (gapPercent >= 10) {
  // 🎯 "Buy here — 10% better than market!"
}
if (gapPercent <= -10) {
  // ⚠️ "Consider other DEXes — 10% below market"
}
```

### 2. Multi-DEX Context
Shows which DEX has primary liquidity for each token.

### 3. 24h Price Trends
```
DGKO: +6.09%  ↗
KLV:  -2.5%   ↘
```

### 4. Savings Calculator
When rate is above market:
```
"Saving ~$3.50 vs market"
```

## Usage

### Replace Old Card
```tsx
// Before
import { DigikoAICard } from '../components/DigikoAICard';

// After
import { DigikoAICard } from '../components/DigikoAICardV2';
```

### Use New Hooks Directly
```tsx
import { useViewPriceComparison } from '../hooks/useViewPriceComparison';
import { useSwapAnalysis } from '../hooks/useSwapAnalysisV2';

function MyComponent() {
  const analysis = useSwapAnalysis({
    inputToken: 'DGKO-CXVJ',
    outputToken: 'KLV',
    inputAmount: 1000,
    outputAmount: 334000,
  });
  
  // New DEXscan data
  console.log(analysis?.dexscanComparison.isArbitrageOpportunity);
  console.log(analysis?.dexscanComparison.digikoVsMarket);
  console.log(analysis?.analysisSource); // 'dexscan' | 'historical' | 'insufficient'
}
```

## Signal Meanings

| Signal | Gap | Meaning |
|--------|-----|---------|
| `strong-buy` | ≤ -10% | Way below market - great entry! |
| `buy` | -10% to -3% | Below market - good opportunity |
| `neutral` | -3% to +3% | At market rate |
| `sell` | +3% to +10% | Above market - good to sell here |
| `strong-sell` | ≥ +10% | Way above market - great exit! |

## Quality Assessment

| Quality | After Fees | User Message |
|---------|------------|--------------|
| `excellent` | ≥ +3% | "Great opportunity" |
| `good` | 0% to +3% | "Good swap" |
| `fair` | -3% to 0% | "Your swap is ok" |
| `poor` | -8% to -3% | "Below average rate" |
| `bad` | < -8% | "Poor rate" |

## Environment Setup

Remember to add the DEXscan API key:
```bash
# .env.local
DEXSCAN_API_KEY=f5b0193326cadb54572fa5711e25dff8fd760ee845fd1c11d9e3c39f9fb37212
```

## Testing

1. Start dev server: `npm run dev`
2. Go to `/swap`
3. Select DGKO/KLV pair
4. Enter an amount
5. Check the DigikoAI card - should show:
   - "DEXscan" badge (if API key configured)
   - Market comparison
   - Arbitrage alert (if applicable)
   - 24h price trends

## Next Steps

1. **Migrate swap page** to use `DigikoAICardV2`
2. **Add notifications** for large arbitrage opportunities
3. **Dashboard widget** showing top arbitrage pairs
4. **Portfolio integration** - use VIEW PRICES for USD values
