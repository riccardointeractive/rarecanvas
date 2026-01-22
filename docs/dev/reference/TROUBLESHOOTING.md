# Troubleshooting Guide
## Common Issues and Solutions

**Last Updated:** December 11, 2025  
**Version:** 1.12.0

---

## Table of Contents
1. [Auto-Refresh Issues](#auto-refresh-issues)
2. [ZIP Installation Problems](#zip-installation-problems)
3. [Cache & Build Issues](#cache--build-issues)
4. [Transaction Problems](#transaction-problems)
5. [Token Images Not Loading](#token-images-not-loading)
6. [TypeScript Errors](#typescript-errors)
7. [Klever SDK Issues](#klever-sdk-issues)
8. [Browser Console Import Errors](#browser-console-import-errors)
9. [KLV Rewards Display Issues](#klv-rewards-display-issues) ⭐ NEW
10. [Telegram Notification Failures](#telegram-notification-failures) ⭐ NEW
11. [Admin Session Issues](#admin-session-issues) ⭐ NEW
12. [Validator Data Problems](#validator-data-problems) ⭐ NEW
13. [KLV Bucket State Detection](#klv-bucket-state-detection) ⭐ NEW

---

## Auto-Refresh Issues

### Problem: Page Continuously Refreshing

**Symptoms:**
- Page/data updates automatically every 30-60 seconds
- Constant API calls in terminal logs
- No user interaction required for updates
- Disturbing user experience

**Root Causes:**
1. **KleverContext auto-refresh** (MOST COMMON)
   - Location: `src/context/KleverContext.tsx`
   - Affects: ENTIRE app (all pages)
   - Impact: GLOBAL - highest priority to fix

2. **Hook-level auto-refresh**
   - Location: Individual hooks in page folders
   - Affects: Specific page only
   - Examples: `useTokenBalances.ts`, `useTransactionHistory.ts`

3. **Component-level auto-refresh**
   - Location: Individual components
   - Affects: That component only
   - Example: `Balance.tsx`

**Solution:**

### Step 1: Identify Auto-Refresh Sources

Search for `setInterval` in codebase:
```bash
grep -r "setInterval" src --include="*.tsx" --include="*.ts" | grep -v node_modules
```

### Step 2: Remove Each setInterval

**Pattern to REMOVE:**
```typescript
// ❌ BAD - Auto-refresh pattern
useEffect(() => {
  if (!address) return;
  
  const interval = setInterval(() => {
    fetchData();
  }, 30000); // Runs every 30 seconds
  
  return () => clearInterval(interval);
}, [address, fetchData]);
```

**Pattern to ADD:**
```typescript
// ✅ GOOD - Manual refresh pattern
const fetchData = useCallback(async () => {
  // Fetch logic here
}, [dependencies]);

useEffect(() => {
  fetchData(); // Run once on mount
}, [fetchData]);

// Return refetch function for manual refresh
return { data, loading, error, refetch: fetchData };
```

### Step 3: Add Manual Refresh UI

**Add refresh button to component:**
```typescript
<button
  onClick={refetch}
  disabled={loading}
  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10"
  title="Refresh"
>
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
</button>
```

### Verification

After fixes, verify in browser console:
1. Load page and note timestamps in console logs
2. Wait 60 seconds without touching anything
3. **Expected:** No automatic logs appearing
4. **If fail:** Run grep command again to find remaining intervals

**Files Fixed (Nov 26, 2025):**
- `src/context/KleverContext.tsx` - Removed global 30s balance refresh
- `src/app/dashboard/hooks/useTokenBalances.ts` - Removed 30s refresh
- `src/app/dashboard/hooks/useTransactionHistory.ts` - Removed 60s refresh  
- `src/components/Balance.tsx` - Removed 30s timestamp refresh

---

## ZIP Installation Problems

### Problem: Files Not Updating After ZIP Installation

**Symptoms:**
- Unzip command succeeds
- `npm run dev` starts successfully
- Browser still shows OLD code/UI
- Changes aren't visible

**Root Causes:**

### 1. Wrong Extraction Directory

**Problem:** ZIP contains nested paths (e.g., `digiko/digiko/src/...`)

**Why it happens:**
```bash
# ❌ WRONG - Extracts TO project root FROM project root
# Already in project root
unzip -o ~/Downloads/package.zip
# Creates: digiko/digiko/src/... (NESTED!)
```

**Solution:**
```bash
# ✅ CORRECT - Extract FROM parent directory
cd ~/Projects
unzip -o ~/Downloads/package.zip
cd digiko
rm -rf .next
npm run dev
```

**OR use ZIP with correct paths:**
```bash
# ZIP created with: cd project_root && zip -r package.zip src/
# Then extract FROM project root:
# Already in project root
unzip -o ~/Downloads/package.zip  # Works because paths start with src/
rm -rf .next
npm run dev
```

### 2. Browser Cache Persisting

**Problem:** Browser caches old JavaScript bundle

**Solution:**
```bash
# Terminal: Clear Next.js cache
rm -rf .next

# Browser: Hard refresh
# Mac: Cmd + Shift + R
# Or: DevTools → Right-click refresh → "Empty Cache and Hard Reload"

# Nuclear option: Close browser tab completely
# Then open fresh tab to localhost:3000
```

### 3. Multiple Dev Servers Running

**Problem:** Old dev server still running on different port

**Symptoms:**
```
Port 3000 is in use, trying 3001...
```

**Solution:**
```bash
# Kill all Next.js processes
pkill -f next

# Verify they're dead
ps aux | grep next

# Then start fresh
npm run dev
```

### Installation Best Practices

**Always use this sequence:**
```bash
# 1. Kill existing servers
pkill -f next

# 2. Navigate to correct directory
cd ~/Projects
# OR
# Already in project root
# (depends on ZIP structure)

# 3. Extract
unzip -o ~/Downloads/package.zip

# 4. Navigate if needed
cd digiko  # Only if extracted from parent

# 5. Clear cache
rm -rf .next

# 6. Start server
npm run dev

# 7. Browser: Hard refresh or new tab
```

---

## Cache & Build Issues

### Problem: "Missing required error components"

**Solution:**
```bash
rm -rf .next && npm run dev
```

**When to clear cache:**
- After structural changes (new directories, moved files)
- After component refactors
- After config changes
- Any error mentioning "error components"
- When in doubt

### Problem: TypeScript compilation fails after update

**Symptoms:**
```
Type 'X' is not assignable to type 'Y'
Property 'Z' does not exist on type 'W'
```

**Solution:**
1. Check if types file was updated: `src/types/klever.ts`
2. Verify imports match new type definitions
3. Clear cache: `rm -rf .next`
4. Restart TypeScript server in VSCode: `Cmd+Shift+P` → "Restart TS Server"

---

## Transaction Problems

### Problem: Transactions Not Showing in Dashboard

**Debug Process:**

### Step 1: Check Browser Console (Not Terminal!)

Open DevTools (F12) and look for:
```
🔍 Fetching transactions from: https://api.mainnet.klever.org/v1.0/transaction/list/...
📡 Transaction API response status: 404 or 200
📦 Transaction API full response: {...}
📋 Transaction list length: X
```

### Step 2: Interpret Results

**Status 404:**
```
ℹ️ No transactions found (404) - wallet may be new or inactive
```
- **Meaning:** Wallet has no transaction history
- **Normal:** For new/inactive wallets
- **Action:** Make a test transaction to verify system works

**Status 200 + Empty Array:**
```
📋 Transaction list length: 0
```
- **Meaning:** API returns success but no transactions
- **Possible:** Klever API sync issue or genuinely empty
- **Action:** Check wallet on Klever blockchain explorer

**Status 200 + Data but Not Displaying:**
```
📋 Transaction list length: 5
✅ Formatted transactions count: 5
```
- **Meaning:** Data arrives but component doesn't render
- **Possible:** Component rendering bug or filter issue
- **Action:** Check component code and formatting logic

### Step 3: Verify Transaction Fetching

Add debug logs if not present:
```typescript
console.log('🔍 Fetching transactions from:', apiUrl);
const response = await fetch(apiUrl);
console.log('📡 Response status:', response.status);
const data = await response.json();
console.log('📦 Full response:', data);
```

### Step 4: Check Network Configuration

Verify correct network in `src/config/app.ts`:
```typescript
export const APP_CONFIG = {
  network: 'Mainnet', // or 'Testnet'
}
```

**Mainnet tokens** won't show on testnet API and vice versa!

---

## Token Images Not Loading

**See:** [TOKEN_IMAGES.md](TOKEN_IMAGES.md) for complete guide

**Quick Fix:**
```bash
# Check if TokenImage component is using correct API
grep -A 10 "const getImageUrl" src/components/TokenImage.tsx

# Should check Klever API FIRST, then custom logos
```

---

## TypeScript Errors

### Problem: "Cannot find module '@/...'"

**Solution:**
```bash
# Verify tsconfig.json has correct paths
cat tsconfig.json | grep baseUrl
# Should show: "baseUrl": "."

# Clear and restart
rm -rf .next
npm run dev
```

### Problem: "Type X is not assignable"

**Common causes:**
1. Missing property in interface
2. Incorrect type import
3. Changed type definition not propagated

**Solution:**
1. Check `src/types/klever.ts` for current types
2. Update imports to match
3. Clear cache: `rm -rf .next`

---

## Klever SDK Issues

### Problem: Transaction fails silently

**Debug:**
```typescript
// Add logging to transaction flow
console.log('1️⃣ Building transaction...');
const unsignedTx = await buildTransaction(...);
console.log('2️⃣ Unsigned TX:', unsignedTx);

console.log('3️⃣ Signing transaction...');
const signedTx = await signTransaction(unsignedTx);
console.log('4️⃣ Signed TX:', signedTx);

console.log('5️⃣ Broadcasting transaction...');
const result = await broadcastTransactions([signedTx]);
console.log('6️⃣ Result:', result);
```

### Problem: Staking bucket ID not found

**Solution:**
- Bucket IDs are created on first stake
- For unstaking, must query `/address/{address}` to get bucket IDs
- Cannot hardcode bucket IDs - they're dynamic per user

**See:** [KLEVER_INTEGRATION.md](KLEVER_INTEGRATION.md) for complete Klever guide

---

## Browser Console Import Errors

### Problem: "Failed to fetch dynamically imported module"

**Discovered:** November 30, 2025  
**Context:** Attempting to import TypeScript files in browser console

**Error:**
```javascript
const { functionName } = await import('/src/utils/file.ts');
// Error: Failed to fetch dynamically imported module
```

### Root Cause

**Browser cannot import TypeScript files directly.**

Why:
- TypeScript files in `/src` are not accessible to browser
- They must be compiled by Next.js build process first
- Browser only has access to compiled JavaScript in `/.next`
- Raw `.ts` files are not served to the browser

### What Browser CAN Import

✅ Compiled JavaScript from public URL  
✅ Modules from CDN  
✅ Built files from `/_next/` (after compilation)

### What Browser CANNOT Import

❌ Raw TypeScript files from `/src`  
❌ Files that haven't been built  
❌ Server-side only modules  
❌ Files outside of build output

### The Solution

**Instead of console imports, create dedicated test pages.**

### Example: Wrong Approach

```typescript
// ❌ BAD - Trying to use console imports
// File: src/utils/utilityFunction.ts
export function utilityFunction() {
  // ...
}

// In browser console:
const { utilityFunction } = await import('/src/utils/utilityFunction.ts');
// ERROR: Failed to fetch
```

### Example: Correct Approach

```typescript
// ✅ GOOD - Create test page with inline logic
// File: src/app/test-feature/page.tsx

'use client';

export default function TestFeaturePage() {
  const handleTest = async () => {
    // All logic inline - no imports needed
    try {
      const result = await someOperation();
      console.log('Success:', result);
    } catch (error) {
      console.error('Error:', error);
    }
  };
  
  return (
    <div className="p-8">
      <h1>Test Feature</h1>
      <button 
        onClick={handleTest}
        className="px-4 py-2 bg-blue-500 rounded"
      >
        Run Test
      </button>
    </div>
  );
}
```

### Best Practice for Testing

When users or developers need to test functionality:

1. **Don't rely on console imports** - They won't work
2. **Create dedicated test pages** at specific routes
3. **Include all logic inline** in the page component
4. **No external imports** that might break
5. **Clear UI with feedback** for results

### Real-World Example: SetAccountName Test Page

**Created:** `/set-name` route for testing SetAccountName functionality

```typescript
// File: src/app/set-name/page.tsx
'use client';

export default function SetNamePage() {
  const [status, setStatus] = useState('');

  const handleSetName = async () => {
    try {
      setStatus('Building transaction...');
      
      // All logic inline - no imports
      const unsignedTx = await window.kleverWeb.buildTransaction([
        {
          type: 12, // SetAccountName
          payload: { name: 'Digiko DEX' }
        }
      ]);
      
      setStatus('Signing...');
      const signedTx = await window.kleverWeb.signTransaction(unsignedTx);
      
      setStatus('Broadcasting...');
      const response = await window.kleverWeb.broadcastTransactions([signedTx]);
      
      setStatus('Success! Transaction: ' + response.hash);
    } catch (error) {
      setStatus('Error: ' + error.message);
    }
  };

  return (
    <div className="p-8">
      <button onClick={handleSetName}>Set Name to Digiko DEX</button>
      <p>{status}</p>
    </div>
  );
}
```

### Alternative: Public JavaScript Files

If you absolutely need browser-accessible functions:

```typescript
// File: public/utils/browserUtils.js (NOT .ts!)
// This file will be accessible at /utils/browserUtils.js

export function publicFunction() {
  console.log('This works in browser!');
}

// In browser console:
const module = await import('/utils/browserUtils.js'); // ✅ Works!
module.publicFunction();
```

**Note:** 
- Must be plain JavaScript (`.js`), not TypeScript (`.ts`)
- Must be in `/public` directory
- No access to Next.js features or TypeScript
- Limited to browser APIs only

### Summary

| Approach | Works? | Use Case |
|----------|--------|----------|
| Import `/src/*.ts` in console | ❌ | Never - will fail |
| Import `/public/*.js` in console | ✅ | Browser-only utilities |
| Create test page route | ✅ | **Recommended approach** |
| Use built files from `/_next` | ⚠️ | Possible but fragile |

**Recommendation:** Always create test pages for functionality testing.

---

### 1. Check Browser Console FIRST
- Terminal logs = Server-side
- Console logs = Client-side
- Most React issues appear in console, not terminal

### 2. Clear Cache When In Doubt
```bash
rm -rf .next && npm run dev
```

### 3. Verify File Locations
```bash
# Check if file exists where you think it does
ls -la src/app/dashboard/page.tsx

# Check file contents
cat src/app/dashboard/page.tsx | head -20
```

### 4. Check for Multiple Versions
```bash
# Find all files with same name
find src -name "page.tsx" -type f

# Can reveal unexpected duplicates
```

### 5. Kill All Processes
```bash
# Nuclear option
pkill -f next
pkill -f node
# Then start fresh
```

---

## Quick Command Reference

```bash
# Clear everything and restart
pkill -f next && rm -rf .next && npm run dev

# Find auto-refresh intervals
grep -r "setInterval" src --include="*.tsx" --include="*.ts"

# Check what's running
ps aux | grep next
lsof -i :3000  # What's using port 3000

# Find file locations
find src -name "*.tsx" | grep dashboard

# Check file contents quickly
cat src/app/dashboard/page.tsx | grep -A 5 "export default"
```

---

## When All Else Fails

1. **Read the error message carefully**
   - Error messages are accurate 90% of the time
   - They tell you exactly what's wrong

2. **Check recent changes**
   - What was the last thing that worked?
   - What changed since then?

3. **Isolate the problem**
   - Does it happen on ALL pages or ONE page?
   - Does it happen in ALL browsers or ONE browser?
   - Does it happen for ALL users or ONE user?

4. **Start fresh**
   ```bash
   # Nuclear option
   rm -rf .next
   rm -rf node_modules
   npm install
   npm run dev
   ```

5. **Check the docs**
   - [KLEVER_INTEGRATION.md](KLEVER_INTEGRATION.md) - Blockchain issues
   - [MODULAR_ARCHITECTURE.md](MODULAR_ARCHITECTURE.md) - Code structure
   - [TOKEN_IMAGES.md](TOKEN_IMAGES.md) - Image loading

---

*Last Updated: December 11, 2025 | v1.12.0*  
*If you find a bug not covered here, document it!*

---

## KLV Rewards Display Issues

**Discovered:** December 10-11, 2025

### Problem: Delegation Rewards Showing Wrong Amount

**Symptoms:**
- Expected ~1,400 KLV delegation rewards
- Dashboard shows ~940 KLV
- Staking rewards correct, delegation rewards wrong

**Root Cause:**

Code incorrectly assumed `allowance` was combined total and subtracted staking:

```typescript
// ❌ WRONG - This was the bug
const delegationRewards = allowance - stakingRewards;
```

**Reality:** Klever API returns them SEPARATELY:
- `account.stakingRewards` = Staking rewards only (claim type 0)
- `account.allowance` = Delegation rewards only (claim type 1)

**Fix:**

```typescript
// ✅ CORRECT - Use allowance directly
const stakingRewards = account.stakingRewards || 0;
const delegationRewards = account.allowance || 0;
const totalRewards = stakingRewards + delegationRewards;
```

**File:** `src/app/staking/hooks/useKLVStaking.ts`

### Problem: Rewards Show 0 When They Exist

**Debug Steps:**
1. Check browser console for API response
2. Verify correct endpoint: `/v1.0/address/{address}/allowance`
3. Check if `allowance` field exists in response
4. Verify wallet has actual rewards on KleverScan

---

## Telegram Notification Failures

**Discovered:** December 10-11, 2025

### Problem: Notification Shows Truncated Content

**Symptoms:**
- v1.11.0 notifications: Full content with bullet points ✅
- v1.12.0 notifications: Only shows "Network Toggle" ❌

**Root Cause:** Unescaped ampersand in title broke curl parsing.

```yaml
# Title was: "Network Toggle & Testnet Support"
# The & was interpreted as form field separator
```

**Fix 1: Escape HTML entities in content**

```bash
CHANGELOG=$(echo "$CHANGELOG" | sed 's/&/\&amp;/g; s/</\&lt;/g; s/>/\&gt;/g')
```

**Fix 2: URL-encode title field**

```yaml
# Before
-d "text=$TITLE"

# After
--data-urlencode "text=$TITLE"
```

**File:** `.github/workflows/telegram-notify.yml`

### Problem: Notifications Not Sending At All

**Debug Steps:**
1. Check GitHub Actions logs
2. Verify `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` secrets
3. Test curl command manually:
```bash
curl -X POST "https://api.telegram.org/bot$TOKEN/sendMessage" \
  --data-urlencode "chat_id=$CHAT_ID" \
  --data-urlencode "text=Test message" \
  -d "parse_mode=HTML"
```

---

## Admin Session Issues

**Discovered:** December 10, 2025

### Problem: Constant Password Prompts

**Symptoms:**
- Log in successfully
- Navigate to another admin page
- Prompted for password again
- Every action requires re-authentication

**Root Cause:** Vercel serverless functions are stateless - in-memory session stores don't persist.

```typescript
// ❌ This doesn't work in serverless
const sessions = new Map<string, Session>();  // Resets on each invocation!
```

**Current Workaround:** Lenient auth trusts localStorage when server can't verify:

```typescript
const verifySession = async () => {
  const serverValid = await checkServer();
  const localSession = localStorage.getItem('adminSession');
  
  // If server can't verify (stateless), trust local
  if (!serverValid && localSession) {
    return true;
  }
  return serverValid;
};
```

**Proper Solution (TODO):** Use Redis or database for session storage.

**See:** `docs/dev/REDIS_SETUP.md` for maintenance mode Redis implementation (can be extended).

---

## Validator Data Problems

**Discovered:** December 9, 2025

### Problem: Only 10 Validators Showing

**Root Cause:** Klever API defaults to `limit=10`.

**Fix:**
```typescript
const response = await fetch(
  `${API}/v1.0/validator/list?limit=500&canDelegate=true`
);
```

### Problem: Commission/Rating Values Wrong

**Symptoms:**
- Commission shows 3000 instead of 30%
- Rating shows 10000000 instead of 100

**Root Cause:** Klever API returns scaled values.

| Field | API Value | Actual Value | Divisor |
|-------|-----------|--------------|---------|
| commission | 3000 | 30% | 100 |
| rating | 10000000 | 100.00 | 100000 |

**Fix:**
```typescript
const commission = apiResponse.commission / 100;
const rating = apiResponse.rating / 100000;
```

**Pattern:** Always check Klever API documentation for field scaling.

---

## KLV Bucket State Detection

**Discovered:** December 10, 2025

### Problem: Active Buckets Show as "Unstaking"

**Symptoms:**
- Freshly staked bucket shows "Unstaking in X epochs"
- No unstake action was performed
- UI incorrectly categorizes bucket state

**Root Cause:** Klever uses sentinel value for "not unstaked".

```typescript
// Klever API response for active (not unstaking) bucket:
{
  unstakedEpoch: 4294967295  // This is 0xFFFFFFFF, max uint32
}
```

**This is NOT an actual epoch number - it means "not set" / "null".**

**Fix:**
```typescript
const MAX_UINT32 = 4294967295;

const isUnstaking = (bucket: Bucket): boolean => {
  return bucket.unstakedEpoch !== undefined && 
         bucket.unstakedEpoch !== MAX_UINT32 &&
         bucket.unstakedEpoch > 0;
};

// Categorize bucket states
const activeAmount = buckets
  .filter(b => !isUnstaking(b))
  .reduce((sum, b) => sum + b.balance, 0);

const unstakingAmount = buckets
  .filter(b => isUnstaking(b))
  .reduce((sum, b) => sum + b.balance, 0);
```

**Pattern:** Watch for max uint values in blockchain APIs - they often represent null/undefined states.

---

## Quick Debug Commands

```bash
# Check all setInterval (auto-refresh sources)
grep -r "setInterval" src --include="*.tsx" --include="*.ts"

# Find hardcoded token IDs
grep -rn "DGKO-CXVJ\|BABYDGKO-3S67" src

# Check TypeScript errors
npm run type-check

# Full validation
npm run validate

# Kill stuck processes
pkill -f next && rm -rf .next && npm run dev
```

---

## When to Update This Document

Add entries when:
- ✅ Bug takes >30 minutes to solve
- ✅ Bug involves non-obvious root cause
- ✅ Bug could recur or affect others
- ✅ Solution involves specific code patterns

Don't add:
- ❌ Simple typos
- ❌ Missing imports
- ❌ One-time issues

---

## SC Query Returns "wrong number of arguments"

**Added:** December 12, 2025

### Symptoms
- Smart contract query via `/v1.0/sc/query` fails
- Error: `"VMUserError:wrong number of arguments"`
- Zero-argument functions work, functions with arguments fail

### Root Cause
Using wrong field name and format for arguments:

```typescript
// ❌ WRONG - This silently fails!
{
  funcName: 'getLpPosition',
  args: ['AQ==', 'h8GLPZM3JF...']  // base64 strings
}
```

### Solution
Use `arguments` (not `args`) with byte arrays (not base64):

```typescript
// ✅ CORRECT
{
  funcName: 'getLpPosition',
  arguments: [[1], [135, 193, 139, ...]]  // byte arrays
}
```

### Helper Functions

```typescript
// Convert BigInt to byte array (minimal encoding)
function bigintToByteArray(value: bigint): number[] {
  if (value === 0n) return [0];
  const bytes: number[] = [];
  let temp = value;
  while (temp > 0n) {
    bytes.unshift(Number(temp & 0xffn));
    temp = temp >> 8n;
  }
  return bytes;
}

// Convert hex to byte array
function hexToByteArray(hex: string): number[] {
  const bytes: number[] = [];
  for (let i = 0; i < hex.length; i += 2) {
    bytes.push(parseInt(hex.substr(i, 2), 16));
  }
  return bytes;
}
```

### Why Zero-Argument Functions Worked
- `args` is an invalid field name (API expects `arguments`)
- Invalid fields are **silently ignored**
- So `args: []` = no arguments = correct for functions with no params!

### Reference
- See `docs/dev/smart-contracts/ABI_ENCODING_GUIDE.md` for full encoding guide
- See `contract/klever-proxy-api-spec.json` for API schema (source of truth)
