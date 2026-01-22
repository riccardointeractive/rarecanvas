'use client';

/**
 * useNetworkConfig Hook
 * 
 * Provides easy access to network-aware configuration.
 * Automatically uses the current network from KleverContext.
 * 
 * @example
 * const { getTokenId, getContractAddress, isTestnet } = useNetworkConfig();
 * const dgkoId = getTokenId('DGKO'); // Returns correct ID for current network
 * const dexAddress = getContractAddress('DEX');
 */

import { useKlever } from '@/context/KleverContext';
import {
  getNetworkConfig,
  getTokenId as _getTokenId,
  getTokenConfig as _getTokenConfig,
  getTokenSymbol as _getTokenSymbol,
  getContractAddress as _getContractAddress,
  isContractDeployed as _isContractDeployed,
  getApiUrl as _getApiUrl,
  getNodeUrl as _getNodeUrl,
  getExplorerUrl as _getExplorerUrl,
  getExplorerTxUrl as _getExplorerTxUrl,
  getExplorerAddressUrl as _getExplorerAddressUrl,
  getExplorerAssetUrl as _getExplorerAssetUrl,
  getTokenDecimals as _getTokenDecimals,
  getTokenPrecision as _getTokenPrecision,
  formatTokenAmount as _formatTokenAmount,
  parseTokenAmount as _parseTokenAmount,
  validateTestnetConfig,
  TESTNET_RESOURCES,
  TOKEN_CONFIG,
  CONTRACT_CONFIG,
  API_CONFIG,
  TokenSymbol,
  ContractName,
} from '@/config/network';

export function useNetworkConfig() {
  const { network } = useKlever();
  
  // Get full config for current network
  const config = getNetworkConfig(network);
  
  // Bound helper functions that use current network automatically
  const getTokenId = (symbol: TokenSymbol) => _getTokenId(symbol, network);
  const getTokenConfig = (symbol: TokenSymbol) => _getTokenConfig(symbol, network);
  const getTokenSymbol = (assetId: string) => _getTokenSymbol(assetId, network);
  const getContractAddress = (name: ContractName) => _getContractAddress(name, network);
  const isContractDeployed = (name: ContractName) => _isContractDeployed(name, network);
  const getApiUrl = () => _getApiUrl(network);
  const getNodeUrl = () => _getNodeUrl(network);
  const getExplorerUrl = () => _getExplorerUrl(network);
  const getExplorerTxUrl = (txHash: string) => _getExplorerTxUrl(txHash, network);
  const getExplorerAddressUrl = (address: string) => _getExplorerAddressUrl(address, network);
  const getExplorerAssetUrl = (assetId: string) => _getExplorerAssetUrl(assetId, network);
  const getTokenDecimals = (symbol: TokenSymbol) => _getTokenDecimals(symbol, network);
  const getTokenPrecision = (symbol: TokenSymbol) => _getTokenPrecision(symbol, network);
  const formatTokenAmount = (rawAmount: number | string, symbol: TokenSymbol) => 
    _formatTokenAmount(rawAmount, symbol, network);
  const parseTokenAmount = (humanAmount: number | string, symbol: TokenSymbol) =>
    _parseTokenAmount(humanAmount, symbol, network);
  
  // Validate testnet config if on testnet
  const testnetValidation = network === 'testnet' ? validateTestnetConfig() : null;
  
  return {
    // Current network
    network,
    isTestnet: network === 'testnet',
    isMainnet: network === 'mainnet',
    
    // Full config objects
    config,
    tokens: config.tokens,
    contracts: config.contracts,
    api: config.api,
    
    // Token helpers
    getTokenId,
    getTokenConfig,
    getTokenSymbol,
    getTokenDecimals,
    getTokenPrecision,
    formatTokenAmount,
    parseTokenAmount,
    
    // Contract helpers
    getContractAddress,
    isContractDeployed,
    
    // API/Explorer helpers
    getApiUrl,
    getNodeUrl,
    getExplorerUrl,
    getExplorerTxUrl,
    getExplorerAddressUrl,
    getExplorerAssetUrl,
    
    // Testnet resources
    testnetResources: TESTNET_RESOURCES,
    testnetValidation,
    
    // Raw config access (for advanced use)
    rawConfig: {
      TOKEN_CONFIG,
      CONTRACT_CONFIG,
      API_CONFIG,
    },
  };
}

/**
 * Get all token IDs for the current network
 * Useful for fetching balances for all relevant tokens
 */
export function useNetworkTokenIds(): string[] {
  const { tokens } = useNetworkConfig();
  return Object.values(tokens).map(t => t.assetId);
}

/**
 * Check if DEX is available on current network
 */
export function useDexAvailability() {
  const { isContractDeployed, isTestnet, getContractAddress } = useNetworkConfig();
  
  const isDexDeployed = isContractDeployed('DEX');
  const dexAddress = getContractAddress('DEX');
  
  return {
    isAvailable: isDexDeployed,
    address: dexAddress,
    message: !isDexDeployed && isTestnet 
      ? 'DEX contract not yet deployed to testnet. Deploy it first to enable swaps.'
      : undefined,
  };
}
