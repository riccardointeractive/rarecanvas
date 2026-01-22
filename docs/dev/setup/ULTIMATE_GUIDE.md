# 🎯 COMPLETE GUIDE: Enhanced Error Logging + Debug Mode

## Your Question
**"How can I test it? There are no errors on my end!"** 😅

## The Answer
**DEBUG MODE!** Force errors to happen so you can test error logging! 🐛

---

## 🚀 Quick Start (5 minutes)

### Step 1: Extract Files
```bash
# Already in project root
unzip -o ~/Downloads/enhanced-error-logging-with-debug.zip
```

### Step 2: Add Debug Menu to Layout
Open `src/app/layout.tsx` and add one line:

```tsx
import { DebugMenu } from '@/components/DebugMenu'; // ADD THIS

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <DebugMenu /> {/* ADD THIS */}
      </body>
    </html>
  );
}
```

### Step 3: Add Debug Checks to Staking
Open `src/app/staking/hooks/useStakingActions.ts` and add:

```tsx
// At the top, add imports:
import { checkForForcedError, debugLog } from '@/utils/debugMode';
import { createErrorLog } from '@/utils/errorLogger';
import { ErrorLog } from '@/types/errorLog';

// Update showErrorModal signature:
showErrorModal: (title: string, message: string, errorLog?: ErrorLog) => void,

// In handleStake, after validation, add:
try {
  checkForForcedError('insufficient_balance');
  checkForForcedError('wallet_rejected');
  
  // ... your staking code ...
  
} catch (error: any) {
  const errorLog = createErrorLog({
    title: 'Staking Failed',
    message: 'Unable to stake tokens',
    error: error as Error,
    userAddress: address,
    component: 'StakingPage',
    action: `Stake ${stakeAmount} ${selectedToken}`,
    transaction: {
      type: 'stake',
      tokenSymbol: selectedToken,
      amount: stakeAmount,
    },
  });
  
  showErrorModal('Staking Failed', 'Unable to stake tokens', errorLog);
  setIsLoading(false);
}
```

### Step 4: Test It!
```bash
npm run dev
```

Go to: `http://localhost:3000/staking?debug=true`

You'll see a **red bug button (🐛)** in bottom-right corner!

### Step 5: Force an Error!
1. Click the 🐛 bug button
2. Select **"💰 Insufficient Balance"**
3. Try to stake some DGKO
4. **BOOM! Error modal appears!** 🎉
5. Click **"Copy Debug Log"**
6. Paste to see the full formatted log
7. Click **"Show Technical Details"**
8. See all the captured info!

**IT WORKS!** 🚀

---

## 🎯 What You Get

### The Debug Menu (When `?debug=true`):
```
┌──────────────────────────┐
│ 🐛 Debug Mode      Exit  │
│ Force errors to test     │
├──────────────────────────┤
│ 💰 Insufficient Balance  │
│ ⏱️ API Timeout          │
│ 🔥 API Error            │
│ 📡 Network Error        │
│ ⛔ Transaction Failed    │
│ 🚫 Wallet Rejected      │
│ ❌ Invalid Address      │
│ 📉 Slippage Exceeded    │
└──────────────────────────┘
```

### The Error Modal (Enhanced):
```
┌──────────────────────────┐
│         ❌                │
│   Staking Failed         │
│   Insufficient balance   │
│                          │
│ [Copy Debug Log] ✓       │
│                          │
│ [Show Technical Details] │
│ ▼ Time: 2024-11-28...    │
│   Page: /staking         │
│   Browser: Chrome 119    │
│   Network: mainnet       │
│   Amount: 1000 DGKO      │
│                          │
│ Copy log to support...   │
└──────────────────────────┘
```

### The Copied Log:
```
============================================================
DIGIKO ERROR LOG
============================================================

ERROR DETAILS:
Title: Staking Failed
Message: Insufficient DGKO balance
Stack Trace: [full error]

CONTEXT:
Timestamp: 2024-11-28T10:23:45.678Z
Route: /staking
User Address: klv1abc7...def456
Component: StakingPage
Action: Stake 1000 DGKO

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

## 📁 Files Included

### Error Logging System:
- `src/types/errorLog.ts` - Type definitions
- `src/utils/errorLogger.ts` - Utility functions
- `src/components/TransactionModal.tsx` - Enhanced modal with copy button
- `src/app/staking/hooks/useModal.ts` - Updated hook

### Debug Mode System:
- `src/utils/debugMode.ts` - Debug mode logic
- `src/components/DebugMenu.tsx` - Floating debug menu

### Test Page:
- `src/app/error-logging-test/page.tsx` - Dedicated test page

### Documentation:
- `docs/dev/FORCE_ERRORS_GUIDE.md` - How to force errors
- `docs/dev/DEBUG_MENU_SETUP.md` - Setup instructions
- `docs/dev/DEBUG_MODE_INTEGRATION.md` - Integration examples
- `docs/dev/READY_TO_USE_EXAMPLE.ts` - Copy-paste ready code
- `docs/dev/ERROR_LOGGING_EXAMPLES.md` - Usage examples
- `docs/dev/INTEGRATION_GUIDE.md` - Full integration guide
- `docs/dev/TESTING_GUIDE.md` - Testing instructions
- `docs/dev/ERROR_LOG_EXAMPLE.txt` - Sample log output
- `docs/dev/ERROR_LOGGING_SUMMARY.md` - Overview

---

## 🎮 How to Use

### For Testing (Debug Mode):
1. Add `?debug=true` to URL
2. Click bug button
3. Select error scenario
4. Do the action
5. Error happens!

### For Production (Normal Mode):
1. No `?debug=true` → No debug menu
2. Real errors get logged
3. Users click "Copy Debug Log"
4. Send you the full log
5. You debug instantly!

---

## 🔧 Integration Priority

### Start Here (Easiest):
1. **Staking page** - Most used, clearest errors
2. Add to `useStakingActions.ts`
3. Test with debug mode
4. Verify error logging works

### Then Add To:
2. **Swap page** - High transaction volume
3. **Token pages** - API errors
4. **Dashboard** - Wallet errors

### See These Files for Help:
- `docs/dev/READY_TO_USE_EXAMPLE.ts` - Copy-paste code
- `docs/dev/DEBUG_MODE_INTEGRATION.md` - Where to add checks
- `docs/dev/FORCE_ERRORS_GUIDE.md` - Complete instructions

---

## ✅ Testing Checklist

### Basic Test:
- [ ] Extract files
- [ ] Add DebugMenu to layout
- [ ] Add debug checks to staking
- [ ] Start dev server
- [ ] Go to staking with `?debug=true`
- [ ] See bug button
- [ ] Force an error
- [ ] Error modal appears
- [ ] Copy button works
- [ ] Technical details expand
- [ ] Log is complete

### Advanced Test:
- [ ] Test all 8 error scenarios
- [ ] Test on different pages
- [ ] Test on mobile view
- [ ] Test without `?debug=true` (should hide)
- [ ] Verify production works normally

---

## 💡 Pro Tips

1. **Start simple** - Just add to staking first
2. **Use ready examples** - See READY_TO_USE_EXAMPLE.ts
3. **Test incrementally** - One error type at a time
4. **Check console** - Debug mode logs helpful info
5. **Test on mobile** - Resize browser window

---

## 🆘 Troubleshooting

### Bug button doesn't appear:
- Make sure URL has `?debug=true`
- Check you added `<DebugMenu />` to layout
- Check browser console for errors

### Error doesn't trigger:
- Make sure you added `checkForForcedError()` in code
- Check which error is selected in menu
- Try refreshing page

### Copy button doesn't work:
- Make sure you passed `errorLog` to modal
- Check browser clipboard permissions
- Use HTTPS or localhost

---

## 🎉 Result

### Before:
- User: "I got an error"
- You: "What error? What page? What browser?"
- User: "I don't remember..."
- You: 😫

### After:
- User: *clicks "Copy Debug Log"* → sends to you
- You: *sees everything* → fixes immediately
- You: 😎

---

## 📚 Quick Reference

### Enable Debug Mode:
```
http://localhost:3000/staking?debug=true
```

### Force an Error:
```typescript
checkForForcedError('insufficient_balance');
```

### Create Error Log:
```typescript
const errorLog = createErrorLog({
  title: 'Error',
  message: 'Message',
  error: error,
  userAddress: address,
  component: 'Page',
  action: 'Action',
  transaction: { type, tokenSymbol, amount }
});
```

### Show Error:
```typescript
showErrorModal('Title', 'Message', errorLog);
```

---

## 🚀 Ready to Start?

1. Extract files
2. Follow Step 1-5 above
3. Test it works
4. Gradually add to other pages
5. Deploy to production
6. Enjoy faster debugging!

**No more "no errors on my end" problem!** 🎯

Questions? Check the docs folder - everything is explained there!
