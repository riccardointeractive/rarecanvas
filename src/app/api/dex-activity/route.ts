/**
 * DEX Activity API
 * 
 * GET /api/dex-activity
 * 
 * Returns recent swaps, pair creations, and liquidity additions from the DEX contract.
 * Used by telegram notifications.
 * 
 * CRITICAL FIX: Uses data field to decode function name for accurate detection!
 * This is the ONLY reliable way to distinguish swaps from liquidity additions.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getNetworkConfig } from '@/config/network';
import { getTokenDecimals } from '@/config/tokens';

// ============================================================================
// Types
// ============================================================================

interface KleverTransaction {
  hash: string;
  timestamp: number;
  sender: string;
  status: string;
  data?: string[];  // Function call data - THIS IS THE KEY!
  contract?: Array<{
    type: number;
    typeString: string;
    parameter: Record<string, unknown>;
  }>;
  receipts?: Array<{
    type: number;
    typeString: string;
    assetId?: string;
    value?: string | number;
    from?: string;
    to?: string;
  }>;
}

export interface DexActivity {
  type: 'swap' | 'pair_created' | 'liquidity_added';
  txHash: string;
  timestamp: number;
  sender: string;
  // For swap
  inputToken?: string;
  outputToken?: string;
  inputAmount?: number;
  outputAmount?: number;
  // For pair_created
  tokenA?: string;
  tokenB?: string;
  pairId?: number;
  // For liquidity_added (V2: dual token support)
  token?: string;           // Combined: "DGKO-CXVJ + KLV"
  amount?: number;          // Legacy: primary token amount
  amountRaw?: string;       // Legacy: raw amounts
  tokenAId?: string;        // First token ID
  tokenBId?: string;        // Second token ID  
  amountA?: number;         // First token amount (human readable)
  amountB?: number;         // Second token amount (human readable)
  // Debug
  functionName?: string;
}

// ============================================================================
// Function Name Mapping
// ============================================================================

// Smart contract endpoint names (from lib.rs)
const SWAP_FUNCTIONS = [
  'swapAtoB',
  'swapBtoA', 
  'swapKlvToB',
  'swapKlvToA',
];

const LIQUIDITY_FUNCTIONS = [
  'mint',
  'depositPendingA',
  'depositPendingAKlv',
  'depositPendingB', 
  'depositPendingBKlv',
  'finalizeLiquidity',
];

const PAIR_CREATION_FUNCTIONS = [
  'createPair',
];

// ============================================================================
// Helpers
// ============================================================================

function getApiBaseUrl(network: 'mainnet' | 'testnet'): string {
  return network === 'testnet'
    ? 'https://api.testnet.klever.org'
    : 'https://api.mainnet.klever.org';
}

function getDexContractAddress(network: 'mainnet' | 'testnet'): string {
  return getNetworkConfig(network).contracts.DEX;
}

function parseAmount(rawAmount: string | number | undefined, assetId: string): number {
  if (!rawAmount) return 0;
  const symbol = assetId.split('-')[0] || assetId;
  const decimals = getTokenDecimals(symbol);
  const precision = Math.pow(10, decimals);
  const numAmount = typeof rawAmount === 'string' ? parseInt(rawAmount, 10) : rawAmount;
  return numAmount / precision;
}

/**
 * Decode the function name from transaction data field
 * Format: hexEncode(functionName@arg1@arg2...)
 * Example: "73776170416e42406f31" -> "swapAtoB@01"
 */
function decodeFunctionName(dataHex: string): string | null {
  try {
    // Convert hex to ASCII
    let decoded = '';
    for (let i = 0; i < dataHex.length; i += 2) {
      const byte = parseInt(dataHex.substring(i, i + 2), 16);
      if (isNaN(byte)) continue;
      decoded += String.fromCharCode(byte);
    }
    
    // Function name is before the first @ (if any)
    const atIndex = decoded.indexOf('@');
    const functionName = atIndex >= 0 ? decoded.substring(0, atIndex) : decoded;
    
    // Validate it looks like a function name (alphanumeric, starts with letter)
    if (/^[a-zA-Z][a-zA-Z0-9]*$/.test(functionName)) {
      return functionName;
    }
    
    return null;
  } catch {
    return null;
  }
}

// ============================================================================
// Transaction Analysis
// ============================================================================

function analyzeTransaction(tx: KleverTransaction, dexAddress: string): DexActivity | null {
  try {
    const contracts = tx.contract || [];
    const receipts = tx.receipts || [];
    
    // Find SmartContract invocation
    const scContract = contracts.find(c => 
      c.typeString === 'SmartContractType' || c.type === 17
    );
    
    if (!scContract) return null;
    
    const params = scContract.parameter as Record<string, unknown>;
    const toAddress = params.address as string | undefined;
    
    // Must be calling our DEX contract
    if (toAddress !== dexAddress) return null;
    
    // CRITICAL: Decode function name from data field
    const dataArr = tx.data || [];
    const dataHex = dataArr[0] || '';
    const functionName = decodeFunctionName(dataHex);
    
    // === PAIR CREATION ===
    if (functionName && PAIR_CREATION_FUNCTIONS.includes(functionName)) {
      // Try to get tokens from callValue first (sent to create pair)
      const callValue = params.callValue as Array<{ asset?: string; assetId?: string }> | undefined;
      let tokenA: string | undefined;
      let tokenB: string | undefined;
      
      if (callValue && callValue.length > 0) {
        tokenA = callValue[0]?.asset || callValue[0]?.assetId;
        tokenB = callValue[1]?.asset || callValue[1]?.assetId;
      }
      
      // If no tokens in callValue, extract from data args
      // Format: createPair@hexTokenA@hexTokenB@...
      if (!tokenA && dataHex) {
        try {
          // First decode the outer hex to get: createPair@hexArg1@hexArg2@...
          let decoded = '';
          for (let i = 0; i < dataHex.length; i += 2) {
            const byte = parseInt(dataHex.substring(i, i + 2), 16);
            if (!isNaN(byte)) decoded += String.fromCharCode(byte);
          }
          
          // Split by @
          const parts = decoded.split('@');
          // parts[0] = "createPair"
          // parts[1] = hex-encoded tokenA (e.g., "4b504550452d314954" = "KPEPE-1IT4")
          // parts[2] = hex-encoded tokenB (e.g., "4b4c56" = "KLV")
          
          if (parts.length >= 2 && parts[1]) {
            // Decode the hex-encoded tokenA
            let tokenADecoded = '';
            for (let i = 0; i < parts[1].length; i += 2) {
              const byte = parseInt(parts[1].substring(i, i + 2), 16);
              if (!isNaN(byte)) tokenADecoded += String.fromCharCode(byte);
            }
            if (tokenADecoded) tokenA = tokenADecoded;
          }
          
          if (parts.length >= 3 && parts[2]) {
            // Decode the hex-encoded tokenB
            let tokenBDecoded = '';
            for (let i = 0; i < parts[2].length; i += 2) {
              const byte = parseInt(parts[2].substring(i, i + 2), 16);
              if (!isNaN(byte)) tokenBDecoded += String.fromCharCode(byte);
            }
            if (tokenBDecoded) tokenB = tokenBDecoded;
          }
        } catch {
          // Ignore parse errors
        }
      }
      
      return {
        type: 'pair_created',
        txHash: tx.hash,
        timestamp: tx.timestamp,
        sender: tx.sender,
        tokenA: tokenA || 'Unknown',
        tokenB: tokenB || 'KLV',
        functionName,
      };
    }
    
    // === SWAP ===
    if (functionName && SWAP_FUNCTIONS.includes(functionName)) {
      // Input: from callValue (what user sent)
      const callValue = params.callValue as Array<{ asset?: string; assetId?: string; value?: number }> | undefined;
      const klvValue = (params.klvValue ?? params.value) as number | undefined;
      
      let inputToken = 'KLV';
      let inputAmountRaw = klvValue || 0;
      
      if (callValue && callValue.length > 0 && callValue[0]) {
        const cv = callValue[0];
        inputToken = cv.asset || cv.assetId || 'KLV';
        inputAmountRaw = cv.value || 0;
      }
      
      // Output: from receipts (transfer FROM contract TO sender)
      const outputReceipt = receipts.find(r => 
        r.typeString === 'Transfer' && 
        r.from === dexAddress && 
        r.to === tx.sender
      );
      
      const outputToken = outputReceipt?.assetId || '???';
      const outputAmountRaw = outputReceipt?.value;
      
      return {
        type: 'swap',
        txHash: tx.hash,
        timestamp: tx.timestamp,
        sender: tx.sender,
        inputToken,
        outputToken,
        inputAmount: parseAmount(inputAmountRaw, inputToken),
        outputAmount: parseAmount(outputAmountRaw, outputToken),
        functionName,
      };
    }
    
    // === LIQUIDITY ADDITION ===
    if (functionName && LIQUIDITY_FUNCTIONS.includes(functionName)) {
      // Get deposited tokens
      const callValue = params.callValue as Array<{ asset?: string; assetId?: string; value?: number }> | undefined;
      const klvValue = (params.klvValue ?? params.value) as number | undefined;
      
      const tokens: { token: string; amount: number; raw: number }[] = [];
      
      // KDA tokens from callValue
      if (callValue) {
        for (const cv of callValue) {
          const assetId = cv.asset || cv.assetId;
          if (assetId && cv.value) {
            tokens.push({
              token: assetId,
              amount: parseAmount(cv.value, assetId),
              raw: cv.value,
            });
          }
        }
      }
      
      // Native KLV from klvValue
      if (klvValue && klvValue > 0) {
        tokens.push({
          token: 'KLV',
          amount: parseAmount(klvValue, 'KLV'),
          raw: klvValue,
        });
      }
      
      // Return combined info with both token amounts
      const primaryToken = tokens[0];
      if (!primaryToken) return null;
      
      return {
        type: 'liquidity_added',
        txHash: tx.hash,
        timestamp: tx.timestamp,
        sender: tx.sender,
        token: tokens.map(t => t.token).join(' + '),
        amount: primaryToken.amount, // Primary token amount only (for backward compat)
        amountRaw: tokens.map(t => String(t.raw)).join(','),
        // V2: Individual token amounts
        tokenAId: tokens[0]?.token,
        tokenBId: tokens[1]?.token,
        amountA: tokens[0]?.amount || 0,
        amountB: tokens[1]?.amount || 0,
        functionName,
      };
    }
    
    // Unknown function - skip
    return null;
  } catch (error) {
    console.error('[DexActivity] Error analyzing tx:', tx.hash, error);
    return null;
  }
}

// ============================================================================
// Main Handler
// ============================================================================

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const network = (url.searchParams.get('network') || 'mainnet') as 'mainnet' | 'testnet';
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '100'), 200);
  const debug = url.searchParams.get('debug') === 'true';
  const typeFilter = url.searchParams.get('type'); // 'swap' | 'pair_created' | 'liquidity_added'
  
  try {
    const apiBaseUrl = getApiBaseUrl(network);
    const dexAddress = getDexContractAddress(network);
    
    // Fetch transactions using address endpoint (gets SmartContract calls)
    const response = await fetch(
      `${apiBaseUrl}/v1.0/address/${dexAddress}/transactions?limit=${limit}`,
      { 
        cache: 'no-store',
        headers: {
          'Accept': 'application/json',
        },
      }
    );
    
    if (!response.ok) {
      console.error('[DexActivity] API error:', response.status);
      return NextResponse.json({
        success: false,
        error: `Klever API returned ${response.status}`,
      }, { status: 502 });
    }
    
    const data = await response.json();
    const transactions: KleverTransaction[] = data.data?.transactions || [];
    
    // Analyze transactions
    const activities: DexActivity[] = [];
    const debugInfo: { hash: string; result: string; functionName?: string | null }[] = [];
    
    for (const tx of transactions) {
      // Skip failed transactions
      if (tx.status !== 'success') {
        if (debug) debugInfo.push({ 
          hash: tx.hash.slice(0, 12), 
          result: 'failed',
        });
        continue;
      }
      
      const activity = analyzeTransaction(tx, dexAddress);
      
      if (activity) {
        // Apply type filter if specified
        if (!typeFilter || activity.type === typeFilter) {
          activities.push(activity);
        }
        if (debug) debugInfo.push({ 
          hash: tx.hash.slice(0, 12), 
          result: activity.type,
          functionName: activity.functionName,
        });
      } else {
        if (debug) {
          // Extract function name for skipped txs too
          const dataHex = tx.data?.[0] || '';
          const fn = decodeFunctionName(dataHex);
          debugInfo.push({ 
            hash: tx.hash.slice(0, 12), 
            result: 'skipped',
            functionName: fn,
          });
        }
      }
    }
    
    return NextResponse.json({
      success: true,
      network,
      count: activities.length,
      data: activities,
      debug: debug ? {
        totalTxs: transactions.length,
        dexAddress,
        analyzed: debugInfo.slice(0, 50),
        // Show a sample transaction with its decoded function name
        sampleTx: transactions[0] ? {
          hash: transactions[0].hash,
          dataHex: transactions[0].data?.[0]?.substring(0, 40),
          decodedFunction: decodeFunctionName(transactions[0].data?.[0] || ''),
          sender: transactions[0].sender,
          status: transactions[0].status,
        } : null,
      } : undefined,
    });
    
  } catch (error) {
    console.error('[DexActivity] Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal error',
      message: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
