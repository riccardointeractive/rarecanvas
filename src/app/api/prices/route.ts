/**
 * Token Prices API
 * 
 * GET /api/prices - Returns cached token prices from Redis
 * GET /api/prices?refresh=true - Force refresh prices (clears cache)
 * 
 * Uses DYNAMIC PROPAGATION for price derivation:
 * - Starts with KLV price from CoinGecko
 * - Iteratively propagates prices through ALL connected pairs
 * - No hardcoded tiers - works with any token chain (KLV→DGKO→KID→WSOL→...)
 * 
 * Falls back to direct fetching if Redis is unavailable or cache is empty.
 */

import { debugLog } from '@/utils/debugMode';
import { NextResponse } from 'next/server';
import { getRedis } from '@/lib/redis';
import { getTokenPrecision } from '@/config/tokens';

const REDIS_KEY = 'digiko:prices';
const DEX_CONTRACT = 'klv1qqqqqqqqqqqqqpgq2jqc28xwmk82mng4kwpm3j9vkq3vyga8xw9qq85y6h';
const KLEVER_API = 'https://api.mainnet.klever.org';
const COINGECKO_API = 'https://api.coingecko.com/api/v3/simple/price?ids=klever&vs_currencies=usd&include_24hr_change=true';

// Max propagation iterations (prevents infinite loops)
const MAX_ITERATIONS = 10;

/**
 * STABLECOIN PRICES
 * 
 * Stablecoins are pegged to USD (or other assets) and should NOT derive
 * their price from AMM pool ratios, which can fluctuate based on liquidity.
 * 
 * Instead, we force these prices to their pegged values.
 * This allows other tokens paired with stablecoins to derive accurate prices.
 */
const STABLECOIN_PRICES: Record<string, { priceUsd: number; peg: string }> = {
  USDT: { priceUsd: 1.0, peg: 'USD' },
  USDC: { priceUsd: 1.0, peg: 'USD' },
  // Add more stablecoins here as needed:
  // DAI: { priceUsd: 1.0, peg: 'USD' },
};

function decodeBase64ToNumber(b64: string): number {
  if (!b64) return 0;
  try {
    const bytes = atob(b64);
    let hex = '';
    for (let i = 0; i < bytes.length; i++) {
      hex += bytes.charCodeAt(i).toString(16).padStart(2, '0');
    }
    return parseInt(hex || '0', 16);
  } catch {
    return 0;
  }
}

function decodeBase64ToString(b64: string): string {
  if (!b64) return '';
  try {
    return atob(b64);
  } catch {
    return '';
  }
}

/**
 * Extract symbol from assetId (e.g., 'DGKO-CXVJ' -> 'DGKO', 'KLV' -> 'KLV')
 */
function getSymbol(assetId: string): string {
  return assetId.split('-')[0] || assetId;
}

/**
 * Get precision for a token using centralized config
 * Uses src/config/tokens.ts as single source of truth (RULE 51)
 */
function getPrecision(assetId: string): number {
  return getTokenPrecision(getSymbol(assetId));
}

/**
 * Encode a number to byte array for V5 contract args
 */
function numberToByteArray(num: number): number[] {
  if (num === 0) return [0];
  const bytes: number[] = [];
  let temp = num;
  while (temp > 0) {
    bytes.unshift(temp & 0xff);
    temp = temp >> 8;
  }
  return bytes;
}

async function fetchPairInfo(pairId: number) {
  try {
    // V5 contract uses getPairInfo with pair ID as arg
    const response = await fetch(`${KLEVER_API}/v1.0/sc/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        scAddress: DEX_CONTRACT,
        funcName: 'getPairInfo',
        arguments: [numberToByteArray(pairId)],
      }),
    });

    if (!response.ok) {
      console.log(`[fetchPairInfo] Pair ${pairId}: HTTP ${response.status}`);
      return null;
    }

    const data = await response.json();
    if (data.code !== 'successful' || data.data?.returnCode !== 'Ok') {
      if (pairId <= 5) console.log(`[fetchPairInfo] Pair ${pairId}: Query failed`, data.code, data.data?.returnCode);
      return null;
    }

    const returnData = data.data?.returnData || [];
    if (returnData.length < 8) {
      if (pairId <= 5) console.log(`[fetchPairInfo] Pair ${pairId}: Not enough data (${returnData.length})`);
      return null;
    }

    const tokenA = decodeBase64ToString(returnData[0]);
    const tokenB = decodeBase64ToString(returnData[1]);
    const reserveARaw = decodeBase64ToNumber(returnData[4]);
    const reserveBRaw = decodeBase64ToNumber(returnData[5]);
    const isActive = decodeBase64ToNumber(returnData[7]) === 1;

    console.log(`[fetchPairInfo] Pair ${pairId}: ${tokenA}/${tokenB} reserves=${reserveARaw}/${reserveBRaw} active=${isActive}`);

    return {
      tokenA,
      tokenB,
      reserveA: reserveARaw / getPrecision(tokenA),
      reserveB: reserveBRaw / getPrecision(tokenB),
      isActive,
    };
  } catch (err) {
    console.log(`[fetchPairInfo] Pair ${pairId}: Error`, err);
    return null;
  }
}

interface PriceEntry {
  priceUsd: number;
  priceKlv: number;
  pairId?: number;
  derivedFrom?: string;
  depth?: number;  // How many hops from KLV
  priceChange24h?: number | null;  // 24h change % (standard)
  priceChange7d?: number | null;   // 7-day change %
  priceChange30d?: number | null;  // 30-day change %
  priceChangeAll?: number | null;  // All-time change %
}

interface SwapTransaction {
  timestamp: number;
  status: string;
  inputToken: string;
  outputToken: string;
  inputAmount: number;
  outputAmount: number;
}

/**
 * Fetch swap history from our API
 */
async function fetchSwapHistory(): Promise<SwapTransaction[]> {
  try {
    // Use internal API endpoint
    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    
    const response = await fetch(`${baseUrl}/api/swap-history?network=mainnet`, {
      cache: 'no-store',
    });
    
    if (!response.ok) return [];
    
    const data = await response.json();
    return data.data || [];
  } catch (e) {
    console.error('[Prices API] Failed to fetch swap history:', e);
    return [];
  }
}

/**
 * Calculate price change % for a token over different time periods
 */
function calculatePriceChanges(
  token: string,
  transactions: SwapTransaction[]
): { change24h: number | null; change7d: number | null; change30d: number | null; changeAll: number | null } {
  // Filter transactions for this token paired with KLV
  const tokenTxs = transactions.filter(tx => {
    const tokens = [tx.inputToken, tx.outputToken];
    return tokens.includes(token) && tokens.includes('KLV') && tx.status === 'success';
  }).sort((a, b) => a.timestamp - b.timestamp);
  
  if (tokenTxs.length < 2) {
    return { change24h: null, change7d: null, change30d: null, changeAll: null };
  }
  
  // Helper to get price from swap (price of token in KLV)
  const getSwapPrice = (tx: SwapTransaction): number => {
    if (tx.inputToken === token) {
      return tx.outputAmount / tx.inputAmount; // Sold token, got KLV
    } else {
      return tx.inputAmount / tx.outputAmount; // Bought token, paid KLV
    }
  };
  
  // Helper to calculate change for a time window with IQR outlier filtering
  const calculateChangeForWindow = (windowTxs: SwapTransaction[]): number | null => {
    if (windowTxs.length < 2) return null;
    
    const prices = windowTxs.map(tx => getSwapPrice(tx)).filter(p => isFinite(p) && p > 0);
    if (prices.length < 2) return null;
    
    let firstPrice = 0;
    let lastPrice = 0;
    
    if (prices.length >= 4) {
      // Use IQR to filter outliers
      const sorted = [...prices].sort((a, b) => a - b);
      const q1 = sorted[Math.floor(sorted.length * 0.25)] ?? 0;
      const q3 = sorted[Math.floor(sorted.length * 0.75)] ?? 0;
      const iqr = q3 - q1;
      const lowerBound = q1 - (iqr * 2);
      const upperBound = q3 + (iqr * 2);
      
      const cleanTxs = windowTxs.filter(tx => {
        const price = getSwapPrice(tx);
        return price >= lowerBound && price <= upperBound;
      });
      
      if (cleanTxs.length >= 2) {
        firstPrice = getSwapPrice(cleanTxs[0]!);
        lastPrice = getSwapPrice(cleanTxs[cleanTxs.length - 1]!);
      } else {
        return null;
      }
    } else {
      firstPrice = getSwapPrice(windowTxs[0]!);
      lastPrice = getSwapPrice(windowTxs[windowTxs.length - 1]!);
    }
    
    if (firstPrice > 0 && lastPrice > 0) {
      const change = ((lastPrice - firstPrice) / firstPrice) * 100;
      return Math.max(-99.99, Math.min(999.99, change));
    }
    return null;
  };
  
  const now = Date.now() / 1000;
  const oneDayCutoff = now - (1 * 24 * 60 * 60);
  const sevenDayCutoff = now - (7 * 24 * 60 * 60);
  const thirtyDayCutoff = now - (30 * 24 * 60 * 60);
  
  return {
    change24h: calculateChangeForWindow(tokenTxs.filter(tx => tx.timestamp >= oneDayCutoff)),
    change7d: calculateChangeForWindow(tokenTxs.filter(tx => tx.timestamp >= sevenDayCutoff)),
    change30d: calculateChangeForWindow(tokenTxs.filter(tx => tx.timestamp >= thirtyDayCutoff)),
    changeAll: calculateChangeForWindow(tokenTxs),
  };
}

async function fetchFreshPrices() {
  // Fetch KLV price with 24h change from CoinGecko
  let klvPrice = 0;
  let klvPriceChange24h: number | null = null;
  try {
    const response = await fetch(COINGECKO_API);
    if (response.ok) {
      const data = await response.json();
      klvPrice = data?.klever?.usd || 0;
      klvPriceChange24h = data?.klever?.usd_24h_change ?? null;
    }
  } catch (e) {
    console.error('[Prices API] CoinGecko error:', e);
  }

  // Initialize prices with KLV as the root (primary anchor)
  const prices: Record<string, PriceEntry> = {
    KLV: { 
      priceUsd: klvPrice, 
      priceKlv: 1, 
      depth: 0,
      priceChange24h: klvPriceChange24h 
    },
  };

  // Fetch all active pairs
  const allPairs: Array<{
    pairId: number;
    tokenA: string;
    tokenB: string;
    symbolA: string;
    symbolB: string;
    reserveA: number;
    reserveB: number;
  }> = [];

  const MAX_PAIRS = 50;
  debugLog('[Prices API] Fetching pairs in parallel...');
  
  // Fetch all pairs in PARALLEL for better performance
  const pairPromises = Array.from({ length: MAX_PAIRS }, (_, i) => i + 1).map(async (pairId) => {
    const pairInfo = await fetchPairInfo(pairId);
    if (!pairInfo) return null;
    if (!pairInfo.isActive) return null;
    if (pairInfo.reserveA <= 0 || pairInfo.reserveB <= 0) return null;
    
    return { 
      pairId, 
      tokenA: pairInfo.tokenA,
      tokenB: pairInfo.tokenB,
      symbolA: getSymbol(pairInfo.tokenA),
      symbolB: getSymbol(pairInfo.tokenB),
      reserveA: pairInfo.reserveA,
      reserveB: pairInfo.reserveB,
    };
  });
  
  const pairResults = await Promise.all(pairPromises);
  
  // Filter out nulls and add to allPairs
  for (const result of pairResults) {
    if (result) {
      allPairs.push(result);
    }
  }
  
  debugLog(`[Prices API] Found ${allPairs.length} active pairs`);
  
  // Log all pairs for debugging
  for (const pair of allPairs) {
    debugLog(`  Pair #${pair.pairId}: ${pair.symbolA}/${pair.symbolB} - Reserves: ${pair.reserveA.toFixed(2)} / ${pair.reserveB.toFixed(2)}`);
  }

  // ============================================================================
  // PHASE 1: KLV-ONLY PROPAGATION (Primary - CoinGecko anchored)
  // ============================================================================
  // This ensures all tokens with a path to KLV get their price from KLV first
  debugLog('[Prices API] Phase 1: KLV propagation...');
  
  let iteration = 0;
  let changed = true;
  
  while (changed && iteration < MAX_ITERATIONS) {
    changed = false;
    iteration++;
    
    for (const pair of allPairs) {
      const priceA = prices[pair.symbolA];
      const priceB = prices[pair.symbolB];
      
      // Skip stablecoin pairs in Phase 1 - we only want KLV-derived prices
      const aIsStablecoin = STABLECOIN_PRICES[pair.symbolA];
      const bIsStablecoin = STABLECOIN_PRICES[pair.symbolB];
      if (aIsStablecoin || bIsStablecoin) continue;
      
      // Case 1: A has price, B doesn't → derive B from A
      if (priceA && priceA.priceUsd > 0 && !priceB) {
        const priceInA = pair.reserveA / pair.reserveB;
        const priceUsd = priceInA * priceA.priceUsd;
        const priceKlv = klvPrice > 0 ? priceUsd / klvPrice : 0;
        
        prices[pair.symbolB] = {
          priceUsd,
          priceKlv,
          pairId: pair.pairId,
          derivedFrom: pair.symbolA,
          depth: (priceA.depth || 0) + 1,
        };
        
        debugLog(`  [P1.${iteration}] ✅ ${pair.symbolB}: $${priceUsd.toFixed(8)} (via ${pair.symbolA})`);
        changed = true;
      }
      
      // Case 2: B has price, A doesn't → derive A from B
      if (priceB && priceB.priceUsd > 0 && !priceA) {
        const priceInB = pair.reserveB / pair.reserveA;
        const priceUsd = priceInB * priceB.priceUsd;
        const priceKlv = klvPrice > 0 ? priceUsd / klvPrice : 0;
        
        prices[pair.symbolA] = {
          priceUsd,
          priceKlv,
          pairId: pair.pairId,
          derivedFrom: pair.symbolB,
          depth: (priceB.depth || 0) + 1,
        };
        
        debugLog(`  [P1.${iteration}] ✅ ${pair.symbolA}: $${priceUsd.toFixed(8)} (via ${pair.symbolB})`);
        changed = true;
      }
    }
  }
  
  debugLog(`[Prices API] Phase 1 complete: ${iteration} iterations, ${Object.keys(prices).length} tokens priced via KLV`);

  // ============================================================================
  // PHASE 2: STABLECOIN FALLBACK (For tokens with no KLV path)
  // ============================================================================
  // Add stablecoins and propagate to any remaining unpriced tokens
  debugLog('[Prices API] Phase 2: Stablecoin fallback...');
  
  // Add forced stablecoin prices (pegged values, not AMM-derived)
  for (const [symbol, config] of Object.entries(STABLECOIN_PRICES)) {
    // Only add if not already priced (shouldn't happen, but safety check)
    if (!prices[symbol]) {
      prices[symbol] = {
        priceUsd: config.priceUsd,
        priceKlv: klvPrice > 0 ? config.priceUsd / klvPrice : 0,
        depth: 0,
        derivedFrom: `${config.peg}-peg`,
      };
      debugLog(`  Stablecoin ${symbol}: $${config.priceUsd.toFixed(2)} (pegged to ${config.peg})`);
    }
  }
  
  // Second propagation pass for stablecoin-only pairs
  let iteration2 = 0;
  changed = true;
  
  while (changed && iteration2 < MAX_ITERATIONS) {
    changed = false;
    iteration2++;
    
    for (const pair of allPairs) {
      const priceA = prices[pair.symbolA];
      const priceB = prices[pair.symbolB];
      
      // Case 1: A has price (stablecoin), B doesn't → derive B from A
      if (priceA && priceA.priceUsd > 0 && !priceB) {
        const priceInA = pair.reserveA / pair.reserveB;
        const priceUsd = priceInA * priceA.priceUsd;
        const priceKlv = klvPrice > 0 ? priceUsd / klvPrice : 0;
        
        prices[pair.symbolB] = {
          priceUsd,
          priceKlv,
          pairId: pair.pairId,
          derivedFrom: pair.symbolA,
          depth: (priceA.depth || 0) + 1,
        };
        
        debugLog(`  [P2.${iteration2}] ✅ ${pair.symbolB}: $${priceUsd.toFixed(8)} (via ${pair.symbolA} - stablecoin fallback)`);
        changed = true;
      }
      
      // Case 2: B has price (stablecoin), A doesn't → derive A from B
      if (priceB && priceB.priceUsd > 0 && !priceA) {
        const priceInB = pair.reserveB / pair.reserveA;
        const priceUsd = priceInB * priceB.priceUsd;
        const priceKlv = klvPrice > 0 ? priceUsd / klvPrice : 0;
        
        prices[pair.symbolA] = {
          priceUsd,
          priceKlv,
          pairId: pair.pairId,
          derivedFrom: pair.symbolB,
          depth: (priceB.depth || 0) + 1,
        };
        
        debugLog(`  [P2.${iteration2}] ✅ ${pair.symbolA}: $${priceUsd.toFixed(8)} (via ${pair.symbolB} - stablecoin fallback)`);
        changed = true;
      }
    }
  }
  
  debugLog(`[Prices API] Phase 2 complete: ${iteration2} iterations, ${Object.keys(prices).length} total tokens priced`);
  
  // Log final prices for debugging
  const pricedTokens = Object.keys(prices).filter(k => prices[k] && prices[k].priceUsd > 0);
  debugLog(`[Prices API] Priced tokens: ${pricedTokens.join(', ')}`);
  
  // Check for tokens in pairs that didn't get prices
  const allTokensInPairs = new Set<string>();
  for (const pair of allPairs) {
    allTokensInPairs.add(pair.symbolA);
    allTokensInPairs.add(pair.symbolB);
  }
  const unpricedTokens = Array.from(allTokensInPairs).filter(t => !prices[t] || prices[t].priceUsd === 0);
  if (unpricedTokens.length > 0) {
    debugLog(`[Prices API] ⚠️ Unpriced tokens: ${unpricedTokens.join(', ')}`);
  }
  
  // ============================================================================
  // PRICE CHANGES: Calculate from swap history for DEX tokens
  // ============================================================================
  debugLog('[Prices API] Fetching swap history for price changes...');
  const swapHistory = await fetchSwapHistory();
  
  if (swapHistory.length > 0) {
    debugLog(`[Prices API] Calculating price changes from ${swapHistory.length} swaps`);
    
    // Calculate changes for each DEX token (not KLV - it uses CoinGecko)
    for (const symbol of pricedTokens) {
      if (symbol === 'KLV') continue; // KLV already has 24h from CoinGecko
      
      const changes = calculatePriceChanges(symbol, swapHistory);
      const priceEntry = prices[symbol];
      
      if (priceEntry) {
        priceEntry.priceChange24h = changes.change24h;
        priceEntry.priceChange7d = changes.change7d;
        priceEntry.priceChange30d = changes.change30d;
        priceEntry.priceChangeAll = changes.changeAll;
        
        debugLog(`  ${symbol}: 24h=${changes.change24h?.toFixed(2) ?? 'N/A'}%, 7d=${changes.change7d?.toFixed(2) ?? 'N/A'}%, 30d=${changes.change30d?.toFixed(2) ?? 'N/A'}%`);
      }
    }
  }

  return {
    prices,
    updatedAt: new Date().toISOString(),
    network: 'mainnet',
    source: 'fresh',
    // Debug info (included in response for debugging)
    _debug: {
      pairsFound: allPairs.length,
      pairs: allPairs.map(p => ({
        id: p.pairId,
        pair: `${p.symbolA}/${p.symbolB}`,
        reserveA: p.reserveA,
        reserveB: p.reserveB,
      })),
      pricedTokens,
      unpricedTokens,
      iterations: iteration,
    },
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const forceRefresh = searchParams.get('refresh') === 'true';
  const includeDebug = searchParams.get('debug') === 'true';
  
  const redis = getRedis();
  
  // Clear cache if refresh requested
  if (forceRefresh && redis) {
    try {
      await redis.del(REDIS_KEY);
      debugLog('[Prices API] Cache cleared (refresh=true)');
    } catch (e) {
      console.error('[Prices API] Failed to clear cache:', e);
    }
  }
  
  // Try Redis first (unless force refresh)
  if (!forceRefresh && redis) {
    try {
      const cached = await redis.get(REDIS_KEY);
      
      if (cached) {
        const data = typeof cached === 'string' ? JSON.parse(cached) : cached;
        return NextResponse.json({
          ...data,
          source: 'cache',
        }, {
          headers: {
            'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
          },
        });
      }
    } catch (error) {
      console.error('[Prices API] Redis error:', error);
    }
  }
  
  // Fallback: fetch fresh prices
  debugLog('[Prices API] Fetching fresh prices...');
  const freshData = await fetchFreshPrices();
  
  // Try to cache for next request (without debug info)
  if (redis) {
    try {
      const { _debug, ...dataToCache } = freshData;
      await redis.set(REDIS_KEY, JSON.stringify(dataToCache), { ex: 300 });
    } catch (e) {
      console.error('[Prices API] Failed to cache:', e);
    }
  }
  
  // Strip debug info unless requested
  const responseData = includeDebug ? freshData : (() => {
    const { _debug, ...rest } = freshData;
    return rest;
  })();
  
  return NextResponse.json(responseData, {
    headers: {
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
    },
  });
}

// CORS preflight handler
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
