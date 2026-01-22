# 🧪 How to Test Enhanced Error Logging

## Option 1: Dedicated Test Page (Easiest!) ⭐

### Step 1: Extract Files
```bash
# Already in project root
unzip -o ~/Downloads/enhanced-error-logging.zip
```

### Step 2: Start Dev Server
```bash
npm run dev
```

### Step 3: Visit Test Page
Open your browser and go to:
```
http://localhost:3000/error-logging-test
```

### Step 4: Test!
1. Click any of the 6 test scenarios
2. See the error modal appear
3. Click "Copy Debug Log" button
4. Paste in a text editor to see the full log
5. Click "Show Technical Details" to see the info in the modal
6. Try all scenarios to see different types of errors!

---

## Option 2: Quick Manual Test (Even Easier!)

If you want to test WITHOUT starting the server:

### Step 1: Open Browser Console
1. Open any website (even Google.com)
2. Press F12 (or Cmd+Option+I on Mac)
3. Go to Console tab

### Step 2: Paste This Code
```javascript
// Copy and paste this into browser console:

const testErrorLog = {
  title: 'Staking Failed',
  message: 'Insufficient DGKO balance in wallet',
  stackTrace: 'Error: Insufficient balance\n    at handleStake (line 145)',
  timestamp: new Date().toISOString(),
  userAddress: 'klv1abc7...def456',
  route: '/staking',
  component: 'StakingPage',
  action: 'Stake 1000 DGKO',
  browser: {
    name: 'Chrome',
    version: '119.0',
    os: 'macOS',
    device: 'desktop',
    userAgent: navigator.userAgent
  },
  network: 'mainnet',
  appVersion: 'v1.0.0',
  transaction: {
    type: 'stake',
    tokenSymbol: 'DGKO',
    amount: '1000'
  }
};

// Format it
const formatted = `
============================================================
DIGIKO ERROR LOG
============================================================

ERROR DETAILS:
Title: ${testErrorLog.title}
Message: ${testErrorLog.message}
Stack Trace:
${testErrorLog.stackTrace}

CONTEXT:
Timestamp: ${testErrorLog.timestamp}
Route: ${testErrorLog.route}
User Address: ${testErrorLog.userAddress}
Component: ${testErrorLog.component}
Action Attempted: ${testErrorLog.action}

ENVIRONMENT:
App Version: ${testErrorLog.appVersion}
Network: ${testErrorLog.network}
Browser: ${testErrorLog.browser.name} ${testErrorLog.browser.version}
OS: ${testErrorLog.browser.os}
Device: ${testErrorLog.browser.device}
User Agent: ${testErrorLog.browser.userAgent}

TRANSACTION DETAILS:
Type: ${testErrorLog.transaction.type}
Token: ${testErrorLog.transaction.tokenSymbol}
Amount: ${testErrorLog.transaction.amount}

============================================================
END OF ERROR LOG
============================================================
`;

console.log(formatted);
```

### Step 3: See the Output!
You'll see a formatted error log in the console - this is what users will copy and send to you!

---

## Option 3: Test in Production Code

### Quick Integration Test:

1. Open `src/app/staking/hooks/useStakingActions.ts`

2. Find any `showErrorModal` call, for example line 49:
```typescript
showErrorModal('Insufficient Balance', `You don't have enough ${selectedToken} to stake this amount`);
```

3. Update it to:
```typescript
// Import at top of file:
import { createErrorLog } from '@/utils/errorLogger';

// Then replace the call:
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
```

4. Save and test by trying to stake more than you have!

---

## ✅ What to Check

When testing, verify:

- [ ] Error modal appears with error message
- [ ] "Copy Debug Log" button is visible
- [ ] Clicking "Copy Debug Log" shows green checkmark
- [ ] Pasting shows formatted log with all details
- [ ] "Show Technical Details" button expands/collapses info
- [ ] Technical details show all captured data
- [ ] Helper text says "Copy this log and send it to support"
- [ ] Close button works
- [ ] Modal is mobile-responsive
- [ ] Glass morphism effects look good

---

## 🎯 Test Scenarios to Try

### Scenario 1: Staking Error
- Try to stake more than you have
- Should capture: amount, token, user action

### Scenario 2: API Error
- Disconnect internet and try to load a page
- Should capture: endpoint, method, error

### Scenario 3: Wallet Error
- Disconnect wallet and try to stake
- Should capture: component, action

---

## 📋 Sample Output

When you paste the copied log, you should see:

```
============================================================
DIGIKO ERROR LOG
============================================================

ERROR DETAILS:
Title: Staking Failed
Message: Insufficient DGKO balance in wallet
Stack Trace: [full error stack if available]

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
User Agent: [full user agent string]

TRANSACTION DETAILS:
Type: stake
Token: DGKO
Amount: 1000

============================================================
END OF ERROR LOG
============================================================
```

---

## 💡 Pro Tips

1. **Test on mobile** - Resize browser to mobile view and test
2. **Test with real errors** - Try actual failing operations
3. **Check console** - Make sure no errors in browser console
4. **Copy and paste** - Always test the copy button actually works
5. **Try all scenarios** - Each scenario captures different data

---

## ❓ Troubleshooting

### "Copy button doesn't work"
- Make sure you're using HTTPS or localhost
- Clipboard API requires secure context

### "Technical details don't show"
- Make sure errorLog prop is passed to TransactionModal
- Check browser console for errors

### "Some fields are undefined"
- That's OK! Not all fields apply to all errors
- Optional fields will be undefined if not provided

---

## 🎉 Success!

If you can:
1. ✅ Trigger an error
2. ✅ See the error modal with "Copy Debug Log" button
3. ✅ Copy the log successfully
4. ✅ Paste and see formatted output with all details
5. ✅ Expand/collapse technical details

**Then it's working perfectly!** 🚀

---

## 📚 Next Steps

After testing:
1. Integrate into other pages (see INTEGRATION_GUIDE.md)
2. Deploy to production
3. Tell users to copy debug logs when reporting issues
4. Enjoy faster debugging!
