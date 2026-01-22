# Pool Liquidity UX Audit

**Date:** January 18, 2026  
**Priority:** HIGH  
**Status:** To implement

---

## User Feedback Summary

### Issue 1: "Insufficient Funds" Error After Transaction (Kleverkid)
> "Transaction failed: validation error: invalid argument: result code: 1, insufficient funds"

**Problem:** User only sees error AFTER attempting the transaction. The UI allowed them to proceed even though they didn't have enough tokens.

### Issue 2: No Auto-Balance Limiting (Marco)
> "Se mettevo max in klv o pmd nell'altra moneta mi segnava più token di quanto ne avessi"

**Problem:** When clicking MAX on one token, the calculated amount for the paired token can exceed the user's actual balance. No visual warning or auto-correction.

### Issue 3: No Pre-Transaction Validation
> "Ho provato tante volte prima di capire che non avevo il bilanciamento giusto tra I token ma non ricevevo nessuna notifica di errore"

**Problem:** Users can attempt multiple failed transactions without understanding why they're failing.

---

## Current Implementation Analysis

### What Works ✅
1. `hasEnoughA` and `hasEnoughB` flags correctly calculated (line 178-179)
2. `canDeposit` flag properly checks both balances (line 180)
3. `TokenInputField` shows error state when `error={!hasEnoughB && depositAmounts.amountB > 0}`
4. Button shows "Insufficient Balance" when `!canDeposit && depositAmounts.amountA > 0`

### What's Missing ❌

1. **MAX button only considers one direction**
   - Current `handleMaxDeposit` (line 249-258) calculates correctly but doesn't show feedback
   - If calculated amounts exceed balance, user sees red but no explanation

2. **Error message is too subtle**
   - Only shows "(insufficient)" next to balance
   - No prominent warning banner or toast

3. **No smart MAX behavior**
   - MAX should auto-clamp to user's maximum possible contribution
   - Currently shows the full calculated amount even if unaffordable

4. **Error messages from blockchain are cryptic**
   - "result code: 1, insufficient funds" - not user-friendly
   - `formatPairTransactionError` doesn't handle this specific error

5. **No pre-flight validation**
   - Transaction is attempted even when obviously destined to fail

---

## Recommended Fixes

### Fix 1: Enhanced MAX Button (Smart Balance)
```typescript
// handleMaxDeposit should set the MAXIMUM AFFORDABLE contribution
const handleMaxDeposit = useCallback(() => {
  if (poolRatio === 0) return;
  
  // Calculate what we can afford based on BOTH balances
  const maxFromA = userBalanceA * poolRatio; // Max KLV if we use all DGKO
  const maxFromB = userBalanceB;              // Max KLV if we use all KLV
  
  // Take the minimum - this is what we can actually afford
  const maxKlv = Math.min(maxFromA, maxFromB);
  const maxDgko = maxKlv / poolRatio;
  
  // Apply a small buffer (0.1%) to avoid rounding issues
  const buffer = 0.999;
  setInputAmountB((maxKlv * buffer).toString());
  setInputAmountA((maxDgko * buffer).toString());
  setPrimaryInput('B');
}, [userBalanceA, userBalanceB, poolRatio]);
```

### Fix 2: Insufficient Balance Warning Component
```tsx
// New component: InsufficientBalanceWarning.tsx
interface InsufficientBalanceWarningProps {
  tokenA: { symbol: string; required: number; balance: number };
  tokenB: { symbol: string; required: number; balance: number };
}

export function InsufficientBalanceWarning({ tokenA, tokenB }: Props) {
  const insufficientA = tokenA.required > tokenA.balance;
  const insufficientB = tokenB.required > tokenB.balance;
  
  if (!insufficientA && !insufficientB) return null;
  
  return (
    <div className="bg-error/10 border border-error/30 rounded-xl p-4 mb-4">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-error flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="text-sm font-medium text-error">Insufficient Balance</p>
          {insufficientA && (
            <p className="text-xs text-error/80">
              Need {formatNum(tokenA.required)} {tokenA.symbol}, have {formatNum(tokenA.balance)}
            </p>
          )}
          {insufficientB && (
            <p className="text-xs text-error/80">
              Need {formatNum(tokenB.required)} {tokenB.symbol}, have {formatNum(tokenB.balance)}
            </p>
          )}
          <p className="text-xs text-text-secondary mt-2">
            Use MAX to set the maximum amount you can contribute.
          </p>
        </div>
      </div>
    </div>
  );
}
```

### Fix 3: Better Error Messages
```typescript
// Update formatPairTransactionError in dynamicContractUtils.ts
export function formatPairTransactionError(error: any): string {
  const errorMsg = error?.message || error?.toString() || 'Unknown error';
  
  if (errorMsg.includes('User rejected')) {
    return 'Transaction was cancelled by user';
  }
  
  // NEW: Handle blockchain "insufficient funds" errors
  if (errorMsg.includes('insufficient funds') || errorMsg.includes('result code: 1')) {
    return 'Insufficient balance. Check that you have enough of both tokens plus KLV for fees.';
  }
  
  if (errorMsg.includes('insufficient balance')) {
    return 'Insufficient balance for this transaction';
  }
  
  if (errorMsg.includes('Klever Extension not found')) {
    return 'Klever Extension not found. Please install it.';
  }
  
  if (errorMsg.includes('incorrect number of KDA transfers')) {
    return 'Transaction format error. Please try again.';
  }
  
  // NEW: Handle slippage/ratio errors
  if (errorMsg.includes('ratio') || errorMsg.includes('slippage')) {
    return 'Pool ratio changed. Please refresh and try again.';
  }
  
  return `Transaction failed: ${errorMsg}`;
}
```

### Fix 4: Pre-Flight Validation
```typescript
// Before calling singleTxMint, add validation
const validateDeposit = useCallback((): { valid: boolean; error?: string } => {
  if (!selectedPair) return { valid: false, error: 'No pair selected' };
  if (depositAmounts.amountA <= 0 || depositAmounts.amountB <= 0) {
    return { valid: false, error: 'Enter amounts to deposit' };
  }
  if (!hasEnoughA) {
    return { 
      valid: false, 
      error: `Need ${formatNum(depositAmounts.amountA)} ${selectedPair.baseToken.symbol}, have ${formatNum(userBalanceA)}`
    };
  }
  if (!hasEnoughB) {
    return { 
      valid: false, 
      error: `Need ${formatNum(depositAmounts.amountB)} ${selectedPair.quoteToken.symbol}, have ${formatNum(userBalanceB)}`
    };
  }
  // Check for KLV fee buffer (minimum 1 KLV for fees)
  const klvBalance = balances['KLV'] || 0;
  const klvRequired = selectedPair.quoteToken.assetId === 'KLV' ? depositAmounts.amountB + 1 : 1;
  if (klvBalance < klvRequired) {
    return { valid: false, error: 'Need at least 1 KLV for transaction fees' };
  }
  return { valid: true };
}, [selectedPair, depositAmounts, hasEnoughA, hasEnoughB, userBalanceA, userBalanceB, balances]);
```

### Fix 5: Update Button States
```tsx
// Current button shows "Insufficient Balance" but could be clearer
<Button
  onClick={handleDeposit}
  disabled={!canDeposit || depositStep === 'processing'}
  variant={!canDeposit ? 'danger' : 'primary'}
  className="w-full"
  size="lg"
>
  {depositStep === 'processing' ? 'Adding Liquidity...' :
   !hasEnoughA && depositAmounts.amountA > 0 ? `Insufficient ${selectedPair.baseToken.symbol}` :
   !hasEnoughB && depositAmounts.amountB > 0 ? `Insufficient ${selectedPair.quoteToken.symbol}` :
   depositAmounts.amountA <= 0 ? 'Enter Amount' :
   'Add Liquidity'}
</Button>
```

---

## Implementation Plan

### Phase 1: Quick Wins (1-2 hours)
1. ✅ Update `formatPairTransactionError` with better messages
2. ✅ Fix `handleMaxDeposit` to apply buffer and be smarter
3. ✅ Update button text to show WHICH token is insufficient

### Phase 2: Visual Feedback (2-3 hours)
1. Create `InsufficientBalanceWarning` component
2. Add warning above deposit button when balance insufficient
3. Add helpful tooltip explaining the ratio requirement

### Phase 3: Advanced Features (optional)
1. Add "Swap to Balance" suggestion when user has one token but not the other
2. Add percentage selectors (25%, 50%, 75%, MAX) for quick input
3. Add live validation as user types

---

## Files to Modify

1. `/src/app/pool/page.tsx` - Main logic changes
2. `/src/utils/dynamicContractUtils.ts` - Error message improvements
3. `/src/components/TokenInputField.tsx` - Enhanced error display
4. **NEW:** `/src/components/InsufficientBalanceWarning.tsx` - Warning banner

---

## Testing Checklist

- [ ] MAX button sets affordable amount for both tokens
- [ ] Error warning appears before transaction attempt
- [ ] Specific error message shows which token is insufficient
- [ ] Button is disabled with clear text when balance insufficient
- [ ] Failed transactions show user-friendly error messages
- [ ] Users can't accidentally attempt impossible transactions
