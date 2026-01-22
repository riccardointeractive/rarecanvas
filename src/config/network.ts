/**
 * Network Configuration
 * 
 * Centralized configuration for testnet/mainnet remapping.
 * - Token IDs differ between networks (DGKO doesn't exist on testnet)
 * - Contract addresses differ between networks
 * - API endpoints differ between networks
 * 
 * Usage:
 *   import { getNetworkConfig, getTokenId, getContractAddress } from '@/config/network';
 *   const config = getNetworkConfig('testnet');
 *   const dgkoId = getTokenId('DGKO', 'testnet'); // Returns testnet equivalent
 */

import { Network } from '@/types/klever';
import { TOKEN_REGISTRY } from '@/config/tokens';

// Re-export Network type for convenience
export type { Network } from '@/types/klever';

// ============================================================================
// Network-Specific Token Mapping
// Built from TOKEN_REGISTRY (single source of truth - RULE 51)
// ============================================================================

/**
 * Token configuration per network
 * 
 * On TESTNET: We remap DGKO/BABYDGKO to existing testnet tokens for testing
 * On MAINNET: We use the real DGKO/BABYDGKO tokens
 * 
 * Uses TOKEN_REGISTRY from tokens.ts as the single source of truth.
 */

// Get token configs with non-null assertion (these tokens are guaranteed to exist)
const KLV = TOKEN_REGISTRY.KLV!;
const DGKO = TOKEN_REGISTRY.DGKO!;
const BABYDGKO = TOKEN_REGISTRY.BABYDGKO!;

export const TOKEN_CONFIG = {
  mainnet: {
    KLV: {
      assetId: KLV.assetIdMainnet,
      symbol: KLV.symbol,
      name: KLV.name,
      decimals: KLV.decimals,
      isNative: KLV.isNative,
    },
    DGKO: {
      assetId: DGKO.assetIdMainnet,
      symbol: DGKO.symbol,
      name: DGKO.name,
      decimals: DGKO.decimals,
      isNative: DGKO.isNative,
    },
    BABYDGKO: {
      assetId: BABYDGKO.assetIdMainnet,
      symbol: BABYDGKO.symbol,
      name: BABYDGKO.name,
      decimals: BABYDGKO.decimals,
      isNative: BABYDGKO.isNative,
    },
  },
  testnet: {
    KLV: {
      assetId: KLV.assetIdTestnet,
      symbol: KLV.symbol,
      name: `${KLV.name} (Testnet)`,
      decimals: KLV.decimals,
      isNative: KLV.isNative,
    },
    DGKO: {
      assetId: DGKO.assetIdTestnet,
      symbol: DGKO.symbol,
      name: `${DGKO.name} (Testnet)`,
      decimals: DGKO.decimals,
      isNative: DGKO.isNative,
    },
    BABYDGKO: {
      assetId: BABYDGKO.assetIdTestnet,
      symbol: BABYDGKO.symbol,
      name: `${BABYDGKO.name} (Testnet)`,
      decimals: BABYDGKO.decimals,
      isNative: BABYDGKO.isNative,
    },
  },
} as const;

// ============================================================================
// Network-Specific Contract Addresses
// ============================================================================

/**
 * Smart contract addresses per network
 * 
 * Deploy your DEX contract to testnet and add the address here.
 * This allows testing the full swap flow without risking mainnet funds.
 */
export const CONTRACT_CONFIG = {
  mainnet: {
    DEX: 'klv1qqqqqqqqqqqqqpgq2jqc28xwmk82mng4kwpm3j9vkq3vyga8xw9qq85y6h',
    CTR_KART: '', // TODO: Deploy and add mainnet address
    // Add more contracts as needed:
    // STAKING: 'klv1...',
    // NFT: 'klv1...',
  },
  testnet: {
    DEX: 'klv1qqqqqqqqqqqqqpgq0r0lxxfrj645llpcvyp5553n52s5swzhxw9qh8fyzq',
    CTR_KART: 'klv1qqqqqqqqqqqqqpgq7ntugnh608f8x5x7p907754pcmts80u0xw9q0tspr5',
    // STAKING: '',
    // NFT: '',
  },
} as const;

// ============================================================================
// API Endpoints
// ============================================================================

export const API_CONFIG = {
  mainnet: {
    api: 'https://api.mainnet.klever.org',
    node: 'https://node.mainnet.klever.org',
    explorer: 'https://kleverscan.org',
  },
  testnet: {
    api: 'https://api.testnet.klever.org',
    node: 'https://node.testnet.klever.org',
    explorer: 'https://testnet.kleverscan.org',
  },
} as const;

// ============================================================================
// Helper Functions
// ============================================================================

export type TokenSymbol = 'KLV' | 'DGKO' | 'BABYDGKO';
export type ContractName = keyof typeof CONTRACT_CONFIG.mainnet;

/**
 * Get full network configuration
 */
export function getNetworkConfig(network: Network) {
  return {
    tokens: TOKEN_CONFIG[network],
    contracts: CONTRACT_CONFIG[network],
    api: API_CONFIG[network],
    isTestnet: network === 'testnet',
    isMainnet: network === 'mainnet',
  };
}

/**
 * Get token ID for a symbol on a specific network
 * 
 * @example
 * getTokenId('DGKO', 'mainnet') // 'DGKO-CXVJ'
 * getTokenId('DGKO', 'testnet') // 'KFI-FJ6M' (or whatever testnet token)
 */
export function getTokenId(symbol: TokenSymbol, network: Network): string {
  return TOKEN_CONFIG[network][symbol].assetId;
}

/**
 * Get full token config for a symbol on a specific network
 */
export function getTokenConfig(symbol: TokenSymbol, network: Network) {
  return TOKEN_CONFIG[network][symbol];
}

/**
 * Get token symbol from asset ID (reverse lookup)
 * Useful when you have an asset ID and need to know which token it represents
 */
export function getTokenSymbol(assetId: string, network: Network): TokenSymbol | null {
  const tokens = TOKEN_CONFIG[network];
  for (const [symbol, config] of Object.entries(tokens)) {
    if (config.assetId === assetId) {
      return symbol as TokenSymbol;
    }
  }
  return null;
}

/**
 * Get contract address by name for a specific network
 * 
 * @example
 * getContractAddress('DEX', 'mainnet') // 'klv1qqqqq...'
 * getContractAddress('DEX', 'testnet') // testnet DEX address
 */
export function getContractAddress(name: ContractName, network: Network): string {
  return CONTRACT_CONFIG[network][name];
}

/**
 * Check if a contract is deployed on a network
 */
export function isContractDeployed(name: ContractName, network: Network): boolean {
  const address = CONTRACT_CONFIG[network][name];
  return !!address && address.length > 0;
}

/**
 * Get API base URL for a network
 */
export function getApiUrl(network: Network): string {
  return API_CONFIG[network].api;
}

/**
 * Get Node URL for a network
 */
export function getNodeUrl(network: Network): string {
  return API_CONFIG[network].node;
}

/**
 * Get Explorer URL for a network
 */
export function getExplorerUrl(network: Network): string {
  return API_CONFIG[network].explorer;
}

/**
 * Build explorer link for a transaction
 */
export function getExplorerTxUrl(txHash: string, network: Network): string {
  return `${API_CONFIG[network].explorer}/transaction/${txHash}`;
}

/**
 * Build explorer link for an address
 */
export function getExplorerAddressUrl(address: string, network: Network): string {
  return `${API_CONFIG[network].explorer}/account/${address}`;
}

/**
 * Build explorer link for an asset
 */
export function getExplorerAssetUrl(assetId: string, network: Network): string {
  return `${API_CONFIG[network].explorer}/asset/${assetId}`;
}

// ============================================================================
// Token Precision Helpers
// ============================================================================

/**
 * Get decimals for a token on a network
 */
export function getTokenDecimals(symbol: TokenSymbol, network: Network): number {
  return TOKEN_CONFIG[network][symbol].decimals;
}

/**
 * Get precision multiplier (10^decimals) for a token
 */
export function getTokenPrecision(symbol: TokenSymbol, network: Network): number {
  const decimals = TOKEN_CONFIG[network][symbol].decimals;
  return Math.pow(10, decimals);
}

/**
 * Format raw amount to human readable
 */
export function formatTokenAmount(
  rawAmount: number | string,
  symbol: TokenSymbol,
  network: Network
): string {
  const decimals = getTokenDecimals(symbol, network);
  const amount = Number(rawAmount) / Math.pow(10, decimals);
  return amount.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  });
}

/**
 * Parse human readable amount to raw (smallest units)
 */
export function parseTokenAmount(
  humanAmount: number | string,
  symbol: TokenSymbol,
  network: Network
): number {
  const decimals = getTokenDecimals(symbol, network);
  return Math.floor(Number(humanAmount) * Math.pow(10, decimals));
}

// ============================================================================
// Testnet Faucet Info
// ============================================================================

export const TESTNET_RESOURCES = {
  faucet: 'https://testnet.kleverscan.org/faucet',
  explorer: 'https://testnet.kleverscan.org',
  documentation: 'https://docs.klever.org',
  
  // Instructions for getting testnet tokens
  instructions: `
    To get testnet KLV:
    1. Go to ${API_CONFIG.testnet.explorer}/faucet
    2. Enter your wallet address
    3. Complete the captcha
    4. Receive 1000 KLV (can request once per day)
    
    To get testnet KDA tokens:
    1. Use the built-in DEX on testnet.kleverscan.org
    2. Swap KLV for the tokens you need
    3. Or create your own test token
  `,
};

// Alias for clarity in imports
export const NETWORK_TOKEN_CONFIG = TOKEN_CONFIG;

// ============================================================================
// Development Mode Warning
// ============================================================================

/**
 * Check if we're in a properly configured testnet environment
 */
export function validateTestnetConfig(): { valid: boolean; warnings: string[] } {
  const warnings: string[] = [];
  
  // Check if DEX contract is deployed
  if (!CONTRACT_CONFIG.testnet.DEX) {
    warnings.push('DEX contract not deployed to testnet. Swap functionality will not work.');
  }
  
  
  return {
    valid: warnings.length === 0,
    warnings,
  };
}
