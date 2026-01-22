/**
 * DEX Activity Notifications API
 * 
 * GET /api/telegram/dex-notify
 * 
 * Monitors DEX contract for:
 * - Swaps
 * - New pair creations
 * - Liquidity additions
 * 
 * Sends notifications to Telegram.
 * 
 * Redis Keys Used:
 *    - digiko:telegram:dex:processedHashes - Processed transaction hashes
 *    - digiko:telegram:dex:lastCheck - Last check timestamp
 */

import { NextRequest, NextResponse } from 'next/server';
import { getRedis } from '@/lib/redis';

// ============================================================================
// Configuration
// ============================================================================

const CONFIG = {
  // Telegram
  botToken: process.env.TELEGRAM_BOT_TOKEN || '',
  chatId: process.env.TELEGRAM_SWAP_CHAT_ID || '',
  threadId: process.env.TELEGRAM_SWAP_THREAD_ID || '',
  
  // Rate limiting
  maxNotificationsPerRun: 10,
  
  // Minimum swap value to notify (in tokens)
  minSwapAmount: 10, // Skip tiny swaps
};

// Redis keys
const REDIS_KEYS = {
  processedHashes: 'digiko:telegram:dex:processedHashes',
  lastCheck: 'digiko:telegram:dex:lastCheck',
};

// ============================================================================
// Types
// ============================================================================

interface DexActivity {
  type: 'swap' | 'pair_created' | 'liquidity_added';
  txHash: string;
  timestamp: number;
  sender: string;
  // For swap
  inputToken?: string;
  outputToken?: string;
  inputAmount?: number;
  outputAmount?: number;
  // For pair_created
  tokenA?: string;
  tokenB?: string;
  pairId?: number;
  // For liquidity_added (V2: dual token support)
  token?: string;           // Combined: "DGKO-CXVJ + KLV"
  amount?: number;          // Legacy: primary token amount
  amountRaw?: string;       // Legacy: raw amounts
  tokenAId?: string;        // First token ID
  tokenBId?: string;        // Second token ID  
  amountA?: number;         // First token amount (human readable)
  amountB?: number;         // Second token amount (human readable)
  // Debug
  functionName?: string;
}

// ============================================================================
// Utility Functions
// ============================================================================

function formatAddress(address: string, chars: number = 4): string {
  if (!address || address.length <= chars * 2 + 3) return address;
  return `${address.slice(0, chars + 4)}...${address.slice(-chars)}`;
}

function formatNumber(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(2)}K`;
  if (value < 0.01 && value > 0) return value.toFixed(6);
  if (value < 1) return value.toFixed(4);
  return value.toLocaleString('en-US', { maximumFractionDigits: 2 });
}

// ============================================================================
// API Functions
// ============================================================================

async function fetchDexActivity(network: 'mainnet' | 'testnet', typeFilter?: string): Promise<DexActivity[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://digiko.io';
    
    let url = `${baseUrl}/api/dex-activity?network=${network}&limit=50`;
    if (typeFilter) {
      url += `&type=${typeFilter}`;
    }
    
    const response = await fetch(url, {
      cache: 'no-store',
    });
    
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('[DexNotify] Failed to fetch activity:', error);
    return [];
  }
}

async function fetchKlvPrice(): Promise<number> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://digiko.io';
    const response = await fetch(`${baseUrl}/api/prices`, {
      cache: 'no-store',
    });
    
    if (!response.ok) return 0.00184; // Fallback
    
    const data = await response.json();
    return data.prices?.KLV?.priceUsd || 0.00184;
  } catch {
    return 0.00184; // Fallback price
  }
}

async function sendTelegramMessage(message: string): Promise<boolean> {
  if (!CONFIG.botToken || !CONFIG.chatId) {
    console.error('[DexNotify] Telegram credentials not configured');
    return false;
  }
  
  try {
    const body: Record<string, unknown> = {
      chat_id: CONFIG.chatId,
      text: message,
      parse_mode: 'HTML',
      disable_web_page_preview: true,
    };
    
    if (CONFIG.threadId) {
      body.message_thread_id = parseInt(CONFIG.threadId, 10);
    }
    
    const response = await fetch(
      `https://api.telegram.org/bot${CONFIG.botToken}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }
    );
    
    if (!response.ok) {
      const error = await response.text();
      console.error('[DexNotify] Telegram error:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('[DexNotify] Failed to send message:', error);
    return false;
  }
}

// ============================================================================
// Message Formatting
// ============================================================================

function formatSwapMessage(activity: DexActivity, klvPrice: number): string {
  const inputSymbol = activity.inputToken?.split('-')[0] || activity.inputToken || '???';
  const outputSymbol = activity.outputToken?.split('-')[0] || activity.outputToken || '???';
  const inputAmount = activity.inputAmount || 0;
  const outputAmount = activity.outputAmount || 0;
  
  // Calculate rate
  const rate = inputAmount > 0 ? outputAmount / inputAmount : 0;
  
  // Calculate USD value (estimate based on KLV side of the swap)
  let usdValue = 0;
  if (inputSymbol === 'KLV') {
    usdValue = inputAmount * klvPrice;
  } else if (outputSymbol === 'KLV') {
    usdValue = outputAmount * klvPrice;
  }
  
  return [
    `✨ <b>SWAP EXECUTED</b>`,
    ``,
    `💰 ${formatNumber(inputAmount)} ${inputSymbol} → ${formatNumber(outputAmount)} ${outputSymbol}`,
    `📊 Rate: 1 ${inputSymbol} = ${formatNumber(rate)} ${outputSymbol}`,
    usdValue > 0 ? `💵 Value: $${formatNumber(usdValue)}` : null,
    ``,
    `👤 <code>${formatAddress(activity.sender, 6)}</code>`,
    `↗ <a href="https://kleverscan.org/transaction/${activity.txHash}">Explorer</a> • <a href="https://digiko.io/swap">DEX</a>`,
    `━━━━━━━━━━`,
  ].filter(Boolean).join('\n');
}

function formatPairCreatedMessage(activity: DexActivity): string {
  const tokenASymbol = activity.tokenA?.split('-')[0] || activity.tokenA || '???';
  const tokenBSymbol = activity.tokenB?.split('-')[0] || activity.tokenB || 'KLV';
  
  return [
    `🎉 <b>NEW PAIR CREATED</b>`,
    ``,
    `📊 <b>${tokenASymbol} / ${tokenBSymbol}</b>`,
    ``,
    `👤 Creator: <code>${formatAddress(activity.sender, 6)}</code>`,
    `↗ <a href="https://kleverscan.org/transaction/${activity.txHash}">Explorer</a> • <a href="https://digiko.io/pool">Add Liquidity</a>`,
    `━━━━━━━━━━`,
  ].join('\n');
}

function formatLiquidityAddedMessage(activity: DexActivity): string {
  // Handle dual-token deposits (mint with both tokens)
  const tokenASymbol = activity.tokenAId?.split('-')[0] || '???';
  const tokenBSymbol = activity.tokenBId?.split('-')[0] || '???';
  const amountA = activity.amountA || 0;
  const amountB = activity.amountB || 0;
  
  // Format amounts - show both if available
  let amountDisplay: string;
  if (amountA > 0 && amountB > 0) {
    amountDisplay = `${formatNumber(amountA)} ${tokenASymbol} + ${formatNumber(amountB)} ${tokenBSymbol}`;
  } else if (amountA > 0) {
    amountDisplay = `${formatNumber(amountA)} ${tokenASymbol}`;
  } else {
    // Fallback to legacy format
    const tokens = activity.token || 'tokens';
    const displayTokens = tokens.split(' + ').map(t => t.split('-')[0]).join(' + ');
    amountDisplay = `${formatNumber(activity.amount || 0)} ${displayTokens}`;
  }
  
  return [
    `💧 <b>LIQUIDITY ADDED</b>`,
    ``,
    `💰 <b>${amountDisplay}</b>`,
    ``,
    `👤 LP: <code>${formatAddress(activity.sender, 6)}</code>`,
    `↗ <a href="https://kleverscan.org/transaction/${activity.txHash}">Explorer</a> • <a href="https://digiko.io/pool">Pool</a>`,
    `━━━━━━━━━━`,
  ].join('\n');
}

function formatMessage(activity: DexActivity, klvPrice: number = 0.00184): string {
  switch (activity.type) {
    case 'swap':
      return formatSwapMessage(activity, klvPrice);
    case 'pair_created':
      return formatPairCreatedMessage(activity);
    case 'liquidity_added':
      return formatLiquidityAddedMessage(activity);
    default:
      return '';
  }
}

// ============================================================================
// Main Handler
// ============================================================================

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const debug = url.searchParams.get('debug') === 'true';
  const reset = url.searchParams.get('reset') === 'true';
  const network = (url.searchParams.get('network') || 'mainnet') as 'mainnet' | 'testnet';
  const typeFilter = url.searchParams.get('type'); // 'swap' | 'pair_created' | 'liquidity_added'
  
  // Check Telegram configuration
  if (!CONFIG.botToken || !CONFIG.chatId) {
    return NextResponse.json({
      success: false,
      error: 'Telegram not configured',
    });
  }
  
  const redis = getRedis();
  
  if (!redis) {
    return NextResponse.json({
      success: false,
      error: 'Redis not available',
    });
  }
  
  try {
    // Reset if requested
    if (reset) {
      await redis.del(REDIS_KEYS.processedHashes);
      return NextResponse.json({
        success: true,
        message: 'Processed hashes cleared',
      });
    }
    
    // Get processed hashes
    const processedHashesRaw = await redis.lrange(REDIS_KEYS.processedHashes, 0, 999) as string[];
    const processedHashes = new Set(processedHashesRaw);
    
    // Fetch DEX activity - include type filter if specified
    const activities = await fetchDexActivity(network, typeFilter || undefined);
    
    if (!activities.length) {
      return NextResponse.json({
        success: true,
        message: 'No activity found',
        processed: 0,
        debug: debug ? { processedCount: processedHashes.size } : undefined,
      });
    }
    
    // Only process activities from last 10 minutes
    const tenMinutesAgo = Math.floor(Date.now() / 1000) - (10 * 60);
    const recentActivities = activities.filter(a => a.timestamp > tenMinutesAgo);
    
    // Filter out already processed
    let newActivities = recentActivities.filter(a => !processedHashes.has(a.txHash));
    
    // Filter out small swaps (to avoid spam)
    newActivities = newActivities.filter(a => {
      if (a.type === 'swap') {
        // Skip if input amount is too small
        return (a.inputAmount || 0) >= CONFIG.minSwapAmount;
      }
      return true;
    });
    
    // Limit notifications
    const toNotify = newActivities.slice(0, CONFIG.maxNotificationsPerRun);
    
    // Fetch KLV price for USD values
    const klvPrice = await fetchKlvPrice();
    
    // Send notifications
    let sentCount = 0;
    const errors: string[] = [];
    
    for (const activity of toNotify) {
      const message = formatMessage(activity, klvPrice);
      
      if (!message) continue;
      
      const success = await sendTelegramMessage(message);
      
      if (success) {
        sentCount++;
        await redis.lpush(REDIS_KEYS.processedHashes, activity.txHash);
      } else {
        errors.push(activity.txHash);
      }
      
      // Small delay between messages
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // Trim processed list
    await redis.ltrim(REDIS_KEYS.processedHashes, 0, 999);
    
    // Update last check
    await redis.set(REDIS_KEYS.lastCheck, Date.now());
    
    return NextResponse.json({
      success: true,
      found: newActivities.length,
      sent: sentCount,
      skipped: newActivities.length - toNotify.length,
      errors: errors.length > 0 ? errors : undefined,
      debug: debug ? {
        totalActivities: activities.length,
        recentActivities: recentActivities.length,
        processedCount: processedHashes.size,
        activities: newActivities.slice(0, 10).map(a => ({
          type: a.type,
          hash: a.txHash.slice(0, 12),
          timestamp: a.timestamp,
          functionName: a.functionName,
        })),
      } : undefined,
    });
    
  } catch (error) {
    console.error('[DexNotify] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal error' },
      { status: 500 }
    );
  }
}

// Allow POST for manual trigger
export async function POST(request: NextRequest) {
  return GET(request);
}
