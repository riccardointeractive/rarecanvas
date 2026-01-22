# CTR Kart: Weekly Seasons Implementation

**Date:** January 1, 2026  
**Goal:** Change leaderboard from daily to weekly to reduce player pressure

## Summary

Changed the game from daily leaderboards to weekly "Seasons" - less pressure on players who might feel they need to play every single day to compete.

## What Changed

### Frontend UI (3 files + 1 type)
- `KartLeaderboard.tsx`: "Daily Leaderboard" → "Season Leaderboard", fixed countdown, dynamic leaderboard size, dynamic prize distribution
- `RaceEntryGate.tsx`: "Races Today" → "Season Races"
- `useKartContract.ts`: Parse `leaderboardSize` and `prizeDistribution` from contract config
- `kart.types.ts`: Added `leaderboardSize` and `prizeDistribution` to ContractConfig

### Key Fixes
1. **Countdown calculation** - Now calculates season end from current time instead of relying on stored `currentDay` value
2. **Dynamic leaderboard size** - Uses `leaderboardSize` from contract instead of hardcoded 5
3. **Dynamic prize distribution** - Fetches `prizeDistribution` from contract instead of hardcoded 50/20/15/10/5

### Contract Config (needs manual update)

The contract already supports configurable `day_duration`. Just need to call:

```rust
// 7 days = 604,800 seconds
setDayDuration(604800)
```

## How to Deploy the Change

### 1. Update Contract Day Duration

Call the `setDayDuration` endpoint on the contract:

**Mainnet Contract:** `klv1qqqqqqqqqqqqqpgqj9qddtkhppqh7mefjd2rld0rvs3fusxjxw9qu4fe2s`

```
Day Duration: 604800 (7 days in seconds)
```

You can do this via:
- Admin panel: `/admin/games/ctr-kart`
- KleverScan contract interface
- Direct SDK call

### 2. Timing Consideration

The change will take effect at the next "day" rollover. Current season will continue until it naturally ends, then the new 7-day duration kicks in.

### 3. Optional: Reset Leaderboard

If you want a clean start, you can:
1. Distribute any pending prizes for the current period
2. Change the day duration
3. The next race will start a new 7-day season

## Countdown Display Logic

The updated countdown now handles weekly durations properly:

```
> 24h remaining: "3d 12h 45m"
< 24h remaining: "12h 45m 30s"
< 1h remaining:  "45m 30s"
< 1m remaining:  "30s"
```

## Terminology

| Old | New |
|-----|-----|
| Daily Leaderboard | Season Leaderboard |
| Today | This Season |
| Races Today | Season Races |
| Your Points Today | Your Season Points |

## Files Modified

1. `src/app/games/ctr-kart/components/KartLeaderboard.tsx`
2. `src/app/games/ctr-kart/components/RaceEntryGate.tsx`
3. `src/app/games/ctr-kart/hooks/useKartContract.ts`
4. `src/app/games/ctr-kart/types/kart.types.ts`
5. `src/app/admin/social-media/types/social-media.types.ts`
6. `src/app/admin/social-media/config/social-media.config.ts`
7. `src/app/admin/social-media/components/CanvasRenderer.tsx`
8. `src/app/admin/social-media/components/TemplateSelector.tsx`

---

## Social Media: Season Announcement Template

Added a new "Season Announcement" template for promoting CTR Kart seasons.

### Dynamic Fields

| Field | Description | Default |
|-------|-------------|---------|
| Headline | Main title | "New Season Starts!" |
| Prize Pool | Amount without token | "20,000" |
| Prize Token | Token symbol | "KLV" |
| Top Players | Leaderboard size | "10" |
| Duration | Season length | "7 days" |
| Call to Action | Subheadline | "Race to win!" |
| Game Name | Game title | "CTR Kart" |

### Visual Features

- Gold gradient prize pool display with glow effect
- Two info cards (Top N Players, Duration)
- Checkered flag pattern in corners
- Speed lines on sides
- Racing emoji in badge

## Why "Season" not "Week"?

"Season" is more gamified and less literal - it sounds more exciting and doesn't lock you into exactly 7 days if you want to adjust later (could be 5 days, 10 days, etc.).
