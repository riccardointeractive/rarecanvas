import { NextResponse } from 'next/server';
import { debugLog } from '@/utils/debugMode';

// Cache duration: 1 hour
const CACHE_DURATION = 60 * 60 * 1000;

interface PricePoint {
  timestamp: number;
  price: number;
}

let cachedData: PricePoint[] = [];
let cacheTimestamp = 0;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const days = parseInt(searchParams.get('days') || '7', 10);

  // Check cache first
  const now = Date.now();
  if (cachedData.length > 0 && now - cacheTimestamp < CACHE_DURATION) {
    debugLog('✅ Returning cached KLV price data');
    return NextResponse.json({ data: cachedData, cached: true });
  }

  try {
    debugLog('🔄 Fetching fresh KLV price data from CoinGecko...');
    
    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/klever/market_chart?vs_currency=usd&days=${days}&interval=daily`,
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.prices || !Array.isArray(data.prices)) {
      throw new Error('Invalid response format from CoinGecko');
    }

    // Transform data
    const priceData: PricePoint[] = data.prices.map(([timestamp, price]: [number, number]) => ({
      timestamp: Math.floor(timestamp / 1000), // Convert to seconds
      price,
    }));

    // Update cache
    cachedData = priceData;
    cacheTimestamp = now;

    debugLog(`✅ Fetched ${priceData.length} price points from CoinGecko`);

    return NextResponse.json({ data: priceData, cached: false });

  } catch (error) {
    console.error('❌ CoinGecko API Error:', error);

    // If we have stale cached data, return it
    if (cachedData.length > 0) {
      debugLog('⚠️ Returning stale cached data due to API error');
      return NextResponse.json({ 
        data: cachedData, 
        cached: true,
        stale: true,
        message: 'Using cached data - CoinGecko unavailable'
      });
    }

    // Otherwise, return mock data as fallback
    debugLog('🎭 Returning mock data - CoinGecko rate limited and no cache available');
    
    const nowSeconds = Math.floor(Date.now() / 1000);
    const mockData: PricePoint[] = Array.from({ length: days + 1 }, (_, i) => {
      // Generate realistic KLV price around $0.0045 with small variance
      const basePrice = 0.0045;
      const variance = (Math.random() * 0.0002) - 0.0001; // ±$0.0001
      const price = basePrice + variance;
      
      return {
        timestamp: nowSeconds - ((days - i) * 24 * 60 * 60),
        price: parseFloat(price.toFixed(6)),
      };
    });

    return NextResponse.json({ 
      data: mockData, 
      cached: false,
      mock: true,
      message: 'Using mock data - CoinGecko rate limited'
    });
  }
}