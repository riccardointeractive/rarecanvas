# Planet Survival Auto-Resolve Setup

## What Changed

1. **Auto-Resolution System**: Rounds now resolve automatically
2. **Round Result Banner**: Players can see results when they return
3. **Round History**: Shows past rounds even when on round 1

## How It Works

### 1. Vercel Cron (Primary)
- Runs every hour at :00
- Checks if round can be resolved
- Automatically resolves and starts new round

### 2. Frontend Auto-Trigger (Backup)
- When any connected user visits the page
- If round is expired, automatically triggers resolution
- Ensures rounds resolve even if cron fails

## Required Environment Variables

Add these to your Vercel project settings:

```bash
# Option A: Use mnemonic (recommended)
PLANET_OPERATOR_MNEMONIC="your twelve word mnemonic phrase here"

# Option B: Use private key + address
PLANET_OPERATOR_PRIVATE_KEY="your_hex_private_key_without_0x"
PLANET_OPERATOR_ADDRESS="klv1youroperatoraddress..."

# Security for cron endpoint
CRON_SECRET="generate_a_random_secret_here"
```

## Operator Wallet Setup

1. **Create a dedicated wallet** for the operator (don't use your main wallet)
2. **Fund it with ~100 KLV** for transaction fees
3. **Export the mnemonic or private key**
4. **Add to Vercel environment variables**

### Generate CRON_SECRET
```bash
openssl rand -hex 32
```

## Testing

### Manual Test (local)
```bash
# Without auth (for local testing, remove CRON_SECRET check temporarily)
curl http://localhost:3000/api/games/planets/auto-resolve

# With auth
curl -H "Authorization: Bearer YOUR_CRON_SECRET" \
  http://localhost:3000/api/games/planets/auto-resolve
```

### Check Cron Logs
- Go to Vercel Dashboard → Your Project → Logs
- Filter by "auto-resolve" to see cron executions

## Files Changed

```
src/app/games/planets/
├── components/
│   ├── RoundResultBanner.tsx  (NEW - shows win/lose/refund)
│   ├── RoundHistory.tsx       (UPDATED - includes current round)
│   └── index.ts               (UPDATED - exports new component)
├── page.tsx                   (UPDATED - auto-trigger on visit)
src/app/api/games/planets/
└── auto-resolve/route.ts      (NEW - cron endpoint)
vercel.json                    (UPDATED - added cron schedule)
```

## How to Apply

```bash
unzip -o ~/Downloads/planet-auto-resolve.zip
rm -rf .next && npm run dev
```

Then add the environment variables to Vercel and redeploy.
