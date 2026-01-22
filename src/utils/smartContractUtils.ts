/**
 * Smart Contract Utilities for Digiko DEX
 * 
 * Provides robust utilities for interacting with Klever smart contracts
 * following the patterns from Klever Smart Contracts Guide.
 * 
 * Key Learnings:
 * - Native KLV uses klv_value() in contract
 * - KDA tokens (DGKO) use single_kda() in contract
 * - Both work with proper transaction building
 */

import { debugLog, debugWarn } from './debugMode';
import { web } from '@klever/sdk-web';
import { getTokenPrecision, getAssetId as getTokenAssetId } from '@/config/tokens';

// Contract configuration - V2
export const DEX_CONTRACT = {
  address: 'klv1qqqqqqqqqqqqqpgq2jqc28xwmk82mng4kwpm3j9vkq3vyga8xw9qq85y6h',
  functions: {
    // V2 Swap functions (all take pair_id)
    SWAP_A_TO_B: 'swapAtoB',       // Send KDA token A, get token B
    SWAP_B_TO_A: 'swapBtoA',       // Send KDA token B, get token A
    SWAP_KLV_TO_B: 'swapKlvToB',   // Send KLV (when A is KLV), get token B
    SWAP_KLV_TO_A: 'swapKlvToA',   // Send KLV (when B is KLV), get token A
    // Legacy names for backward compatibility
    SWAP_DGKO_TO_KLV: 'swapAtoB',  // DGKO → KLV (DGKO is token A)
    SWAP_KLV_TO_DGKO: 'swapKlvToA', // KLV → DGKO (KLV is token B)
    // View functions (V5: these take pair_id as argument)
    GET_RESERVES: 'getReserves',
    GET_PAIR_INFO: 'getPairInfo',
  },
} as const;

// Default pair ID for DGKO/KLV
export const DEFAULT_PAIR_ID = 1;

/**
 * Token configuration - uses centralized config from @/config/tokens
 * @deprecated Use getTokenPrecision() and getAssetId() from @/config/tokens directly
 */
export const TOKENS = {
  KLV: {
    id: 'KLV',
    precision: getTokenPrecision('KLV'),
    isNative: true,
  },
  DGKO: {
    id: getTokenAssetId('DGKO', 'mainnet'),
    precision: getTokenPrecision('DGKO'),
    isNative: false,
  },
} as const;

/**
 * Transaction types for Klever
 */
export enum TxType {
  SmartContract = 63,
}

/**
 * Smart contract types
 */
export enum ScType {
  Invoke = 0,
  Deploy = 1,
  Upgrade = 3,
}

/**
 * Build a smart contract invocation transaction (V2)
 * 
 * This follows the correct pattern for Klever smart contracts:
 * - For KLV: Payment goes in callValue (contract uses klv_value())
 * - For KDA tokens: Payment goes in callValue (contract uses single_kda())
 * - Function name + args encoded as base64 metadata
 * 
 * @param functionName - The contract function to call
 * @param assetId - Asset ID ('KLV' or 'DGKO-CXVJ')
 * @param amount - Amount in smallest units (with precision already applied)
 * @param pairId - Optional pair ID for V2 functions (default: 1 for DGKO/KLV)
 * @param estimateFee - If true, also returns estimated fee
 * @returns Promise<{tx: any, estimatedFee?: number}> - Unsigned transaction and optional fee
 */
export async function buildSmartContractTransaction(
  functionName: string,
  assetId: string,
  amount: number,
  pairId: number = DEFAULT_PAIR_ID,
  estimateFee: boolean = false
): Promise<{ tx: any; estimatedFee?: number }> {
  // Validate inputs
  if (!functionName || typeof functionName !== 'string') {
    throw new Error('Invalid function name');
  }
  
  if (!assetId || typeof assetId !== 'string') {
    throw new Error('Invalid asset ID');
  }
  
  if (!amount || amount <= 0) {
    throw new Error('Amount must be greater than 0');
  }
  
  // Ensure amount is an integer (no decimals in blockchain units)
  const amountInUnits = Math.floor(amount);
  
  debugLog('🔧 Building smart contract transaction...');
  debugLog('  Contract:', DEX_CONTRACT.address);
  debugLog('  Function:', functionName);
  debugLog('  Asset:', assetId);
  debugLog('  Amount:', amountInUnits);
  
  // Check for Klever Extension
  if (!window.kleverWeb) {
    throw new Error('Klever Extension not found. Please install Klever Extension to use swap functionality.');
  }
  
  // CRITICAL: Check if wallet is connected
  // This ensures Extension knows this is a Digiko transaction
  if (!web.isKleverWebActive()) {
    throw new Error('Wallet not connected. Please connect your wallet first to perform transactions.');
  }
  
  debugLog('✅ Wallet connected - Extension will brand this as Digiko transaction');
  
  // Build payload for SmartContract invoke
  // CRITICAL: callValue uses MAP format with asset ID as key
  const payload = {
    scType: ScType.Invoke,
    address: DEX_CONTRACT.address,
    callValue: {
      [assetId]: amountInUnits,
    },
  };
  
  // V2: Encode function name + pair_id as base64 metadata
  // Format: base64(functionName@hexPairId)
  // Example: swapAtoB@01 becomes base64 encoded
  const pairIdHex = pairId.toString(16).padStart(2, '0');
  const metadataString = `${functionName}@${pairIdHex}`;
  const metadata = Buffer.from(metadataString).toString('base64');
  
  debugLog('📦 Transaction Payload:', JSON.stringify(payload, null, 2));
  debugLog('📦 Metadata string:', metadataString);
  debugLog('📦 Metadata (base64):', metadata);
  debugLog('📦 Pair ID:', pairId);
  
  try {
    // Build transaction using Klever Extension
    // This creates an unsigned transaction that will be signed by the user's wallet
    debugLog('🔨 Building transaction with Klever Extension...');
    
    const unsignedTx = await window.kleverWeb.buildTransaction(
      [
        {
          type: TxType.SmartContract,
          payload,
        },
      ],
      [metadata] // Function name as metadata
    );
    
    debugLog('✅ Transaction built successfully');
    debugLog('📋 Unsigned TX structure:', unsignedTx);
    
    // Optionally estimate fee using the built transaction
    let estimatedFee: number | undefined;
    if (estimateFee) {
      try {
        debugLog('💰 Estimating fee with Klever Node Server...');
        
        const feeResponse = await fetch('https://node.mainnet.klever.finance/transaction/estimate-fee', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(unsignedTx),
        });
        
        if (feeResponse.ok) {
          const feeData = await feeResponse.json();
          // Fee is in smallest units (6 decimals)
          estimatedFee = feeData.data?.fee ? Number(feeData.data.fee) / 1000000 : undefined;
          debugLog('✅ Estimated fee from Klever:', estimatedFee, 'KLV');
        }
      } catch (feeError) {
        debugWarn('⚠️ Could not estimate fee:', feeError);
        // Continue without fee estimation
      }
    }
    
    return { tx: unsignedTx, estimatedFee };
  } catch (error: any) {
    // Klever Extension might throw non-standard error objects
    const errorMessage = error?.message || error?.error || JSON.stringify(error) || 'Unknown error';
    console.error('❌ Failed to build transaction:', errorMessage);
    console.error('❌ Full error object:', error);
    throw new Error(`Failed to build transaction: ${errorMessage}`);
  }
}

/**
 * Sign a transaction with the user's wallet
 * 
 * @param unsignedTx - Unsigned transaction from buildSmartContractTransaction
 * @returns Promise<any> - Signed transaction ready for broadcast
 */
export async function signTransaction(unsignedTx: any): Promise<any> {
  debugLog('✍️ Signing transaction with Klever Extension...');
  
  try {
    // Use the SDK's signTransaction method
    // This will prompt the user to approve the transaction in their wallet
    const signedTx = await web.signTransaction(unsignedTx);
    
    debugLog('✅ Transaction signed successfully');
    debugLog('📋 Signed TX:', signedTx);
    
    return signedTx;
  } catch (error: any) {
    const errorMessage = error?.message || error?.error || JSON.stringify(error) || 'Unknown error';
    console.error('❌ Signing failed:', errorMessage);
    console.error('❌ Full error object:', error);
    
    // Provide helpful error messages
    if (errorMessage?.includes('User rejected') || errorMessage?.includes('denied')) {
      throw new Error('Transaction was rejected by user');
    }
    
    throw new Error(`Failed to sign transaction: ${errorMessage}`);
  }
}

/**
 * Broadcast a signed transaction to the blockchain
 * 
 * @param signedTx - Signed transaction from signTransaction
 * @returns Promise<string> - Transaction hash
 */
export async function broadcastTransaction(signedTx: any): Promise<string> {
  debugLog('📡 Broadcasting transaction to blockchain...');
  
  try {
    const response = await web.broadcastTransactions([signedTx]);
    
    debugLog('📡 Broadcast response:', response);
    
    // Validate response
    if (!response || !response.data || !response.data.txsHashes || response.data.txsHashes.length === 0) {
      throw new Error('No transaction hash returned from broadcast');
    }
    
    const txHash = response.data.txsHashes[0];
    
    if (!txHash) {
      throw new Error('No transaction hash returned from broadcast');
    }
    
    debugLog('✅ Transaction broadcast successful!');
    debugLog('🔗 Transaction hash:', txHash);
    
    return txHash;
  } catch (error: any) {
    const errorMessage = error?.message || error?.error || JSON.stringify(error) || 'Unknown error';
    console.error('❌ Broadcast failed:', errorMessage);
    console.error('❌ Full error object:', error);
    throw new Error(`Failed to broadcast transaction: ${errorMessage}`);
  }
}

/**
 * Execute a complete swap transaction (V2)
 * 
 * This is a convenience function that combines build, sign, and broadcast
 * into a single operation.
 * 
 * V2: Uses pair_id based functions (swapAtoB, swapKlvToA, etc.)
 * 
 * @param functionName - Contract function to call (can be legacy name)
 * @param assetId - Asset ID to send
 * @param amount - Amount to send (in smallest units)
 * @returns Promise<string> - Transaction hash
 */
export async function executeSwapTransaction(
  _functionName: string,
  assetId: string,
  amount: number
): Promise<string> {
  try {
    // V2: Map to correct function based on asset
    // For DGKO/KLV pair: DGKO is token A, KLV is token B
    const isKlvInput = assetId === 'KLV';
    const v2FunctionName = isKlvInput 
      ? DEX_CONTRACT.functions.SWAP_KLV_TO_A  // KLV → DGKO
      : DEX_CONTRACT.functions.SWAP_A_TO_B;   // DGKO → KLV
    
    debugLog('🔄 V2 Swap: Using function', v2FunctionName, 'for pair', DEFAULT_PAIR_ID);
    
    // Step 1: Build unsigned transaction with pair_id
    const { tx: unsignedTx } = await buildSmartContractTransaction(
      v2FunctionName, 
      assetId, 
      amount, 
      DEFAULT_PAIR_ID
    );
    
    // Step 2: Sign with user's wallet
    const signedTx = await signTransaction(unsignedTx);
    
    // Step 3: Broadcast to blockchain
    const txHash = await broadcastTransaction(signedTx);
    
    return txHash;
  } catch (error: any) {
    const errorMessage = error?.message || error?.error || JSON.stringify(error) || 'Unknown error';
    console.error('❌ Swap transaction failed:', errorMessage);
    console.error('❌ Full error object:', error);
    throw error;
  }
}

/**
 * Query a smart contract view function
 * 
 * Uses the Klever Node Server API for precise, real-time data.
 * 
 * @param funcName - View function name
 * @param args - Optional arguments (encoded as hex strings)
 * @returns Promise<any> - Response from contract
 */
export async function queryContract(
  funcName: string,
  args: string[] = []
): Promise<any> {
  debugLog('🔍 Querying contract view function...');
  debugLog('  Function:', funcName);
  debugLog('  Arguments:', args);
  
  try {
    // Use Proxy API for smart contract queries
    // See: RULE 53 - Proxy API for indexed data, Node Server for real-time
    // Endpoint: POST https://api.mainnet.klever.org/v1.0/sc/query
    const response = await fetch('https://api.mainnet.klever.org/v1.0/sc/query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        scAddress: DEX_CONTRACT.address,
        funcName,
        arguments: args,  // CRITICAL: Must use 'arguments' NOT 'args' in request body
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Query failed with status ${response.status}`);
    }
    
    const data = await response.json();
    
    debugLog('✅ Query successful:', data);
    
    return data;
  } catch (error: any) {
    console.error('❌ Contract query failed:', error);
    throw new Error(`Failed to query contract: ${error.message || 'Unknown error'}`);
  }
}

/**
 * Get contract reserves (DGKO and KLV)
 * 
 * Uses Klever Proxy API /sc/query endpoint to call view functions.
 * V2: Uses getReservesPair1() - parameter-less function
 * 
 * @returns Promise<{dgkoReserve: number, klvReserve: number}>
 */
export async function getContractReserves(): Promise<{
  dgkoReserve: number;
  klvReserve: number;
}> {
  try {
    debugLog('🔍 Fetching contract reserves (V2)...');
    
    // V2: Use getReservesPair1() - NO PARAMETERS needed
    const response = await fetch('https://api.mainnet.klever.org/v1.0/sc/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        scAddress: DEX_CONTRACT.address,
        funcName: 'getReservesPair1',
        arguments: [],  // CRITICAL: Must use 'arguments' NOT 'args'
      }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to query contract');
    }
    
    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error);
    }
    
    debugLog('📊 Query response:', data);
    
    // V2: Returns [reserve_a, reserve_b]
    const returnData = data.data?.returnData || [];
    const reserveABase64 = returnData[0] || '';
    const reserveBBase64 = returnData[1] || '';
    
    // Decode base64 to hex (browser-compatible)
    const decodeBase64 = (b64: string): string => {
      if (!b64) return '';
      const bytes = atob(b64);
      return Array.from(bytes).map(c => c.charCodeAt(0).toString(16).padStart(2, '0')).join('');
    };
    
    const reserveAHex = decodeBase64(reserveABase64);
    const reserveBHex = decodeBase64(reserveBBase64);
    
    debugLog('🔢 Hex values:', { reserveAHex, reserveBHex });
    
    // For DGKO/KLV pair: A = DGKO (4 decimals), B = KLV (6 decimals)
    const dgkoReserve = parseInt(reserveAHex || '0', 16) / TOKENS.DGKO.precision;
    const klvReserve = parseInt(reserveBHex || '0', 16) / TOKENS.KLV.precision;
    
    debugLog('📊 V2 Contract reserves:');
    debugLog('  DGKO:', dgkoReserve);
    debugLog('  KLV:', klvReserve);
    
    return { dgkoReserve, klvReserve };
  } catch (error: any) {
    console.error('❌ Failed to get reserves:', error);
    throw error;
  }
}

/**
 * Estimate fee for a swap without building the transaction
 * 
 * This is faster and can be used for showing quotes before the user commits.
 * Uses average observed fees as estimation.
 * 
 * @param functionName - Contract function
 * @param assetId - Asset being swapped
 * @param amount - Amount in smallest units
 * @returns Promise<number> - Estimated fee in KLV
 */
export async function estimateSwapFee(
  _functionName: string,
  _assetId: string,
  _amount: number
): Promise<number> {
  try {
    // For better UX, we could build and estimate in the background
    // but for now, use observed average
    
    // Smart contract calls on Klever typically cost 5-10 KLV
    // User reported 6 KLV, so use that as the estimate
    const averageFee = 6;
    
    debugLog('💰 Estimated fee (average):', averageFee, 'KLV');
    
    return averageFee;
  } catch (error) {
    console.error('Failed to estimate fee:', error);
    return 6; // Fallback
  }
}

/**
 * Validate transaction parameters before building
 * 
 * @param functionName - Function name
 * @param assetId - Asset ID
 * @param amount - Amount in display units (e.g., 10.5 DGKO)
 * @param direction - Swap direction
 * @returns Object with validation result and formatted amount
 */
export function validateSwapParams(
  functionName: string,
  assetId: string,
  amount: number,
  direction: 'DGKO_TO_KLV' | 'KLV_TO_DGKO'
): {
  valid: boolean;
  error?: string;
  amountInUnits?: number;
} {
  // Validate function name matches direction
  const expectedFunction = direction === 'DGKO_TO_KLV' 
    ? DEX_CONTRACT.functions.SWAP_DGKO_TO_KLV 
    : DEX_CONTRACT.functions.SWAP_KLV_TO_DGKO;
  
  if (functionName !== expectedFunction) {
    return {
      valid: false,
      error: `Function name mismatch. Expected ${expectedFunction}, got ${functionName}`,
    };
  }
  
  // Validate asset ID matches direction
  const expectedAsset = direction === 'DGKO_TO_KLV' ? TOKENS.DGKO.id : TOKENS.KLV.id;
  
  if (assetId !== expectedAsset) {
    return {
      valid: false,
      error: `Asset ID mismatch. Expected ${expectedAsset}, got ${assetId}`,
    };
  }
  
  // Validate amount
  if (!amount || amount <= 0) {
    return {
      valid: false,
      error: 'Amount must be greater than 0',
    };
  }
  
  // Calculate amount in units with proper precision
  const precision = direction === 'DGKO_TO_KLV' ? TOKENS.DGKO.precision : TOKENS.KLV.precision;
  const amountInUnits = Math.floor(amount * precision);
  
  if (amountInUnits <= 0) {
    return {
      valid: false,
      error: 'Amount too small (rounds to 0 in blockchain units)',
    };
  }
  
  return {
    valid: true,
    amountInUnits,
  };
}

/**
 * Format transaction error for user display
 * 
 * @param error - Error from transaction execution
 * @returns User-friendly error message
 */
export function formatTransactionError(error: any): string {
  const errorMsg = error?.message || error?.toString() || 'Unknown error';
  
  // Map common errors to user-friendly messages
  if (errorMsg.includes('User rejected')) {
    return 'Transaction was cancelled by user';
  }
  
  if (errorMsg.includes('insufficient balance')) {
    return 'Insufficient balance for this transaction';
  }
  
  if (errorMsg.includes('Klever Extension not found')) {
    return 'Klever Extension not found. Please install it to use swap functionality.';
  }
  
  if (errorMsg.includes('incorrect number of KDA transfers')) {
    return 'Transaction format error. Please try again or contact support.';
  }
  
  if (errorMsg.includes('Failed to build transaction')) {
    return 'Failed to create transaction. Please try again.';
  }
  
  if (errorMsg.includes('Failed to sign transaction')) {
    return 'Failed to sign transaction. Please check your wallet and try again.';
  }
  
  if (errorMsg.includes('Failed to broadcast transaction')) {
    return 'Failed to send transaction to blockchain. Please try again.';
  }
  
  // Return original error if no mapping found
  return `Transaction failed: ${errorMsg}`;
}