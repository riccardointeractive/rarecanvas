# Deployment Troubleshooting Guide

**Last Updated:** November 28, 2024  
**Version:** 1.1.0 Deployment Saga

This document catalogs every deployment failure encountered during v1.1.0 and their solutions. Read this BEFORE deploying to avoid a 3-hour debugging session.

---

## Quick Reference

| Error Type | Symptom | Solution |
|------------|---------|----------|
| **Import Error** | `Cannot find module` | Check import paths, verify KleverContext not WalletContext |
| **Type Safety** | `Type 'null' is not assignable to 'undefined'` | Use `value \|\| undefined` |
| **Git Size** | `HTTP 400` on push, 300+ MB | Nuclear git reset (see below) |
| **Static Generation** | `useSearchParams() should be wrapped in suspense` | Add `export const dynamic = 'force-dynamic';` |
| **SSR Error** | `localStorage is not defined` | Force dynamic rendering |
| **Missing Fonts** | `Can't resolve './fonts/GeistVF.woff'` | Use `geist` npm package |
| **Docs Compilation** | TypeScript compiling docs folder | Add to `tsconfig.json` exclude |

---

## The 9 Failure Modes

### 1. Semantic Versioning Error

**Symptom:**
- Using v1.0.0 for new feature instead of v1.1.0

**Root Cause:**
- Misunderstanding semantic versioning rules

**Solution:**
```bash
# Semantic Versioning Rules
MAJOR.MINOR.PATCH

MAJOR (x.0.0) - Breaking changes, incompatible API changes
MINOR (1.x.0) - New features, backward compatible ✅ USE THIS
PATCH (1.0.x) - Bug fixes only
```

**Prevention:**
- New features = MINOR bump
- Bug fixes = PATCH bump
- Breaking changes = MAJOR bump

---

### 2. Wrong Import Path

**Symptom:**
```
Cannot find module '@/context/WalletContext'
Location: src/app/error-logging-test/page.tsx line 7
```

**Root Cause:**
- Copy-paste from old code using `WalletContext`
- Should be `KleverContext`

**Solution:**
```typescript
// ❌ Wrong
import { useWallet } from '@/context/WalletContext'

// ✅ Correct
import { useKlever } from '@/context/KleverContext'
```

**Prevention:**
- Always verify imports after copy-paste
- Check context names in current codebase

---

### 3. Nested Repository Structure

**Symptom:**
```
Error path: ./digiko/src/...
Cannot find module '../types/dashboard.types'
```

**Root Cause:**
- Double-nesting: `digiko/digiko/`
- Local structure correct, but GitHub had nested folder

**Solution:**
```bash
# Remove nested folder
rm -rf /home/claude/digiko/digiko

# Verify structure
ls -la /home/claude/digiko/
# Should see src/ at root, not another digiko/
```

**Prevention:**
- Always check directory structure before initial commit
- Use `tree -L 2` to visualize structure

---

### 4. Git History Bloat (THE BIG ONE)

**Symptom:**
```
Writing objects: 311.42 MiB | 9.22 MiB/s
error: RPC failed; HTTP 400
fatal: the remote end hung up unexpectedly
```

**Root Cause:**
- 3,072 contract build files tracked by git (311 MB)
- `contract/target/` directories with Rust build artifacts
- `.gitignore` added AFTER files were already tracked
- `git rm --cached` removes from tracking but NOT from history

**Why .gitignore Didn't Work:**
```bash
# This only affects FUTURE files:
echo "contract/target/" >> .gitignore

# This removes from tracking:
git rm --cached contract/target/

# But both leave files in git history!
# History still contains all 311 MB of old commits
```

**Git Object Size Check:**
```bash
git count-objects -vH

# Before cleanup:
count: 2879
size: 364.59 MiB  ❌ WAY TOO BIG

# After cleanup:
count: 279
size: 435 KB  ✅ GOOD
```

**Solution - Nuclear Git Reset:**

See `GIT_NUCLEAR_RESET.md` for full procedure. Quick version:

```bash
# Already in project root (VS Code terminal)

# 1. Complete history wipe
rm -rf .git

# 2. Fresh repo
git init

# 3. Add ONLY source files (never builds)
git add .gitignore src/ public/ docs/ package*.json *.config.js *.json *.md
git add contract/*.toml contract/src/ contract/wasm/src/

# 4. Commit clean
git commit -m "v1.1.0: Enhanced Error Logging System"

# 5. Force push
git branch -M main
git remote add origin https://github.com/riccardointeractive/digiko.git
git push -u origin main --force
```

**Result:**
- **Before:** 311.45 MiB, HTTP 400 error
- **After:** 435 KB, successful push
- **Reduction:** 99.86%

**Prevention:**
- Configure `.gitignore` BEFORE first commit
- Never commit `target/`, `node_modules/`, or build artifacts
- Check repo size regularly: `git count-objects -vH`
- If >50 MB, investigate immediately

---

### 5. TypeScript Compiling Documentation

**Symptom:**
```
Type error: Cannot find module '../config/staking.config'
File: ./docs/dev/READY_TO_USE_EXAMPLE.ts:14:55
```

**Root Cause:**
- `docs/` folder contains example TypeScript files
- Not meant to be compiled, just for reference
- TypeScript trying to compile everything in project

**Solution:**
```json
// tsconfig.json
{
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules", "docs/**/*", "contract/**/*"]
}
```

**Prevention:**
- Always exclude non-source directories from TypeScript
- Add to exclude: docs, scripts, temp, contract

---

### 6. Type Safety - Null vs Undefined

**Symptom:**
```
Type error: Type 'string | null' is not assignable to type 'string | undefined'.
Type 'null' is not assignable to type 'string | undefined'.
Location: src/app/error-logging-test/page.tsx:53
```

**Root Cause:**
- `useKlever()` returns `address: string | null`
- Error logging expects `userAddress: string | undefined`
- TypeScript in strict mode treats `null` and `undefined` as distinct types

**Wrong Solutions:**
```typescript
// ❌ Type casting (hides the problem)
userAddress: address as string | undefined

// ❌ Ignoring TypeScript
// @ts-ignore
userAddress: address
```

**Correct Solution:**
```typescript
// ✅ Explicit null handling
userAddress: address || undefined

// This converts:
// null → undefined
// string → string
// Runtime behavior is safe
```

**Why This Matters:**
```typescript
// Some APIs treat null and undefined differently
JSON.stringify({ value: null })      // {"value":null}
JSON.stringify({ value: undefined }) // {}

// Our error logging system expects undefined for "no value"
```

**Prevention:**
- Use `|| undefined` for null-to-undefined conversion
- Never use type casting to bypass this
- Understand the semantic difference between null and undefined

---

### 7. Next.js Static Site Generation (SSG) Errors

**Symptom:**
```
⨯ useSearchParams() should be wrapped in a suspense boundary at page "/dashboard"
Error occurred prerendering page "/dashboard"

Proxy error: Dynamic server usage: Route /api/balance couldn't be rendered statically
```

**Root Cause:**
- Next.js 14 tries to pre-render all pages at build time
- Web3 features require runtime data:
  - `useSearchParams()` - needs actual URL
  - Wallet connections - needs browser
  - `localStorage` - doesn't exist server-side
  - API routes with `searchParams` - need runtime request

**The Cascade:**
1. Compilation passes ✅
2. Type checking passes ✅
3. Static generation FAILS ❌

**Solution - Force Dynamic Rendering:**

```typescript
// src/app/layout.tsx
export const dynamic = 'force-dynamic';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <KleverProvider>
          {children}
        </KleverProvider>
      </body>
    </html>
  );
}
```

```typescript
// EVERY API route (src/app/api/*/route.ts)
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  // ... rest of code
}
```

**Why This Works:**
- Tells Next.js: "Don't try to pre-render this"
- Forces server-side rendering on every request
- Allows runtime features like wallet connections

**Prevention:**
- Add `export const dynamic = 'force-dynamic';` to:
  - Root layout (src/app/layout.tsx)
  - ALL API routes (src/app/api/*/route.ts)
  - Any page using useSearchParams without Suspense
- Web3 apps should ALWAYS use dynamic rendering

---

### 8. localStorage During SSR

**Symptom:**
```
Error loading swap history: ReferenceError: localStorage is not defined
Location: /vercel/path0/.next/server/app/swap/page.js:1:3660
```

**Root Cause:**
- `localStorage` accessed during server-side rendering
- `localStorage` only exists in browser, not Node.js

**Solution:**
```typescript
// ❌ Wrong - runs on server
const [history, setHistory] = useState(() => {
  return JSON.parse(localStorage.getItem('swapHistory') || '[]');
});

// ✅ Correct - only runs in browser
const [history, setHistory] = useState([]);

useEffect(() => {
  // This only runs client-side
  const saved = localStorage.getItem('swapHistory');
  if (saved) setHistory(JSON.parse(saved));
}, []);
```

**Alternative - Force Dynamic:**
```typescript
// At top of page component
export const dynamic = 'force-dynamic';

// Now can use localStorage safely (no SSR)
```

**Prevention:**
- Never call `localStorage` at module scope or in render
- Use `useEffect` for client-side only code
- Or force dynamic rendering for entire page

---

### 9. Missing Font Files

**Symptom:**
```
Module not found: Can't resolve './fonts/GeistVF.woff'
Module not found: Can't resolve './fonts/GeistMonoVF.woff'
Import trace: ./src/app/layout.tsx
```

**Root Cause:**
- Font files not committed to git
- `src/app/fonts/` directory doesn't exist in repo
- `localFont()` looking for local files that aren't there

**Wrong Solution:**
```bash
# Downloading fonts manually
curl -o src/app/fonts/GeistVF.woff https://...
# Still need to track in git, easy to miss
```

**Correct Solution - Use npm Package:**
```bash
npm install geist
```

```typescript
// src/app/layout.tsx
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
```

**Why This is Better:**
- Fonts managed by npm (versioned, tracked)
- No local files to commit
- Automatic updates
- Self-hosted (not Google Fonts CDN)

**Prevention:**
- Use npm packages for fonts when available
- If using local fonts, add to git IMMEDIATELY
- Test build in clean directory to catch missing files

---

## Deployment Checklist

Before pushing to production:

### Pre-Commit Checks
```bash
# 1. Check git size
git count-objects -vH
# If >50 MB, investigate

# 2. Verify .gitignore
cat .gitignore
# Should exclude: node_modules, .next, contract/target, etc.

# 3. Check what's being committed
git status
# Should NOT see: target/, node_modules/, .next/, *.o, *.rlib

# 4. Verify TypeScript compiles
npm run build
# Should complete without errors
```

### Layout & API Routes Check
```bash
# 5. Verify force-dynamic is present
grep -r "export const dynamic" src/app/

# Should see:
# src/app/layout.tsx:export const dynamic = 'force-dynamic';
# src/app/api/balance/route.ts:export const dynamic = 'force-dynamic';
# src/app/api/account/route.ts:export const dynamic = 'force-dynamic';
# src/app/api/asset/route.ts:export const dynamic = 'force-dynamic';
```

### Font Check
```bash
# 6. Verify font configuration
grep -A 5 "geist" package.json src/app/layout.tsx

# Should see either:
# - "geist": "..." in package.json
# OR
# - Font files in src/app/fonts/ AND committed to git
```

### Final Push
```bash
# 7. Push to GitHub
git push origin main

# 8. Watch Vercel deployment
# Check Vercel dashboard for:
# - ✅ Build succeeded
# - ✅ No static generation errors
# - ✅ Deployment completed
```

---

## Emergency Procedures

### If Build Fails
1. Read ENTIRE error message
2. Check this guide for matching symptom
3. Apply solution
4. Test locally: `npm run build`
5. Push fix

### If Git Push Fails (>100 MB)
1. **DO NOT** try to fix in small steps
2. Go directly to `GIT_NUCLEAR_RESET.md`
3. Follow procedure exactly
4. This is the ONLY reliable fix

### If Deployment Succeeds but Site Broken
1. Check browser console for errors
2. Likely cause: Missing environment variables
3. Check Vercel environment variables match local `.env`

---

## The Build Failure Cascade

Understanding the order matters:

```
Layer 1: COMPILATION
├─ Missing imports ❌ Fix first
├─ Missing files (fonts) ❌ Fix first
└─ TypeScript errors ❌ Fix first
    ↓
Layer 2: TYPE CHECKING
├─ null vs undefined ❌ Fix second
└─ Interface mismatches ❌ Fix second
    ↓
Layer 3: STATIC GENERATION
├─ useSearchParams errors ❌ Fix third
├─ API route static errors ❌ Fix third
└─ localStorage SSR errors ❌ Fix third
    ↓
Layer 4: RUNTIME
└─ Browser-only features ✅ Finally deployed!
```

**Critical:** Fix errors in order. Layer 2 errors won't appear until Layer 1 is fixed!

---

## Prevention Checklist

Start new projects with:

### Initial Setup
```bash
# 1. Create .gitignore FIRST
cat > .gitignore << 'EOF'
node_modules/
.next/
.env*
*.log

# Contract build artifacts - CRITICAL
contract/target/
contract/meta/target/
contract/wasm/target/
contract/output/*.wasm
*.o
*.rlib
*.rmeta
*.d

# Build artifacts
tsconfig.tsbuildinfo
EOF

# 2. Configure tsconfig.json
# Add to exclude: ["node_modules", "docs/**/*", "contract/**/*"]

# 3. Add force-dynamic to layout.tsx
# export const dynamic = 'force-dynamic';

# 4. Use geist npm package
npm install geist

# 5. First commit - check size
git add .
git commit -m "Initial setup"
git count-objects -vH
# Should be <10 MB
```

### Before Each Feature
- [ ] Read latest docs/dev/ files
- [ ] Check for similar past issues
- [ ] Plan where force-dynamic is needed
- [ ] Test build locally before pushing

---

## Success Metrics

**v1.1.0 Deployment:**
- **Attempts:** 12 failed builds
- **Time:** 3 hours
- **Final size:** 435 KB (from 311 MB)
- **Lessons:** 9 documented failures
- **Result:** ✅ Production deployed

**Future Deployments:**
- **Target:** 1 attempt, <15 minutes
- **This guide makes it possible**

---

## Related Documents

- `GIT_NUCLEAR_RESET.md` - Emergency git cleanup procedure
- `docs/PROJECT_RULES.md` - Updated with deployment rules
- `docs/dev/TROUBLESHOOTING.md` - General troubleshooting
- `.gitignore` - Updated with contract exclusions

---

**Remember:** This guide exists because we hit EVERY possible failure. Future deployments should be smooth sailing. 🚀
