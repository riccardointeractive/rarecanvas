/**
 * Admin Tokens Types
 */

export interface TokenFormData {
  symbol: string;
  name: string;
  assetIdMainnet: string;
  assetIdTestnet: string;
  decimals: number;
  precision: number;
  isNative: boolean;
  logo: string;
  color: string;
  colorSecondary: string;
  description: string;
  websiteUrl: string;
  explorerUrl: string;
  coingeckoUrl: string;
  isActive: boolean;
  sortOrder: number;
}

export interface TokenPrecisionEntry {
  symbol: string;
  name: string;
  assetIdMainnet: string;
  assetIdTestnet: string;
  decimals: number;
  precision: number;
  isNative: boolean;
  source: 'registry' | 'custom' | 'api';
}
