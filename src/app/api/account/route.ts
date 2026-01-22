export const dynamic = 'force-dynamic';
import { debugLog } from '@/utils/debugMode';

import { NextRequest, NextResponse } from 'next/server';

// Simple in-memory cache for account data
const accountCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 15000; // 15 seconds cache on server

// Track rate limit state
let rateLimitUntil = 0;

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const address = searchParams.get('address');
  const network = searchParams.get('network') || 'mainnet';

  if (!address) {
    return NextResponse.json({ error: 'Address is required' }, { status: 400 });
  }

  // Validate address format (basic check)
  if (!address.startsWith('klv1') || address.length < 40) {
    return NextResponse.json({ error: 'Invalid Klever address format' }, { status: 400 });
  }

  const cacheKey = `${address}-${network}`;
  
  // Check cache first
  const cached = accountCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    debugLog(`📦 Cache hit for ${address} on ${network}`);
    return NextResponse.json(cached.data);
  }

  // Check if we're in rate limit cooldown
  if (Date.now() < rateLimitUntil) {
    debugLog(`⏳ Rate limit cooldown active, using cached data`);
    if (cached) {
      return NextResponse.json(cached.data);
    }
    // Return empty account if no cache
    return NextResponse.json({
      data: {
        account: {
          address,
          balance: 0,
          nonce: 0,
          assets: {},
        }
      }
    });
  }

  // Determine API URL based on network
  const apiBaseUrl = network === 'testnet' 
    ? 'https://api.testnet.klever.org'
    : 'https://api.mainnet.klever.org';

  try {
    debugLog(`📡 Fetching account data for: ${address} on ${network}`);
    
    const response = await fetch(`${apiBaseUrl}/v1.0/address/${address}`, {
      headers: {
        'Accept': 'application/json',
      },
      // Add timeout
      signal: AbortSignal.timeout(10000),
    });
    
    // Handle rate limiting
    if (response.status === 429) {
      console.warn(`⚠️ Rate limited by Klever API (429)`);
      // Set cooldown for 30 seconds
      rateLimitUntil = Date.now() + 30000;
      
      // Return cached data if available
      if (cached) {
        return NextResponse.json(cached.data);
      }
      
      // Return empty account
      return NextResponse.json({
        data: {
          account: {
            address,
            balance: 0,
            nonce: 0,
            assets: {},
          }
        }
      });
    }
    
    // Handle various response statuses
    if (response.status === 404) {
      // Account doesn't exist yet on chain - return empty account
      debugLog(`ℹ️ Account ${address} not found on ${network} - returning empty account`);
      const emptyData = {
        data: {
          account: {
            address,
            balance: 0,
            nonce: 0,
            assets: {},
          }
        }
      };
      // Cache the empty result too
      accountCache.set(cacheKey, { data: emptyData, timestamp: Date.now() });
      return NextResponse.json(emptyData);
    }
    
    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      console.error(`❌ Klever API error (${response.status}):`, errorText);
      return NextResponse.json(
        { error: `Klever API error: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Handle case where API returns success but no account data
    if (!data?.data?.account) {
      debugLog(`ℹ️ Account ${address} has no data on ${network} - returning empty account`);
      const emptyData = {
        data: {
          account: {
            address,
            balance: 0,
            nonce: 0,
            assets: {},
          }
        }
      };
      accountCache.set(cacheKey, { data: emptyData, timestamp: Date.now() });
      return NextResponse.json(emptyData);
    }
    
    // Cache successful response
    accountCache.set(cacheKey, { data, timestamp: Date.now() });
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('❌ Error in account API route:', error);
    
    // Handle timeout specifically
    if (error instanceof Error && error.name === 'TimeoutError') {
      // Use cache if available
      if (cached) {
        return NextResponse.json(cached.data);
      }
      return NextResponse.json(
        { error: 'Request timeout - Klever API slow' },
        { status: 504 }
      );
    }
    
    if (error instanceof Error) {
      console.error('Error details:', error.message);
    }
    
    // Return cached data on any error if available
    if (cached) {
      debugLog('📦 Returning cached data after error');
      return NextResponse.json(cached.data);
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch account data' },
      { status: 500 }
    );
  }
}
