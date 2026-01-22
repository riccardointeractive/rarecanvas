# Vercel Workflow Guide
**Complete Setup for Preview Deployments, Environment Variables, and Optimal Workflow**

**Date:** November 28, 2024  
**Status:** Implementation Guide

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Preview Deployments Setup](#preview-deployments-setup)
3. [Environment Variables](#environment-variables)
4. [Branch Strategy](#branch-strategy)
5. [Deployment Workflow](#deployment-workflow)
6. [Best Practices](#best-practices)

---

## 📖 Overview

### What You'll Get

**Before (Current):**
- Push to main → Deploy to production
- No testing environment
- .env file in repository (security risk)

**After (New Workflow):**
- Push to feature branch → Automatic preview URL
- Test thoroughly before production
- Secrets stored securely in Vercel
- One-click rollbacks
- Deployment history

---

## 🚀 Preview Deployments Setup

### Step 1: Enable Preview Deployments

**Already Enabled!** ✅

Vercel automatically creates preview deployments for:
- Every git push to any branch
- Every pull request

**Nothing to configure!** It just works.

### Step 2: Understanding Preview URLs

When you push a branch:
```
Branch: feature/swap-improvements
Preview URL: digiko-git-feature-swap-improvements-riccardointeractive.vercel.app

Branch: fix/staking-bug
Preview URL: digiko-git-fix-staking-bug-riccardointeractive.vercel.app
```

**Format:** `[project]-git-[branch-name]-[team].vercel.app`

### Step 3: Test Your First Preview

```bash
# 1. Create a test branch
git checkout -b test/preview-deployment

# 2. Make a small change
echo "// Testing preview deployment" >> src/app/page.tsx

# 3. Commit and push
git add .
git commit -m "test: preview deployment"
git push -u origin test/preview-deployment

# 4. Check Vercel dashboard
# You'll see a new deployment with preview URL
```

### Step 4: Find Your Preview URL

**Option A: Vercel Dashboard**
1. Go to https://vercel.com/dashboard
2. Click on "digiko" project
3. See list of deployments
4. Click on your branch deployment
5. Click "Visit" button

**Option B: GitHub (if using PRs)**
1. Create pull request
2. Vercel bot comments with preview URL
3. Click URL to test

**Option C: Vercel CLI**
```bash
# Install Vercel CLI (one time)
npm i -g vercel

# Link project (one time)
vercel link

# Deploy current branch
vercel

# Get preview URL in terminal
```

---

## 🔐 Environment Variables

### Current Problem

Your `.env` file contains:
```bash
NEXT_PUBLIC_KLEVER_API=https://api.klever.org
ADMIN_PASSWORD_HASH=...
TELEGRAM_BOT_TOKEN=...
```

**Issues:**
- Committed to git (security risk)
- Same values for all environments
- Hard to update
- Team members see secrets

### Solution: Vercel Environment Variables

### Step 1: Access Environment Variables

1. Go to https://vercel.com/dashboard
2. Click "digiko" project
3. Click "Settings" tab
4. Click "Environment Variables" in left sidebar

### Step 2: Add Variables

**For Each Variable:**

1. Click "Add New"
2. Enter key: `NEXT_PUBLIC_KLEVER_API`
3. Enter value: `https://api.klever.org`
4. Select environments:
   - ✅ Production
   - ✅ Preview
   - ✅ Development
5. Click "Save"

**Repeat for all your variables:**

**Public Variables** (Safe to expose in browser):
```
NEXT_PUBLIC_KLEVER_API
NEXT_PUBLIC_NETWORK
NEXT_PUBLIC_APP_VERSION
```

**Private Variables** (Server-side only):
```
ADMIN_PASSWORD_HASH
TELEGRAM_BOT_TOKEN
TELEGRAM_CHAT_ID
DATABASE_URL (if you add database later)
```

### Step 3: Different Values Per Environment

**Example: API Endpoints**

**Production:**
```
NEXT_PUBLIC_KLEVER_API=https://api.klever.org
```

**Preview:**
```
NEXT_PUBLIC_KLEVER_API=https://api.testnet.klever.org
```

**Development:**
```
NEXT_PUBLIC_KLEVER_API=http://localhost:3001
```

### Step 4: Update Your Local .env

After adding to Vercel, update local `.env`:

```bash
# .env (local development only)
# These values are for local dev, production uses Vercel

NEXT_PUBLIC_KLEVER_API=https://api.klever.org
NEXT_PUBLIC_NETWORK=mainnet
NEXT_PUBLIC_APP_VERSION=v1.0.0

# Private variables (never commit)
ADMIN_PASSWORD_HASH=your_hash_here
TELEGRAM_BOT_TOKEN=your_token_here
```

**Critical:** Ensure `.env` is in `.gitignore` (it already is!)

### Step 5: Remove .env from Git History (if needed)

```bash
# Check if .env is in git
git log --all --full-history -- .env

# If it exists, remove it (advanced - be careful!)
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env" \
  --prune-empty --tag-name-filter cat -- --all

# Force push (only if you're sure!)
git push origin --force --all
```

**Safer Option:** Just ensure `.env` is in `.gitignore` going forward.

---

## 🌳 Branch Strategy

### Recommended Structure

```
main (production)
  ├── develop (staging - optional)
  ├── feature/new-token-page
  ├── feature/swap-improvements
  ├── fix/staking-precision-bug
  └── test/performance-optimization
```

### Branch Naming Convention

**Features:**
```
feature/swap-slippage
feature/token-analytics
feature/nft-integration
```

**Fixes:**
```
fix/staking-precision
fix/wallet-connection
fix/api-timeout
```

**Tests:**
```
test/load-testing
test/mobile-responsiveness
test/error-handling
```

### Workflow

**1. Start New Feature:**
```bash
git checkout main
git pull
git checkout -b feature/new-feature
```

**2. Develop & Test Locally:**
```bash
npm run dev
# Make changes, test locally
```

**3. Push for Preview:**
```bash
git add .
git commit -m "feat: add new feature"
git push -u origin feature/new-feature
```

**4. Get Preview URL:**
- Check Vercel dashboard
- Test on preview URL
- Share with team/testers

**5. If Good, Merge to Main:**
```bash
git checkout main
git merge feature/new-feature
git push

# Or create Pull Request on GitHub
```

**6. Clean Up:**
```bash
git branch -d feature/new-feature
git push origin --delete feature/new-feature
```

---

## 🔄 Deployment Workflow

### Automatic Deployments

**What Triggers Deployment:**
- ✅ Push to any branch → Preview deployment
- ✅ Push to main → Production deployment
- ✅ Create PR → Preview deployment with comment

**What Vercel Does Automatically:**
1. Detects git push
2. Pulls code
3. Installs dependencies
4. Runs `npm run build`
5. Deploys to CDN
6. Gives you URL

**If Build Fails:**
- Deployment is cancelled
- Previous version stays live
- You get error notification
- Fix and push again

### Manual Deployments

**Redeploy Last Commit:**
1. Go to Vercel dashboard
2. Click on deployment
3. Click "..." menu
4. Click "Redeploy"

**Deploy Specific Branch:**
```bash
# Using Vercel CLI
vercel --prod  # Deploy current branch to production
vercel         # Deploy current branch to preview
```

### Rollback

**If Production Has Issues:**

1. Go to Vercel dashboard
2. Click "Deployments"
3. Find last good deployment
4. Click "..." menu
5. Click "Promote to Production"

**Instant rollback!** Previous version is live again.

---

## 🎯 Deployment Environments

### Production (digiko.io)

**Triggers:**
- Push to `main` branch

**Environment Variables:**
- Production values
- Real API endpoints
- Real tokens/secrets

**Access:**
- https://digiko.io
- Live users see this

### Preview (Auto-generated URLs)

**Triggers:**
- Push to any non-main branch
- Pull requests

**Environment Variables:**
- Preview values
- Can use testnet APIs
- Safe testing

**Access:**
- `[project]-git-[branch]-[team].vercel.app`
- Only you and testers see this

### Development (Local)

**Triggers:**
- `npm run dev`

**Environment Variables:**
- Local `.env` file
- Can use localhost APIs
- Fast iteration

**Access:**
- http://localhost:3000
- Only you see this

---

## 💡 Best Practices

### 1. Test on Preview Before Merging

```bash
# Bad
git push origin main  # Directly to production

# Good
git push origin feature/my-feature  # Get preview URL
# Test thoroughly on preview
# If good, then merge to main
```

### 2. Use Meaningful Branch Names

```bash
# Bad
git checkout -b test
git checkout -b fix

# Good
git checkout -b feature/add-token-swap
git checkout -b fix/staking-decimal-precision
```

### 3. Keep Main Branch Clean

```
main should always be production-ready
Never commit work-in-progress to main
Use feature branches for everything
```

### 4. Share Preview URLs

```
Testing: Share preview URL with testers
Design review: Share with designers
Client approval: Share with stakeholders
Community feedback: Share with trusted community members
```

### 5. Clean Up Old Branches

```bash
# List all branches
git branch -a

# Delete local branch
git branch -d feature/old-feature

# Delete remote branch
git push origin --delete feature/old-feature
```

### 6. Monitor Deployments

**Vercel sends notifications for:**
- Successful deployments
- Failed builds
- Performance issues

**Enable notifications:**
1. Vercel Dashboard → Settings
2. Notifications
3. Enable email/Slack notifications

---

## 🔧 Advanced Features

### Custom Domains for Previews

**Want specific URL for previews?**

1. Go to Settings → Domains
2. Add domain: `preview.digiko.io`
3. Configure DNS
4. Assign to specific branch

### Deploy Hooks

**Trigger deployments from external services:**

1. Settings → Git → Deploy Hooks
2. Create hook
3. Get webhook URL
4. Use in external services (CI/CD, etc.)

### Edge Functions

**For API routes that need to be fast:**

```typescript
// src/app/api/route.ts
export const runtime = 'edge';  // Runs on Vercel Edge Network

export async function GET() {
  // Your API logic
}
```

### Analytics

**Already enabled with Vercel Analytics!**

View in dashboard:
- Page views
- User locations
- Performance metrics
- Most visited pages

---

## 📊 Deployment Checklist

**Before Every Production Deploy:**

- [ ] Code pushed to feature branch
- [ ] Preview deployment tested
- [ ] All features work on preview
- [ ] No console errors
- [ ] Mobile responsive checked
- [ ] Environment variables correct
- [ ] Build succeeds
- [ ] Ready to merge to main

**After Production Deploy:**

- [ ] Visit digiko.io
- [ ] Verify changes are live
- [ ] Check critical paths work
- [ ] Monitor for errors
- [ ] Check analytics

---

## 🚨 Troubleshooting

### Build Fails on Vercel

**Check:**
1. Does `npm run build` work locally?
2. Are all dependencies in package.json?
3. Check build logs in Vercel dashboard
4. Look for TypeScript errors
5. Check environment variables are set

**Common Issues:**
```
Missing dependency → Add to package.json
TypeScript error → Fix locally first
Missing env var → Add in Vercel dashboard
Import error → Check paths are correct
```

### Preview Deployment Not Creating

**Check:**
1. Is branch pushed to GitHub?
2. Check Vercel dashboard → Settings → Git
3. Verify Vercel app is installed on GitHub
4. Check deployment logs

### Environment Variables Not Working

**Check:**
1. Are they set in Vercel dashboard?
2. Did you select correct environment?
3. Did you redeploy after adding?
4. Check spelling (case-sensitive!)

**To apply new env vars:**
```
Must redeploy after adding environment variables
Push new commit or click "Redeploy" in dashboard
```

---

## 🎉 Summary

### What You Now Have:

✅ **Preview Deployments** - Test before production  
✅ **Environment Variables** - Secure secret management  
✅ **Branch Strategy** - Organized development  
✅ **Deployment Workflow** - Professional process  
✅ **Rollback Capability** - Safety net  
✅ **Monitoring** - Know what's happening

### Workflow in Practice:

```bash
# 1. Start new feature
git checkout -b feature/new-thing

# 2. Develop locally
npm run dev

# 3. Push for preview
git push origin feature/new-thing

# 4. Test preview URL
# Visit: digiko-git-feature-new-thing-riccardointeractive.vercel.app

# 5. If good, merge to production
git checkout main
git merge feature/new-thing
git push

# Done! Production deployed automatically
```

### Next Steps:

1. Set up environment variables in Vercel dashboard
2. Try creating a test branch and preview deployment
3. Update local `.env` with comment about Vercel
4. Start using feature branches for all new work

**You're now using Vercel like a pro!** 🚀
