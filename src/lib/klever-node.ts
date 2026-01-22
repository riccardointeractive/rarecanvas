/**
 * Klever Backend Utilities
 * Server-side utilities for building smart contract transactions using Node SDK
 * 
 * NETWORK AWARE: All functions accept network parameter ('mainnet' | 'testnet')
 * 
 * BREAKTHROUGH DISCOVERY (Dec 1, 2025): KLV CAN BE SENT VIA CALLVALUE!
 * Verified from SAME DEX transaction: c62dbd2922bc1cad3f38729e6092151730fc40fbdb5d62e8767e84571b4740de
 * 
 * KLV is treated as a KDA token in smart contracts:
 * - TokenIdentifier::from("KLV") in Rust contract code
 * - Sent via callValue just like any other KDA token
 * - Works with call_value().single_kda() in contracts
 * 
 * SDK TRANSFORMATION:
 * SDK input (map): { "KLV": 100000000 } or { "DGKO-CXVJ": 450000 }
 * Blockchain format (array): [{ asset: "KLV", value: 100000000, kdaRoyalties: 0, klvRoyalties: 0 }]
 */

import { debugLog } from '@/utils/debugMode';
import { Account, TransactionType, utils } from '@klever/sdk-node';

// Type for smart contract payload
interface SmartContractPayload {
  scType: number;
  address: string;
  callValue: Array<{
    asset: string;
    value: number;
    kdaRoyalties: number;
    klvRoyalties: number;
  }>;
}

// Network type
type Network = 'mainnet' | 'testnet';

// Network-specific configuration
const NETWORK_CONFIG: Record<Network, {
  api: string;
  node: string;
  contracts: { DEX: string };
  tokens: Record<string, { assetId: string; decimals: number }>;
}> = {
  mainnet: {
    api: 'https://api.mainnet.klever.org',
    node: 'https://node.mainnet.klever.org',
    contracts: {
      DEX: 'klv1qqqqqqqqqqqqqpgq2jqc28xwmk82mng4kwpm3j9vkq3vyga8xw9qq85y6h',
    },
    tokens: {
      KLV: { assetId: 'KLV', decimals: 6 },
      DGKO: { assetId: 'DGKO-CXVJ', decimals: 4 },
      BABYDGKO: { assetId: 'BABYDGKO-3S67', decimals: 8 },
    },
  },
  testnet: {
    api: 'https://api.testnet.klever.org',
    node: 'https://node.testnet.klever.org',
    contracts: {
      DEX: 'klv1qqqqqqqqqqqqqpgq0r0lxxfrj645llpcvyp5553n52s5swzhxw9qh8fyzq',
    },
    tokens: {
      KLV: { assetId: 'KLV', decimals: 6 },
      DGKO: { assetId: 'DGKO-2E9J', decimals: 4 },
      BABYDGKO: { assetId: 'BABYDGKO-VIXW', decimals: 8 },
    },
  },
};

/**
 * Get network config
 */
export function getNetworkConfig(network: Network) {
  return NETWORK_CONFIG[network];
}

/**
 * Set SDK providers for a specific network
 */
export function setNetworkProviders(network: Network) {
  const config = NETWORK_CONFIG[network];
  utils.setProviders({
    api: config.api,
    node: config.node,
  });
}

// Default to mainnet for backwards compatibility
setNetworkProviders('mainnet');

/**
 * Build unsigned smart contract transaction with CORRECT payment structure
 * 
 * VERIFIED: KLV works the same as any KDA token!
 * Both directions use callValue with asset identifier:
 * - Token → KLV: callValue = { "TOKEN-XXXX": amount }
 * - KLV → Token: callValue = { "KLV": amount }
 */
export async function buildSmartContractInvokeTx(params: {
  senderAddress: string;
  functionName: string;
  amount: number;
  assetId: string;
  nonce: number;
  contractAddress?: string;
  network?: Network;
}) {
  const {
    senderAddress,
    functionName,
    amount,
    assetId,
    nonce,
    network = 'mainnet',
  } = params;

  // Set providers for the correct network
  setNetworkProviders(network);
  
  // Use provided contract address or get from network config
  const contractAddress = params.contractAddress || NETWORK_CONFIG[network].contracts.DEX;

  try {
    debugLog(`🔧 [${network}] Building SmartContract call with payment (callValue)...`);
    debugLog('Function:', functionName);
    debugLog('Amount:', amount);
    debugLog('Asset:', assetId);
    debugLog('Contract:', contractAddress);
    debugLog('Nonce:', nonce);
    debugLog('Sender:', senderAddress);

    // Encode function name as base64 for metadata
    const metadata = Buffer.from(functionName).toString('base64');
    
    debugLog('📦 Function metadata (base64):', metadata);
    debugLog('💰 Payment: callValue={ ' + assetId + ': ' + amount + ' } (map format)');

    // Create temporary account for building transaction
    const tempAccount = new Account();
    
    // Wait for account to be ready
    debugLog('⏳ Waiting for account to be ready...');
    await tempAccount.ready;
    debugLog('✅ Account ready');

    // Build the unsigned transaction with callValue
    debugLog('🔨 Building SmartContract transaction with callValue...');
    
    const payload: SmartContractPayload = {
      scType: 0, // Invoke
      address: contractAddress,
      callValue: [
        {
          asset: assetId,
          value: amount,
          kdaRoyalties: 0,
          klvRoyalties: 0,
        }
      ],
    };
    
    debugLog('💰 Payment: callValue ARRAY = [{ asset: ' + assetId + ', value: ' + amount + ' }]');
    debugLog('📋 FULL PAYLOAD:', JSON.stringify(payload, null, 2));
    
    try {
      debugLog('🔨 Calling tempAccount.buildTransaction NOW...');
      const unsignedTx = await tempAccount.buildTransaction(
        [
          {
            type: TransactionType.SmartContract,
            payload,
          },
        ],
        [metadata],
        {
          nonce: nonce,
          sender: senderAddress,
        }
      );
      debugLog('✅ buildTransaction returned successfully!');

      return {
        success: true,
        unsignedTx,
        nonce,
      };
    } catch (buildError: unknown) {
      const errorMessage = buildError instanceof Error ? buildError.message : String(buildError);
      const errorStack = buildError instanceof Error ? buildError.stack : undefined;
      console.error('❌ buildTransaction threw an error:');
      console.error('Error:', buildError);
      console.error('Error message:', errorMessage);
      console.error('Error stack:', errorStack);
      
      return {
        success: false,
        error: errorMessage || 'Unknown build error',
      };
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    console.error('❌ Error in buildSmartContractInvokeTx (outer catch):');
    console.error('Error:', error);
    console.error('Error message:', errorMessage);
    console.error('Error stack:', errorStack);
    return {
      success: false,
      error: errorMessage || 'Failed to build transaction',
    };
  }
}

/**
 * Build swap transaction with proper encoding
 * Wrapper for convenience - NOW NETWORK AWARE
 * 
 * @param params.fromToken - Internal token symbol: 'DGKO' | 'BABYDGKO' | 'KLV'
 * @param params.toToken - Internal token symbol: 'DGKO' | 'BABYDGKO' | 'KLV'
 * @param params.network - 'mainnet' | 'testnet' (defaults to mainnet)
 */
export async function buildSwapTransaction(params: {
  senderAddress: string;
  fromToken: 'DGKO' | 'BABYDGKO' | 'KLV';
  toToken: 'DGKO' | 'BABYDGKO' | 'KLV';
  amountIn: number;
  network?: Network;
}) {
  const { senderAddress, fromToken, amountIn, network = 'mainnet' } = params;
  const config = NETWORK_CONFIG[network];

  // Get nonce
  const nonce = await getAccountNonce(senderAddress, network);

  // Determine function name based on swap direction
  // These are the actual contract function names
  const functionName = fromToken === 'KLV' ? 'swapKlvToA' : 'swapAtoB';
  
  // Get the correct asset ID for the current network
  const assetId = config.tokens[fromToken]?.assetId || fromToken;

  return buildSmartContractInvokeTx({
    senderAddress,
    functionName,
    amount: amountIn,
    assetId,
    nonce,
    contractAddress: config.contracts.DEX,
    network,
  });
}

/**
 * Get account nonce from Klever API - NETWORK AWARE
 */
export async function getAccountNonce(address: string, network: Network = 'mainnet'): Promise<number> {
  const config = NETWORK_CONFIG[network];
  
  try {
    const response = await fetch(
      `${config.api}/v1.0/address/${address}`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch account info');
    }

    const data = await response.json();
    return data.data?.account?.nonce || 0;
  } catch (error) {
    console.error(`[${network}] Error fetching account nonce:`, error);
    return 0;
  }
}

/**
 * Broadcast a signed transaction - NETWORK AWARE
 */
export async function broadcastTransaction(signedTx: string, network: Network = 'mainnet') {
  const config = NETWORK_CONFIG[network];
  
  try {
    const response = await fetch(
      `${config.node}/transaction/broadcast`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tx: signedTx }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Broadcast failed');
    }

    const result = await response.json();
    return {
      success: true,
      txHash: result.data?.hash || result.hash,
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[${network}] Error broadcasting transaction:`, error);
    return {
      success: false,
      error: errorMessage || 'Failed to broadcast transaction',
    };
  }
}
