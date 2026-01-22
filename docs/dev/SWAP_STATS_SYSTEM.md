# Swap Statistics System

## Overview

The swap statistics system provides **complete historical data** for swap metrics, solving the problem where the recent transaction cache (limited to ~500 transactions) would show inaccurate totals for users who were inactive recently.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                       DATA SOURCES                              │
├─────────────────────────────────────────────────────────────────┤
│  /api/swap-history        │  /api/swap-stats                    │
│  ─────────────────────    │  ────────────────                   │
│  Recent 500 transactions  │  Complete historical aggregates     │
│  For display/charts       │  For total counts & volume          │
└─────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                       REDIS STORAGE                             │
├─────────────────────────────────────────────────────────────────┤
│  digiko:stats:mainnet:contract    │  Contract-level aggregates  │
│  digiko:stats:mainnet:users       │  Per-user stats (HASH)      │
│  digiko:stats:mainnet:hashes      │  Processed tx hashes (SET)  │
│  digiko:stats:mainnet:backfill    │  Backfill progress          │
└─────────────────────────────────────────────────────────────────┘
```

## Files Created

### Types
- `src/types/swapStats.ts` - Type definitions and Redis key helpers

### API Routes
- `src/app/api/swap-stats/route.ts` - GET stats (contract or user)
- `src/app/api/swap-stats/increment/route.ts` - POST to increment after swaps
- `src/app/api/admin/backfill-swaps/route.ts` - Historical sync management

### Hooks
- `src/hooks/useSwapStats.ts` - TanStack Query hooks for stats

### Admin UI
- `src/app/admin/swap-stats/page.tsx` - Admin page for backfill control

### Updated Files
- `src/app/my-dex/hooks/useUserActivity.ts` - Now uses stats for totalSwaps
- `src/lib/queryKeys.ts` - Added swapStats query keys
- `src/hooks/index.ts` - Exports new hooks
- `src/app/admin/components/AdminSidebar.tsx` - Added swap stats link

## Usage

### 1. Initial Backfill (One-Time)

Go to **Admin > Swap > Swap Stats** and click "Full Backfill" to sync all historical transactions.

Or via API:
```bash
curl -X POST "https://digiko.io/api/admin/backfill-swaps?network=mainnet&mode=full"
```

### 2. Incremental Sync (Ongoing)

The system will automatically catch new swaps via:
- Periodic "Sync New Swaps" runs
- Real-time increment after each swap (if integrated)

### 3. Using Stats in Components

```typescript
import { useUserSwapStats, useContractSwapStats } from '@/hooks';

function MyComponent() {
  // User's complete historical stats
  const { data: userStats } = useUserSwapStats();
  
  // Contract-level totals
  const { data: contractStats } = useContractSwapStats();
  
  return (
    <div>
      <p>Your total swaps: {userStats?.totalSwaps ?? 0}</p>
      <p>Platform total: {contractStats?.totalSwaps ?? 0}</p>
    </div>
  );
}
```

### 4. Real-Time Increment (Optional)

After a successful swap, call the increment endpoint:

```typescript
await fetch('/api/swap-stats/increment', {
  method: 'POST',
  body: JSON.stringify({
    network: 'mainnet',
    txHash: 'abc123...',
    trader: 'klv1...',
    inputToken: 'DGKO',
    outputToken: 'KLV',
    inputAmount: 100,
    outputAmount: 50,
    status: 'success',
    timestamp: Date.now() / 1000,
  }),
});
```

## Data Structure

### ContractSwapStats
```typescript
{
  totalSwaps: number;
  successfulSwaps: number;
  failedSwaps: number;
  volumeByToken: Record<string, number>;
  totalVolumeKLV: number;
  uniqueTraders: number;
  firstSwapTimestamp: number;
  lastSwapTimestamp: number;
  syncStatus: 'idle' | 'syncing' | 'complete' | 'error';
}
```

### UserSwapStats
```typescript
{
  address: string;
  totalSwaps: number;
  successfulSwaps: number;
  volumeByToken: Record<string, number>;
  totalVolumeKLV: number;
  pairCounts: Record<string, number>; // e.g., "DGKO-KLV": 50
  firstSwapTimestamp: number;
  lastSwapTimestamp: number;
}
```

## Notes

- **Deduplication**: Processed transaction hashes are stored in a Redis SET to prevent double-counting
- **Rate Limiting**: Backfill includes small delays between API calls to avoid rate limits
- **Safety Limit**: Full backfill scans up to 20,000 transactions (200 pages × 100 per page)
- **Cache Duration**: Stats are cached for 5 minutes via TanStack Query
