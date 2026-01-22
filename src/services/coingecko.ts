/**
 * CoinGecko API Service
 * Fetches KLV price data via backend API (avoids CORS issues)
 */

import { debugLog } from '@/utils/debugMode';

export interface PricePoint {
  timestamp: number; // Unix timestamp in seconds
  price: number; // Price in USD
}

/**
 * Fetch KLV price history from backend API
 * @param days Number of days of history (1, 7, 30, 90, 365, max)
 * @returns Array of price points
 */
export async function fetchKLVPriceHistory(days: number = 7): Promise<PricePoint[]> {
  try {
    debugLog(`🌐 Fetching KLV price history from /api/klv-price-history?days=${days}`);
    
    const response = await fetch(
      `/api/klv-price-history?days=${days}`
    );

    debugLog(`📡 API Response status: ${response.status}`);

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }

    const result = await response.json();
    debugLog(`📊 API returned:`, result);
    
    return result.data || [];
  } catch (error) {
    console.error('❌ Error in fetchKLVPriceHistory:', error);
    return [];
  }
}

/**
 * Get simplified price history with custom intervals
 * Useful for charts that need specific number of data points
 */
export function simplifyPriceHistory(
  prices: PricePoint[],
  targetPoints: number = 10
): PricePoint[] {
  if (prices.length <= targetPoints) {
    return prices;
  }

  const interval = Math.floor(prices.length / targetPoints);
  const simplified: PricePoint[] = [];

  for (let i = 0; i < prices.length; i += interval) {
    const price = prices[i];
    if (simplified.length < targetPoints && price) {
      simplified.push(price);
    }
  }

  // Always include the last point
  const lastPrice = prices[prices.length - 1];
  if (lastPrice && simplified[simplified.length - 1] !== lastPrice) {
    simplified.push(lastPrice);
  }

  return simplified;
}
