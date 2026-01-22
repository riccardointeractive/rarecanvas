# Token Precision Guide

> **CRITICAL**: This document explains how token precision works in Digiko and how to avoid bugs like the DAXDO display error (showing 16M instead of 160K).

**Last Updated:** December 21, 2025  
**Status:** Canonical Reference

---

## Table of Contents

1. [Source of Truth](#source-of-truth)
2. [Key Concepts](#key-concepts)
3. [Token Precision Reference](#token-precision-reference)
4. [Correct Usage Patterns](#correct-usage-patterns)
5. [Anti-Patterns to Avoid](#anti-patterns-to-avoid)
6. [Adding New Tokens](#adding-new-tokens)
7. [Debugging Precision Issues](#debugging-precision-issues)
8. [Lessons Learned](#lessons-learned)

---

## Source of Truth

### The ONLY place token precision should be defined:

```
src/config/tokens.ts → TOKEN_REGISTRY
```

### Admin UI for visual management:

```
/admin/tokens/precision
```

### Helper Functions (use these, don't hardcode):

```typescript
import { 
  getTokenDecimals,    // Returns number of decimal places (e.g., 6)
  getTokenPrecision,   // Returns multiplier (e.g., 1000000)
  formatTokenAmount,   // Formats raw → human readable
  parseTokenAmount,    // Parses human readable → raw
} from '@/config/tokens';
```

---

## Key Concepts

### Decimals vs Precision

| Term | Definition | Example (KLV) |
|------|------------|---------------|
| **Decimals** | Number of decimal places | `6` |
| **Precision** | Multiplier (10^decimals) | `1,000,000` |
| **Raw Value** | Value stored on blockchain | `5000000` |
| **Human Value** | What users see | `5.0 KLV` |

### The Formula

```
precision = 10 ^ decimals

humanValue = rawValue / precision
rawValue = humanValue * precision
```

### Why This Matters

Blockchain stores integers only. A balance of "5.5 KLV" is stored as `5500000` (5.5 × 1,000,000).

**If you use wrong precision:**
- Wrong precision (4 instead of 8): `16000000 / 10000 = 1600` ❌
- Correct precision (8): `16000000 / 100000000 = 0.16` ✅

This is exactly what happened with DAXDO - it has 8 decimals but code defaulted to 6.

---

## Token Precision Reference

| Token | Symbol | Decimals | Precision | Asset ID (Mainnet) |
|-------|--------|----------|-----------|-------------------|
| Klever | KLV | 6 | 1,000,000 | `KLV` |
| Klever Finance | KFI | 6 | 1,000,000 | `KFI` |
| Dragon | DRG | 6 | 1,000,000 | `DRG-17KE` |
| Kunai | KUNAI | 6 | 1,000,000 | `KUNAI-18TK` |
| **Digiko** | DGKO | **4** | **10,000** | `DGKO-CXVJ` |
| **BabyDigiko** | BABYDGKO | **8** | **100,000,000** | `BABYDGKO-3S67` |
| **DAXDO** | DAXDO | **8** | **100,000,000** | `DAXDO-1A4L` |
| Kid | KID | 3 | 1,000 | `KID-36W3` |
| Goat | GOAT | 3 | 1,000 | `GOAT-3NXV` |

⚠️ **Note the outliers**: DGKO (4), BABYDGKO (8), DAXDO (8), KID (3), GOAT (3) - these are NOT the default 6!

---

## Correct Usage Patterns

### ✅ Pattern 1: Using Helper Functions

```typescript
import { getTokenDecimals, getTokenPrecision } from '@/config/tokens';

// Get decimals for display formatting
const decimals = getTokenDecimals('DAXDO');  // Returns 8

// Get precision for calculations
const precision = getTokenPrecision('DAXDO');  // Returns 100000000

// Convert raw to human
const humanValue = rawBalance / precision;

// Convert human to raw
const rawValue = Math.floor(humanAmount * precision);
```

### ✅ Pattern 2: Using React Hook (in components)

```typescript
import { useNetworkTokens } from '@/context/NetworkTokensContext';

function MyComponent() {
  const { getDecimals, getPrecision } = useNetworkTokens();
  
  const decimals = getDecimals('DAXDO');  // Returns 8
  const precision = getPrecision('DAXDO');  // Returns 100000000
}
```

### ✅ Pattern 3: Format/Parse Utilities

```typescript
import { formatTokenAmount, parseTokenAmount } from '@/config/tokens';

// Format for display (raw → human string)
const display = formatTokenAmount(16000000000, 'DAXDO');  // "160.00"

// Parse user input (human string → raw)
const raw = parseTokenAmount('160', 'DAXDO');  // 16000000000
```

### ✅ Pattern 4: Dynamic Fallback (when token might be unknown)

```typescript
// If you must have a fallback, use the helper which defaults to 6
const decimals = getTokenDecimals(unknownSymbol);  // Safe, returns 6 for unknown

// NEVER do this:
const decimals = someValue || 6;  // ❌ DANGEROUS
```

---

## Anti-Patterns to Avoid

### ❌ Anti-Pattern 1: Hardcoded Precision Constants

```typescript
// BAD - Creates duplicate source of truth
const DGKO_PRECISION = 10000;
const KLV_PRECISION = 1000000;

// GOOD - Use centralized config
import { getTokenPrecision } from '@/config/tokens';
const dgkoPrecision = getTokenPrecision('DGKO');
```

### ❌ Anti-Pattern 2: Hardcoded Fallback Defaults

```typescript
// BAD - Assumes all tokens have 6 decimals (DAXDO bug!)
const decimals = getDecimals(symbol) || 6;
const precision = config?.precision || 1000000;

// GOOD - Use helper that handles unknowns properly
const decimals = getTokenDecimals(symbol);  // Returns 6 for unknown, correct value for known
```

### ❌ Anti-Pattern 3: Ternary Token Checks

```typescript
// BAD - Doesn't scale, misses tokens like DAXDO
const decimals = token === 'DGKO' ? 4 : 6;
const precision = token === 'BABYDGKO' ? 100000000 : 1000000;

// GOOD - Dynamic lookup
const decimals = getTokenDecimals(token);
```

### ❌ Anti-Pattern 4: Duplicate Token Objects

```typescript
// BAD - Local token config that can get out of sync
const TOKENS = {
  KLV: { precision: 1000000 },
  DGKO: { precision: 10000 },
};

// GOOD - Import from centralized config
import { getTokenPrecision } from '@/config/tokens';
```

### ❌ Anti-Pattern 5: Magic Numbers in Math

```typescript
// BAD - What is 1000000? Why?
const klvAmount = rawValue / 1000000;

// GOOD - Self-documenting
const klvAmount = rawValue / getTokenPrecision('KLV');
```

---

## Adding New Tokens

### Step 1: Add to TOKEN_REGISTRY

Edit `src/config/tokens.ts`:

```typescript
export const TOKEN_REGISTRY: Record<string, TokenConfig> = {
  // ... existing tokens ...
  
  NEWTOKEN: {
    symbol: 'NEWTOKEN',
    name: 'New Token',
    assetIdMainnet: 'NEWTOKEN-XXXX',
    assetIdTestnet: 'NEWTOKEN-XXXX',
    decimals: 5,                    // ← Set correct decimals
    precision: 100_000,             // ← Must equal 10^decimals
    isNative: false,
    color: '#FF6B6B',
    isActive: true,
    sortOrder: 100,
  },
};
```

### Step 2: That's It!

All helper functions automatically work:
- `getTokenDecimals('NEWTOKEN')` → `5`
- `getTokenPrecision('NEWTOKEN')` → `100000`
- `formatTokenAmount(raw, 'NEWTOKEN')` → formatted string

### Step 3: Optional - Add to NetworkTokensContext

If the token needs network-specific behavior or should appear in dropdowns:

```typescript
// In src/context/NetworkTokensContext.tsx
const TOKENS: Record<Network, Record<string, NetworkToken>> = {
  mainnet: {
    // ... existing ...
    NEWTOKEN: {
      symbol: 'NEWTOKEN',
      name: 'New Token',
      assetId: 'NEWTOKEN-XXXX',
      decimals: 5,
      precision: 100_000,
      isNative: false,
      logo: '/tokens/newtoken.svg',
    },
  },
  testnet: {
    // ... similar ...
  },
};
```

---

## Debugging Precision Issues

### Symptom: Balance shows wrong number

**Example:** User has 160,000 DAXDO but sees 16,000,000

**Diagnosis:**
1. What precision is being used? (Check console logs)
2. What precision should be used? (Check TOKEN_REGISTRY)
3. Where is the wrong precision coming from? (grep for hardcoded values)

**Debug Code:**
```typescript
console.log('Token:', symbol);
console.log('Expected decimals:', getTokenDecimals(symbol));
console.log('Raw value:', rawBalance);
console.log('Calculated:', rawBalance / getTokenPrecision(symbol));
```

### Symptom: Transaction fails or sends wrong amount

**Diagnosis:**
1. Are you converting human → raw correctly?
2. Are you using `Math.floor()` to avoid decimals?
3. Is the precision correct for the token?

**Debug Code:**
```typescript
const humanAmount = 100;  // User wants to send 100 tokens
const precision = getTokenPrecision(symbol);
const rawAmount = Math.floor(humanAmount * precision);
console.log(`Sending ${humanAmount} ${symbol} = ${rawAmount} raw units`);
```

### Quick Audit Command

Find all hardcoded precision values:
```bash
grep -rn "precision\s*[=:]\s*[0-9]\{4,\}\|decimals\s*=\s*[0-9]" \
  --include="*.ts" --include="*.tsx" src/ \
  | grep -v "config/tokens.ts\|node_modules"
```

---

## Lessons Learned

### The DAXDO Bug (December 2025)

**What happened:**
- User dashboard showed 16,000,000 DAXDO instead of 160,000
- DAXDO has 8 decimals but code defaulted to 6
- 100x display error: `16000000000 / 1000000 = 16000` vs `16000000000 / 100000000 = 160`

**Root causes identified:**
1. `NetworkTokensContext.tsx` didn't include DAXDO in token list
2. `getDecimals('DAXDO')` returned `undefined` → fell back to `|| 6`
3. Multiple files had `|| 6` fallback pattern

**Fix applied:**
1. Added DAXDO to NetworkTokensContext
2. Replaced all `|| 6` fallbacks with `getTokenDecimals()` calls
3. Removed all duplicate precision constants
4. Created this documentation

**Prevention:**
- NEVER use `|| 6` or `?? 6` fallbacks
- ALWAYS use `getTokenDecimals()` or `getTokenPrecision()`
- When adding new tokens, add to TOKEN_REGISTRY first
- Run audit command before releases

---

## File Reference

| File | Purpose |
|------|---------|
| `src/config/tokens.ts` | **SOURCE OF TRUTH** - All token config |
| `src/context/NetworkTokensContext.tsx` | React context for network-aware tokens |
| `src/app/admin/tokens/precision/page.tsx` | Admin UI for precision management |
| `docs/dev/TOKEN_PRECISION_GUIDE.md` | This document |

---

## Quick Reference Card

```typescript
// ALWAYS USE THESE:
import { getTokenDecimals, getTokenPrecision } from '@/config/tokens';

// For display: raw → human
const humanValue = rawValue / getTokenPrecision(symbol);

// For transactions: human → raw  
const rawValue = Math.floor(humanValue * getTokenPrecision(symbol));

// For formatting decimals
const formatted = humanValue.toFixed(getTokenDecimals(symbol));
```

**Remember:** If it's not in `src/config/tokens.ts`, it doesn't exist. 🎯
