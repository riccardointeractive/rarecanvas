/**
 * Dashboard Types
 */

export interface GuideItem {
  icon: React.ReactNode;
  title: string;
  description: string;
  variant: 'blue' | 'cyan';
}

export interface TokenBalance {
  assetId: string;
  // Raw values (smallest unit)
  balance: string;           // Total = available + staked
  availableRaw: string;      // Available (liquid) balance
  stakedRaw: string;         // Frozen/staked balance
  // Formatted values (human readable)
  balanceFormatted: string;  // Total formatted
  availableFormatted: string; // Available formatted
  stakedFormatted: string;   // Staked formatted
  // Price data
  priceUSD: number;          // Current price per token
  valueUSD: number;          // Total value (balance × price)
  availableValueUSD: number; // Available value
  stakedValueUSD: number;    // Staked value
  // Metadata
  decimals: number;          // Token precision
  change24h?: number;
  logo?: string;
}

export interface Transaction {
  hash: string;
  type: string;
  from: string;
  to?: string;
  amount: string;
  assetId: string;
  timestamp: number;
  status: 'confirmed' | 'pending' | 'failed';
  fee?: string;
}

export interface StakingPosition {
  assetId: string;
  amount: string;
  rewards: string;
  apy: number;
  epochsRemaining?: number;
  bucketId?: string;
}

export interface PortfolioStats {
  totalValueUSD: number;
  availableValueUSD: number;   // Liquid/available tokens
  stakedValueUSD: number;      // Frozen/staked tokens
  klvStakedValueUSD: number;   // KLV delegated to validators
  change24h: number;
  change24hPercent: number;
  totalAssets: number;
  klvPrice: number;            // Current KLV price for reference
}
