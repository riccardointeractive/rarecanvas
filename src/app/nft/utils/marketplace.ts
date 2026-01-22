/**
 * NFT Marketplace Transaction Utilities
 * 
 * Functions for buying, selling, and managing NFT marketplace orders
 * using the Klever SDK.
 * 
 * Transaction Types:
 * - Buy (17): Purchase NFT from marketplace
 * - Sell (18): List NFT for sale
 * - CancelMarketOrder (19): Cancel a listing
 * 
 * Network-aware: Works on both mainnet and testnet
 * 
 * IMPORTANT: Token precision comes from src/config/tokens.ts
 */

import { debugLog } from '@/utils/debugMode';
import { getTokenDecimals } from '@/config/tokens';

// Declare window type for Klever Extension
declare global {
  interface Window {
    kleverWeb?: {
      initialize: () => Promise<void>;
      getWalletAddress: () => Promise<string>;
      buildTransaction: (contracts: any[], metadata?: string[]) => Promise<any>;
      signTransaction: (tx: any) => Promise<any>;
      broadcastTransactions: (txs: any[]) => Promise<any>;
    };
  }
}

// =============================================================================
// Types
// =============================================================================

export type Network = 'mainnet' | 'testnet';

/**
 * Transaction types for Klever marketplace
 */
export enum MarketplaceTxType {
  Buy = 17,
  Sell = 18,
  CancelMarketOrder = 19,
  CreateMarketplace = 20,
  ConfigMarketplace = 21,
}

/**
 * Buy types
 */
export enum BuyType {
  ITOBuy = 0,
  MarketBuy = 1,
}

/**
 * Market types for selling
 */
export enum MarketType {
  InstantSell = 0,
  Auction = 1,
}

/**
 * Buy transaction payload
 */
export interface BuyPayload {
  buyType: BuyType;
  id: string;           // Order ID for MarketBuy
  currencyId: string;   // Currency to pay with (e.g., "KLV")
  amount: number;       // Price in smallest units (with precision)
}

/**
 * Sell transaction payload
 */
export interface SellPayload {
  marketType: MarketType;
  marketplaceId: string;
  assetId: string;      // NFT collection/nonce (e.g., "OMNI-QW86/46")
  currencyId: string;
  price?: number;       // For instant sell
  reservePrice?: number; // For auction
  endTime: number;      // Unix timestamp
}

/**
 * Cancel order payload
 */
export interface CancelOrderPayload {
  orderId: string;
}

/**
 * Transaction result
 */
export interface MarketplaceTxResult {
  success: boolean;
  txHash?: string;
  error?: string;
  explorerUrl?: string;
}

// =============================================================================
// Configuration
// =============================================================================

/**
 * Network-specific configuration
 */
const NETWORK_CONFIG = {
  mainnet: {
    apiUrl: 'https://api.mainnet.klever.org',
    nodeUrl: 'https://node.mainnet.klever.org',
    explorerUrl: 'https://kleverscan.org',
    defaultMarketplaceId: 'klv1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqpgm89z',
  },
  testnet: {
    apiUrl: 'https://api.testnet.klever.org',
    nodeUrl: 'https://node.testnet.klever.org',
    explorerUrl: 'https://testnet.kleverscan.org',
    defaultMarketplaceId: 'klv1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqpgm89z', // Update if different on testnet
  },
};

/**
 * Get network config
 */
export function getNetworkConfig(network: Network) {
  return NETWORK_CONFIG[network];
}

/**
 * Get precision (decimals) for a currency
 * Uses centralized config from src/config/tokens.ts
 */
export function getCurrencyPrecision(currencyId: string): number {
  return getTokenDecimals(currencyId);
}

/**
 * @deprecated Use getCurrencyPrecision() which uses centralized config
 * This is kept for backwards compatibility but now derives from tokens.ts
 */
export const CURRENCY_PRECISIONS: Record<string, number> = {
  // No longer hardcoded - use getCurrencyPrecision() instead
  KLV: 6,  // Kept for backwards compatibility, but function uses centralized config
};

/**
 * Convert amount to smallest units
 */
export function toSmallestUnits(amount: number, precision: number): number {
  return Math.floor(amount * Math.pow(10, precision));
}

/**
 * Convert from smallest units to display amount
 */
export function fromSmallestUnits(amount: number, precision: number): number {
  return amount / Math.pow(10, precision);
}

// =============================================================================
// Buy NFT
// =============================================================================

/**
 * Buy an NFT from the marketplace
 * 
 * @param orderId - The marketplace order ID
 * @param price - The price in display units (e.g., 100 KLV)
 * @param currencyId - The currency to pay with (default: "KLV")
 * @param network - Network to use (default: "mainnet")
 * @returns Transaction result
 */
export async function buyNFT(
  orderId: string,
  price: number,
  currencyId: string = 'KLV',
  network: Network = 'mainnet'
): Promise<MarketplaceTxResult> {
  const config = getNetworkConfig(network);
  debugLog(`[NFT Buy] Starting purchase on ${network}...`, { orderId, price, currencyId });
  
  // Check for Klever Extension
  if (!window.kleverWeb) {
    return {
      success: false,
      error: 'Klever Extension not found. Please install Klever Extension.',
    };
  }

  try {
    // Get currency precision
    const precision = getCurrencyPrecision(currencyId);
    const priceInSmallestUnits = toSmallestUnits(price, precision);
    
    debugLog('[NFT Buy] Price conversion:', {
      displayPrice: price,
      precision,
      smallestUnits: priceInSmallestUnits,
      network,
    });

    // Build Buy payload
    const payload: BuyPayload = {
      buyType: BuyType.MarketBuy,
      id: orderId,
      currencyId: currencyId,
      amount: priceInSmallestUnits,
    };

    debugLog('[NFT Buy] Payload:', payload);

    // Build transaction
    const unsignedTx = await window.kleverWeb.buildTransaction(
      [
        {
          type: MarketplaceTxType.Buy,
          payload,
        },
      ]
    );

    debugLog('[NFT Buy] Transaction built:', unsignedTx);

    // Sign transaction
    const signedTx = await window.kleverWeb.signTransaction(unsignedTx);
    debugLog('[NFT Buy] Transaction signed');

    // Broadcast transaction
    const response = await window.kleverWeb.broadcastTransactions([signedTx]);
    debugLog('[NFT Buy] Broadcast response:', response);

    // Check response
    if (response?.data?.txsHashes && response.data.txsHashes.length > 0) {
      const txHash = response.data.txsHashes[0];
      const explorerUrl = `${config.explorerUrl}/transaction/${txHash}`;
      debugLog(`[NFT Buy] Success! TX Hash: ${txHash}`);
      debugLog(`[NFT Buy] Explorer: ${explorerUrl}`);
      
      return {
        success: true,
        txHash,
        explorerUrl,
      };
    }

    // Handle error in response
    if (response?.error) {
      return {
        success: false,
        error: response.error,
      };
    }

    return {
      success: false,
      error: 'Transaction failed - no hash returned',
    };

  } catch (error) {
    console.error('[NFT Buy] Error:', error);
    
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Transaction failed';
    
    // Parse common errors
    if (errorMessage.includes('rejected') || errorMessage.includes('denied')) {
      return {
        success: false,
        error: 'Transaction was rejected by user',
      };
    }
    
    if (errorMessage.includes('insufficient')) {
      return {
        success: false,
        error: 'Insufficient balance to complete purchase',
      };
    }

    return {
      success: false,
      error: errorMessage,
    };
  }
}

// =============================================================================
// Sell NFT (List for sale)
// =============================================================================

/**
 * List an NFT for sale on the marketplace
 * 
 * @param assetId - The NFT asset ID (collection/nonce format)
 * @param price - The price in display units
 * @param currencyId - The currency to accept (default: "KLV")
 * @param durationDays - How long to list (default: 30 days)
 * @param network - Network to use (default: "mainnet")
 * @param marketplaceId - The marketplace to list on (optional)
 * @returns Transaction result
 */
export async function sellNFT(
  assetId: string,
  price: number,
  currencyId: string = 'KLV',
  durationDays: number = 30,
  network: Network = 'mainnet',
  marketplaceId?: string
): Promise<MarketplaceTxResult> {
  const config = getNetworkConfig(network);
  const mpId = marketplaceId || config.defaultMarketplaceId;
  
  debugLog(`[NFT Sell] Starting listing on ${network}...`, { assetId, price, currencyId, durationDays });
  
  // Check for Klever Extension
  if (!window.kleverWeb) {
    return {
      success: false,
      error: 'Klever Extension not found. Please install Klever Extension.',
    };
  }

  try {
    // Get currency precision
    const precision = getCurrencyPrecision(currencyId);
    const priceInSmallestUnits = toSmallestUnits(price, precision);
    
    // Calculate end time (current time + duration)
    const endTime = Math.floor(Date.now() / 1000) + (durationDays * 24 * 60 * 60);
    
    debugLog('[NFT Sell] Price/Time conversion:', {
      displayPrice: price,
      smallestUnits: priceInSmallestUnits,
      endTime,
      endTimeDate: new Date(endTime * 1000).toISOString(),
      network,
    });

    // Build Sell payload
    const payload: SellPayload = {
      marketType: MarketType.InstantSell,
      marketplaceId: mpId,
      assetId: assetId,
      currencyId: currencyId,
      price: priceInSmallestUnits,
      endTime: endTime,
    };

    debugLog('[NFT Sell] Payload:', payload);

    // Build transaction
    const unsignedTx = await window.kleverWeb.buildTransaction(
      [
        {
          type: MarketplaceTxType.Sell,
          payload,
        },
      ]
    );

    debugLog('[NFT Sell] Transaction built:', unsignedTx);

    // Sign transaction
    const signedTx = await window.kleverWeb.signTransaction(unsignedTx);
    debugLog('[NFT Sell] Transaction signed');

    // Broadcast transaction
    const response = await window.kleverWeb.broadcastTransactions([signedTx]);
    debugLog('[NFT Sell] Broadcast response:', response);

    // Check response
    if (response?.data?.txsHashes && response.data.txsHashes.length > 0) {
      const txHash = response.data.txsHashes[0];
      const explorerUrl = `${config.explorerUrl}/transaction/${txHash}`;
      debugLog(`[NFT Sell] Success! TX Hash: ${txHash}`);
      
      return {
        success: true,
        txHash,
        explorerUrl,
      };
    }

    // Handle error in response
    if (response?.error) {
      return {
        success: false,
        error: response.error,
      };
    }

    return {
      success: false,
      error: 'Transaction failed - no hash returned',
    };

  } catch (error) {
    console.error('[NFT Sell] Error:', error);
    
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Transaction failed';

    return {
      success: false,
      error: errorMessage,
    };
  }
}

// =============================================================================
// Cancel Listing
// =============================================================================

/**
 * Cancel an NFT listing
 * 
 * @param orderId - The marketplace order ID to cancel
 * @param network - Network to use (default: "mainnet")
 * @returns Transaction result
 */
export async function cancelNFTListing(
  orderId: string,
  network: Network = 'mainnet'
): Promise<MarketplaceTxResult> {
  const config = getNetworkConfig(network);
  debugLog(`[NFT Cancel] Cancelling listing on ${network}...`, { orderId });
  
  // Check for Klever Extension
  if (!window.kleverWeb) {
    return {
      success: false,
      error: 'Klever Extension not found. Please install Klever Extension.',
    };
  }

  try {
    // Build Cancel payload
    const payload: CancelOrderPayload = {
      orderId: orderId,
    };

    debugLog('[NFT Cancel] Payload:', payload);

    // Build transaction
    const unsignedTx = await window.kleverWeb.buildTransaction(
      [
        {
          type: MarketplaceTxType.CancelMarketOrder,
          payload,
        },
      ]
    );

    debugLog('[NFT Cancel] Transaction built:', unsignedTx);

    // Sign transaction
    const signedTx = await window.kleverWeb.signTransaction(unsignedTx);
    debugLog('[NFT Cancel] Transaction signed');

    // Broadcast transaction
    const response = await window.kleverWeb.broadcastTransactions([signedTx]);
    debugLog('[NFT Cancel] Broadcast response:', response);

    // Check response
    if (response?.data?.txsHashes && response.data.txsHashes.length > 0) {
      const txHash = response.data.txsHashes[0];
      const explorerUrl = `${config.explorerUrl}/transaction/${txHash}`;
      debugLog(`[NFT Cancel] Success! TX Hash: ${txHash}`);
      
      return {
        success: true,
        txHash,
        explorerUrl,
      };
    }

    // Handle error in response
    if (response?.error) {
      return {
        success: false,
        error: response.error,
      };
    }

    return {
      success: false,
      error: 'Transaction failed - no hash returned',
    };

  } catch (error) {
    console.error('[NFT Cancel] Error:', error);
    
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Transaction failed';

    return {
      success: false,
      error: errorMessage,
    };
  }
}

// =============================================================================
// Utility: Get Explorer Links
// =============================================================================

/**
 * Get KleverScan link for a transaction
 */
export function getExplorerTxLink(txHash: string, network: Network = 'mainnet'): string {
  const config = getNetworkConfig(network);
  return `${config.explorerUrl}/transaction/${txHash}`;
}

/**
 * Get KleverScan link for an NFT
 */
export function getExplorerNFTLink(
  collectionId: string, 
  nonce: number, 
  network: Network = 'mainnet'
): string {
  const config = getNetworkConfig(network);
  return `${config.explorerUrl}/asset/${collectionId}/${nonce}`;
}

/**
 * Get KleverScan link for a collection
 */
export function getExplorerCollectionLink(
  collectionId: string, 
  network: Network = 'mainnet'
): string {
  const config = getNetworkConfig(network);
  return `${config.explorerUrl}/asset/${collectionId}`;
}
