/**
 * Token Page Types
 * Shared types for dynamic token pages (DGKO, BABYDGKO, future tokens)
 */

import { ReactNode } from 'react';
import { Exchange } from '@/types/exchange';

// ============================================================================
// Token Stats (from blockchain)
// ============================================================================

export interface TokenStats {
  totalSupply: string;
  circulatingSupply: string;
  stakingHolders: number;
  totalStaked: string;
  stakedPercent: number;
  apr: number;
  burned: string;
  minted: string;
}

// ============================================================================
// Configuration Types
// ============================================================================

export interface TokenomicsItem {
  label: string;
  percent: number;
  color: string;
}

export interface TokenomicsDisplayConfig {
  /** Center label for donut chart (e.g., "100M") */
  centerLabel: string;
  /** Center sublabel (e.g., "Max Supply") */
  centerSublabel: string;
  /** Number of decimals */
  decimals: string;
  /** Vesting period (e.g., "24 months") */
  vesting: string;
}

export interface RoadmapItem {
  title: string;
  status: 'live' | 'coming';
  quarter: string;
  description: string;
}

export interface EcosystemFeature {
  icon: ReactNode;
  title: string;
  description: string;
  status: 'live' | 'coming';
  href: string | null;
}

export interface TokenDetail {
  label: string;
  value: string;
  mono?: boolean;
}

export interface SocialLinkConfig {
  name: string;
  icon: ReactNode;
  url: string;
}

export interface CTAConfig {
  title: string;
  description: string;
  primaryAction: {
    href: string;
    label: string;
    external?: boolean;
  };
  secondaryAction?: {
    href: string;
    label: string;
    external?: boolean;
  };
}

export interface OnChainDataConfig {
  /** Number of columns for the grid (3 or 4) */
  columns: 3 | 4;
  /** Which metrics to display */
  metrics: Array<'totalSupply' | 'circulatingSupply' | 'totalStaked' | 'stakedPercent' | 'stakingHolders'>;
  /** Custom labels for metrics */
  labels?: {
    totalSupply?: string;
    circulatingSupply?: string;
    totalStaked?: string;
    stakedPercent?: string;
    stakingHolders?: string;
  };
}

export interface ActivityMetric {
  type: 'burned' | 'minted';
  icon: ReactNode;
  iconColor: 'red' | 'green' | 'blue';
  label: string;
  description: string;
}

// ============================================================================
// Master Token Page Configuration
// ============================================================================

export interface TokenPageConfig {
  /** Token identifier (DGKO, BABYDGKO, etc.) */
  tokenId: string;
  
  /** Asset ID on Klever blockchain */
  assetId: string;
  
  /** Token precision for calculations */
  precision: number;
  
  /** Display name for the token */
  displayName: string;
  
  /** Token tagline for header */
  tagline: string;
  
  /** Token description for header */
  description: string;
  
  /** Header icon (TokenImage TOKEN_ID) */
  headerTokenId: string;
  
  /** Tokenomics distribution */
  tokenomics: TokenomicsItem[];
  
  /** Tokenomics display configuration */
  tokenomicsDisplay: TokenomicsDisplayConfig;
  
  /** Roadmap items */
  roadmap: RoadmapItem[];
  
  /** Token technical details */
  tokenDetails: TokenDetail[];
  
  /** Exchanges where token is available */
  exchanges: Exchange[];
  
  /** Ecosystem features grid */
  ecosystemFeatures: EcosystemFeature[];
  
  /** Social links for community section */
  socialLinks: SocialLinkConfig[];
  
  /** Community section title */
  communityTitle: string;
  
  /** CTA section configuration */
  cta: CTAConfig;
  
  /** On-chain data grid configuration */
  onChainData: OnChainDataConfig;
  
  /** Activity metrics (burned/minted cards) */
  activityMetrics: ActivityMetric[];
  
  /** Exchange list title */
  exchangeListTitle: string;
}
