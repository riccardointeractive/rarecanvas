# Lessons Learned - 2026-01-19: Swap History Parsing Bug Fix

## Bug: Incorrect Token Pairing in Swap History

### Root Cause

The swap history API (`/api/swap-history/route.ts`) was incorrectly parsing DEX transactions when they contained multiple transfer receipts for the same token.

**The Problem:**
```typescript
// OLD CODE - BUGGY
const inputTransfer = transfers.find((t: any) => t.to === dexAddress);
const outputTransfer = transfers.find((t: any) => t.from === dexAddress);
```

Using `.find()` returns only the **FIRST** matching transfer. DEX transactions often have multiple entries:
- Main trade transfer (e.g., 168,769.258 KONG)
- Fee transfer (e.g., 757.666 KONG)

If the fee transfer appeared first in the receipts array, the code would incorrectly pair:
- 350 KLV (main trade output) with 757.666 KONG (fee amount) ❌
- Instead of: 350 KLV with 168,769.258 KONG (main trade) ✅

### The Fix

Changed to use `.reduce()` to find the **LARGEST** transfer in each direction:

```typescript
// NEW CODE - FIXED
const incomingTransfers = transfers.filter((t: any) => t.to === dexAddress);
const outgoingTransfers = transfers.filter((t: any) => t.from === dexAddress);

// For incoming: find the largest transfer (main trade, not fee)
const inputTransfer = incomingTransfers.length > 0 
  ? incomingTransfers.reduce((largest: any, current: any) => 
      (current.value || 0) > (largest.value || 0) ? current : largest
    )
  : null;

// For outgoing: find the largest transfer (this is what user receives)
const outputTransfer = outgoingTransfers.length > 0
  ? outgoingTransfers.reduce((largest: any, current: any) =>
      (current.value || 0) > (largest.value || 0) ? current : largest
    )
  : null;
```

### Impact

This fix ensures:
1. Swap history shows correct token amounts
2. Exchange rates are calculated correctly
3. Portfolio tracking and analytics are accurate

### Lesson Learned

**When parsing blockchain transaction receipts:**
- Never assume only one transfer per direction
- DEX transactions often have multiple receipts (fees, refunds, main trade)
- Always aggregate or select appropriately (usually the largest value is the main trade)
- Consider that fees can be separate transfers, not just deducted from main amount

### Files Modified

- `src/app/api/swap-history/route.ts` - Fixed transfer selection logic

### Testing

After deploying:
1. Clear Redis cache: `POST /api/swap-history?network=mainnet`
2. Verify transactions with known amounts display correctly
3. Check KONG swaps specifically (they had visible errors due to the fee structure)
