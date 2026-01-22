# Debug Mode & Testing Guide
**Complete Guide to Debugging, Testing, and Development Tools**

**Version:** v1.0.0  
**Status:** ✅ Fully Integrated  
**Last Updated:** November 28, 2024

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Debug Mode](#debug-mode)
3. [Debug Menu](#debug-menu)
4. [Force Errors for Testing](#force-errors-for-testing)
5. [Testing Workflows](#testing-workflows)
6. [Integration Examples](#integration-examples)
7. [Best Practices](#best-practices)

---

## 📖 Overview

Digiko includes comprehensive debugging and testing tools that allow you to:
- Enable debug mode without breaking production
- Access hidden debug menu
- Force errors for testing error logging
- Test error scenarios safely
- Verify error logging integration

---

## 🐛 Debug Mode

### What is Debug Mode?

Debug mode is a **non-breaking** development feature that:
- Enables verbose console logging
- Shows hidden debug information
- Allows forcing errors for testing
- Does NOT break production functionality
- Can be toggled on/off anytime

### Enabling Debug Mode

#### Method 1: URL Parameter (Temporary)
```
http://localhost:3000/staking?debug=true
```

Debug mode active for current session only.

#### Method 2: localStorage (Persistent)
```javascript
// In browser console
localStorage.setItem('debug', 'true')

// Disable
localStorage.removeItem('debug')
```

Debug mode persists across page reloads.

#### Method 3: Debug Menu (Recommended)
Press `Ctrl+Shift+D` (or `Cmd+Shift+D` on Mac) to toggle debug menu.

### Checking Debug Mode Status

```typescript
import { isDebugMode } from '@/utils/debugMode';

if (isDebugMode()) {
  console.log('Debug mode is active');
}
```

### Debug Mode Utilities

#### `src/utils/debugMode.ts`

```typescript
// Check if debug mode is enabled
export function isDebugMode(): boolean

// Log only in debug mode
export function debugLog(message: string, ...args: any[]): void

// Warn only in debug mode
export function debugWarn(message: string, ...args: any[]): void

// Error log (always logs, but adds debug context)
export function debugError(message: string, error?: Error): void

// Toggle debug mode programmatically
export function toggleDebugMode(): boolean

// Enable debug mode
export function enableDebugMode(): void

// Disable debug mode
export function disableDebugMode(): void
```

#### Usage Examples

```typescript
import { debugLog, debugWarn, debugError, isDebugMode } from '@/utils/debugMode';

// Log only in debug mode
debugLog('Fetching token balance', { address, token });

// Warn only in debug mode
debugWarn('API response slow', { endpoint, duration });

// Error with debug context
debugError('Transaction failed', error);

// Conditional logic based on debug mode
if (isDebugMode()) {
  // Show extra debugging UI
  // Enable verbose logging
  // Allow forcing errors
}
```

---

## 🎮 Debug Menu

### What is the Debug Menu?

A hidden overlay that provides quick access to:
- Debug mode toggle
- Force error testing
- System information
- Quick actions for testing

### Accessing the Debug Menu

**Keyboard Shortcut:** `Ctrl+Shift+D` (Windows/Linux) or `Cmd+Shift+D` (Mac)

**Programmatic:**
```typescript
import { useDebugMenu } from '@/hooks/useDebugMenu';

const { isOpen, toggle } = useDebugMenu();
```

### Debug Menu Component

#### `src/components/DebugMenu.tsx`

Features:
- Glass morphism design
- Keyboard shortcuts
- Force error testing
- System info display
- Debug mode toggle

Example UI:
```
┌─────────────────────────────────┐
│  🔧 DEBUG MENU                  │
├─────────────────────────────────┤
│  [Toggle Debug Mode]            │
│  [Force Staking Error]          │
│  [Force API Error]              │
│  [Force Validation Error]       │
├─────────────────────────────────┤
│  Version: v1.0.0                │
│  Network: mainnet               │
│  Debug: ✅ Active               │
└─────────────────────────────────┘
```

### Adding Debug Menu to Pages

```typescript
import DebugMenu from '@/components/DebugMenu';

export default function MyPage() {
  return (
    <>
      {/* Your page content */}
      
      {/* Debug menu (only shows in debug mode) */}
      <DebugMenu />
    </>
  );
}
```

---

## ⚠️ Force Errors for Testing

### Why Force Errors?

Testing error logging without breaking production:
- Verify error log format
- Test copy functionality
- Check technical details display
- Validate all error paths
- Ensure proper context capture

### Force Error Pattern

```typescript
import { isDebugMode } from '@/utils/debugMode';
import { createErrorLog } from '@/utils/errorLogger';

async function handleStake(amount: string) {
  try {
    // Force error in debug mode
    if (isDebugMode() && localStorage.getItem('forceStakeError') === 'true') {
      throw new Error('DEBUG: Forced staking error for testing');
    }
    
    // Normal staking logic
    await executeStake(amount);
    
  } catch (error) {
    const errorLog = createErrorLog({
      title: 'Staking Failed',
      message: 'Could not complete staking transaction',
      error: error as Error,
      userAddress: address,
      component: 'StakingPage',
      action: `Stake ${amount} DGKO`,
      transaction: {
        type: 'stake',
        tokenSymbol: 'DGKO',
        amount,
      },
    });
    
    showErrorModal('Staking Failed', 'Please try again', errorLog);
  }
}
```

### Activating Force Errors

#### Method 1: localStorage
```javascript
// Force staking error
localStorage.setItem('forceStakeError', 'true');

// Force API error
localStorage.setItem('forceApiError', 'true');

// Force validation error
localStorage.setItem('forceValidationError', 'true');

// Disable forcing
localStorage.removeItem('forceStakeError');
```

#### Method 2: Debug Menu
1. Press `Ctrl+Shift+D` to open debug menu
2. Click "Force [Error Type]"
3. Perform the action
4. Error will be triggered with full logging

#### Method 3: URL Parameter
```
http://localhost:3000/staking?debug=true&forceError=stake
```

### Common Force Error Keys

```typescript
// Staking
forceStakeError
forceUnstakeError
forceClaimError

// Swap
forceSwapError
forceSwapBuildError

// API
forceApiError
forceBalanceError
forceTokenStatsError

// Validation
forceValidationError
forceInsufficientBalanceError
```

---

## 🧪 Testing Workflows

### Workflow 1: Test New Error Integration

```bash
# 1. Enable debug mode
localStorage.setItem('debug', 'true');

# 2. Enable force error
localStorage.setItem('forceStakeError', 'true');

# 3. Navigate to page
http://localhost:3000/staking

# 4. Attempt action (stake tokens)
# Error modal appears with debug log button

# 5. Verify error log
- Click "Show Technical Details"
- Check all fields are populated
- Click "Copy Debug Log"
- Paste and verify format

# 6. Clean up
localStorage.removeItem('forceStakeError');
```

### Workflow 2: Test Error Logging Across Pages

```javascript
// Test script in browser console
const testPages = [
  { page: '/staking', error: 'forceStakeError' },
  { page: '/swap', error: 'forceSwapError' },
  { page: '/dashboard', error: 'forceBalanceError' },
];

// Enable debug mode
localStorage.setItem('debug', 'true');

// Test each page
testPages.forEach(test => {
  console.log(`Testing ${test.page}...`);
  localStorage.setItem(test.error, 'true');
  // Navigate to page and trigger error
  // Verify log format
  // Clean up
  localStorage.removeItem(test.error);
});
```

### Workflow 3: Production Safety Check

Before deploying:

```typescript
// ✅ SAFE: Debug code protected
if (isDebugMode()) {
  // This only runs when debug is explicitly enabled
}

// ✅ SAFE: Force errors guarded
if (isDebugMode() && localStorage.getItem('forceError') === 'true') {
  // Only triggers in debug mode AND with explicit flag
}

// ❌ UNSAFE: No protection
if (localStorage.getItem('forceError') === 'true') {
  // Could trigger in production!
}
```

Checklist:
- [ ] All force error checks wrapped in `isDebugMode()`
- [ ] Debug logs use `debugLog()` not `console.log()`
- [ ] No hardcoded debug flags
- [ ] Test with debug mode OFF
- [ ] Verify no debug UI visible in production

---

## 💡 Integration Examples

### Example 1: Staking Page Integration

```typescript
import { isDebugMode, debugLog } from '@/utils/debugMode';
import { createErrorLog } from '@/utils/errorLogger';

export default function StakingPage() {
  const handleStake = async (amount: string) => {
    debugLog('Stake initiated', { amount, address });
    
    try {
      // Force error for testing (debug mode only)
      if (isDebugMode() && localStorage.getItem('forceStakeError') === 'true') {
        throw new Error('DEBUG: Forced staking error');
      }
      
      await executeStake(amount);
      debugLog('Stake successful', { amount });
      
    } catch (error) {
      debugError('Stake failed', error as Error);
      
      const errorLog = createErrorLog({
        title: 'Staking Failed',
        message: 'Could not complete staking',
        error: error as Error,
        userAddress: address,
        component: 'StakingPage',
        action: `Stake ${amount} DGKO`,
        transaction: {
          type: 'stake',
          tokenSymbol: 'DGKO',
          amount,
        },
      });
      
      showErrorModal('Staking Failed', 'Please try again', errorLog);
    }
  };
  
  return (
    <>
      {/* Staking UI */}
      
      {/* Debug Menu (only visible in debug mode) */}
      {isDebugMode() && <DebugMenu />}
    </>
  );
}
```

### Example 2: API Integration

```typescript
export async function fetchTokenBalance(address: string): Promise<number> {
  debugLog('Fetching balance', { address });
  
  try {
    // Force error for testing
    if (isDebugMode() && localStorage.getItem('forceBalanceError') === 'true') {
      throw new Error('DEBUG: Forced balance fetch error');
    }
    
    const response = await fetch(`/api/balance?address=${address}`);
    
    if (!response.ok) {
      const errorLog = createErrorLog({
        title: 'Balance Fetch Failed',
        message: 'Could not retrieve balance',
        userAddress: address,
        component: 'BalanceAPI',
        action: 'Fetch token balance',
        api: {
          endpoint: '/api/balance',
          method: 'GET',
          statusCode: response.status,
          responseBody: await response.text(),
        },
      });
      
      throw errorLog;
    }
    
    const data = await response.json();
    debugLog('Balance fetched', { balance: data.balance });
    return data.balance;
    
  } catch (error) {
    debugError('Balance fetch failed', error as Error);
    throw error;
  }
}
```

### Example 3: Debug Menu Component

```typescript
'use client';

import { useState, useEffect } from 'react';
import { isDebugMode, toggleDebugMode } from '@/utils/debugMode';

export default function DebugMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [debugActive, setDebugActive] = useState(false);
  
  useEffect(() => {
    setDebugActive(isDebugMode());
    
    // Keyboard shortcut: Ctrl+Shift+D
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-black/90 backdrop-blur-xl border border-white/20 rounded-2xl p-6 min-w-[300px]">
        <h3 className="text-lg font-medium text-white mb-4">
          🔧 Debug Menu
        </h3>
        
        <div className="space-y-3">
          <button
            onClick={() => {
              toggleDebugMode();
              setDebugActive(isDebugMode());
            }}
            className="w-full px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm"
          >
            Debug Mode: {debugActive ? '✅ ON' : '❌ OFF'}
          </button>
          
          <button
            onClick={() => {
              localStorage.setItem('forceStakeError', 'true');
              alert('Stake error will be forced on next attempt');
            }}
            className="w-full px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm"
          >
            Force Staking Error
          </button>
          
          <button
            onClick={() => {
              localStorage.setItem('forceApiError', 'true');
              alert('API error will be forced on next request');
            }}
            className="w-full px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm"
          >
            Force API Error
          </button>
          
          <div className="pt-3 border-t border-white/10 text-xs text-gray-400">
            <p>Version: v1.0.0</p>
            <p>Network: mainnet</p>
            <p>Debug: {debugActive ? 'Active' : 'Inactive'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

## 💎 Best Practices

### Do's

✅ **Always protect force errors**
```typescript
if (isDebugMode() && localStorage.getItem('forceError') === 'true') {
  // Safe
}
```

✅ **Use debug utilities**
```typescript
debugLog('Info');  // Not console.log
debugWarn('Warning');  // Not console.warn
debugError('Error', error);  // Not console.error
```

✅ **Test thoroughly before deploy**
- Test with debug OFF
- Verify no debug UI visible
- Check no console logs in production

✅ **Document force error keys**
- List all force error flags
- Document in comments
- Update this guide

### Don'ts

❌ **Unprotected force errors**
```typescript
if (localStorage.getItem('forceError') === 'true') {
  // Could trigger in production!
}
```

❌ **Hardcoded debug flags**
```typescript
const DEBUG = true;  // Never hardcode!
```

❌ **Debug UI always visible**
```typescript
return <DebugMenu />;  // Wrong! Protect with isDebugMode()
```

❌ **Sensitive data in debug logs**
```typescript
debugLog('User data', { password, privateKey });  // Never!
```

---

## 🎯 Testing Checklist

Before deploying:

### Debug Mode
- [ ] Debug mode OFF by default
- [ ] Debug mode toggleable via URL/localStorage
- [ ] Debug logs only show in debug mode
- [ ] No debug UI visible in production

### Force Errors
- [ ] All force errors protected by isDebugMode()
- [ ] Force errors work as expected
- [ ] Force errors can be disabled
- [ ] No lingering force error flags

### Error Logging
- [ ] Error logs created for all error types
- [ ] Technical details collapsible
- [ ] Copy button works
- [ ] All context fields populated
- [ ] Privacy respected (addresses truncated)

### Production Safety
- [ ] No console.log() in production
- [ ] No hardcoded debug flags
- [ ] No debug UI visible
- [ ] Build succeeds with no warnings
- [ ] All error paths tested

---

## 📚 Related Documentation

- `ERROR_LOGGING.md` - Error logging system guide
- `ERROR_LOG_EXAMPLE.txt` - Sample error log output
- `TROUBLESHOOTING.md` - Common error solutions
- `TESTING_GUIDE.md` - General testing procedures

---

## 🎉 Summary

**Debug Mode:** Non-breaking development tools  
**Debug Menu:** Quick access to testing features  
**Force Errors:** Safe error testing without breaking production  
**Production Ready:** All protections in place

**Debug smarter, not harder.** 🚀
