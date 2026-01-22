/**
 * Marketplace API Proxy Route
 * 
 * Proxies requests to Klever marketplace API to avoid CORS issues.
 * 
 * Endpoints:
 * - GET /api/marketplace?action=orders - Get active NFT orders
 * - GET /api/marketplace?action=list - Get all marketplaces
 * - GET /api/marketplace?action=nft&assetId=X&nonce=Y - Get NFT metadata
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const action = searchParams.get('action') || 'orders';
  const network = searchParams.get('network') || 'mainnet';

  const baseUrl = network === 'testnet'
    ? 'https://api.testnet.klever.org'
    : 'https://api.mainnet.klever.org';

  try {
    let apiUrl: string;
    
    switch (action) {
      case 'orders': {
        // Build query params for orders
        const params = new URLSearchParams();
        
        // Pass through relevant query params
        const active = searchParams.get('active');
        const status = searchParams.get('status');
        const collection = searchParams.get('collection');
        const sortBy = searchParams.get('sortBy');
        const orderBy = searchParams.get('orderBy');
        const page = searchParams.get('page');
        const limit = searchParams.get('limit');
        const marketplaceId = searchParams.get('id');
        
        if (active) params.set('active', active);
        if (status) params.set('status', status);
        if (collection) params.set('collection', collection);
        if (sortBy) params.set('sortBy', sortBy);
        if (orderBy) params.set('orderBy', orderBy);
        if (page) params.set('page', page);
        if (limit) params.set('limit', limit);
        if (marketplaceId) params.set('id', marketplaceId);
        
        apiUrl = `${baseUrl}/v1.0/marketplaces/orders/list?${params}`;
        break;
      }
      
      case 'list': {
        // List all marketplaces
        const page = searchParams.get('page') || '1';
        const limit = searchParams.get('limit') || '50';
        apiUrl = `${baseUrl}/v1.0/marketplaces/list?page=${page}&limit=${limit}`;
        break;
      }
      
      case 'nft': {
        // Get specific NFT metadata
        const assetId = searchParams.get('assetId');
        const nonce = searchParams.get('nonce');
        
        if (!assetId || !nonce) {
          return NextResponse.json(
            { error: 'assetId and nonce are required for NFT action' },
            { status: 400 }
          );
        }
        
        // Try SFT endpoint first (most common for Klever NFTs)
        const sftUrl = `${baseUrl}/v1.0/assets/sft/${assetId}/${nonce}`;
        
        try {
          const resp = await fetch(sftUrl, {
            headers: { 'Accept': 'application/json' },
          });
          
          if (resp.ok) {
            const data = await resp.json();
            const asset = data?.data?.asset || data?.data || data;
            
            // If we have logo or URIs, we have image data
            if (asset?.logo || asset?.uris?.length > 0) {
              return NextResponse.json(data);
            }
          }
        } catch {
          // Fall through to collection endpoint
        }
        
        // Fallback to collection endpoint (gets collection logo at least)
        const collectionUrl = `${baseUrl}/v1.0/assets/${assetId}`;
        
        try {
          const resp = await fetch(collectionUrl, {
            headers: { 'Accept': 'application/json' },
          });
          
          if (resp.ok) {
            return NextResponse.json(await resp.json());
          }
        } catch {
          // Return empty
        }
        
        return NextResponse.json({ data: { asset: null } });
      }
      
      case 'activity': {
        // NFT activity history
        const params = new URLSearchParams();
        const nftId = searchParams.get('nftId');
        const contractType = searchParams.get('contractType');
        const sort = searchParams.get('sort');
        const page = searchParams.get('page');
        const limit = searchParams.get('limit');
        
        if (nftId) params.set('nftId', nftId);
        if (contractType) params.set('contractType', contractType);
        if (sort) params.set('sort', sort);
        if (page) params.set('page', page);
        if (limit) params.set('limit', limit);
        
        apiUrl = `${baseUrl}/v1.0/marketplaces/nfts/activity?${params}`;
        break;
      }
      
      case 'marketplace': {
        // Get specific marketplace
        const id = searchParams.get('id');
        if (!id) {
          return NextResponse.json(
            { error: 'Marketplace ID is required' },
            { status: 400 }
          );
        }

        const params = new URLSearchParams();
        const collection = searchParams.get('collection');
        const page = searchParams.get('page');
        const limit = searchParams.get('limit');
        const sort = searchParams.get('sort');

        if (collection) params.set('collection', collection);
        if (page) params.set('page', page);
        if (limit) params.set('limit', limit);
        if (sort) params.set('sort', sort);

        apiUrl = `${baseUrl}/v1.0/marketplaces/${id}?${params}`;
        break;
      }

      case 'transactions': {
        // Get marketplace transactions (Buy=17, Sell=18, Cancel=19)
        const params = new URLSearchParams();
        const type = searchParams.get('type'); // 17, 18, or 19
        const page = searchParams.get('page') || '1';
        const limit = searchParams.get('limit') || '20';
        const status = searchParams.get('status') || 'success';
        const fromAddress = searchParams.get('fromAddress');
        const toAddress = searchParams.get('toAddress');
        const orderId = searchParams.get('orderId');

        params.set('page', page);
        params.set('limit', limit);
        params.set('status', status);
        if (type) params.set('type', type);
        if (fromAddress) params.set('fromAddress', fromAddress);
        if (toAddress) params.set('toAddress', toAddress);
        if (orderId) params.set('orderid', orderId);

        apiUrl = `${baseUrl}/v1.0/transaction/list?${params}`;
        break;
      }

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }

    const response = await fetch(apiUrl, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      // Return empty data for 404 (no orders found)
      if (response.status === 404) {
        if (action === 'orders') {
          return NextResponse.json({ data: { orders: [] }, pagination: null });
        }
      }
      
      throw new Error(`Klever API responded with status: ${response.status}`);
    }

    const data = await response.json();
    
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('[Marketplace API] Error:', error);
    
    // Return empty data on error to prevent UI breaking
    if (action === 'orders') {
      return NextResponse.json({ 
        data: { orders: [] }, 
        pagination: null,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch data' },
      { status: 500 }
    );
  }
}
