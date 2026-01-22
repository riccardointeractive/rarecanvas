# Lessons Learned: V5 Mainnet Upgrade (January 18, 2026)

## Critical Issue: `args` vs `arguments` in Klever API

### The Bug
Token prices showed $0.00 after V5 upgrade. The `/api/prices` endpoint returned only KLV and stablecoins.

### Root Cause
Klever API requires `arguments` key, NOT `args`:

```javascript
// ❌ WRONG - Silently fails, returns no data
body: JSON.stringify({
  scAddress: DEX_CONTRACT,
  funcName: 'getPairInfo',
  args: [numberToByteArray(pairId)],  // API ignores this!
})

// ✅ CORRECT - Works properly
body: JSON.stringify({
  scAddress: DEX_CONTRACT,
  funcName: 'getPairInfo',
  arguments: [numberToByteArray(pairId)],  // Must be "arguments"
})
```

### Why It Was Hard to Find
- API returns `{ code: "successful" }` even with wrong key
- No error message, just empty `returnData`
- Multiple files had the same bug (copy-paste propagation)

### Files Affected
1. `/api/prices/route.ts`
2. `/api/prices/debug/route.ts`
3. `/api/cron/ai-collector/route.ts`
4. `/services/tokenPrices.ts`
5. `/admin/contracts/hooks/useContractQueries.ts`

---

## V5 Contract Query Format

### Old Format (Legacy Single-Pair)
```javascript
funcName: `getPairInfoPair${pairId}`  // e.g., getPairInfoPair1
arguments: []
```

### New Format (V5 Multi-Pair)
```javascript
funcName: 'getPairInfo'
arguments: [numberToByteArray(pairId)]  // e.g., [1] for pair 1
```

### Helper Function
```typescript
function numberToByteArray(num: number): number[] {
  if (num === 0) return [0];
  const bytes: number[] = [];
  let temp = num;
  while (temp > 0) {
    bytes.unshift(temp & 0xff);
    temp = temp >> 8;
  }
  return bytes;
}
```

---

## Price Cascade System

### How It Works
1. **KLV** ← CoinGecko (external anchor)
2. **DGKO, CTR, etc.** ← Derived from KLV pairs (depth 1)
3. **KUNAI, KID, KAKA** ← Derived from DGKO pairs (depth 2)
4. **WSOL** ← Derived from KID pair (depth 3)

### Unknown Token Handling
For tokens without USD price (e.g., new pairs), skip the minimum liquidity check:

```typescript
if (basePriceUSD === 0 || quotePriceUSD === 0) {
  // Can't calculate USD value - allow trading if reserves exist
  return undefined;
}
```

---

## Key Takeaways

1. **Always use `arguments` not `args`** for Klever API smart contract queries
2. **API can silently fail** - always add debug logging when things don't work
3. **Test directly with curl** before assuming frontend bug:
   ```bash
   curl -X POST "https://api.mainnet.klever.org/v1.0/sc/query" \
     -H "Content-Type: application/json" \
     -d '{"scAddress":"...","funcName":"getPairInfo","arguments":[[1]]}'
   ```
4. **Check ALL files** when fixing API format - copy-paste spreads bugs
5. **V5 is live on both networks** - remove testnet-only conditionals
