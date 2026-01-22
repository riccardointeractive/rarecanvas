import { NextResponse } from 'next/server';
import { fetchAllTokenPrices, fetchTokenPrice, clearPriceCache } from '@/services/tokenPrices';

/**
 * Token Prices API - Powered by Centralized Price Service
 * 
 * GET /api/token-prices - Get all token prices
 * GET /api/token-prices?assetId=DGKO-CXVJ - Get specific token price
 * GET /api/token-prices?refresh=true - Force refresh (bypass cache)
 * GET /api/token-prices?network=testnet - Use testnet
 * 
 * PRICE CALCULATION:
 * - KLV price: From CoinGecko (external USD anchor)
 * - All other tokens: From DEX pool reserves × KLV price
 * 
 * @see /admin/tokens/prices for the admin dashboard
 * @see /src/services/tokenPrices.ts for the source of truth
 */

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const assetId = searchParams.get('assetId');
    const network = (searchParams.get('network') as 'mainnet' | 'testnet') || 'mainnet';
    const forceRefresh = searchParams.get('refresh') === 'true';

    // Force refresh if requested
    if (forceRefresh) {
      clearPriceCache();
    }

    // Get specific token price
    if (assetId) {
      const price = await fetchTokenPrice(assetId, network);

      if (!price || price.source === 'error') {
        return NextResponse.json(
          { 
            error: 'Token price not available',
            assetId,
            message: 'Token not found or no active trading pair'
          },
          { status: 404 }
        );
      }

      return NextResponse.json(price);
    }

    // Get all token prices
    const result = await fetchAllTokenPrices(network, forceRefresh);

    return NextResponse.json({
      klv: result.klv,
      tokens: result.tokens,
      count: result.tokens.length,
      network: result.network,
      lastUpdate: result.lastUpdate,
      // Legacy format for backward compatibility
      // Some old code expects { tokens: [...] } with all tokens including KLV
      all: [result.klv, ...result.tokens],
    });
  } catch (error) {
    console.error('Error in token prices API:', error);

    return NextResponse.json(
      {
        error: 'Failed to fetch token prices',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
