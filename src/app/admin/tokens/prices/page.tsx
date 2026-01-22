'use client';

import { useState, useEffect } from 'react';
import { RefreshCw, ExternalLink, Info } from 'lucide-react';
import { TokenImage } from '@/components/TokenImage';
import { RefreshButton } from '@/components/RefreshButton';
import { isSessionValidSync, isSessionValid } from '../../utils/adminAuth.secure';
import { LoginFormSecure as LoginForm } from '../../components/LoginForm.secure';
import { AdminLayout } from '../../components/AdminLayout';
import { AdminPageHeader } from '../../components/AdminPageHeader';
import { Card, Alert, StatusBadge } from '@/components/ui';
import { useKlever } from '@/context/KleverContext';
import { useTokenPricesContext } from '@/context/TokenPricesContext';
import { formatUSD, formatReserve } from '@/utils/formatters';

/**
 * Admin Token Prices Dashboard
 * 
 * Uses the centralized TokenPricesContext for all pricing data.
 * 
 * HOW PRICES WORK:
 * 1. KLV: Fetched from CoinGecko (external USD anchor)
 * 2. Any TOKEN/KLV pair: USD calculated from pool reserves
 *    Formula: Token USD = (KLV Reserve / Token Reserve) × KLV USD
 * 
 * @see /src/context/TokenPricesContext.tsx (source of truth)
 */

export default function TokenPricesAdmin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const { network } = useKlever();
  const { 
    klvPrice, 
    tokenPrices, 
    loading, 
    error, 
    refresh,
    lastUpdate 
  } = useTokenPricesContext();

  useEffect(() => {
    const syncValid = isSessionValidSync();
    setIsAuthenticated(syncValid);
    if (syncValid) {
      isSessionValid().then(valid => { if (!valid) setIsAuthenticated(false); });
    }
    setIsLoading(false);
  }, []);

  // Format KLV price ratios (different from KLV amounts)
  const formatKLVRatio = (value: number) => {
    if (value === 0) return '0';
    if (value < 0.000001) return value.toFixed(10);
    if (value < 0.01) return value.toFixed(6);
    return value.toFixed(4);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass rounded-2xl border border-border-default p-8">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
            <div className="text-text-primary font-medium">Loading...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginForm onSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <AdminLayout onLogout={() => setIsAuthenticated(false)}>
      <div className="space-y-8">
        <AdminPageHeader
          title="Token Prices"
          description="Real-time token prices from DEX pool reserves"
          backHref="/admin/tokens"
          backLabel="Back"
          actions={
            <RefreshButton
              onClick={() => refresh()}
              isLoading={loading}
              title="Refresh prices"
            />
          }
        />

        {/* How It Works */}
        <Card className="p-6 border-blue-500/20 bg-blue-500/5">
          <div className="flex items-start gap-4">
            <div className="p-2 rounded-lg bg-info/10">
              <Info className="w-5 h-5 text-info" />
            </div>
            <div className="flex-1 space-y-2">
              <h3 className="text-text-primary font-medium">Price Derivation Hierarchy</h3>
              <div className="text-sm text-text-secondary space-y-1">
                <p><strong className="text-success">Tier 1 (KLV pairs):</strong> Direct USD from CoinGecko × pool ratio</p>
                <p><strong className="text-info">Tier 2 (DGKO pairs):</strong> Derived via DGKO price (from DGKO/KLV)</p>
                <p><strong className="text-cyan-400">Tier 3 (BABYDGKO pairs):</strong> Derived via BABYDGKO price (from BABYDGKO/KLV)</p>
                <p className="font-mono text-xs mt-2 text-text-muted">
                  Token USD = (Anchor Reserve ÷ Token Reserve) × Anchor USD
                </p>
              </div>
            </div>
          </div>
        </Card>

        {error && (
          <Alert variant="error" title="Error">
            {error}
          </Alert>
        )}

        {loading && !klvPrice ? (
          <Card className="p-12">
            <div className="flex flex-col items-center justify-center">
              <RefreshCw className="w-8 h-8 text-brand-primary animate-spin mb-4" />
              <p className="text-text-secondary">Loading price data...</p>
            </div>
          </Card>
        ) : (
          <>
            {/* KLV Base Price Card */}
            {klvPrice && (
              <Card className="p-6">
                <h2 className="text-lg font-medium text-text-primary mb-4">Base Currency</h2>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <TokenImage assetId="KLV" size="lg" />
                    <div>
                      <div className="text-text-primary font-medium text-lg">KLV</div>
                      <div className="text-text-secondary text-sm">Klever (USD Anchor)</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-mono font-semibold text-text-primary">
                      {formatUSD(klvPrice.priceUSD)}
                    </div>
                    <div className="flex items-center justify-end gap-3 mt-1">
                      <StatusBadge 
                        status={klvPrice.source !== 'error' ? 'active' : 'error'} 
                        label={klvPrice.source === 'cache' ? 'Cached' : klvPrice.source === 'fresh' ? 'Live' : 'Error'} 
                      />
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* DEX Token Prices Table */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-text-primary">DEX Token Prices</h2>
                <span className="text-sm text-text-muted">{tokenPrices.length} tokens priced</span>
              </div>
              <Card className="overflow-hidden">
                {tokenPrices.length === 0 ? (
                  <div className="p-12 text-center text-text-secondary">
                    No active trading pairs. Add pairs in <a href="/admin/trading-pairs" className="text-brand-primary hover:underline">Trading Pairs</a>.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-overlay-subtle">
                        <tr>
                          <th className="text-left px-4 py-3 text-sm font-medium text-text-secondary">Token</th>
                          <th className="text-right px-4 py-3 text-sm font-medium text-text-secondary">USD Price</th>
                          <th className="text-right px-4 py-3 text-sm font-medium text-text-secondary">KLV Price</th>
                          <th className="text-right px-4 py-3 text-sm font-medium text-text-secondary hidden md:table-cell">Pool Reserves</th>
                          <th className="text-left px-4 py-3 text-sm font-medium text-text-secondary">Source</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {tokenPrices.map((token) => {
                          // Determine tier color based on derivedFrom
                          const tierColor = token.derivedFrom === 'KLV' 
                            ? 'text-success' 
                            : token.derivedFrom === 'DGKO' 
                              ? 'text-info' 
                              : token.derivedFrom === 'BABYDGKO'
                                ? 'text-cyan-400'
                                : 'text-text-secondary';
                          const tierLabel = token.derivedFrom 
                            ? `via ${token.derivedFrom}` 
                            : token.source === 'error' ? 'Error' : 'Unknown';
                          
                          return (
                            <tr key={token.assetId} className="hover:bg-overlay-subtle transition-colors">
                              <td className="px-4 py-4">
                                <div className="flex items-center gap-3">
                                  <TokenImage assetId={token.assetId} size="sm" />
                                  <div>
                                    <div className="text-text-primary font-medium">{token.symbol}</div>
                                    <div className="text-text-muted text-xs">{token.poolData?.pairName || token.assetId}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-4 text-right">
                                <span className={`font-mono ${token.priceUSD > 0 ? 'text-text-primary' : 'text-error'}`}>
                                  {formatUSD(token.priceUSD)}
                                </span>
                              </td>
                              <td className="px-4 py-4 text-right">
                                <span className={`font-mono ${token.priceKLV > 0 ? 'text-brand-primary' : 'text-error'}`}>
                                  {formatKLVRatio(token.priceKLV)}
                                </span>
                              </td>
                              <td className="px-4 py-4 text-right hidden md:table-cell">
                                {token.poolData && token.poolData.baseReserve > 0 ? (
                                  <div className="text-xs text-text-secondary font-mono">
                                    <span>{formatReserve(token.poolData.baseReserve)}</span>
                                    <span className="mx-1">/</span>
                                    <span>{formatReserve(token.poolData.quoteReserve)}</span>
                                  </div>
                                ) : (
                                  <span className="text-text-muted">—</span>
                                )}
                              </td>
                              <td className="px-4 py-4">
                                <span className={`text-xs font-medium ${tierColor}`}>
                                  {tierLabel}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card>
            </div>

            {/* Technical Info */}
            <Card className="p-6">
              <h2 className="text-lg font-medium text-text-primary mb-4">Technical Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="text-text-muted mb-1">Network</div>
                  <div className="flex items-center gap-2">
                    <StatusBadge 
                      status={network === 'mainnet' ? 'active' : 'pending'} 
                      label={network === 'mainnet' ? 'Mainnet' : 'Testnet'} 
                    />
                  </div>
                </div>
                <div>
                  <div className="text-text-muted mb-1">Last Update</div>
                  <div className="text-text-secondary font-mono text-xs">
                    {lastUpdate ? new Date(lastUpdate).toLocaleString() : '—'}
                  </div>
                </div>
                <div>
                  <div className="text-text-muted mb-1">Data Source</div>
                  <a 
                    href="https://www.coingecko.com/en/coins/klever" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-brand-primary hover:underline flex items-center gap-1"
                  >
                    CoinGecko <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </Card>

            {/* Info Note */}
            <Card className="p-4 bg-black/20">
              <div className="flex items-center gap-2 text-xs text-text-muted">
                <span>💡</span>
                <span>Tokens are automatically priced if they have a pair with KLV, DGKO, or BABYDGKO. Add pairs in <a href="/admin/trading-pairs" className="text-brand-primary hover:underline">Trading Pairs</a>.</span>
              </div>
            </Card>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
