# Testing Plan Template

**Based on:** v0.20.3 Release Testing (November 26, 2025)  
**Purpose:** Reusable testing checklist for major releases

---

## Pre-Testing Setup

```bash
# Already in project root
pkill -f next
rm -rf .next
npm run dev
```

**Expected:** Server starts on `http://localhost:3000`

---

## Test 1: Version Display (Centralized Config)

**Purpose:** Verify APP_CONFIG works across all locations

### Locations to Check

| Location | How to Access | What to Verify |
|----------|---------------|----------------|
| Navigation Header | Any page | "Digiko" name, "Beta" badge |
| Footer | Scroll to bottom | Name, status badge, version |
| Admin Panel | `/admin` → login | Version card, System Information |
| Dashboard Account Info | `/dashboard` (connected) | Network, Platform version |
| Mobile Menu | Resize < 768px → hamburger | "Digiko Beta", network |
| Desktop More Menu | Click "More" (3 lines) | Version, network with green dot |

**PASS:** All 6 locations show correct version from APP_CONFIG  
**FAIL:** Any location shows wrong version or hardcoded values

---

## Test 2: Navigation UX

**Purpose:** Verify click-based dropdown and active page indication

### Tokens Dropdown Behavior
- [ ] Click "Tokens" → dropdown appears
- [ ] Move mouse away → dropdown stays open (not hover-based)
- [ ] Click "Tokens" again → dropdown closes
- [ ] Click outside → dropdown closes

### Active Page Indication
- [ ] `/dashboard` → "Dashboard" link is white with background
- [ ] `/staking` → "Staking" link highlighted
- [ ] `/swap` → "Swap" link highlighted
- [ ] `/dgko` or `/babydgko` → "Tokens" button highlighted

### Dropdown Navigation
- [ ] Click dropdown item → navigates AND closes dropdown

---

## Test 3: Dashboard Functionality

**Purpose:** Verify dashboard components work correctly

### Page Load
- [ ] Disconnected → "Connect Wallet" prompt shows
- [ ] Connected → Dashboard loads correctly

### Components
- [ ] Page header shows "Dashboard" title
- [ ] Balance card displays (left column)
- [ ] Account Info card displays (left column)
- [ ] Send Form displays (right column)
- [ ] Quick Guide section visible

### Account Info Card
- [ ] Network row shows correctly
- [ ] Status shows green dot "Connected"
- [ ] Platform shows "Digiko v{version}"

### Send Form
- [ ] Can enter recipient address
- [ ] Can enter amount
- [ ] "Send KLV" button appears

---

## Test 4: Mobile Responsiveness

**Purpose:** Verify all changes work on mobile

### Breakpoints to Test
- 375px (iPhone SE)
- 390px (iPhone 12/13)
- 430px (iPhone 14 Pro Max)

### Mobile Navigation
- [ ] Hamburger menu opens
- [ ] Current page has colored background
- [ ] Menu closes after navigation

### Mobile Dashboard
- [ ] Cards stack vertically
- [ ] Text is readable
- [ ] No horizontal scroll

### Mobile Footer
- [ ] Name/badge displays correctly
- [ ] Version displays correctly
- [ ] Links stack vertically

---

## Test 5: Console and Network

**Purpose:** Verify no errors

### Browser Console
- [ ] Navigate all pages: `/`, `/dashboard`, `/staking`, `/swap`, `/dgko`, `/babydgko`
- [ ] NO red errors (warnings OK)
- [ ] No React hydration errors

### Network Tab
- [ ] Balance API calls succeed (200)
- [ ] Token stats API calls succeed
- [ ] No 404 errors

---

## Test 6: Build Test

```bash
# Already in project root
npm run build
```

- [ ] Build completes successfully
- [ ] No TypeScript errors
- [ ] All pages compiled

---

## Test 7: Wallet Connection

### Connect Flow
- [ ] "Connect Wallet" prompt shows when disconnected
- [ ] Klever Extension popup appears
- [ ] Connection succeeds
- [ ] Dashboard loads with balance

### Feature Verification
- [ ] Balance displays correctly
- [ ] Staking positions show (if any)
- [ ] Swap interface shows balances

---

## Test 8: Cross-Browser (Optional)

| Browser | Version Display | Navigation | Notes |
|---------|-----------------|------------|-------|
| Chrome | ☐ | ☐ | |
| Firefox | ☐ | ☐ | |
| Safari | ☐ | ☐ | |

---

## Final Checklist

### Visual
- [ ] All pages load
- [ ] No layout issues
- [ ] Colors consistent with design guide
- [ ] Glass morphism effects working
- [ ] Animations smooth

### Functionality
- [ ] All navigation works
- [ ] Wallet connection works
- [ ] Version shows correctly everywhere
- [ ] Active states working
- [ ] Dropdown behavior correct

### Code Quality
- [ ] No console errors
- [ ] Production build succeeds
- [ ] TypeScript clean
- [ ] No broken API calls

---

## Issue Reporting Template

```markdown
**Test Failed:** [Test name and step]
**Expected:** [What should happen]
**Actual:** [What actually happened]
**Browser:** [Chrome/Firefox/Safari]
**Console Errors:** [Any errors]
**Screenshot:** [If applicable]

**Steps to Reproduce:**
1. [Step 1]
2. [Step 2]
3. [Error occurs]
```

---

## Success Criteria

**ALL tests must pass before release:**
- Version displays correctly in all 6 locations
- Navigation works reliably
- Active page indication correct
- Dashboard components functional
- No console errors
- Production build succeeds
- Mobile responsive

**If all pass:** Ready for `git commit` and deployment  
**If any fail:** Debug and retest before committing

---

**Related:** RULE 30 (Testing Decision Tree), RULE 50 (Production Readiness Checklist)
