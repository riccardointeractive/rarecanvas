export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';

/**
 * Asset API - Fetches token metadata from Klever blockchain
 * 
 * Returns 200 even on errors (with null data) to prevent infinite retries
 * and console spam from TokenImage component.
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const assetId = searchParams.get('assetId');
  const network = searchParams.get('network') || 'mainnet';

  if (!assetId) {
    return NextResponse.json({ error: 'Asset ID is required', data: null }, { status: 400 });
  }

  try {
    // Use correct API based on network
    const baseUrl = network === 'testnet'
      ? 'https://api.testnet.klever.org'
      : 'https://api.mainnet.klever.org';
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout
    
    const response = await fetch(`${baseUrl}/v1.0/assets/${assetId}`, {
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      // Return 200 with null data instead of 500 to prevent retries
      return NextResponse.json({ 
        data: null, 
        error: `Asset not found or API error: ${response.status}` 
      });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    // Return 200 with null data to prevent infinite retries
    // This is intentional - we don't want TokenImage to keep retrying
    console.warn(`[Asset API] Failed to fetch ${assetId}:`, error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json({ 
      data: null, 
      error: 'Failed to fetch asset data' 
    });
  }
}
