# Token Architecture & Configuration Guide
## 🔒 INTERNAL - Critical for Adding New Tokens

**Last Updated:** December 17, 2025  
**Status:** ⚠️ DUAL-FILE SYSTEM (consolidation planned)

---

## ⚠️ CRITICAL: Two Files Must Be Updated

When adding a new token to Digiko, you **MUST update BOTH files** or the token will display incorrect amounts:

| File | Purpose | Used By |
|------|---------|---------|
| `src/config/tokens.ts` | Central registry | Admin pages, `getTokenPrecision()`, `getTokenDecimals()` |
| `src/context/NetworkTokensContext.tsx` | Runtime context | Transaction history, swap hooks, balance parsing |

### Why Two Files Exist (Technical Debt)
- `tokens.ts` was created as the "single source of truth"
- `NetworkTokensContext.tsx` existed earlier with network-aware config
- Consolidation was deferred to avoid breaking changes
- **TODO:** Make NetworkTokensContext read from tokens.ts

---

## 📋 Adding a New Token: Step-by-Step

### Step 1: Add to `src/config/tokens.ts`

```typescript
// In TOKEN_REGISTRY object:
NEW_TOKEN: {
  symbol: 'NEW',
  name: 'New Token',
  assetIdMainnet: 'NEW-XXXX',    // Get from Kleverscan
  assetIdTestnet: 'NEW-YYYY',    // Get from testnet Kleverscan
  decimals: 6,                    // Check token's actual decimals!
  precision: 1_000_000,           // Must equal 10^decimals
  isNative: false,                // true only for KLV
  color: '#FF0000',               // Brand color
  isActive: true,
  sortOrder: 10,
},
```

### Step 2: Add to `src/context/NetworkTokensContext.tsx`

Add to **BOTH** `MAINNET_TOKENS` and `TESTNET_TOKENS`:

```typescript
// In MAINNET_TOKENS:
NEW_TOKEN: {
  symbol: 'NEW',
  displaySymbol: 'NEW',
  name: 'New Token',
  assetId: 'NEW-XXXX',           // Mainnet asset ID
  decimals: 6,                    // MUST match tokens.ts!
  precision: 1_000_000,           // MUST match tokens.ts!
  isNative: false,
},

// In TESTNET_TOKENS:
NEW_TOKEN: {
  symbol: 'NEW',
  displaySymbol: 'NEW',
  name: 'New Token (Testnet)',
  assetId: 'NEW-YYYY',           // Testnet asset ID
  decimals: 6,                    // MUST match tokens.ts!
  precision: 1_000_000,           // MUST match tokens.ts!
  isNative: false,
},
```

### Step 3: Verify

1. Build: `npm run build`
2. Check admin token precision page shows correct values
3. Test a swap with the new token
4. Verify transaction history displays correct amounts

---

## 🔢 Token Precision Reference

| Token | Decimals | Precision | Notes |
|-------|----------|-----------|-------|
| KLV | 6 | 1,000,000 | Native chain token |
| KFI | 6 | 1,000,000 | Klever Finance token |
| DGKO | 4 | 10,000 | Digiko main token |
| BABYDGKO | 8 | 100,000,000 | High precision |

### Formula
```
precision = 10^decimals
```

### Converting Amounts
```typescript
// Raw → Human readable
humanAmount = rawAmount / precision

// Human → Raw (for transactions)
rawAmount = Math.floor(humanAmount * precision)
```

---

## 🐛 Common Bugs & How to Avoid Them

### Bug: Token shows 100x wrong amount
**Cause:** Decimals mismatch between the two config files  
**Example:** KFI was set to 4 decimals in NetworkTokensContext but 6 in tokens.ts  
**Fix:** Ensure BOTH files have identical decimals/precision

### Bug: Token works in admin but not in swap
**Cause:** Only updated tokens.ts, forgot NetworkTokensContext.tsx  
**Fix:** Update both files

### Bug: Token works on mainnet but not testnet
**Cause:** Only added to MAINNET_TOKENS, forgot TESTNET_TOKENS  
**Fix:** Add to both network configs

### Bug: "Unknown token" in transaction history
**Cause:** Asset ID doesn't match what's on chain  
**Fix:** Verify asset ID on Kleverscan matches config exactly

---

## 🔍 Where Precision Is Used

### Files using `getTokenPrecision()` from tokens.ts:
- `src/app/admin/contracts/hooks/useContractData.ts`
- `src/app/admin/contracts/shared/useContractInvoke.tsx`
- `src/app/admin/contracts/components/ContractInvoker.tsx`
- `src/app/admin/contracts/components/SectionComponents.tsx`
- `src/app/admin/contracts/overview/page.tsx`
- `src/app/admin/contracts/edit-pair/page.tsx`
- `src/app/admin/contracts/claim-fees/page.tsx`
- `src/app/swap/hooks/useTradingPairs.ts`
- `src/app/swap/hooks/useContractQueries.ts`
- `src/app/swap/hooks/useUserBalances.ts`

### Files using NetworkTokensContext:
- `src/app/swap/hooks/useContractTransactions.ts` (transaction history parsing)
- `src/app/swap/components/BlockchainTransactionHistory.tsx`
- Various components for token display/images

---

## 🎯 Future Improvement: Single Source of Truth

**Goal:** Make NetworkTokensContext read from tokens.ts

**Benefits:**
- Add token once, works everywhere
- No more sync bugs
- Admin token editor becomes possible

**Complexity:** Medium - requires careful refactoring
**Risk:** Breaking swap functionality if done incorrectly

**Status:** Deferred until dedicated cleanup session

---

## 📞 Quick Reference

### Check Token Precision
```bash
# In browser console on any Digiko page:
import { getTokenPrecision, getTokenDecimals } from '@/config/tokens';
console.log('KFI precision:', getTokenPrecision('KFI'));
console.log('KFI decimals:', getTokenDecimals('KFI'));
```

### Verify On-Chain Decimals
1. Go to Kleverscan: `https://kleverscan.org/asset/TOKEN-XXXX`
2. Check "Precision" field
3. Ensure config matches

### Files to Edit
```
src/config/tokens.ts              ← TOKEN_REGISTRY
src/context/NetworkTokensContext.tsx  ← MAINNET_TOKENS + TESTNET_TOKENS
```
