#!/usr/bin/env npx ts-node

/**
 * Digiko DEX Swap Notification Bot
 * 
 * Monitors the Digiko DEX for new swaps and sends notifications to Telegram.
 * 
 * SETUP:
 * 1. Create a Telegram bot via @BotFather and get the token
 * 2. Create a channel/group and add the bot as admin
 * 3. Get the chat ID (can use @raw_data_bot or similar)
 * 4. Set environment variables:
 *    - TELEGRAM_BOT_TOKEN: Your bot token from BotFather
 *    - TELEGRAM_CHAT_ID: The chat ID to send notifications to
 *    - DIGIKO_API_URL: Base URL for Digiko API (default: https://digiko.io)
 * 
 * RUN:
 * npx ts-node scripts/telegram-swap-bot.ts
 * 
 * Or add to package.json scripts:
 * "swap-bot": "npx ts-node scripts/telegram-swap-bot.ts"
 */

// ============================================================================
// Configuration
// ============================================================================

const CONFIG = {
  // Telegram settings
  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN || '',
  telegramChatId: process.env.TELEGRAM_CHAT_ID || '',
  
  // API settings
  apiBaseUrl: process.env.DIGIKO_API_URL || 'https://digiko.io',
  
  // Polling interval (in milliseconds)
  pollInterval: 15_000, // 15 seconds
  
  // Minimum swap value to notify (in USD)
  minSwapValueUsd: 0.01,
  
  // Network
  network: 'mainnet',
};

// ============================================================================
// Types
// ============================================================================

interface SwapTransaction {
  txHash: string;
  timestamp: number;
  status: 'success' | 'failed' | 'pending';
  trader: string;
  swapType: string;
  inputAmount: number;
  outputAmount: number;
  inputToken: string;
  outputToken: string;
  inputAssetId: string;
  outputAssetId: string;
  exchangeRate: number;
}

interface PriceData {
  prices: Record<string, {
    priceUsd: number;
    priceKlv: number;
  }>;
  updatedAt: string;
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Format a wallet address to show only first and last characters
 */
function formatAddress(address: string, chars: number = 4): string {
  if (!address || address.length <= chars * 2 + 3) return address;
  return `${address.slice(0, chars + 4)}...${address.slice(-chars)}`;
}

/**
 * Format a number with appropriate decimal places
 */
function formatNumber(value: number, decimals: number = 2): string {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(2)}M`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(2)}K`;
  }
  if (value < 0.01) {
    return value.toFixed(6);
  }
  return value.toFixed(decimals);
}

/**
 * Format USD value
 */
function formatUsd(value: number): string {
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(2)}M`;
  }
  if (value >= 1_000) {
    return `$${(value / 1_000).toFixed(2)}K`;
  }
  if (value < 0.01) {
    return `$${value.toFixed(4)}`;
  }
  return `$${value.toFixed(2)}`;
}

/**
 * Get emoji based on swap size
 */
function getSwapEmoji(usdValue: number): string {
  if (usdValue >= 10_000) return '🐋'; // Whale
  if (usdValue >= 1_000) return '🦈';  // Shark
  if (usdValue >= 100) return '🐟';    // Fish
  return '🐠';                          // Small fish
}

/**
 * Get direction emoji
 */
function getDirectionEmoji(inputToken: string, outputToken: string): string {
  if (outputToken === 'KLV') return '💸'; // Selling for KLV
  if (inputToken === 'KLV') return '🛒';  // Buying with KLV
  return '🔄';                              // Other swap
}

// ============================================================================
// API Functions
// ============================================================================

/**
 * Fetch swap history from Digiko API
 */
async function fetchSwapHistory(): Promise<SwapTransaction[]> {
  try {
    const response = await fetch(
      `${CONFIG.apiBaseUrl}/api/swap-history?network=${CONFIG.network}`
    );
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('[SwapBot] Failed to fetch swap history:', error);
    return [];
  }
}

/**
 * Fetch token prices from Digiko API
 */
async function fetchPrices(): Promise<PriceData | null> {
  try {
    const response = await fetch(`${CONFIG.apiBaseUrl}/api/prices`);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('[SwapBot] Failed to fetch prices:', error);
    return null;
  }
}

/**
 * Send message to Telegram
 */
async function sendTelegramMessage(message: string): Promise<boolean> {
  if (!CONFIG.telegramBotToken || !CONFIG.telegramChatId) {
    console.error('[SwapBot] Telegram credentials not configured');
    return false;
  }
  
  try {
    const response = await fetch(
      `https://api.telegram.org/bot${CONFIG.telegramBotToken}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: CONFIG.telegramChatId,
          text: message,
          parse_mode: 'HTML',
          disable_web_page_preview: true,
        }),
      }
    );
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Telegram API error: ${error}`);
    }
    
    return true;
  } catch (error) {
    console.error('[SwapBot] Failed to send Telegram message:', error);
    return false;
  }
}

// ============================================================================
// Message Formatting
// ============================================================================

/**
 * Format a swap transaction as a Telegram message
 */
function formatSwapMessage(
  swap: SwapTransaction,
  prices: PriceData | null
): string {
  // Calculate USD values
  const inputPrice = prices?.prices[swap.inputToken]?.priceUsd || 0;
  const outputPrice = prices?.prices[swap.outputToken]?.priceUsd || 0;
  
  const inputValueUsd = swap.inputAmount * inputPrice;
  const outputValueUsd = swap.outputAmount * outputPrice;
  
  // Use the higher value (they should be roughly equal)
  const swapValueUsd = Math.max(inputValueUsd, outputValueUsd);
  
  const swapEmoji = getSwapEmoji(swapValueUsd);
  const directionEmoji = getDirectionEmoji(swap.inputToken, swap.outputToken);
  
  // Format the message
  const lines = [
    `${swapEmoji} <b>New Swap on Digiko DEX</b>`,
    ``,
    `${directionEmoji} <b>${swap.inputToken}</b> → <b>${swap.outputToken}</b>`,
    ``,
    `📊 <b>Amount:</b>`,
    `   ${formatNumber(swap.inputAmount)} ${swap.inputToken} → ${formatNumber(swap.outputAmount)} ${swap.outputToken}`,
    ``,
    `💵 <b>Value:</b> ${formatUsd(swapValueUsd)}`,
    ``,
    `👤 <b>Trader:</b> <code>${formatAddress(swap.trader, 6)}</code>`,
    ``,
    `🔗 <a href="https://kleverscan.org/transaction/${swap.txHash}">View on Explorer</a>`,
  ];
  
  return lines.join('\n');
}

/**
 * Format a batch of swaps as a summary message
 */
function formatBatchMessage(
  swaps: SwapTransaction[],
  prices: PriceData | null
): string {
  if (swaps.length === 1 && swaps[0]) {
    return formatSwapMessage(swaps[0], prices);
  }
  
  // Calculate totals
  let totalValueUsd = 0;
  const pairCounts: Record<string, number> = {};
  
  for (const swap of swaps) {
    const inputPrice = prices?.prices[swap.inputToken]?.priceUsd || 0;
    const outputPrice = prices?.prices[swap.outputToken]?.priceUsd || 0;
    const valueUsd = Math.max(
      swap.inputAmount * inputPrice,
      swap.outputAmount * outputPrice
    );
    totalValueUsd += valueUsd;
    
    const pair = `${swap.inputToken}/${swap.outputToken}`;
    pairCounts[pair] = (pairCounts[pair] || 0) + 1;
  }
  
  const lines = [
    `🔔 <b>${swaps.length} New Swaps on Digiko DEX</b>`,
    ``,
    `💵 <b>Total Volume:</b> ${formatUsd(totalValueUsd)}`,
    ``,
    `📊 <b>Pairs:</b>`,
  ];
  
  for (const [pair, count] of Object.entries(pairCounts)) {
    lines.push(`   • ${pair}: ${count} swap${count > 1 ? 's' : ''}`);
  }
  
  lines.push(``);
  lines.push(`🔗 <a href="https://digiko.io/dex">View DEX</a>`);
  
  return lines.join('\n');
}

// ============================================================================
// Main Bot Logic
// ============================================================================

class SwapBot {
  private processedTxs: Set<string> = new Set();
  private isRunning: boolean = false;
  
  async start(): Promise<void> {
    console.log('[SwapBot] Starting Digiko Swap Notification Bot...');
    console.log(`[SwapBot] API URL: ${CONFIG.apiBaseUrl}`);
    console.log(`[SwapBot] Poll Interval: ${CONFIG.pollInterval / 1000}s`);
    console.log(`[SwapBot] Min Swap Value: $${CONFIG.minSwapValueUsd}`);
    
    // Validate configuration
    if (!CONFIG.telegramBotToken) {
      console.error('[SwapBot] ERROR: TELEGRAM_BOT_TOKEN not set');
      console.log('[SwapBot] Set the environment variable and restart');
      process.exit(1);
    }
    
    if (!CONFIG.telegramChatId) {
      console.error('[SwapBot] ERROR: TELEGRAM_CHAT_ID not set');
      console.log('[SwapBot] Set the environment variable and restart');
      process.exit(1);
    }
    
    // Initial load - populate processed txs to avoid spam on startup
    console.log('[SwapBot] Loading initial swap history...');
    const initialSwaps = await fetchSwapHistory();
    for (const swap of initialSwaps) {
      this.processedTxs.add(swap.txHash);
    }
    console.log(`[SwapBot] Loaded ${this.processedTxs.size} existing transactions`);
    
    // Send startup message
    await sendTelegramMessage(
      `🚀 <b>Digiko Swap Bot Online</b>\n\n` +
      `Monitoring DEX for new swaps...\n\n` +
      `🔗 <a href="https://digiko.io/dex">Open DEX</a>`
    );
    
    // Start polling
    this.isRunning = true;
    this.poll();
  }
  
  async stop(): Promise<void> {
    console.log('[SwapBot] Stopping...');
    this.isRunning = false;
    
    await sendTelegramMessage(
      `⏹️ <b>Digiko Swap Bot Offline</b>\n\n` +
      `Bot has stopped monitoring.`
    );
  }
  
  private async poll(): Promise<void> {
    while (this.isRunning) {
      try {
        await this.checkForNewSwaps();
      } catch (error) {
        console.error('[SwapBot] Poll error:', error);
      }
      
      // Wait for next poll
      await new Promise(resolve => setTimeout(resolve, CONFIG.pollInterval));
    }
  }
  
  private async checkForNewSwaps(): Promise<void> {
    // Fetch current swaps and prices
    const [swaps, prices] = await Promise.all([
      fetchSwapHistory(),
      fetchPrices(),
    ]);
    
    if (!swaps.length) {
      return;
    }
    
    // Find new swaps (not seen before)
    const newSwaps = swaps.filter(swap => {
      // Skip if already processed
      if (this.processedTxs.has(swap.txHash)) {
        return false;
      }
      
      // Skip failed transactions
      if (swap.status !== 'success') {
        return false;
      }
      
      // Calculate USD value
      const inputPrice = prices?.prices[swap.inputToken]?.priceUsd || 0;
      const outputPrice = prices?.prices[swap.outputToken]?.priceUsd || 0;
      const valueUsd = Math.max(
        swap.inputAmount * inputPrice,
        swap.outputAmount * outputPrice
      );
      
      // Skip if below minimum value
      if (valueUsd < CONFIG.minSwapValueUsd) {
        this.processedTxs.add(swap.txHash); // Mark as processed anyway
        return false;
      }
      
      return true;
    });
    
    // Process new swaps
    if (newSwaps.length > 0) {
      console.log(`[SwapBot] Found ${newSwaps.length} new swap(s)`);
      
      // Send notification(s)
      if (newSwaps.length <= 3) {
        // Send individual messages for small batches
        for (const swap of newSwaps) {
          const message = formatSwapMessage(swap, prices);
          await sendTelegramMessage(message);
          this.processedTxs.add(swap.txHash);
          
          // Small delay between messages
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      } else {
        // Send batch summary for large batches
        const message = formatBatchMessage(newSwaps, prices);
        await sendTelegramMessage(message);
        
        for (const swap of newSwaps) {
          this.processedTxs.add(swap.txHash);
        }
      }
    }
  }
}

// ============================================================================
// Entry Point
// ============================================================================

const bot = new SwapBot();

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n[SwapBot] Received SIGINT, shutting down...');
  await bot.stop();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n[SwapBot] Received SIGTERM, shutting down...');
  await bot.stop();
  process.exit(0);
});

// Start the bot
bot.start().catch(error => {
  console.error('[SwapBot] Fatal error:', error);
  process.exit(1);
});
