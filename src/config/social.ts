/**
 * Social Links Configuration
 * Centralized management of all social media links for Rare Canvas
 *
 * @fileoverview Single source of truth for social media URLs across the platform
 */

export const SOCIAL_LINKS = {
  /**
   * Rare Canvas Social Links
   */
  RARECANVAS: {
    X: 'https://x.com/RareCanvasIO',
    LINKEDIN: 'https://www.linkedin.com/company/rarecanvas/',
    TELEGRAM: 'https://t.me/RareCanvasCommunity',
  },
} as const;

/**
 * Type-safe access to social links
 */
export type SocialPlatform = 'X' | 'LINKEDIN' | 'TELEGRAM';
export type TokenType = 'RARECANVAS';
