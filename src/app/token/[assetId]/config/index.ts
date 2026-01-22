/**
 * Token Configurations Index
 *
 * Generic token page configuration - all tokens use the GenericTokenPage
 * which fetches data from Klever API.
 */

import { TokenPageConfig } from '@/components/token-page';

export const TOKEN_CONFIGS: Record<string, TokenPageConfig> = {};

/**
 * Check if a token has a custom config
 */
export function hasCustomConfig(assetId: string): boolean {
  return assetId in TOKEN_CONFIGS;
}

/**
 * Get custom config for a token
 */
export function getTokenConfig(assetId: string): TokenPageConfig | null {
  return TOKEN_CONFIGS[assetId] || null;
}
