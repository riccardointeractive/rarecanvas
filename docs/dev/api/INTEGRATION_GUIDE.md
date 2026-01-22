# Enhanced Error Logging - Integration Guide

## 📋 Overview

This guide shows you exactly how to integrate the enhanced error logging system into your existing Digiko codebase. The new system captures comprehensive debugging information that makes your life (and mine!) SO much easier.

---

## 🎯 What You Get

When a user clicks **"Copy Debug Log"**, they'll copy something like this:

```
============================================================
DIGIKO ERROR LOG
============================================================

ERROR DETAILS:
Title: Staking Failed
Message: Insufficient DGKO balance in wallet
Stack Trace: [full error stack]

CONTEXT:
Timestamp: 2024-11-28T10:23:45.678Z
Route: /staking
User Address: klv1abc7...def456
Component: StakingPage
Action Attempted: Stake 1000 DGKO

ENVIRONMENT:
App Version: v1.0.0
Network: mainnet
Browser: Chrome 119.0
OS: macOS
Device: desktop

TRANSACTION DETAILS:
Type: stake
Token: DGKO
Amount: 1000

============================================================
```

---

## 🔧 Step-by-Step Integration

### STEP 1: Update Modal Hook Import

In your component (e.g., `page.tsx`):

```typescript
// ADD THIS IMPORT:
import { ErrorLog } from '@/types/errorLog';

// Update your useModal destructure to include modalErrorLog:
const {
  modalOpen,
  modalStatus,
  modalTitle,
  modalMessage,
  modalTxHash,
  modalErrorLog, // ← ADD THIS
  showSuccessModal,
  showErrorModal,
  showLoadingModal,
  closeModal,
} = useModal();
```

### STEP 2: Update TransactionModal Props

```typescript
<TransactionModal
  isOpen={modalOpen}
  status={modalStatus}
  title={modalTitle}
  message={modalMessage}
  txHash={modalTxHash}
  errorLog={modalErrorLog} // ← ADD THIS
  onClose={closeModal}
/>
```

### STEP 3: Update Action Hooks

In your action hooks (e.g., `useStakingActions.ts`):

```typescript
// ADD THESE IMPORTS:
import { createErrorLog } from '@/utils/errorLogger';
import { ErrorLog } from '@/types/errorLog';

// Update showErrorModal signature:
showErrorModal: (title: string, message: string, errorLog?: ErrorLog) => void,

// BEFORE:
showErrorModal('Staking Failed', 'Insufficient balance');

// AFTER:
const errorLog = createErrorLog({
  title: 'Staking Failed',
  message: 'Insufficient DGKO balance in wallet',
  error: error as Error, // The caught error
  userAddress: address,
  component: 'StakingPage',
  action: `Stake ${stakeAmount} ${selectedToken}`,
  transaction: {
    type: 'stake',
    tokenSymbol: selectedToken,
    amount: stakeAmount,
  },
});
showErrorModal('Staking Failed', 'Insufficient balance', errorLog);
```

---

## 📝 Common Integration Patterns

### Pattern 1: Simple Validation Error

```typescript
if (stakeAmountNum > availableBalanceNum) {
  const errorLog = createErrorLog({
    title: 'Insufficient Balance',
    message: `You don't have enough ${selectedToken} to stake this amount`,
    userAddress: address,
    component: 'StakingPage',
    action: `Stake ${stakeAmount} ${selectedToken}`,
    transaction: {
      type: 'stake',
      tokenSymbol: selectedToken,
      amount: stakeAmount,
    },
  });
  
  showErrorModal(
    'Insufficient Balance',
    `You don't have enough ${selectedToken} to stake this amount`,
    errorLog
  );
  return;
}
```

### Pattern 2: API Error

```typescript
try {
  const response = await fetch(apiUrl);
  if (!response.ok) throw new Error(`API returned ${response.status}`);
  // ... rest of code
} catch (error) {
  const errorLog = createErrorLog({
    title: 'Failed to Load Data',
    message: 'Unable to fetch data from blockchain',
    error: error as Error,
    userAddress: address,
    component: 'StakingPage',
    action: 'Load staking stats',
    api: {
      endpoint: apiUrl,
      method: 'GET',
      statusCode: response?.status,
      responseBody: await response?.text(),
    },
  });
  
  showErrorModal(
    'Failed to Load Data',
    'Unable to fetch data from blockchain',
    errorLog
  );
}
```

### Pattern 3: Transaction Error

```typescript
try {
  const unsignedTx = await kleverService.createTransaction(/* ... */);
  const signedTx = await web.signTransaction(unsignedTx);
  const txHash = await web.broadcastTransactions([signedTx]);
  // ... success
} catch (error) {
  const errorLog = createErrorLog({
    title: 'Transaction Failed',
    message: 'Unable to complete stake transaction',
    error: error as Error,
    userAddress: address,
    component: 'StakingPage',
    action: `Stake ${stakeAmount} ${selectedToken}`,
    transaction: {
      type: 'stake',
      tokenSymbol: selectedToken,
      amount: stakeAmount,
      txHash: txHash, // if available
      rawError: error.message,
    },
  });
  
  showErrorModal(
    'Transaction Failed',
    'Unable to complete stake transaction',
    errorLog
  );
}
```

---

## 🎨 What It Looks Like

The error modal now shows:

1. **Error message** - Clear, user-friendly message
2. **"Copy Debug Log" button** - One-click copy with feedback
3. **"Show Technical Details" button** - Collapsible section with all details
4. **Helper text** - "Copy this log and send it to support"

When expanded, users see:
- Timestamp
- Page/Route
- Component
- Action attempted
- Browser & OS
- Network
- App version
- Wallet address (truncated)
- Transaction details (if applicable)
- API details (if applicable)

---

## ✅ Integration Checklist

For each page/hook that handles errors:

- [ ] Import `createErrorLog` from `@/utils/errorLogger`
- [ ] Import `ErrorLog` type from `@/types/errorLog`
- [ ] Update `showErrorModal` signature to accept `ErrorLog?`
- [ ] Replace simple error calls with `createErrorLog()`
- [ ] Include relevant context (component, action, transaction, api)
- [ ] Update `useModal` return to include `modalErrorLog`
- [ ] Update `TransactionModal` props to pass `errorLog`

---

## 🚀 Priority Integration Order

1. **Staking page** - Most used, most critical
2. **Swap page** - High transaction volume
3. **DGKO/BABYDGKO pages** - API-heavy
4. **Dashboard** - Wallet operations

---

## 💡 Pro Tips

1. **Always include `userAddress`** - Helps identify which wallet had the issue
2. **Always include `component` and `action`** - Tells you exactly where it happened
3. **For API errors** - Include endpoint, method, status code, response body
4. **For transaction errors** - Include token, amount, type, and raw error
5. **For validation errors** - Still use `createErrorLog()` for consistency

---

## 🔍 Debugging Workflow (New)

**Before (painful):**
1. User: "I got an error"
2. You: "What page?"
3. User: "Staking I think"
4. You: "What were you doing?"
5. User: "Trying to stake"
6. You: "How much?"
7. User: "I don't remember"
8. You: "What browser?"
9. User: "Chrome maybe?"
10. You: 😫

**After (amazing):**
1. User: "I got an error" → copies debug log → sends to you
2. You: See everything → fix immediately
3. You: 😎

---

## 📚 Files Created

- `/src/types/errorLog.ts` - Type definitions
- `/src/utils/errorLogger.ts` - Utility functions
- `/src/components/TransactionModal.tsx` - Enhanced UI (updated)
- `/src/app/staking/hooks/useModal.ts` - Enhanced hook (updated)
- `/docs/dev/ERROR_LOGGING_EXAMPLES.md` - Usage examples
- `/docs/dev/ERROR_LOG_EXAMPLE.txt` - Sample output
- `/docs/dev/INTEGRATION_GUIDE.md` - This file!

---

## 🎯 Next Steps

1. Test the new error modal in dev mode
2. Update staking page first (highest priority)
3. Gradually update other error handlers
4. Ask users to send debug logs when they report issues
5. Enjoy faster debugging! 🎉

---

## ❓ Questions?

Just ask Claude! Send a message like:
- "How do I integrate error logging in the swap page?"
- "Show me how to handle API errors with the new system"
- "What information does the debug log include?"
