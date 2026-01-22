/**
 * Social Media Builder Types
 * 
 * Type definitions for the social media image builder
 * 
 * IMPORTANT: Tokens are automatically loaded from the central TOKEN_REGISTRY
 * in src/config/tokens.ts. No need to manually add tokens here.
 */

import { getActiveTokens, type TokenConfig } from '@/config/tokens';

export type TemplateType = 
  | 'new-pair'
  | 'apr-promotion'
  | 'listing'
  | 'announcement'
  | 'milestone'
  | 'season-announcement';

export type ImageSize = '1200x630' | '1080x1080' | '1200x1200' | '1920x1080';

export type GridStyle = 'none' | 'perspective' | 'isometric' | 'horizontal' | 'radial' | 'hex';

export interface GridOptions {
  style: GridStyle;
  opacity: number;  // 0-100
  density: number;  // 1-3 (sparse, normal, dense)
}

export interface TokenInfo {
  symbol: string;
  name: string;
  color: string;
  /** Asset ID for fetching logo from Klever API */
  assetId?: string;
  /** Manual override logo URL (used if API fetch fails) */
  logoUrl?: string;
  /** Token precision (decimals) - e.g., 4 for DGKO, 6 for KLV, 8 for BABYDGKO */
  precision?: number;
}

export interface TemplateConfig {
  id: TemplateType;
  name: string;
  description: string;
  defaultSize: ImageSize;
  fields: TemplateField[];
}

export interface TemplateField {
  id: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'color' | 'token';
  placeholder?: string;
  defaultValue?: string | number;
  options?: { value: string; label: string }[];
  required?: boolean;
}

export interface TemplateData {
  template: TemplateType;
  size: ImageSize;
  fields: Record<string, string | number>;
  tokens: TokenInfo[];
  accentColor: string;
  showDisclaimer: boolean;
  grid: GridOptions;
}

export interface ImageDimensions {
  width: number;
  height: number;
}

export const IMAGE_SIZES: Record<ImageSize, ImageDimensions> = {
  '1200x630': { width: 1200, height: 630 },    // Twitter/LinkedIn
  '1080x1080': { width: 1080, height: 1080 },  // Instagram Square
  '1200x1200': { width: 1200, height: 1200 },  // High-res Square
  '1920x1080': { width: 1920, height: 1080 },  // HD Banner
};

/**
 * Convert TokenConfig to TokenInfo for social media builder
 */
function toTokenInfo(config: TokenConfig): TokenInfo {
  return {
    symbol: config.symbol,
    name: config.name,
    color: config.color,
    assetId: config.assetIdMainnet,
  };
}

/**
 * PRESET_TOKENS - Automatically derived from TOKEN_REGISTRY
 * 
 * These tokens are loaded from the central token configuration
 * in src/config/tokens.ts. To add or modify tokens, update the
 * TOKEN_REGISTRY there - changes will automatically appear here.
 */
export const PRESET_TOKENS: TokenInfo[] = getActiveTokens().map(toTokenInfo);

/**
 * Generate unique accent colors from token registry + brand colors
 */
function generateAccentColors(): { value: string; label: string }[] {
  // Start with brand colors that aren't token-specific
  const brandColors = [
    { value: '#00C896', label: 'KuCoin Green' },
    { value: '#F0B90B', label: 'Binance Yellow' },
    { value: '#FF6B6B', label: 'Coral Red' },
  ];
  
  // Get unique colors from tokens
  const tokenColors = getActiveTokens().map(token => ({
    value: token.color,
    label: `${token.name} ${token.symbol}`,
  }));
  
  // Combine and deduplicate by color value
  const allColors = [...tokenColors, ...brandColors];
  const seen = new Set<string>();
  return allColors.filter(color => {
    if (seen.has(color.value)) return false;
    seen.add(color.value);
    return true;
  });
}

export const ACCENT_COLORS = generateAccentColors();

export const GRID_STYLES: { value: GridStyle; label: string; icon: string }[] = [
  { value: 'none', label: 'None', icon: '○' },
  { value: 'perspective', label: 'Perspective', icon: '◫' },
  { value: 'isometric', label: 'Isometric', icon: '◇' },
  { value: 'horizontal', label: 'Horizontal', icon: '☰' },
  { value: 'radial', label: 'Radial', icon: '◎' },
  { value: 'hex', label: 'Hexagonal', icon: '⬡' },
];

export const DEFAULT_GRID: GridOptions = {
  style: 'perspective',
  opacity: 30,
  density: 2,
};
