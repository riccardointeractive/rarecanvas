import { NextRequest, NextResponse } from 'next/server';
import { getRedis } from '@/lib/redis';
import { getTokenPrecision, getTokenSymbol } from '@/config/tokens';

const getPositionsKey = (network: string, address: string) => 
  `digiko:${network}:user:${address}:positions`;
const getLastSyncKey = (network: string, address: string) => 
  `digiko:${network}:user:${address}:positions:lastSync`;

const NETWORK_CONFIG: Record<string, { api: string; contract: string }> = {
  mainnet: {
    api: 'https://api.mainnet.klever.org',
    contract: 'klv1qqqqqqqqqqqqqpgq2jqc28xwmk82mng4kwpm3j9vkq3vyga8xw9qq85y6h',
  },
  testnet: {
    api: 'https://api.testnet.klever.org', 
    contract: 'klv1qqqqqqqqqqqqqpgq0r0lxxfrj645llpcvyp5553n52s5swzhxw9qh8fyzq',
  },
};

const BECH32_ALPHABET = 'qpzry9x8gf2tvdw0s3jn54khce6mua7l';

interface UserPosition {
  pairId: string;
  baseToken: string;
  quoteToken: string;
  baseAmount: number;
  quoteAmount: number;
  shares: string;
  pendingFeesBase: number;
  pendingFeesQuote: number;
  valueUSD: number;
}

function decodeBase64(b64: string): string {
  try {
    return Buffer.from(b64, 'base64').toString('utf8');
  } catch {
    return '';
  }
}

function decodeBase64ToNumber(b64: string): number {
  try {
    if (!b64) return 0;
    const bytes = Buffer.from(b64, 'base64');
    let num = 0;
    for (let i = 0; i < bytes.length; i++) {
      const byte = bytes[i];
      if (byte !== undefined) num = num * 256 + byte;
    }
    return num;
  } catch {
    return 0;
  }
}

function decodeBase64ToBool(b64: string): boolean {
  return decodeBase64ToNumber(b64) === 1;
}

function base64ToBigInt(b64: string): bigint {
  if (!b64) return BigInt(0);
  const bytes = Buffer.from(b64, 'base64');
  const hex = bytes.toString('hex');
  return hex ? BigInt('0x' + hex) : BigInt(0);
}

function numberToByteArray(value: number): number[] {
  if (value === 0) return [0];
  const hex = value.toString(16);
  const paddedHex = hex.length % 2 ? '0' + hex : hex;
  const bytes: number[] = [];
  for (let i = 0; i < paddedHex.length; i += 2) {
    bytes.push(parseInt(paddedHex.substr(i, 2), 16));
  }
  return bytes;
}

function kleverAddressToBytes(address: string): number[] {
  if (!address.startsWith('klv1')) {
    throw new Error('Invalid Klever address');
  }
  const data = address.slice(4).toLowerCase();
  const values: number[] = [];
  for (const char of data) {
    const value = BECH32_ALPHABET.indexOf(char);
    if (value === -1) throw new Error('Invalid bech32 character');
    values.push(value);
  }
  const dataValues = values.slice(0, -6);
  const bytes: number[] = [];
  let acc = 0;
  let bits = 0;
  for (const value of dataValues) {
    acc = (acc << 5) | value;
    bits += 5;
    while (bits >= 8) {
      bits -= 8;
      bytes.push((acc >> bits) & 0xff);
    }
  }
  while (bytes.length < 32) bytes.unshift(0);
  return bytes.slice(-32);
}

async function queryContract(
  funcName: string,
  args: number[][],
  apiUrl: string,
  contractAddress: string
): Promise<string[]> {
  const response = await fetch(`${apiUrl}/v1.0/sc/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      scAddress: contractAddress,
      funcName,
      arguments: args,
    }),
  });
  const data = await response.json();
  if (data.code !== 'successful' || data.data?.returnCode !== 'Ok') {
    throw new Error(data.error || `Query failed: ${funcName}`);
  }
  return data.data.returnData || [];
}

async function fetchUserPositions(
  address: string,
  network: string
): Promise<UserPosition[]> {
  const config = NETWORK_CONFIG[network] || NETWORK_CONFIG.mainnet;
  const api = config!.api;
  const contract = config!.contract;
  
  console.log(`[Positions] Fetching for ${address.slice(0, 12)}...`);
  
  const pairIdsData = await queryContract('getAllPairIds', [], api, contract);
  const pairIds: number[] = [];
  for (const b64 of pairIdsData) {
    const id = decodeBase64ToNumber(b64);
    if (id > 0) pairIds.push(id);
  }
  
  console.log(`[Positions] Found ${pairIds.length} pairs`);
  if (pairIds.length === 0) return [];
  
  const addressBytes = kleverAddressToBytes(address);
  
  // V5 contract only on testnet for now
  const isV5Contract = true; // Both networks are V5 now
  
  console.log(`[Positions] Fetching pairs in parallel... (V5: ${isV5Contract})`);
  
  const pairInfoPromises = pairIds.map(async (pairId) => {
    try {
      // V5 (testnet): getPairInfo with args | Old (mainnet): getPairInfoPairN
      const pairInfo = isV5Contract
        ? await queryContract('getPairInfo', [numberToByteArray(pairId)], api, contract)
        : await queryContract(`getPairInfoPair${pairId}`, [], api, contract);
      if (!pairInfo || pairInfo.length < 8) return null;
      const isActive = decodeBase64ToBool(pairInfo[7] || '');
      if (!isActive) return null;
      return { pairId, pairInfo };
    } catch {
      return null;
    }
  });
  
  const pairInfoResults = await Promise.all(pairInfoPromises);
  const activePairs = pairInfoResults.filter((p): p is { pairId: number; pairInfo: string[] } => p !== null);
  
  console.log(`[Positions] ${activePairs.length} active pairs`);
  
  const positionPromises = activePairs.map(async ({ pairId, pairInfo }) => {
    try {
      const pairIdBytes = numberToByteArray(pairId);
      const lpData = await queryContract('getLpPosition', [pairIdBytes, addressBytes], api, contract);
      if (!lpData || lpData.length < 3) return null;
      const shares = base64ToBigInt(lpData[0] || '');
      if (shares <= BigInt(0)) return null;
      
      const totalSharesData = await queryContract('getTotalShares', [pairIdBytes], api, contract);
      const tokenA = decodeBase64(pairInfo[0] || '');
      const tokenB = decodeBase64(pairInfo[1] || '');
      const tokenAIsKlv = decodeBase64ToBool(pairInfo[2] || '');
      const tokenBIsKlv = decodeBase64ToBool(pairInfo[3] || '');
      const reserveA = decodeBase64ToNumber(pairInfo[4] || '');
      const reserveB = decodeBase64ToNumber(pairInfo[5] || '');
      const pendingFeesA = base64ToBigInt(lpData[1] || '');
      const pendingFeesB = base64ToBigInt(lpData[2] || '');
      
      let totalShares = BigInt(0);
      if (totalSharesData && totalSharesData.length >= 2) {
        totalShares = base64ToBigInt(totalSharesData[0] || '') + base64ToBigInt(totalSharesData[1] || '');
      }
      
      const baseAssetId = tokenAIsKlv ? 'KLV' : tokenA;
      const quoteAssetId = tokenBIsKlv ? 'KLV' : tokenB;
      const basePrecision = getTokenPrecision(baseAssetId);
      const quotePrecision = getTokenPrecision(quoteAssetId);
      const baseSymbol = getTokenSymbol(baseAssetId);
      const quoteSymbol = getTokenSymbol(quoteAssetId);
      
      let baseAmount = 0;
      let quoteAmount = 0;
      if (totalShares > BigInt(0)) {
        baseAmount = Number((shares * BigInt(reserveA)) / totalShares) / basePrecision;
        quoteAmount = Number((shares * BigInt(reserveB)) / totalShares) / quotePrecision;
      }
      
      console.log(`[Positions] Found: pair-${pairId}`);
      
      return {
        pairId: `pair-${pairId}`,
        baseToken: baseSymbol,
        quoteToken: quoteSymbol,
        baseAmount,
        quoteAmount,
        shares: shares.toString(),
        pendingFeesBase: Number(pendingFeesA) / basePrecision,
        pendingFeesQuote: Number(pendingFeesB) / quotePrecision,
        valueUSD: 0,
      };
    } catch {
      return null;
    }
  });
  
  const results = await Promise.all(positionPromises);
  const positions = results.filter((p): p is UserPosition => p !== null);
  console.log(`[Positions] Total: ${positions.length}`);
  return positions;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get('address');
  const network = searchParams.get('network') || 'mainnet';
  const forceRefresh = searchParams.get('refresh') === 'true';
  
  if (!address || !address.startsWith('klv1')) {
    return NextResponse.json({ success: false, error: 'Valid address required' }, { status: 400 });
  }
  
  const redis = getRedis();
  
  if (!redis) {
    try {
      const positions = await fetchUserPositions(address, network);
      return NextResponse.json({ success: true, data: positions, source: 'blockchain' });
    } catch (err) {
      return NextResponse.json({ success: false, error: 'Failed to fetch', details: String(err) }, { status: 500 });
    }
  }
  
  const positionsKey = getPositionsKey(network, address);
  const lastSyncKey = getLastSyncKey(network, address);
  
  try {
    if (!forceRefresh) {
      const cached = await redis.get(positionsKey);
      if (cached) {
        const data = typeof cached === 'string' ? JSON.parse(cached) : cached;
        console.log(`[Positions] Cache hit: ${address.slice(0, 12)}`);
        
        const lastSync = await redis.get(lastSyncKey) as number | null;
        if (!lastSync || (Date.now() - lastSync > 5 * 60 * 1000)) {
          fetchUserPositions(address, network).then(async (pos) => {
            await redis.set(positionsKey, pos);
            await redis.set(lastSyncKey, Date.now());
          }).catch(console.error);
        }
        
        return NextResponse.json({ success: true, data, source: 'cache' });
      }
    }
    
    console.log(`[Positions] Cache miss: ${address.slice(0, 12)}`);
    const positions = await fetchUserPositions(address, network);
    await redis.setex(positionsKey, 300, positions as any);
    await redis.set(lastSyncKey, Date.now());
    
    return NextResponse.json({ success: true, data: positions, source: 'blockchain' });
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Failed to fetch', details: String(err) }, { status: 500 });
  }
}
