# Redis Setup for Digiko

## Overview

Digiko uses **Upstash Redis** for server-side persistence across multiple features. Redis enables cross-device synchronization and persistent state across serverless function invocations.

## Database Location

| Property | Value |
|----------|-------|
| **Provider** | Upstash Redis |
| **Host** | `singular-gecko-40032.upstash.io` |
| **Database Name** | `digiko-redis` |
| **Console** | https://console.upstash.com/ |
| **Created via** | Vercel Integration (Storage tab) |

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     src/lib/redis.ts                            │
│        (Shared singleton client - lazy initialization)          │
└───────────────────────────────┬─────────────────────────────────┘
                                │
        ┌───────────────────────┼───────────────────────┐
        │                       │                       │
        ▼                       ▼                       ▼
┌───────────────┐     ┌─────────────────┐     ┌─────────────────┐
│ /api/prices   │     │ /api/swap-hist  │     │ /api/admin/*    │
│ (5m cache)    │     │ (list + sync)   │     │ (sessions, etc) │
└───────────────┘     └─────────────────┘     └─────────────────┘
```

## Redis Keys

All keys use the `digiko:` namespace prefix for clean separation.

| Key Pattern | Purpose | TTL |
|-------------|---------|-----|
| `digiko:prices` | Token price cache | 300s (5 min) |
| `digiko:maintenance` | Site maintenance config | Persistent |
| `digiko:factory` | Factory projects config | Persistent |
| `digiko:swap:mainnet:list` | Swap transaction history | Persistent |
| `digiko:swap:mainnet:lastSync` | Last sync timestamp | Persistent |
| `digiko:swap:mainnet:syncLock` | Sync mutex lock | 60s |
| `digiko:swap:testnet:list` | Testnet swap history | Persistent |
| `digiko:swap:testnet:lastSync` | Testnet last sync | Persistent |
| `digiko:swap:testnet:syncLock` | Testnet sync lock | 60s |
| `digiko:session:{token}` | Admin session data | 24h |
| `digiko:ratelimit:{key}` | Rate limit counters | 15m |

## Environment Variables

| Variable | Format | Required | Description |
|----------|--------|----------|-------------|
| `UPSTASH_REDIS_REST_URL` | `https://xxx.upstash.io` | ✅ Yes | REST API endpoint |
| `UPSTASH_REDIS_REST_TOKEN` | `AZxg...` | ✅ Yes | REST API token |
| `REDIS_URL` | `redis://...` | Optional | TCP connection (slower, fallback) |

The shared Redis client (`src/lib/redis.ts`) checks for credentials in this order:
1. `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` (fastest)
2. `KV_REST_API_URL` + `KV_REST_API_TOKEN` (Vercel KV format)
3. Parse from `REDIS_URL` (fallback, slower)

## Setup via Vercel

### Step 1: Create Database

1. Go to **vercel.com** → Your project → **Storage** tab
2. Click **Create Database**
3. Select **Upstash** → **Redis**
4. Name: `digiko-redis`
5. Click **Create** and **Connect to Project**

### Step 2: Get REST API Credentials

The Vercel integration creates a `REDIS_URL` (TCP format), but serverless functions need **REST API** credentials.

**From Upstash Console:**
1. Go to **console.upstash.com**
2. Sign in (create account if needed)
3. Click on your database
4. Find **REST API** section
5. Copy `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`

### Step 3: Add Environment Variables

In Vercel:
1. Go to **Settings** → **Environment Variables**
2. Add:
   - `UPSTASH_REDIS_REST_URL` = `https://singular-gecko-40032.upstash.io`
   - `UPSTASH_REDIS_REST_TOKEN` = your token
3. Select **All Environments** (Production, Preview, Development)
4. Click **Save**
5. **Redeploy** for changes to take effect

## Files

| File | Purpose |
|------|---------|
| `src/lib/redis.ts` | Shared Redis client singleton |
| `src/app/api/maintenance/route.ts` | Maintenance config API |
| `src/app/api/prices/route.ts` | Token prices with Redis cache |
| `src/app/api/cron/update-prices/route.ts` | Cron job for price updates |
| `src/app/api/swap-history/route.ts` | Swap transaction caching |
| `src/app/api/admin/factory/route.ts` | Factory projects config |
| `src/app/api/admin/sessionStore.ts` | Redis-backed session store |

## Admin Sessions

Admin authentication now uses Redis for session persistence:

- Sessions survive serverless cold starts
- Sessions work across multiple Vercel instances
- Automatic TTL-based expiration (24 hours)
- Rate limiting persists across requests

Falls back to in-memory storage if Redis is unavailable.

## Performance Optimizations

| Optimization | Description |
|-------------|-------------|
| REST API | Uses HTTP/REST instead of TCP for serverless compatibility |
| Lazy loading | Redis client only initialized on first request |
| 5-minute cache | Price data cached to reduce external API calls |
| 60-second locks | Sync operations use mutex locks to prevent duplicates |
| Auto TTL | Sessions and rate limits auto-expire |

## Troubleshooting

### "Page loads slowly"

**Cause:** Using TCP `REDIS_URL` instead of REST credentials.

**Fix:** Add `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` to environment variables.

### "Settings don't persist"

**Cause:** Redis credentials not configured or incorrect.

**Fix:** 
1. Check Vercel Logs for errors
2. Test API: `curl https://digiko.io/api/maintenance`
3. Verify environment variables are set

### "Admin session expires randomly"

**Cause:** Session was stored in-memory only (Redis unavailable).

**Fix:** Ensure Redis credentials are configured correctly.

### "API returns default config after saving"

**Cause:** Redis write failed silently.

**Fix:** Check Vercel Logs for Redis connection errors.

## Dependencies

```json
{
  "@upstash/redis": "^1.35.7"
}
```

## Version History

- **v2.0.0** - All Redis keys use `digiko:` prefix, sessions moved to Redis
- **v1.6.0** - Initial release with Upstash Redis integration
