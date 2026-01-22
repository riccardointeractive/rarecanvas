'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { useTokenBalances } from '../hooks/useTokenBalances';
import { TokenImage } from '@/components/TokenImage';
import { Badge } from '@/components/ui';
import { useNetworkTokens } from '@/context/NetworkTokensContext';
import { useTokenPricesContext } from '@/context/TokenPricesContext';
import { useViewPrices } from '@/hooks/useDexScan';

/**
 * All Token Balances Component
 * 
 * Single unified list of all tokens with:
 * - Real token images from Klever API
 * - Available balances only (staked shown in Staking Overview)
 * - USD values and token prices
 * - Price change indicator (green/red badge) from VIEW PRICES (DEXscan)
 * - "Not listed" badge for tokens without DEX pairs
 */
export function AllTokenBalances() {
  const { tokens, loading, error } = useTokenBalances();
  const { getTokenByAssetId } = useNetworkTokens();
  const { klvPrice } = useTokenPricesContext();
  
  // VIEW PRICES from DEXscan - includes 24h change data
  const { data: viewPrices } = useViewPrices();

  // Get KLV 24h change from context (from CoinGecko)
  const klvChange24h = klvPrice?.priceChange24h ?? null;

  // Get 24h price change from VIEW PRICES (DEXscan)
  // Much more accurate than calculating from individual swap history
  const getChange24h = useMemo(() => {
    return (assetId: string): number | null => {
      // KLV uses CoinGecko data from context
      if (assetId === 'KLV') return klvChange24h;
      
      if (!viewPrices) return null;
      
      const baseSymbol = assetId.split('-')[0] || assetId;
      
      // Try by full assetId first, then by symbol
      const viewPrice = viewPrices[assetId] || viewPrices[baseSymbol];
      
      if (viewPrice && typeof viewPrice.priceChange24h === 'number') {
        return viewPrice.priceChange24h;
      }
      
      return null;
    };
  }, [viewPrices, klvChange24h]);

  if (loading) {
    return (
      <div className="space-y-2 md:space-y-3">
        <h3 className="text-base md:text-lg font-medium text-text-primary mb-3 md:mb-4">Your Tokens</h3>
        {[1, 2, 3].map(i => (
          <div key={i} className="h-14 md:h-16 bg-overlay-default rounded-xl md:rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h3 className="text-base md:text-lg font-medium text-text-primary mb-3 md:mb-4">Your Tokens</h3>
        <div className="text-error text-sm p-4 rounded-xl bg-error-muted border border-border-error">{error}</div>
      </div>
    );
  }

  // Helper function to get token display name (network-aware)
  const getTokenName = (assetId: string): string => {
    const tokenInfo = getTokenByAssetId(assetId);
    if (tokenInfo) {
      return tokenInfo.displaySymbol || tokenInfo.symbol || assetId.split('-')[0] || assetId;
    }
    if (assetId === 'KLV') return 'Klever';
    if (assetId === 'USDT-ODW7') return 'USDT';
    if (assetId === 'KFI-2GEX') return 'KFI';
    if (assetId === 'DVK-41F1') return 'DVK';
    return assetId.split('-')[0] || assetId;
  };

  // Helper function to get token link
  const getTokenLink = (assetId: string): string => {
    return `/token/${encodeURIComponent(assetId)}`;
  };

  // Format USD value - gray/white only
  const formatUSD = (value: number): string => {
    if (value === 0) return '—';
    if (value < 0.01) return '<$0.01';
    if (value >= 1000) return `$${(value / 1000).toFixed(2)}K`;
    return `$${value.toFixed(2)}`;
  };

  // Format token price with appropriate precision
  // Uses compact notation $0.(5)37395 for micro-prices (same as SwapPriceChart)
  const formatTokenPrice = (price: number): string => {
    if (price === 0) return '';
    if (price >= 1) return `$${price.toFixed(2)}`;
    if (price >= 0.01) return `$${price.toFixed(4)}`;
    if (price >= 0.0001) return `$${price.toFixed(6)}`;
    
    // Compact notation for micro-prices: $0.(5)37395
    const priceStr = price.toFixed(20);
    const afterDecimal = priceStr.split('.')[1] || '';
    let zeroCount = 0;
    for (const char of afterDecimal) {
      if (char === '0') zeroCount++;
      else break;
    }
    const significantPart = afterDecimal.slice(zeroCount, zeroCount + 5);
    return `$0.(${zeroCount})${significantPart}`;
  };

  // Get price change for a token (uses VIEW PRICES)
  const getChange = (assetId: string): number | null => {
    return getChange24h(assetId);
  };

  // Filter out zero balances
  const nonZeroTokens = tokens.filter(t => parseFloat(t.balanceFormatted) > 0);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-3 md:mb-4">
        <h3 className="text-base md:text-lg font-medium text-text-primary">Your Tokens</h3>
        <span className="text-xs md:text-sm text-text-muted">
          {nonZeroTokens.length} {nonZeroTokens.length === 1 ? 'token' : 'tokens'}
        </span>
      </div>

      {/* Empty state */}
      {nonZeroTokens.length === 0 ? (
        <div className="text-center py-6 md:py-8 rounded-xl bg-overlay-default border border-border-default">
          <div className="text-text-secondary mb-2 text-sm md:text-base">No tokens found</div>
          <div className="text-xs md:text-sm text-text-muted">Your wallet is empty</div>
        </div>
      ) : (
        <div className="space-y-2 md:space-y-3">
          {/* Single unified token list */}
          {nonZeroTokens.map((token) => {
            const tokenName = getTokenName(token.assetId);
            const tokenLink = getTokenLink(token.assetId);
            const hasPrice = token.priceUSD > 0;
            const change = getChange(token.assetId);
            const isPositive = change !== null && change >= 0;
            
            return (
              <Link
                key={token.assetId}
                href={tokenLink}
                className="flex items-center justify-between gap-3 md:gap-4 p-3 md:p-4 rounded-xl md:rounded-2xl bg-overlay-default border border-border-default hover:bg-overlay-active hover:border-border-default transition-all group"
              >
                {/* Token Icon & Name */}
                <div className="flex items-center gap-2.5 md:gap-3 flex-1 min-w-0">
                  <TokenImage 
                    assetId={token.assetId} 
                    size="sm"
                  />
                  <div className="min-w-0">
                    <div className="font-medium text-text-primary text-sm md:text-base">
                      {tokenName}
                    </div>
                    {/* Show token price with change badge, or "not listed" badge */}
                    {hasPrice ? (
                      <div className="flex items-center gap-1.5">
                        <span className="text-2xs md:text-xs text-text-muted font-mono">
                          {formatTokenPrice(token.priceUSD)}
                        </span>
                        {/* Price change badge - same pattern as SwapPriceChart */}
                        {change !== null && (
                          <Badge 
                            variant={isPositive ? 'success' : 'error'} 
                            size="sm"
                          >
                            {isPositive ? '+' : ''}{change.toFixed(2)}%
                          </Badge>
                        )}
                      </div>
                    ) : (
                      <Badge variant="neutral" size="sm">
                        not listed
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Balance & Value - no colors, gray/white only */}
                <div className="text-right flex-shrink-0">
                  <div className="font-mono text-text-primary text-sm md:text-base">
                    {parseFloat(token.balanceFormatted).toLocaleString()}
                  </div>
                  <div className="text-xs md:text-sm font-mono text-text-secondary">
                    {formatUSD(token.valueUSD)}
                  </div>
                </div>

                {/* Arrow */}
                <ChevronRight className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0 text-text-muted group-hover:text-text-primary transition-colors" />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
