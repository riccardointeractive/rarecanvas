/**
 * Debug endpoint for price propagation
 * GET /api/prices/debug - Shows detailed pair and propagation info
 */

import { NextResponse } from 'next/server';
import { getTokenPrecision } from '@/config/tokens';

const DEX_CONTRACT = 'klv1qqqqqqqqqqqqqpgq2jqc28xwmk82mng4kwpm3j9vkq3vyga8xw9qq85y6h';
const KLEVER_API = 'https://api.mainnet.klever.org';
const COINGECKO_API = 'https://api.coingecko.com/api/v3/simple/price?ids=klever&vs_currencies=usd&include_24hr_change=true';

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

function getSymbol(assetId: string): string {
  return assetId.split('-')[0] || assetId;
}

function getPrecision(assetId: string): number {
  return getTokenPrecision(getSymbol(assetId));
}

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
    // V5 contract uses getPairInfo with pair ID as byte array arg
    const response = await fetch(`${KLEVER_API}/v1.0/sc/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        scAddress: DEX_CONTRACT,
        funcName: 'getPairInfo',
        arguments: [numberToByteArray(pairId)],
      }),
    });

    if (!response.ok) return { error: `HTTP ${response.status}` };

    const data = await response.json();
    if (data.code !== 'successful' || data.data?.returnCode !== 'Ok') {
      return { error: 'Query failed', data };
    }

    const returnData = data.data?.returnData || [];
    if (returnData.length < 8) return { error: 'Not enough data', returnData };

    const tokenA = decodeBase64ToString(returnData[0]);
    const tokenB = decodeBase64ToString(returnData[1]);
    const reserveARaw = decodeBase64ToNumber(returnData[4]);
    const reserveBRaw = decodeBase64ToNumber(returnData[5]);
    const isActive = decodeBase64ToNumber(returnData[7]) === 1;

    return {
      pairId,
      tokenA,
      tokenB,
      symbolA: getSymbol(tokenA),
      symbolB: getSymbol(tokenB),
      reserveARaw,
      reserveBRaw,
      precisionA: getPrecision(tokenA),
      precisionB: getPrecision(tokenB),
      reserveA: reserveARaw / getPrecision(tokenA),
      reserveB: reserveBRaw / getPrecision(tokenB),
      isActive,
    };
  } catch (e) {
    return { error: String(e) };
  }
}

export async function GET() {
  // Fetch KLV price
  let klvPrice = 0;
  let klvChange = null;
  try {
    const response = await fetch(COINGECKO_API);
    if (response.ok) {
      const data = await response.json();
      klvPrice = data?.klever?.usd || 0;
      klvChange = data?.klever?.usd_24h_change ?? null;
    }
  } catch (e) {
    console.error('CoinGecko error:', e);
  }

  // Fetch all pairs
  const pairs = [];
  for (let i = 1; i <= 25; i++) {
    const info = await fetchPairInfo(i);
    if (!('error' in info)) {
      pairs.push(info);
    }
  }

  // Simulate propagation
  const prices: Record<string, { usd: number; via?: string; iteration?: number }> = {
    KLV: { usd: klvPrice },
  };

  const log: string[] = [];
  let iteration = 0;
  let changed = true;

  while (changed && iteration < 10) {
    changed = false;
    iteration++;

    for (const pair of pairs) {
      if (!pair.isActive || pair.reserveA <= 0 || pair.reserveB <= 0) continue;

      const priceA = prices[pair.symbolA];
      const priceB = prices[pair.symbolB];

      if (priceA && priceA.usd > 0 && !priceB) {
        const priceInA = pair.reserveA / pair.reserveB;
        const usd = priceInA * priceA.usd;
        prices[pair.symbolB] = { usd, via: pair.symbolA, iteration };
        log.push(`[${iteration}] ${pair.symbolB}: $${usd.toFixed(8)} (via ${pair.symbolA} from pair #${pair.pairId})`);
        changed = true;
      }

      if (priceB && priceB.usd > 0 && !priceA) {
        const priceInB = pair.reserveB / pair.reserveA;
        const usd = priceInB * priceB.usd;
        prices[pair.symbolA] = { usd, via: pair.symbolB, iteration };
        log.push(`[${iteration}] ${pair.symbolA}: $${usd.toFixed(8)} (via ${pair.symbolB} from pair #${pair.pairId})`);
        changed = true;
      }
    }
  }

  // Find unpriced tokens
  const allTokens = new Set<string>();
  for (const pair of pairs) {
    allTokens.add(pair.symbolA);
    allTokens.add(pair.symbolB);
  }
  const unpriced = Array.from(allTokens).filter(t => !prices[t] || prices[t].usd === 0);

  return NextResponse.json({
    klv: { price: klvPrice, change24h: klvChange },
    totalPairs: pairs.length,
    pairs: pairs.map(p => ({
      id: p.pairId,
      pair: `${p.symbolA}/${p.symbolB}`,
      active: p.isActive,
      reserveA: p.reserveA,
      reserveB: p.reserveB,
    })),
    propagation: {
      iterations: iteration,
      log,
    },
    prices,
    unpriced,
  }, {
    headers: {
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
