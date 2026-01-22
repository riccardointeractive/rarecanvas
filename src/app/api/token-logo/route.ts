export const dynamic = 'force-dynamic';
import { debugLog } from '@/utils/debugMode';

import { NextRequest, NextResponse } from 'next/server';
import { getTokenByAssetId } from '@/config/tokens';
import { readFile } from 'fs/promises';
import { join } from 'path';

/**
 * Token Logo API - Fetches and proxies token logos from Klever API
 * 
 * Usage: /api/token-logo?assetId=DGKO-CXVJ
 * 
 * This route:
 * 1. Checks for local fallback in tokens.ts config
 * 2. If no local, fetches from Klever API
 * 3. Proxies the image to avoid CORS issues for canvas
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const assetId = searchParams.get('assetId');
  const network = searchParams.get('network') || 'mainnet';

  if (!assetId) {
    return NextResponse.json({ error: 'assetId parameter required' }, { status: 400 });
  }

  try {
    // Step 1: Check for local fallback in tokens.ts
    const tokenConfig = getTokenByAssetId(assetId);
    if (tokenConfig?.logo) {
      debugLog(`[token-logo] Using local fallback for ${assetId}: ${tokenConfig.logo}`);
      
      // Read local file from public folder
      const filePath = join(process.cwd(), 'public', tokenConfig.logo);
      try {
        const buffer = await readFile(filePath);
        const ext = tokenConfig.logo.split('.').pop()?.toLowerCase();
        const contentType = ext === 'svg' ? 'image/svg+xml' : 
                           ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : 
                           'image/png';
        
        return new NextResponse(buffer, {
          headers: {
            'Content-Type': contentType,
            'Cache-Control': 'public, max-age=86400',
            'Access-Control-Allow-Origin': '*',
          },
        });
      } catch (_fileError) {
        console.error(`[token-logo] Local file not found: ${filePath}`);
        // Fall through to API fetch
      }
    }

    // Step 2: Get token metadata from Klever API
    const apiUrl = network === 'testnet'
      ? 'https://api.testnet.klever.org'
      : 'https://api.mainnet.klever.org';
    
    const metaResponse = await fetch(`${apiUrl}/v1.0/assets/${assetId}`, {
      headers: {
        'Accept': 'application/json',
      },
    });
    
    if (!metaResponse.ok) {
      console.error(`[token-logo] Failed to fetch asset metadata for ${assetId}: ${metaResponse.status}`);
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
    }

    const metaData = await metaResponse.json();
    const logoUrl = metaData.data?.asset?.logo;

    if (!logoUrl) {
      debugLog(`[token-logo] No logo URL for ${assetId}`);
      return NextResponse.json({ error: 'No logo available' }, { status: 404 });
    }

    debugLog(`[token-logo] Fetching logo for ${assetId} from: ${logoUrl}`);

    // Step 3: Fetch the actual image with better headers
    const imageResponse = await fetch(logoUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://kleverscan.org/',
      },
      redirect: 'follow',
    });

    if (!imageResponse.ok) {
      console.error(`[token-logo] Failed to fetch logo image for ${assetId} from ${logoUrl}: ${imageResponse.status} ${imageResponse.statusText}`);
      return NextResponse.json({ error: 'Failed to fetch logo image' }, { status: 500 });
    }

    // Step 4: Return the image with proper headers
    const contentType = imageResponse.headers.get('content-type') || 'image/png';
    const arrayBuffer = await imageResponse.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    debugLog(`[token-logo] Successfully fetched logo for ${assetId} (${buffer.length} bytes, ${contentType})`);

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error(`[token-logo] Error fetching logo for ${assetId}:`, error);
    return NextResponse.json({ error: 'Failed to fetch token logo' }, { status: 500 });
  }
}
