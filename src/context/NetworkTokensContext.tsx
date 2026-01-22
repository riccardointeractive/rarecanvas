'use client';

/**
 * NetworkTokensContext
 * 
 * Network-aware wrapper around the centralized token configuration.
 * 
 * IMPORTANT: This context DERIVES all token data from src/config/tokens.ts
 * Do NOT hardcode precision, decimals, or asset IDs here!
 * 
 * This context provides:
 * - Current network's token configurations (derived from TOKEN_REGISTRY)
 * - Current network's contract addresses
 * - Current network's API endpoints
 * - Helper functions for token operations
 * 
 * Usage:
 *   const { tokens, contracts, getToken, getAssetId } = useNetworkTokens();
 *   const dgkoAssetId = getAssetId('DGKO'); // Returns correct ID for current network
 */

import React, { createContext, useContext, useMemo, ReactNode } from 'react';
import { useKlever } from './KleverContext';
import { Network } from '@/types/klever';
import { 
  TOKEN_REGISTRY, 
  TokenConfig as BaseTokenConfig,
  getTokenDecimals,
  getTokenPrecision,
  getAssetId as getAssetIdFromRegistry,
} from '@/config/tokens';

// ============================================================================
// Token Configuration Types
// ============================================================================

export interface TokenConfig {
  /** Internal symbol used as key (always DGKO, BABYDGKO, KLV) */
  symbol: string;
  /** Display symbol (same as symbol) */
  displaySymbol: string;
  /** Full display name */
  name: string;
  /** Blockchain asset ID (network-specific) */
  assetId: string;
  /** Number of decimal places - FROM tokens.ts */
  decimals: number;
  /** Precision multiplier (10^decimals) - FROM tokens.ts */
  precision: number;
  /** Whether this is a native token (KLV) */
  isNative: boolean;
}

export interface ContractConfig {
  /** DEX smart contract address */
  DEX: string;
  /** Staking contract address (if separate) */
  STAKING?: string;
}

export interface ApiConfig {
  /** Main API base URL */
  api: string;
  /** Node server URL */
  node: string;
  /** Block explorer URL */
  explorer: string;
}

// ============================================================================
// Build Network Tokens from Centralized Registry
// ============================================================================

/**
 * Build network-aware token config from TOKEN_REGISTRY
 * This ensures decimals/precision ALWAYS come from the single source of truth
 */
function buildTokenConfig(baseToken: BaseTokenConfig, network: Network): TokenConfig {
  const isTestnet = network === 'testnet';
  return {
    symbol: baseToken.symbol,
    displaySymbol: baseToken.symbol,
    name: isTestnet ? `${baseToken.name} (Testnet)` : baseToken.name,
    assetId: network === 'mainnet' ? baseToken.assetIdMainnet : baseToken.assetIdTestnet,
    // CRITICAL: These come from TOKEN_REGISTRY, not hardcoded!
    decimals: baseToken.decimals,
    precision: baseToken.precision,
    isNative: baseToken.isNative,
  };
}

/**
 * Generate TOKENS object dynamically from TOKEN_REGISTRY
 * This ensures we never have stale/duplicate precision values
 */
function buildNetworkTokens(network: Network): Record<string, TokenConfig> {
  const tokens: Record<string, TokenConfig> = {};
  
  // Build from centralized registry
  Object.values(TOKEN_REGISTRY).forEach(baseToken => {
    if (baseToken.isActive) {
      tokens[baseToken.symbol] = buildTokenConfig(baseToken, network);
    }
  });
  
  return tokens;
}

// ============================================================================
// Network Configuration Data (Non-Token)
// ============================================================================

/**
 * Contract addresses per network
 */
const CONTRACTS: Record<Network, ContractConfig> = {
  mainnet: {
    DEX: 'klv1qqqqqqqqqqqqqpgq2jqc28xwmk82mng4kwpm3j9vkq3vyga8xw9qq85y6h',
  },
  testnet: {
    DEX: 'klv1qqqqqqqqqqqqqpgq0r0lxxfrj645llpcvyp5553n52s5swzhxw9qh8fyzq',
  },
};

/**
 * API endpoints per network
 */
const APIS: Record<Network, ApiConfig> = {
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
};

// ============================================================================
// Context Definition
// ============================================================================

export interface NetworkTokensContextValue {
  /** Current network */
  network: Network;
  
  /** Whether we're on testnet */
  isTestnet: boolean;
  
  /** All tokens for current network (keyed by internal symbol) */
  tokens: Record<string, TokenConfig>;
  
  /** Contract addresses for current network */
  contracts: ContractConfig;
  
  /** API endpoints for current network */
  api: ApiConfig;
  
  /** Get a specific token by internal symbol (DGKO, BABYDGKO, KLV) */
  getToken: (symbol: string) => TokenConfig | undefined;
  
  /** Get asset ID for a token symbol */
  getAssetId: (symbol: string) => string;
  
  /** Get display symbol for a token */
  getDisplaySymbol: (symbol: string) => string;
  
  /** Get decimals for a token - uses centralized config */
  getDecimals: (symbol: string) => number;
  
  /** Get precision for a token - uses centralized config */
  getPrecision: (symbol: string) => number;
  
  /** Find token by asset ID (reverse lookup) */
  getTokenByAssetId: (assetId: string) => TokenConfig | undefined;
  
  /** Format raw amount to human readable */
  formatAmount: (rawAmount: number | string, symbol: string) => string;
  
  /** Parse human amount to raw (smallest units) */
  parseAmount: (humanAmount: number | string, symbol: string) => number;
  
  /** Get explorer URL for a transaction */
  getExplorerTxUrl: (txHash: string) => string;
  
  /** Get explorer URL for an address */
  getExplorerAddressUrl: (address: string) => string;
  
  /** Get explorer URL for an asset */
  getExplorerAssetUrl: (assetId: string) => string;
  
  /** Get all token symbols */
  tokenSymbols: string[];
  
  /** Get all asset IDs for current network */
  assetIds: string[];
}

const NetworkTokensContext = createContext<NetworkTokensContextValue | null>(null);

// ============================================================================
// Provider Component
// ============================================================================

interface NetworkTokensProviderProps {
  children: ReactNode;
}

export function NetworkTokensProvider({ children }: NetworkTokensProviderProps) {
  const { network } = useKlever();
  
  const value = useMemo<NetworkTokensContextValue>(() => {
    // Build tokens dynamically from TOKEN_REGISTRY
    const tokens = buildNetworkTokens(network);
    const contracts = CONTRACTS[network];
    const api = APIS[network];
    const isTestnet = network === 'testnet';
    
    // Build reverse lookup map (assetId -> token)
    const assetIdToToken = new Map<string, TokenConfig>();
    Object.values(tokens).forEach(token => {
      assetIdToToken.set(token.assetId, token);
      // Also map by symbol for flexibility
      assetIdToToken.set(token.symbol, token);
    });
    
    const getToken = (symbol: string): TokenConfig | undefined => {
      return tokens[symbol.toUpperCase()];
    };
    
    const getAssetId = (symbol: string): string => {
      // Use centralized config
      return getAssetIdFromRegistry(symbol, network);
    };
    
    const getDisplaySymbol = (symbol: string): string => {
      const token = getToken(symbol);
      return token?.displaySymbol || symbol;
    };
    
    // CRITICAL: Use centralized functions for precision/decimals
    const getDecimals = (symbolOrAssetId: string): number => {
      return getTokenDecimals(symbolOrAssetId);
    };
    
    const getPrecision = (symbolOrAssetId: string): number => {
      return getTokenPrecision(symbolOrAssetId);
    };
    
    const getTokenByAssetId = (assetId: string): TokenConfig | undefined => {
      // Try direct lookup first
      const direct = assetIdToToken.get(assetId);
      if (direct) return direct;
      
      // Try symbol extraction (e.g., 'DGKO' from 'DGKO-CXVJ')
      const symbol = assetId.split('-')[0];
      if (symbol) {
        return tokens[symbol];
      }
      return undefined;
    };
    
    const formatAmount = (rawAmount: number | string, symbol: string): string => {
      const decimals = getDecimals(symbol);
      const amount = Number(rawAmount) / Math.pow(10, decimals);
      return amount.toLocaleString('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: decimals,
      });
    };
    
    const parseAmount = (humanAmount: number | string, symbol: string): number => {
      const decimals = getDecimals(symbol);
      return Math.floor(Number(humanAmount) * Math.pow(10, decimals));
    };
    
    const getExplorerTxUrl = (txHash: string): string => {
      return `${api.explorer}/transaction/${txHash}`;
    };
    
    const getExplorerAddressUrl = (address: string): string => {
      return `${api.explorer}/account/${address}`;
    };
    
    const getExplorerAssetUrl = (assetId: string): string => {
      return `${api.explorer}/asset/${assetId}`;
    };
    
    return {
      network,
      isTestnet,
      tokens,
      contracts,
      api,
      getToken,
      getAssetId,
      getDisplaySymbol,
      getDecimals,
      getPrecision,
      getTokenByAssetId,
      formatAmount,
      parseAmount,
      getExplorerTxUrl,
      getExplorerAddressUrl,
      getExplorerAssetUrl,
      tokenSymbols: Object.keys(tokens),
      assetIds: Object.values(tokens).map(t => t.assetId),
    };
  }, [network]);
  
  return (
    <NetworkTokensContext.Provider value={value}>
      {children}
    </NetworkTokensContext.Provider>
  );
}

// ============================================================================
// Hook
// ============================================================================

export function useNetworkTokens(): NetworkTokensContextValue {
  const context = useContext(NetworkTokensContext);
  
  if (!context) {
    throw new Error('useNetworkTokens must be used within a NetworkTokensProvider');
  }
  
  return context;
}

// ============================================================================
// Standalone Helper (for use outside React components)
// ============================================================================

/**
 * Get token config for a specific network (for use outside React)
 * Prefer useNetworkTokens() hook when possible.
 */
export function getNetworkTokenConfig(network: Network) {
  return {
    tokens: buildNetworkTokens(network),
    contracts: CONTRACTS[network],
    api: APIS[network],
  };
}
