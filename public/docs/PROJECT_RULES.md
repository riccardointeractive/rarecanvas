# DIGIKO PROJECT RULES

**Version:** 6.0  
**Rules:** 9

---

## 1. NO HARDCODING

If something is repeated, it should not be hardcoded.

| What | Where |
|------|-------|
| App config | `src/config/app.ts` |
| Token decimals | `src/config/tokens.ts` → `getTokenDecimals()` |
| Contract addresses | `src/config/network.ts` |
| Design tokens | `src/config/design-tokens.ts` |
| DEXscan API | `src/config/dexscan.ts` |

**Two-Price System:**
| Price | Source | Use |
|-------|--------|-----|
| VIEW PRICE | DEXscan API (aggregated from Digiko, Swopus, SAME) | Display, portfolio, charts, AI comparison |
| RESERVE PRICE | Pool reserves (`reserveA / reserveB`) | Actual swap execution |

```typescript
// VIEW PRICE - what market says
import { useViewPrices } from '@/hooks';
const { data: prices } = useViewPrices();
const dgkoMarketPrice = prices?.DGKO?.priceUsd;

// RESERVE PRICE - what you'll actually get
const reservePrice = reserveKLV / reserveDGKO;
```

**If you're typing the same value twice, you're doing it wrong.**

---

## 2. CODE INTEGRITY

Don't remove existing functionality without explicit confirmation.

---

## 3. KLEVER API

| Operation | Use |
|-----------|-----|
| Read data (balances, history) | Proxy: `api.mainnet.klever.org` |
| Query smart contract | API: `api.mainnet.klever.org/v1.0/sc/query` |
| Write transactions | SDK: `web.buildTransaction()` |

---

## 4. SMART CONTRACTS

Every contract **MUST** have:
```rust
#[init]
fn init(&self) { }

#[upgrade]  // ← MANDATORY
fn upgrade(&self) { }
```

**Build with meta:**
```bash
cd contract-name/meta && cargo run build
```

---

## 5. FILE STRUCTURE

```
src/app/[feature]/
├── page.tsx          # < 100 lines, orchestration only
├── components.tsx    # Feature components (if needed)
└── hooks.ts          # Feature hooks (if needed)
```

Separate `types/`, `config/`, `hooks/` folders **only** if > 100 lines each.

---

## 6. DESIGN

**Consistency is key.**

Source of truth: `docs/DESIGN_PHILOSOPHY.md`

Live component library: `/admin/design-system`

If a component doesn't exist for what you need, create it in `src/components/` and use it everywhere. Don't build one-off solutions.

---

## 7. TANSTACK QUERY (DATA FETCHING)

**ALL data fetching hooks MUST use TanStack Query.** No manual useState + useEffect for API calls.

| Location | Purpose |
|----------|---------|
| `src/providers/QueryProvider.tsx` | Global setup |
| `src/app/my-dex/lib/queryKeys.ts` | Centralized query keys |

**Pattern:**
```typescript
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/app/my-dex/lib/queryKeys';

export function useMyData() {
  return useQuery({
    queryKey: queryKeys.myData.byId(id),
    queryFn: () => fetchMyData(id),
    staleTime: 5 * 60 * 1000,  // 5 min fresh
  });
}
```

**Cache invalidation after mutations:**
```typescript
import { useInvalidateMyDex } from '@/app/my-dex/hooks';

const { invalidatePositions, invalidateActivity } = useInvalidateMyDex();
// Call after successful transaction
```

**Hooks already migrated:**
- `useTradingPairs` ✅
- `useUserPositions` ✅  
- `useUserActivity` ✅
- `useFavorites` ✅

**Hooks needing migration:**
- `useUserBalances`
- `useContractTransactions`
- `useLiquidityProvider`

---

## 8. DOCUMENTATION

- Docs hub: `docs/README.md`
- After important fixes: update `docs/dev/LESSONS.md`
- Don't create new files for every little thing

---

## 9. ZIP UPDATES

Make sure unzip path matches project folder.

```bash
unzip -o ~/Downloads/update.zip
rm -rf .next && npm run dev
```

---

## QUICK REFERENCE

```
Project folder: ~/Projects/digiko/
Mainnet: digiko.io
Proxy API: api.mainnet.klever.org
SC Query: api.mainnet.klever.org/v1.0/sc/query
```
