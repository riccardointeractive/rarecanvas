/**
 * Token Configuration - Single Source of Truth
 * 
 * This file is THE authoritative reference for all token metadata in Rare Canvas.
 * Claude: Always check this file for token precision, IDs, and configuration.
 * 
 * IMPORTANT CONCEPTS:
 * - precision: The multiplier (e.g., 10000 = 4 decimals)
 * - decimals: The number of decimal places (e.g., 4)
 * - Formula: precision = 10^decimals
 * 
 * @see /admin/tokens/precision for visual management
 */

import { Network } from '@/types/klever';

// ============================================================================
// Types
// ============================================================================

export interface TokenConfig {
  /** Token symbol (e.g., 'DGKO', 'KLV') */
  symbol: string;
  /** Full display name */
  name: string;
  /** Asset ID on mainnet */
  assetIdMainnet: string;
  /** Asset ID on testnet */
  assetIdTestnet: string;
  /** Number of decimal places */
  decimals: number;
  /** Precision multiplier (10^decimals) */
  precision: number;
  /** Whether this is the native chain token */
  isNative: boolean;
  /** Custom logo path (relative to /public) */
  logo?: string;
  /** Primary brand color (hex) */
  color: string;
  /** Secondary gradient color (hex) */
  colorSecondary?: string;
  /** Token description */
  description?: string;
  /** External links */
  links?: {
    website?: string;
    explorer?: string;
    coingecko?: string;
  };
  /** Whether token is active/tradeable */
  isActive: boolean;
  /** Sort order for display */
  sortOrder: number;
}

// ============================================================================
// Token Registry
// ============================================================================

/**
 * Master token configuration
 * 
 * CLAUDE REFERENCE:
 * - KLV: 6 decimals, precision 1,000,000
 * - KFI: 6 decimals, precision 1,000,000
 * - DRG: 6 decimals, precision 1,000,000
 * - DGKO: 4 decimals, precision 10,000
 * - BABYDGKO: 8 decimals, precision 100,000,000
 * - KUNAI: 6 decimals, precision 1,000,000
 * - KID: 3 decimals, precision 1,000
 * - DAXDO: 8 decimals, precision 100,000,000
 * - GOAT: 3 decimals, precision 1,000
 * - CTR: 6 decimals, precision 1,000,000
 * - KAKA: 0 decimals, precision 1 (whole numbers only)
 * - KONG: 3 decimals, precision 1,000
 * - SAVO: 3 decimals, precision 1,000
 * - SHIT: 6 decimals, precision 1,000,000
 * - WSOL: 8 decimals, precision 100,000,000
 * - USDT: 6 decimals, precision 1,000,000
 * - USDC: 6 decimals, precision 1,000,000
 * - PMD: 0 decimals, precision 1 (whole numbers only)
 * - CHIPS: 6 decimals, precision 1,000,000
 * - KPEPE: 6 decimals, precision 1,000,000
 * - MEME: 6 decimals, precision 1,000,000
 * - MOTO: 8 decimals, precision 100,000,000
 * - PHARAO: 6 decimals, precision 1,000,000
 * - SAME: 6 decimals, precision 1,000,000
 * - VLX: 6 decimals, precision 1,000,000
 * - KIRA: 3 decimals, precision 1,000
 * - XPORT: 6 decimals, precision 1,000,000
 * - BPGOK: 8 decimals, precision 100,000,000
 */
export const TOKEN_REGISTRY: Record<string, TokenConfig> = {
  KLV: {
    symbol: 'KLV',
    name: 'Klever',
    assetIdMainnet: 'KLV',
    assetIdTestnet: 'KLV',
    decimals: 6,
    precision: 1_000_000, // 10^6
    isNative: true,
    logo: '/tokens/klv.png',
    color: '#7C3AED',
    colorSecondary: '#EC4899',
    description: 'Native token of the Klever blockchain',
    links: {
      website: 'https://klever.org',
      coingecko: 'https://www.coingecko.com/en/coins/klever',
    },
    isActive: true,
    sortOrder: 1,
  },
  DGKO: {
    symbol: 'DGKO',
    name: 'Rare Canvas',
    assetIdMainnet: 'DGKO-CXVJ',
    assetIdTestnet: 'DGKO-2E9J',
    decimals: 4,
    precision: 10_000, // 10^4
    isNative: false,
    logo: '/tokens/dgko.png',
    color: '#8B5CF6',
    colorSecondary: '#A78BFA',
    description: 'Main governance token of the Rare Canvas ecosystem',
    links: {
      website: 'https://rarecanvas.io',
    },
    isActive: true,
    sortOrder: 2,
  },
  BABYDGKO: {
    symbol: 'BABYDGKO',
    name: 'Baby Rare Canvas',
    assetIdMainnet: 'BABYDGKO-3S67',
    assetIdTestnet: 'BABYDGKO-VIXW',
    decimals: 8,
    precision: 100_000_000, // 10^8
    isNative: false,
    logo: '/tokens/babydgko.png',
    color: '#A78BFA',
    colorSecondary: '#8B5CF6',
    description: 'Community token of the Rare Canvas ecosystem',
    links: {
      website: 'https://rarecanvas.io',
    },
    isActive: true,
    sortOrder: 3,
  },
  KFI: {
    symbol: 'KFI',
    name: 'Klever Finance',
    assetIdMainnet: 'KFI',
    assetIdTestnet: '',
    decimals: 6,
    precision: 1_000_000, // 10^6
    isNative: false,
    logo: '/tokens/kfi.png',
    color: '#F59E0B',
    colorSecondary: '#F97316',
    description: 'Klever Finance governance token',
    links: {
      coingecko: 'https://www.coingecko.com/en/coins/klever-finance',
    },
    isActive: true,
    sortOrder: 4,
  },
  DRG: {
    symbol: 'DRG',
    name: 'Dragon',
    assetIdMainnet: 'DRG-17KE',
    assetIdTestnet: '',
    decimals: 6,
    precision: 1_000_000, // 10^6
    isNative: false,
    logo: '/tokens/drg.png',
    color: '#1F2937',
    colorSecondary: '#374151',
    description: 'Dragon token on Klever blockchain',
    links: {
      explorer: 'https://kleverscan.org/asset/DRG-17KE',
    },
    isActive: true,
    sortOrder: 5,
  },
  KUNAI: {
    symbol: 'KUNAI',
    name: 'KunaiKash',
    assetIdMainnet: 'KUNAI-18TK',
    assetIdTestnet: '',
    decimals: 6,
    precision: 1_000_000, // 10^6
    isNative: false,
    logo: '/tokens/kunai.png',
    color: '#A855F7',
    colorSecondary: '#D946EF',
    description: 'KunaiKash token on Klever blockchain',
    links: {
      explorer: 'https://kleverscan.org/asset/KUNAI-18TK',
    },
    isActive: true,
    sortOrder: 6,
  },
  KID: {
    symbol: 'KID',
    name: 'KleverKid Coin',
    assetIdMainnet: 'KID-36W3',
    assetIdTestnet: '',
    decimals: 3,
    precision: 1_000, // 10^3
    isNative: false,
    logo: '/tokens/kid.png',
    color: '#4F46E5',
    colorSecondary: '#EC4899',
    description: 'KleverKid Coin on Klever blockchain',
    links: {
      explorer: 'https://kleverscan.org/asset/KID-36W3',
    },
    isActive: true,
    sortOrder: 7,
  },
  DAXDO: {
    symbol: 'DAXDO',
    name: 'DaxDoge',
    assetIdMainnet: 'DAXDO-1A4L',
    assetIdTestnet: '',
    decimals: 8,
    precision: 100_000_000, // 10^8
    isNative: false,
    logo: '/tokens/daxdo.png',
    color: '#F59E0B',
    colorSecondary: '#D97706',
    description: 'DaxDoge token on Klever blockchain',
    links: {
      explorer: 'https://kleverscan.org/asset/DAXDO-1A4L',
    },
    isActive: true,
    sortOrder: 8,
  },
  GOAT: {
    symbol: 'GOAT',
    name: 'Greatest Of All Tokens',
    assetIdMainnet: 'GOAT-3NXV',
    assetIdTestnet: '',
    decimals: 3,
    precision: 1_000, // 10^3
    isNative: false,
    logo: '/tokens/goat.png',
    color: '#F59E0B',
    colorSecondary: '#EAB308',
    description: 'GOAT - Greatest Of All Tokens on Klever blockchain',
    links: {
      explorer: 'https://kleverscan.org/asset/GOAT-3NXV',
    },
    isActive: true,
    sortOrder: 9,
  },
  HGT: {
    symbol: 'HGT',
    name: 'Hypatia Games',
    assetIdMainnet: 'HGT-1V37',
    assetIdTestnet: '',
    decimals: 6,
    precision: 1_000_000, // 10^6
    isNative: false,
    logo: '/tokens/hgt.png',
    color: '#FFFFFF',
    colorSecondary: '#E5E5E5',
    description: 'Hypatia Games token on Klever blockchain',
    links: {
      explorer: 'https://kleverscan.org/asset/HGT-1V37',
    },
    isActive: true,
    sortOrder: 10,
  },
  CTR: {
    symbol: 'CTR',
    name: 'Crash',
    assetIdMainnet: 'CTR-2N54',
    assetIdTestnet: '',
    decimals: 6,
    precision: 1_000_000, // 10^6
    isNative: false,
    logo: '/tokens/ctr.png',
    color: '#06B6D4',
    colorSecondary: '#EC4899',
    description: 'Crash token on Klever blockchain',
    links: {
      explorer: 'https://kleverscan.org/asset/CTR-2N54',
    },
    isActive: true,
    sortOrder: 11,
  },
  KAKA: {
    symbol: 'KAKA',
    name: 'Kaka',
    assetIdMainnet: 'KAKA-3DRY',
    assetIdTestnet: '',
    decimals: 0,
    precision: 1, // 10^0 - whole numbers only
    isNative: false,
    logo: '/tokens/kaka.png',
    color: '#A855F7',
    colorSecondary: '#EC4899',
    description: 'Kaka token on Klever blockchain',
    links: {
      explorer: 'https://kleverscan.org/asset/KAKA-3DRY',
    },
    isActive: true,
    sortOrder: 12,
  },
  KBLOC: {
    symbol: 'KBLOC',
    name: 'kBloc',
    assetIdMainnet: 'KBLOC-1AIX',
    assetIdTestnet: '',
    decimals: 3,
    precision: 1_000, // 10^3
    isNative: false,
    logo: '/tokens/kbloc.png',
    color: '#E879F9',
    colorSecondary: '#A855F7',
    description: 'kBloc token on Klever blockchain',
    links: {
      explorer: 'https://kleverscan.org/asset/KBLOC-1AIX',
    },
    isActive: true,
    sortOrder: 13,
  },
  KONG: {
    symbol: 'KONG',
    name: 'KONG Token',
    assetIdMainnet: 'KONG-LGAJ',
    assetIdTestnet: '',
    decimals: 3,
    precision: 1_000, // 10^3
    isNative: false,
    logo: '/tokens/kong.png',
    color: '#EAB308',
    colorSecondary: '#F59E0B',
    description: 'KONG Token on Klever blockchain',
    links: {
      explorer: 'https://kleverscan.org/asset/KONG-LGAJ',
    },
    isActive: true,
    sortOrder: 14,
  },
  SAVO: {
    symbol: 'SAVO',
    name: 'Savore Coin',
    assetIdMainnet: 'SAVO-3EX7',
    assetIdTestnet: '',
    decimals: 3,
    precision: 1_000, // 10^3
    isNative: false,
    logo: '/tokens/savo.png',
    color: '#64748B',
    colorSecondary: '#475569',
    description: 'Savore Coin on Klever blockchain',
    links: {
      explorer: 'https://kleverscan.org/asset/SAVO-3EX7',
    },
    isActive: true,
    sortOrder: 15,
  },
  TCT: {
    symbol: 'TCT',
    name: 'Truckt',
    assetIdMainnet: 'TCT-3B99',
    assetIdTestnet: '',
    decimals: 3,
    precision: 1_000, // 10^3
    isNative: false,
    logo: '/tokens/tct.png',
    color: '#2DD4BF',
    colorSecondary: '#14B8A6',
    description: 'Truckt token on Klever blockchain',
    links: {
      explorer: 'https://kleverscan.org/asset/TCT-3B99',
    },
    isActive: true,
    sortOrder: 16,
  },
  SHIT: {
    symbol: 'SHIT',
    name: 'Shiny Heffers Investment Token',
    assetIdMainnet: 'SHIT-3UF0',
    assetIdTestnet: '',
    decimals: 6,
    precision: 1_000_000, // 10^6
    isNative: false,
    logo: '/tokens/shit.jpg',
    color: '#CA8A04',
    colorSecondary: '#EAB308',
    description: 'Shiny Heffers Investment Token on Klever blockchain',
    links: {
      explorer: 'https://kleverscan.org/asset/SHIT-3UF0',
    },
    isActive: true,
    sortOrder: 17,
  },
  WSOL: {
    symbol: 'WSOL',
    name: 'Wrapped SOL',
    assetIdMainnet: 'WSOL-1C4Q',
    assetIdTestnet: '',
    decimals: 8,
    precision: 100_000_000, // 10^8
    isNative: false,
    logo: '/tokens/wsol.png',
    color: '#9945FF',
    colorSecondary: '#14F195',
    description: 'Wrapped Solana on Klever blockchain',
    links: {
      explorer: 'https://kleverscan.org/asset/WSOL-1C4Q',
    },
    isActive: true,
    sortOrder: 18,
  },
  USDT: {
    symbol: 'USDT',
    name: 'Tether USD',
    assetIdMainnet: 'USDT-23V8',
    assetIdTestnet: '',
    decimals: 6,
    precision: 1_000_000, // 10^6
    isNative: false,
    logo: '/tokens/usdt.png',
    color: '#26A17B',
    colorSecondary: '#1A9268',
    description: 'Tether USD on Klever blockchain',
    links: {
      explorer: 'https://kleverscan.org/asset/USDT-23V8',
    },
    isActive: true,
    sortOrder: 19,
  },
  USDC: {
    symbol: 'USDC',
    name: 'Wrapped USDC',
    assetIdMainnet: 'USDC-1LN4',
    assetIdTestnet: '',
    decimals: 6,
    precision: 1_000_000, // 10^6
    isNative: false,
    logo: '/tokens/usdc.png',
    color: '#2775CA',
    colorSecondary: '#3B82F6',
    description: 'Wrapped USDC on Klever blockchain',
    links: {
      explorer: 'https://kleverscan.org/asset/USDC-1LN4',
    },
    isActive: true,
    sortOrder: 20,
  },
  PMD: {
    symbol: 'PMD',
    name: 'Pandemic Diamond',
    assetIdMainnet: 'PMD-2U7V',
    assetIdTestnet: '',
    decimals: 0,
    precision: 1, // 10^0 - whole numbers only
    isNative: false,
    logo: '/tokens/pmd.png',
    color: '#4ADE80',
    colorSecondary: '#22C55E',
    description: 'Pandemic Diamond on Klever blockchain',
    links: {
      explorer: 'https://kleverscan.org/asset/PMD-2U7V',
    },
    isActive: true,
    sortOrder: 21,
  },
  CHIPS: {
    symbol: 'CHIPS',
    name: 'Dexbet Chips',
    assetIdMainnet: 'CHIPS-1GZP',
    assetIdTestnet: '',
    decimals: 6,
    precision: 1_000_000, // 10^6
    isNative: false,
    logo: '/tokens/chips.png',
    color: '#10B981',
    colorSecondary: '#059669',
    description: 'Dexbet Chips token on Klever blockchain',
    links: {
      website: 'https://dexbet.win',
      explorer: 'https://kleverscan.org/asset/CHIPS-1GZP',
    },
    isActive: true,
    sortOrder: 22,
  },
  KPEPE: {
    symbol: 'KPEPE',
    name: 'KleverPepe',
    assetIdMainnet: 'KPEPE-1EOD',
    assetIdTestnet: '',
    decimals: 6,
    precision: 1_000_000, // 10^6
    isNative: false,
    logo: '/tokens/kpepe.png',
    color: '#22C55E',
    colorSecondary: '#16A34A',
    description: 'KleverPepe meme token on Klever blockchain',
    links: {
      explorer: 'https://kleverscan.org/asset/KPEPE-1EOD',
    },
    isActive: true,
    sortOrder: 23,
  },
  MEME: {
    symbol: 'MEME',
    name: 'MEME',
    assetIdMainnet: 'MEME-1P0M',
    assetIdTestnet: '',
    decimals: 6,
    precision: 1_000_000, // 10^6
    isNative: false,
    logo: '/tokens/meme.png',
    color: '#F59E0B',
    colorSecondary: '#D97706',
    description: 'MEME token on Klever blockchain',
    links: {
      explorer: 'https://kleverscan.org/asset/MEME-1P0M',
    },
    isActive: true,
    sortOrder: 24,
  },
  MOTO: {
    symbol: 'MOTO',
    name: 'MotoKoin',
    assetIdMainnet: 'MOTO-2XES',
    assetIdTestnet: '',
    decimals: 8,
    precision: 100_000_000, // 10^8
    isNative: false,
    logo: '/tokens/moto.png',
    color: '#22C55E',
    colorSecondary: '#16A34A',
    description: 'MotoKoin token on Klever blockchain',
    links: {
      website: 'https://motokoin.io',
      explorer: 'https://kleverscan.org/asset/MOTO-2XES',
    },
    isActive: true,
    sortOrder: 25,
  },
  PHARAO: {
    symbol: 'PHARAO',
    name: 'Pharaoh',
    assetIdMainnet: 'PHARAO-204Q',
    assetIdTestnet: '',
    decimals: 6,
    precision: 1_000_000, // 10^6
    isNative: false,
    logo: '/tokens/pharao.png',
    color: '#EAB308',
    colorSecondary: '#CA8A04',
    description: 'Pharaoh token on Klever blockchain',
    links: {
      explorer: 'https://kleverscan.org/asset/PHARAO-204Q',
    },
    isActive: true,
    sortOrder: 26,
  },
  SAME: {
    symbol: 'SAME',
    name: 'SAME',
    assetIdMainnet: 'SAME-3LRL',
    assetIdTestnet: '',
    decimals: 6,
    precision: 1_000_000, // 10^6
    isNative: false,
    logo: '/tokens/same.png',
    color: '#06B6D4',
    colorSecondary: '#8B5CF6',
    description: 'SAME token on Klever blockchain',
    links: {
      website: 'https://app.want-same.com',
      explorer: 'https://kleverscan.org/asset/SAME-3LRL',
    },
    isActive: true,
    sortOrder: 27,
  },
  VLX: {
    symbol: 'VLX',
    name: 'VELIX',
    assetIdMainnet: 'VLX-3LAS',
    assetIdTestnet: '',
    decimals: 6,
    precision: 1_000_000, // 10^6
    isNative: false,
    logo: '/tokens/vlx.png',
    color: '#7C3AED',
    colorSecondary: '#6D28D9',
    description: 'VELIX token on Klever blockchain',
    links: {
      explorer: 'https://kleverscan.org/asset/VLX-3LAS',
    },
    isActive: true,
    sortOrder: 28,
  },
  KIRA: {
    symbol: 'KIRA',
    name: 'Kira Joy',
    assetIdMainnet: 'KIRA-31QW',
    assetIdTestnet: '',
    decimals: 3,
    precision: 1_000, // 10^3
    isNative: false,
    logo: '/tokens/kira.png',
    color: '#06B6D4',
    colorSecondary: '#0891B2',
    description: 'Kira Joy token on Klever blockchain',
    links: {
      explorer: 'https://kleverscan.org/asset/KIRA-31QW',
    },
    isActive: true,
    sortOrder: 29,
  },
  XPORT: {
    symbol: 'XPORT',
    name: 'XPORT Hub',
    assetIdMainnet: 'XPORT-2KLU',
    assetIdTestnet: '',
    decimals: 6,
    precision: 1_000_000, // 10^6
    isNative: false,
    logo: '/tokens/xport.png',
    color: '#1F2937',
    colorSecondary: '#374151',
    description: 'XPORT Hub token on Klever blockchain',
    links: {
      explorer: 'https://kleverscan.org/asset/XPORT-2KLU',
    },
    isActive: true,
    sortOrder: 30,
  },
  BPGOK: {
    symbol: 'BPGOK',
    name: 'Baby PengolinCoin',
    assetIdMainnet: 'BPGOK-1OPP',
    assetIdTestnet: '',
    decimals: 8,
    precision: 100_000_000, // 10^8
    isNative: false,
    logo: '/tokens/bpgok.png',
    color: '#EAB308',
    colorSecondary: '#CA8A04',
    description: 'Baby PengolinCoin on Klever blockchain',
    links: {
      explorer: 'https://kleverscan.org/asset/BPGOK-1OPP',
    },
    isActive: true,
    sortOrder: 31,
  },
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get token config by symbol
 */
export function getTokenBySymbol(symbol: string): TokenConfig | undefined {
  return TOKEN_REGISTRY[symbol.toUpperCase()];
}

/**
 * Get token config by asset ID (searches both mainnet and testnet)
 */
export function getTokenByAssetId(assetId: string): TokenConfig | undefined {
  return Object.values(TOKEN_REGISTRY).find(
    token => 
      token.assetIdMainnet === assetId || 
      token.assetIdTestnet === assetId
  );
}

/**
 * Get asset ID for a token on a specific network
 */
export function getAssetId(symbol: string, network: Network): string {
  const token = getTokenBySymbol(symbol);
  if (!token) return symbol; // Fallback to symbol if not found
  return network === 'mainnet' ? token.assetIdMainnet : token.assetIdTestnet;
}

/**
 * Get precision for a token
 */
export function getTokenPrecision(symbolOrAssetId: string): number {
  // Try by symbol first
  const bySymbol = getTokenBySymbol(symbolOrAssetId);
  if (bySymbol) return bySymbol.precision;
  
  // Try by asset ID
  const byAssetId = getTokenByAssetId(symbolOrAssetId);
  if (byAssetId) return byAssetId.precision;
  
  // Default to KLV precision
  return 1_000_000;
}

/**
 * Get decimals for a token
 */
export function getTokenDecimals(symbolOrAssetId: string): number {
  // Try by symbol first
  const bySymbol = getTokenBySymbol(symbolOrAssetId);
  if (bySymbol) return bySymbol.decimals;
  
  // Try by asset ID
  const byAssetId = getTokenByAssetId(symbolOrAssetId);
  if (byAssetId) return byAssetId.decimals;
  
  // Default to KLV decimals
  return 6;
}

/**
 * Get display name for a token
 */
export function getTokenName(symbolOrAssetId: string): string {
  const bySymbol = getTokenBySymbol(symbolOrAssetId);
  if (bySymbol) return bySymbol.name;
  
  const byAssetId = getTokenByAssetId(symbolOrAssetId);
  if (byAssetId) return byAssetId.name;
  
  // Return the symbol part of the asset ID
  return symbolOrAssetId.split('-')[0] || symbolOrAssetId;
}

/**
 * Get trading symbol for a token (e.g., 'DGKO', 'KLV')
 */
export function getTokenSymbol(symbolOrAssetId: string): string {
  const bySymbol = getTokenBySymbol(symbolOrAssetId);
  if (bySymbol) return bySymbol.symbol;
  
  const byAssetId = getTokenByAssetId(symbolOrAssetId);
  if (byAssetId) return byAssetId.symbol;
  
  // Return the symbol part of the asset ID (e.g., 'DGKO' from 'DGKO-CXVJ')
  return symbolOrAssetId.split('-')[0] || symbolOrAssetId;
}

/**
 * Get custom logo path for a token
 */
export function getTokenLogo(symbolOrAssetId: string): string | undefined {
  const bySymbol = getTokenBySymbol(symbolOrAssetId);
  if (bySymbol) return bySymbol.logo;
  
  const byAssetId = getTokenByAssetId(symbolOrAssetId);
  return byAssetId?.logo;
}

/**
 * Get brand color for a token
 */
export function getTokenColor(symbolOrAssetId: string): string {
  const bySymbol = getTokenBySymbol(symbolOrAssetId);
  if (bySymbol) return bySymbol.color;
  
  const byAssetId = getTokenByAssetId(symbolOrAssetId);
  if (byAssetId) return byAssetId.color;
  
  // Default gray
  return '#6B7280';
}

/**
 * Get secondary/gradient color for a token
 */
export function getTokenColorSecondary(symbolOrAssetId: string): string {
  const bySymbol = getTokenBySymbol(symbolOrAssetId);
  if (bySymbol) return bySymbol.colorSecondary || bySymbol.color;
  
  const byAssetId = getTokenByAssetId(symbolOrAssetId);
  if (byAssetId) return byAssetId.colorSecondary || byAssetId.color;
  
  // Default gray
  return '#4B5563';
}

/**
 * Get Tailwind gradient classes for a token (for fallback display)
 * Uses the token's color config to generate consistent gradients
 */
export function getTokenGradientClasses(symbolOrAssetId: string): string {
  const token = getTokenBySymbol(symbolOrAssetId) || getTokenByAssetId(symbolOrAssetId);
  
  if (!token) {
    return 'from-gray-500/30 to-gray-600/20';
  }
  
  // Map hex colors to Tailwind gradient classes
  const colorMap: Record<string, string> = {
    '#0066FF': 'from-blue-500/30 to-cyan-500/20',      // DGKO
    '#00D4FF': 'from-cyan-400/30 to-purple-500/20',    // BABYDGKO
    '#7C3AED': 'from-purple-500/30 to-pink-500/20',    // KLV
    '#F59E0B': 'from-amber-500/30 to-orange-500/20',   // KFI, DAXDO
    '#DC2626': 'from-red-500/30 to-orange-500/20',     // DRG
    '#EF4444': 'from-red-400/30 to-red-700/20',        // KUNAI
    '#22C55E': 'from-green-500/30 to-green-600/20',    // KID
    '#8B5CF6': 'from-violet-500/30 to-purple-600/20',  // GOAT
    '#F97316': 'from-orange-500/30 to-orange-600/20',  // CTR
    '#10B981': 'from-emerald-500/30 to-emerald-600/20', // KAKA
    '#854D0E': 'from-yellow-900/30 to-yellow-700/20',  // KONG
    '#0EA5E9': 'from-sky-500/30 to-sky-600/20',        // SAVO
    '#CA8A04': 'from-yellow-600/30 to-yellow-500/20',  // SHIT
    '#2775CA': 'from-blue-600/30 to-blue-400/20',      // USDC
  };
  
  return colorMap[token.color] || 'from-gray-500/30 to-gray-600/20';
}

/**
 * Check if a token is a stablecoin (pegged to $1)
 */
export function isStablecoin(symbolOrAssetId: string): boolean {
  const symbol = getTokenSymbol(symbolOrAssetId).toUpperCase();
  return symbol === 'USDT' || symbol === 'USDC';
}

/**
 * Get all active tokens
 */
export function getActiveTokens(): TokenConfig[] {
  return Object.values(TOKEN_REGISTRY)
    .filter(token => token.isActive)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

/**
 * Get all tokens (including inactive)
 */
export function getAllTokens(): TokenConfig[] {
  return Object.values(TOKEN_REGISTRY)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

/**
 * Format a raw amount to human-readable with proper decimals
 * 
 * @param rawAmount - Amount in smallest unit (e.g., 10000 for 1 DGKO)
 * @param symbolOrAssetId - Token symbol or asset ID
 * @returns Formatted string (e.g., "1.0000")
 */
export function formatTokenAmount(
  rawAmount: number | bigint, 
  symbolOrAssetId: string,
  options?: {
    showSymbol?: boolean;
    maxDecimals?: number;
  }
): string {
  const precision = getTokenPrecision(symbolOrAssetId);
  const decimals = getTokenDecimals(symbolOrAssetId);
  
  const amount = Number(rawAmount) / precision;
  const maxDecimals = options?.maxDecimals ?? decimals;
  
  const formatted = amount.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: maxDecimals,
  });
  
  if (options?.showSymbol) {
    const symbol = getTokenBySymbol(symbolOrAssetId)?.symbol || 
                   getTokenByAssetId(symbolOrAssetId)?.symbol ||
                   symbolOrAssetId.split('-')[0];
    return `${formatted} ${symbol}`;
  }
  
  return formatted;
}

/**
 * Parse a human-readable amount to raw amount
 * 
 * @param amount - Human-readable amount (e.g., 1.5)
 * @param symbolOrAssetId - Token symbol or asset ID
 * @returns Raw amount in smallest unit
 */
export function parseTokenAmount(
  amount: number | string, 
  symbolOrAssetId: string
): number {
  const precision = getTokenPrecision(symbolOrAssetId);
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  return Math.floor(numAmount * precision);
}

// ============================================================================
// Precision Reference Table (for documentation)
// ============================================================================

/**
 * PRECISION QUICK REFERENCE
 * 
 * Token      | Decimals | Precision    | Example Raw  | Example Display
 * -----------|----------|--------------|--------------|----------------
 * KLV        | 6        | 1,000,000    | 1000000      | 1.000000
 * DGKO       | 4        | 10,000       | 10000        | 1.0000
 * BABYDGKO   | 8        | 100,000,000  | 100000000    | 1.00000000
 * KFI        | 6        | 1,000,000    | 1000000      | 1.000000
 * DRG        | 6        | 1,000,000    | 1000000      | 1.000000
 * KUNAI      | 6        | 1,000,000    | 1000000      | 1.000000
 * KID        | 3        | 1,000        | 1000         | 1.000
 * DAXDO      | 8        | 100,000,000  | 100000000    | 1.00000000
 * GOAT       | 3        | 1,000        | 1000         | 1.000
 * CTR        | 6        | 1,000,000    | 1000000      | 1.000000
 * KAKA       | 0        | 1            | 1            | 1 (whole numbers)
 * KONG       | 3        | 1,000        | 1000         | 1.000
 * SAVO       | 3        | 1,000        | 1000         | 1.000
 * SHIT       | 6        | 1,000,000    | 1000000      | 1.000000
 * WSOL       | 8        | 100,000,000  | 100000000    | 1.00000000
 * USDT       | 6        | 1,000,000    | 1000000      | 1.000000
 * USDC       | 6        | 1,000,000    | 1000000      | 1.000000
 * PMD        | 0        | 1            | 1            | 1 (whole numbers)
 * CHIPS      | 6        | 1,000,000    | 1000000      | 1.000000
 * KPEPE      | 6        | 1,000,000    | 1000000      | 1.000000
 * MEME       | 6        | 1,000,000    | 1000000      | 1.000000
 * MOTO       | 8        | 100,000,000  | 100000000    | 1.00000000
 * PHARAO     | 6        | 1,000,000    | 1000000      | 1.000000
 * SAME       | 6        | 1,000,000    | 1000000      | 1.000000
 * VLX        | 6        | 1,000,000    | 1000000      | 1.000000
 * KIRA       | 3        | 1,000        | 1000         | 1.000
 * XPORT      | 6        | 1,000,000    | 1000000      | 1.000000
 * BPGOK      | 8        | 100,000,000  | 100000000    | 1.00000000
 * 
 * FORMULA: humanReadable = rawAmount / precision
 * FORMULA: rawAmount = humanReadable * precision
 */
