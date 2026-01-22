/**
 * Formatters - SINGLE SOURCE OF TRUTH
 * 
 * All number/currency formatting functions live here.
 * Do NOT create local formatKLV functions in components!
 * 
 * @see PROJECT_RULES.md - Centralized Configuration
 */

import { KLEVER_DECIMALS } from './constants';

// ============================================================================
// KLV Formatters
// ============================================================================

/**
 * Format KLV for standard display (with commas)
 * @param amount - Human-readable amount (not kaons)
 * @param maxDecimals - Maximum decimal places (default: 2)
 * @returns Formatted string like "1,234.56"
 */
export function formatKLV(amount: number, maxDecimals: number = 2): string {
  return amount.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: maxDecimals,
  });
}

/**
 * Format KLV in compact notation (K, M, B suffixes)
 * Best for displaying large amounts in limited space
 * @param amount - Human-readable amount
 * @returns Formatted string like "1.2M" or "500K"
 */
export function formatKLVCompact(amount: number): string {
  if (amount >= 1_000_000_000) {
    return `${(amount / 1_000_000_000).toFixed(1)}B`;
  }
  if (amount >= 1_000_000) {
    return `${(amount / 1_000_000).toFixed(1)}M`;
  }
  if (amount >= 1_000) {
    return `${(amount / 1_000).toFixed(1)}K`;
  }
  return amount.toLocaleString('en-US', { maximumFractionDigits: 2 });
}

/**
 * Format KLV with high precision (for rewards, small amounts)
 * @param amount - Human-readable amount
 * @param minDecimals - Minimum decimal places (default: 2)
 * @param maxDecimals - Maximum decimal places (default: 6)
 * @returns Formatted string like "0.001234"
 */
export function formatKLVPrecise(
  amount: number, 
  minDecimals: number = 2, 
  maxDecimals: number = 6
): string {
  return amount.toLocaleString('en-US', {
    minimumFractionDigits: minDecimals,
    maximumFractionDigits: maxDecimals,
  });
}

/**
 * Convert raw kaons to human-readable KLV and format
 * @param kaons - Raw blockchain amount (smallest unit)
 * @param precision - Decimal places of the token (default: 6 for KLV)
 * @returns Formatted human-readable string
 */
export function formatKLVFromKaons(kaons: number, precision: number = KLEVER_DECIMALS): string {
  const klv = kaons / Math.pow(10, precision);
  return klv.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

/**
 * Format KLV with always 2 decimal places
 * @param amount - Human-readable amount
 * @returns Formatted string like "1,234.00"
 */
export function formatKLVFull(amount: number): string {
  return amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

// ============================================================================
// Price Formatters
// ============================================================================

/**
 * Format USD price (handles very small values)
 * @param price - USD price
 * @returns Formatted string
 */
export function formatUSD(price: number): string {
  if (price === 0) return '$0';
  if (price < 0.000001) return `$${price.toFixed(10)}`;
  if (price < 0.01) return `$${price.toFixed(6)}`;
  if (price < 1) return `$${price.toFixed(4)}`;
  return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/**
 * Format reserve/liquidity amounts (compact)
 * @param value - Amount
 * @returns Formatted string like "1.5M"
 */
export function formatReserve(value: number): string {
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(2)}B`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(2)}K`;
  return value.toLocaleString('en-US', { maximumFractionDigits: 2 });
}

// ============================================================================
// Generic Number Formatters
// ============================================================================

/**
 * Format any number with commas
 * @param value - Number to format
 * @param decimals - Decimal places (default: 2)
 */
export function formatNumber(value: number, decimals: number = 2): string {
  return value.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  });
}

/**
 * Format percentage
 * @param value - Percentage value (e.g., 10 for 10%)
 * @param decimals - Decimal places (default: 2)
 */
export function formatPercent(value: number, decimals: number = 2): string {
  return `${value.toFixed(decimals)}%`;
}
