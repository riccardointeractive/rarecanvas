# Telegram Swap Notification Bot

Real-time notifications for swaps on the Digiko DEX.

## Overview

The bot monitors the Digiko DEX for new swap transactions and sends formatted notifications to a Telegram channel/group. There are two deployment options:

1. **Vercel Cron (Recommended)** - Runs as a serverless function, triggered every minute
2. **Standalone Script** - Runs as a separate process, polls every 15 seconds

## Features

- 📊 Real-time swap notifications
- 💵 USD value calculation using live prices
- 🐋 Whale alerts with size-based emojis
- 🔗 Direct links to explorer and DEX
- 📱 Clean, mobile-friendly formatting

## Sample Notification

```
🐟 Swap on Digiko DEX

KLV → DGKO
1,000.00 → 500.00

💵 $15.50
👤 klv1abc...xyz4

Explorer • DEX
```

## Setup

### 1. Create Telegram Bot

1. Open Telegram and message [@BotFather](https://t.me/BotFather)
2. Send `/newbot` and follow the prompts
3. Save the **bot token** (looks like `123456789:ABCdefGHIjklMNO...`)

### 2. Get Chat ID

**Option A: Channel**
1. Create a channel (or use existing)
2. Add your bot as an administrator
3. Forward any message from the channel to [@raw_data_bot](https://t.me/raw_data_bot)
4. Look for `"forward_from_chat": {"id": -1001234567890}`

**Option B: Group**
1. Add bot to the group
2. Send a message in the group
3. Visit: `https://api.telegram.org/bot<YOUR_TOKEN>/getUpdates`
4. Look for `"chat": {"id": -1234567890}`

### 3. Environment Variables

Add to Vercel (or `.env.local` for development):

```bash
# Required
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
TELEGRAM_SWAP_CHAT_ID=-1001234567890

# Optional (for endpoint protection)
CRON_SECRET=your-random-secret-string
```

## Deployment Options

### Option 1: Vercel Cron (Recommended)

Already configured! The cron job runs every minute:

```json
// vercel.json
{
  "crons": [{
    "path": "/api/cron/swap-notifications",
    "schedule": "* * * * *"
  }]
}
```

**Note:** Vercel Hobby plan includes 2 cron jobs. Pro plan allows more.

### Option 2: Standalone Script

For local development or running on a VPS:

```bash
# Set environment variables
export TELEGRAM_BOT_TOKEN=your-token
export TELEGRAM_SWAP_CHAT_ID=your-chat-id
export DIGIKO_API_URL=https://digiko.io

# Run the bot
npm run swap-bot
```

For production, use PM2 or similar:

```bash
# Install PM2
npm install -g pm2

# Start bot
pm2 start "npm run swap-bot" --name digiko-swap-bot

# Save PM2 config
pm2 save
pm2 startup
```

## Configuration

### Minimum Swap Value

By default, swaps under $0.10 are not notified. Adjust in:

- **Vercel Cron:** `src/app/api/cron/swap-notifications/route.ts`
- **Standalone:** `scripts/telegram-swap-bot.ts`

```typescript
const CONFIG = {
  minSwapValueUsd: 0.10, // Adjust as needed
};
```

### Notification Emojis

Based on swap USD value:
- 🐋 Whale: $10,000+
- 🦈 Shark: $1,000+
- 🐟 Fish: $100+
- 🐠 Small fish: $10+
- 🦐 Tiny: < $10

## API Endpoints

### Check Notifications Status

```bash
# Manual trigger (if CRON_SECRET is set)
curl -H "Authorization: Bearer YOUR_CRON_SECRET" \
  https://digiko.io/api/cron/swap-notifications
```

Response:
```json
{
  "success": true,
  "found": 3,
  "sent": 3,
  "skipped": 0
}
```

## Troubleshooting

### Bot not sending messages

1. Check bot token is correct
2. Verify chat ID (use negative number for groups/channels)
3. Ensure bot is admin in the channel
4. Check Vercel logs for errors

### Missing notifications

1. Check minimum swap value filter
2. Verify prices API is returning data
3. Check Redis connection

### Duplicate notifications

Redis tracks processed transactions. If using multiple instances, ensure they share the same Redis database.

## File Structure

```
scripts/
└── telegram-swap-bot.ts      # Standalone bot script

src/app/api/cron/
└── swap-notifications/
    └── route.ts              # Vercel cron endpoint

vercel.json                   # Cron configuration
```

## Dependencies

The bot uses existing Digiko APIs:
- `/api/swap-history` - Swap transaction data
- `/api/prices` - Token USD prices
- Redis (Upstash) - State management

No additional dependencies required.
