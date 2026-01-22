export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const address = searchParams.get('address');
  const network = searchParams.get('network') || 'mainnet';

  if (!address) {
    return NextResponse.json({ error: 'Address is required' }, { status: 400 });
  }

  // Determine API URL based on network
  const apiBaseUrl = network === 'testnet' 
    ? 'https://api.testnet.klever.org'
    : 'https://api.mainnet.klever.org';

  try {
    const response = await fetch(`${apiBaseUrl}/v1.0/address/${address}/assets`);
    
    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Balance API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch balance' },
      { status: 500 }
    );
  }
}
