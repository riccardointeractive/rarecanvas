'use client';

/**
 * Token Price Hooks
 * 
 * Re-exports from TokenPricesContext for backward compatibility.
 * 
 * The actual price fetching logic is in:
 * @see /src/context/TokenPricesContext.tsx
 * 
 * USAGE:
 * import { useAllTokenPrices, useKLVPrice, useTokenPrice } from '@/hooks/useTokenPrices';
 */

// Re-export everything from context for backward compatibility
export {
  useTokenPricesContext,
  useAllTokenPrices,
  useKLVPrice,
  useTokenPrice,
  useTokenPriceUSD,
  type TokenPriceData,
} from '@/context/TokenPricesContext';

// Legacy export for components using useTokenPrices
export { useAllTokenPrices as useTokenPrices } from '@/context/TokenPricesContext';
