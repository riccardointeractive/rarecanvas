# Lessons Learned: Pool Liquidity UX

**Date:** January 18, 2026  
**Issue:** Users getting cryptic "insufficient funds" errors after attempting transactions

---

## Problem

Users were attempting to add liquidity and seeing errors like:
```
Transaction failed: validation error: invalid argument: result code: 1, insufficient funds
```

The UI allowed users to click "Add Liquidity" even when they clearly didn't have enough tokens.

## Root Cause

1. **Feedback came too late** - Error only shown AFTER blockchain rejected the transaction
2. **MAX button didn't account for both tokens** - Would set amounts that exceeded the paired token's balance
3. **Error messages were blockchain-native** - Not user-friendly
4. **No visual warning** - Just subtle red text on balance

## Solution

### 1. Pre-flight Validation Warning
Created `InsufficientBalanceWarning` component that shows BEFORE the user attempts:
```tsx
<InsufficientBalanceWarning
  tokenA={{ symbol: 'DGKO', required: 100, balance: 50 }}
  tokenB={{ symbol: 'KLV', required: 200, balance: 150 }}
  onMaxClick={handleMaxDeposit}
/>
```

Shows:
- Prominent red banner
- Exact amounts needed vs available
- Shortfall calculation
- "Use MAX" link to auto-correct

### 2. Smarter MAX Button
```typescript
// Before: Could set amounts exceeding paired balance
const maxKlv = Math.min(maxFromA, maxFromB);

// After: Apply 0.1% buffer to avoid precision issues
const buffer = 0.999;
const maxQuote = Math.min(maxFromA, maxFromB) * buffer;
```

### 3. Specific Button Text
```tsx
// Before
!canDeposit ? 'Insufficient Balance'

// After  
!hasEnoughA ? `Insufficient ${baseToken.symbol}` :
!hasEnoughB ? `Insufficient ${quoteToken.symbol}` :
```

### 4. Human-Readable Error Messages
```typescript
// In formatPairTransactionError()
if (lowerMsg.includes('insufficient funds') || lowerMsg.includes('result code: 1')) {
  return 'Insufficient balance. Make sure you have enough of both tokens plus KLV for fees.';
}
```

## Key Takeaway

> **In DeFi, users should NEVER be able to attempt a transaction that will obviously fail.**
> 
> Pre-flight validation is not optional - it's essential UX.

## Files Changed

- `src/components/InsufficientBalanceWarning.tsx` (new)
- `src/app/pool/page.tsx`
- `src/utils/dynamicContractUtils.ts`

## Related

- Pool UX Audit: `docs/dev/POOL_UX_AUDIT.md`
