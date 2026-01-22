'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { TokenImage } from '@/components/TokenImage';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/Button';
import { APP_CONFIG } from '@/config/app';
import { useKlever } from '@/context/KleverContext';
import { useTokenPricesContext } from '@/context/TokenPricesContext';
import {
  AlertTriangle,
  ExternalLink,
  RefreshCw,
  Wallet,
  TrendingUp,
  Users,
  Clock,
  Check,
  X,
  Search,
  User,
  ArrowLeftRight
} from 'lucide-react';

// ============================================================================
// Types - Real data from Klever API
// ============================================================================

interface UserBalance {
  balance: string;
  balanceFormatted: string;
}

interface PriceData {
  priceKLV: number | null;
  priceUSD: number | null;
  klvPrice: number | null;
  poolId: string | null;
}

interface KleverAssetData {
  name: string;
  ticker: string;
  assetId: string;
  ownerAddress: string;
  precision: number;
  circulatingSupply: number;
  initialSupply: number;
  maxSupply: number;
  burnedValue: number;
  mintedValue: number;
  logo?: string;
  verified?: boolean;
  staking?: {
    totalStaked: number;
    interestType: string;
    apr: { timestamp: number; value: number }[];
    minEpochsToClaim: number;
    minEpochsToUnstake: number;
    minEpochsToWithdraw: number;
  };
  royalties?: {
    address: string;
    transferPercentage: { amount: number; percentage: number }[];
    marketPercentage: number;
    marketFixedAmount: number;
    itoPercentage: number;
    itoFixedAmount: number;
  };
  properties?: {
    canFreeze: boolean;
    canWipe: boolean;
    canPause: boolean;
    canMint: boolean;
    canBurn: boolean;
    canChangeOwner: boolean;
    canAddRoles: boolean;
  };
  attributes?: {
    isPaused: boolean;
    isNFTMintStopped: boolean;
  };
  uris?: { key: string; value: string }[];
}

interface Holder {
  address: string;
  balance: number;
  percentage?: number;
}

interface HoldersData {
  holders: Holder[];
  totalHolders: number;
}

interface Pool {
  poolID: string;
  assetA: string;
  assetB: string;
  ratioA?: number;
  ratioB?: number;
  totalLiquidity?: number;
  feeRate?: number;
  active?: boolean;
}

interface Transaction {
  hash: string;
  timestamp: number;
  sender: string;
  status: string;
  contract?: { typeString: string; parameter?: any }[];
  receipts?: any[];
}

interface GenericTokenPageProps {
  assetId: string;
}

// ============================================================================
// Helper Functions
// ============================================================================

const formatNumber = (num: number, precision: number = 0): string => {
  const adjusted = num / Math.pow(10, precision);
  if (adjusted >= 1e12) return (adjusted / 1e12).toFixed(2) + 'T';
  if (adjusted >= 1e9) return (adjusted / 1e9).toFixed(2) + 'B';
  if (adjusted >= 1e6) return (adjusted / 1e6).toFixed(2) + 'M';
  if (adjusted >= 1e3) return (adjusted / 1e3).toFixed(2) + 'K';
  return adjusted.toLocaleString(undefined, { maximumFractionDigits: 2 });
};

const formatAddress = (address: string): string => {
  if (!address) return '';
  return `${address.slice(0, 8)}...${address.slice(-6)}`;
};

const formatTimestamp = (timestamp: number): string => {
  const date = new Date(timestamp * 1000);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
};

// ============================================================================
// Component
// ============================================================================

export function GenericTokenPage({ assetId }: GenericTokenPageProps) {
  const { address, isConnected, connect, isConnecting } = useKlever();
  const { getPriceUSD, klvPrice } = useTokenPricesContext();
  const [tokenData, setTokenData] = useState<KleverAssetData | null>(null);
  const [holdersData, setHoldersData] = useState<HoldersData | null>(null);
  const [pools, setPools] = useState<Pool[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [userBalance, setUserBalance] = useState<UserBalance | null>(null);
  const [priceData, setPriceData] = useState<PriceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const network = APP_CONFIG.network.toLowerCase() as 'mainnet' | 'testnet';
  const apiBase = `https://api.${network}.klever.org/v1.0`;
  
  // Get price from context
  const tokenPriceUSD = getPriceUSD(assetId);
  void klvPrice; // Suppress unused warning

  // Fetch all token data
  const fetchAllData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // 1. Fetch basic asset info
      const assetResponse = await fetch(`${apiBase}/assets/${assetId}`);
      if (!assetResponse.ok) throw new Error('Failed to fetch token data');
      const assetData = await assetResponse.json();
      
      if (!assetData.data?.asset) {
        throw new Error('Token not found');
      }
      
      const asset = assetData.data.asset;
      setTokenData(asset);
      const precision = asset.precision || 0;

      // 2. Fetch holders - use limit=1 to just get total count efficiently
      const holdersPromise = fetch(`${apiBase}/assets/holders/${assetId}?limit=10`)
        .then(res => res.ok ? res.json() : null)
        .catch(() => null);

      // 3. Fetch ALL pools to find ones containing this token
      const poolsPromise = fetch(`${apiBase}/assets/pool/list?limit=100`)
        .then(res => res.ok ? res.json() : null)
        .catch(() => null);

      // 4. Fetch recent transactions involving owner
      const ownerAddress = asset.ownerAddress;
      const txPromise = ownerAddress 
        ? fetch(`${apiBase}/address/${ownerAddress}/transactions?limit=20`)
            .then(res => res.ok ? res.json() : null)
            .catch(() => null)
        : Promise.resolve(null);

      // 5. Fetch user's balance for this token (if connected)
      const userBalancePromise = (isConnected && address)
        ? fetch(`/api/account?address=${address}&network=${network}`)
            .then(res => res.ok ? res.json() : null)
            .catch(() => null)
        : Promise.resolve(null);

      // 6. Fetch KLV price from CoinGecko (for USD conversion)
      const klvPricePromise = fetch('/api/klv-price-history?days=1')
        .then(res => res.ok ? res.json() : null)
        .catch(() => null);

      // Wait for all parallel requests
      const [holdersResult, poolsResult, txResult, userAccountResult, klvPriceResult] = await Promise.all([
        holdersPromise,
        poolsPromise,
        txPromise,
        userBalancePromise,
        klvPricePromise,
      ]);

      // Process holders - get total from pagination
      if (holdersResult?.data) {
        const totalHolders = holdersResult.pagination?.totalRecords || 
                            holdersResult.data?.totalHolders ||
                            holdersResult.data?.holders?.length || 0;
        setHoldersData({
          holders: holdersResult.data.holders || [],
          totalHolders: totalHolders,
        });
      }

      // Process pools - filter for pools containing this token
      let relevantPools: Pool[] = [];
      if (poolsResult?.data?.pools) {
        relevantPools = poolsResult.data.pools.filter((pool: Pool) => 
          pool.assetA === assetId || pool.assetB === assetId
        );
        setPools(relevantPools);
      }

      // Process transactions
      if (txResult?.data?.transactions) {
        setTransactions(txResult.data.transactions.slice(0, 10));
      }

      // Process user's balance for this specific token
      if (userAccountResult?.data?.account?.assets) {
        const assets = userAccountResult.data.account.assets;
        const tokenAsset = assets[assetId];
        
        if (tokenAsset) {
          const rawBalance = tokenAsset.balance || '0';
          const balanceFormatted = (parseInt(rawBalance) / Math.pow(10, precision)).toLocaleString(undefined, {
            minimumFractionDigits: 0,
            maximumFractionDigits: Math.min(precision, 8),
          });
          
          setUserBalance({
            balance: rawBalance,
            balanceFormatted,
          });
        } else {
          setUserBalance({ balance: '0', balanceFormatted: '0' });
        }
      }

      // Calculate price from pools if available
      if (relevantPools.length > 0 && klvPriceResult?.data?.length > 0) {
        const klvPrice = klvPriceResult.data[klvPriceResult.data.length - 1]?.price || null;
        
        // Find a KLV pool for this token (best for price calculation)
        const klvPool = relevantPools.find(p => p.assetA === 'KLV' || p.assetB === 'KLV');
        
        if (klvPool && klvPool.ratioA && klvPool.ratioB) {
          // Calculate price in KLV
          // If token is assetB: priceKLV = ratioA / ratioB (how many KLV per token)
          // If token is assetA: priceKLV = ratioB / ratioA
          const isTokenAssetA = klvPool.assetA === assetId;
          const klvRatio = isTokenAssetA ? klvPool.ratioB : klvPool.ratioA;
          const tokenRatio = isTokenAssetA ? klvPool.ratioA : klvPool.ratioB;
          
          // Account for precision differences (KLV has 6 decimals)
          const priceKLV = (klvRatio / tokenRatio) * Math.pow(10, precision - 6);
          const priceUSD = klvPrice ? priceKLV * klvPrice : null;
          
          setPriceData({
            priceKLV,
            priceUSD,
            klvPrice,
            poolId: klvPool.poolID,
          });
        }
      }

    } catch (err) {
      console.error('Error fetching token data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load token data');
    } finally {
      setLoading(false);
    }
  }, [assetId, apiBase, address, isConnected, network]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen py-8 md:py-10 lg:py-12">
        <div className="max-w-dashboard mx-auto px-4 md:px-6 lg:px-8">
          <div className="bg-bg-surface rounded-xl p-5 md:p-6 border border-border-default">
            <div className="animate-pulse space-y-8">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-surface" />
                <div className="space-y-2">
                  <div className="h-8 bg-surface rounded w-48" />
                  <div className="h-4 bg-surface rounded w-32" />
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-24 bg-surface rounded-2xl" />
                ))}
              </div>
              <div className="h-64 bg-surface rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !tokenData) {
    return (
      <div className="min-h-screen py-8 md:py-10 lg:py-12">
        <div className="max-w-dashboard mx-auto px-4 md:px-6 lg:px-8">
          <div className="bg-bg-surface rounded-xl p-5 md:p-6 border border-border-default text-center">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-error-muted flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-error" strokeWidth={2} />
            </div>
            <h2 className="text-2xl font-medium text-text-primary mb-2">Token Not Found</h2>
            <p className="text-text-secondary">
              {error || `Could not find token with ID: ${assetId}`}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Get display values
  const displayName = tokenData.name || tokenData.ticker || assetId.split('-')[0];
  const ticker = (tokenData.ticker || assetId.split('-')[0] || assetId) as string;
  const precision = tokenData.precision || 0;
  
  // Calculate staking APR if available
  const stakingApr = tokenData.staking?.apr?.length
    ? (tokenData.staking.apr[tokenData.staking.apr.length - 1]?.value ?? 0) / 100
    : null;

  return (
    <div className="min-h-screen py-8 md:py-10 lg:py-12">
      <div className="max-w-dashboard mx-auto px-4 md:px-6 lg:px-8">
        
        {/* ================================================================ */}
        {/* Header */}
        {/* ================================================================ */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <TokenImage 
                assetId={assetId} 
                size="xl"
              />
              <div>
                <div className="flex items-center gap-3 mb-1 flex-wrap">
                  <h1 className="text-xl font-medium text-text-primary">{displayName}</h1>
                  {tokenData.verified && (
                    <Badge variant="success" size="sm">Verified</Badge>
                  )}
                  {tokenData.attributes?.isPaused && (
                    <Badge variant="warning" size="sm">Paused</Badge>
                  )}
                </div>
                <p className="text-base md:text-lg text-text-secondary font-mono">{assetId}</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-3">
              <a
                href={`https://explorer.${network}.klever.org/asset/${assetId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-subtle hover:bg-surface border border-border-default text-text-primary text-sm font-medium transition-all flex items-center gap-2"
              >
                <ExternalLink className="w-4 h-4" strokeWidth={2} />
                Explorer
              </a>
              <button
                onClick={fetchAllData}
                className="p-2 rounded-xl bg-subtle hover:bg-surface border border-border-default text-text-primary transition-all"
                title="Refresh data"
              >
                <RefreshCw className="w-5 h-5" strokeWidth={2} />
              </button>
            </div>
          </div>
        </div>

        {/* ================================================================ */}
        {/* Your Balance (if connected and has balance) */}
        {/* ================================================================ */}
        {isConnected && userBalance && (
          <div className="bg-bg-surface rounded-xl p-4 md:p-5 border border-border-default mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="text-sm text-text-secondary mb-1">Your Balance</div>
                <div className="text-3xl md:text-4xl font-medium text-text-primary">
                  {userBalance.balanceFormatted} <span className="text-xl text-text-secondary">{ticker}</span>
                </div>
                {/* Use DEX price if available, otherwise native pool price */}
                {(tokenPriceUSD > 0 || priceData?.priceUSD) && parseFloat(userBalance.balance) > 0 && (
                  <div className="text-lg text-text-secondary mt-1">
                    ≈ ${((parseFloat(userBalance.balance) / Math.pow(10, precision)) * (tokenPriceUSD > 0 ? tokenPriceUSD : priceData?.priceUSD || 0)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
                  </div>
                )}
              </div>
              
              {/* Quick actions for this token */}
              <div className="flex items-center gap-3">
                <Link
                  href="/dashboard"
                  className="px-4 py-2.5 rounded-xl bg-subtle hover:bg-surface border border-border-default text-text-primary text-sm font-medium transition-all"
                >
                  View All Assets
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Connect Wallet prompt if not connected */}
        {!isConnected && (
          <div className="bg-bg-surface rounded-xl p-4 border border-border-default mb-6 text-center">
            <div className="text-text-secondary mb-3">Connect your wallet to see your {ticker} balance</div>
            <Button
              variant="connect"
              onClick={connect}
              disabled={isConnecting}
            >
              <Wallet className="w-4 h-4" strokeWidth={2} />
              {isConnecting ? 'Connecting...' : 'Connect Wallet'}
            </Button>
          </div>
        )}

        {/* ================================================================ */}
        {/* Stats Grid */}
        {/* ================================================================ */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <div className="bg-bg-surface rounded-xl p-4 border border-border-default">
            <div className="text-sm text-text-secondary mb-1">Max Supply</div>
            <div className="text-lg font-medium text-text-primary">
              {formatNumber(tokenData.maxSupply, precision)}
            </div>
            <div className="text-xs text-text-muted mt-1 font-mono">{ticker}</div>
          </div>
          
          <div className="bg-bg-surface rounded-xl p-4 border border-border-default">
            <div className="text-sm text-text-secondary mb-1">Circulating</div>
            <div className="text-lg font-medium text-text-primary">
              {formatNumber(tokenData.circulatingSupply, precision)}
            </div>
            <div className="text-xs text-text-muted mt-1 font-mono">{ticker}</div>
          </div>
          
          <div className="bg-bg-surface rounded-xl p-4 border border-border-default">
            <div className="text-sm text-text-secondary mb-1">Burned</div>
            <div className="text-lg font-medium text-error">
              {formatNumber(tokenData.burnedValue, precision)}
            </div>
            <div className="text-xs text-text-muted mt-1 font-mono">{ticker}</div>
          </div>
          
          <div className="bg-bg-surface rounded-xl p-4 border border-border-default">
            <div className="text-sm text-text-secondary mb-1">Minted</div>
            <div className="text-lg font-medium text-success">
              {formatNumber(tokenData.mintedValue, precision)}
            </div>
            <div className="text-xs text-text-muted mt-1 font-mono">{ticker}</div>
          </div>
        </div>

        {/* ================================================================ */}
        {/* Staking Info (if token has staking) */}
        {/* ================================================================ */}
        {tokenData.staking && tokenData.staking.totalStaked > 0 && (
          <div className="bg-bg-surface rounded-xl p-4 md:p-5 border border-border-default mb-6">
            <h2 className="text-lg font-medium text-text-primary mb-4 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-brand-primary" strokeWidth={1.5} />
              Staking Information
            </h2>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-subtle">
                <div className="text-sm text-text-secondary mb-1">Total Staked</div>
                <div className="text-xl font-medium text-text-primary">
                  {formatNumber(tokenData.staking.totalStaked, precision)}
                </div>
              </div>
              
              {stakingApr !== null && (
                <div className="p-4 rounded-2xl bg-subtle">
                  <div className="text-sm text-text-secondary mb-1">Current APR</div>
                  <div className="text-xl font-medium text-success">
                    {stakingApr.toFixed(2)}%
                  </div>
                </div>
              )}
              
              <div className="p-4 rounded-2xl bg-subtle">
                <div className="text-sm text-text-secondary mb-1">Min Epochs to Claim</div>
                <div className="text-xl font-medium text-text-primary">
                  {tokenData.staking.minEpochsToClaim}
                </div>
              </div>
              
              <div className="p-4 rounded-2xl bg-subtle">
                <div className="text-sm text-text-secondary mb-1">Min Epochs to Unstake</div>
                <div className="text-xl font-medium text-text-primary">
                  {tokenData.staking.minEpochsToUnstake}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================ */}
        {/* Top Holders */}
        {/* ================================================================ */}
        {holdersData && holdersData.holders.length > 0 && (
          <div className="bg-bg-surface rounded-xl p-4 md:p-5 border border-border-default mb-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-medium text-text-primary flex items-center gap-3">
                <Users className="w-6 h-6 text-brand-primary" strokeWidth={1.5} />
                Top Holders
              </h2>
              <div className="text-sm text-text-secondary">
                {holdersData.totalHolders.toLocaleString()} total holders
              </div>
            </div>
            
            <div className="space-y-3">
              {holdersData.holders.slice(0, 10).map((holder, index) => (
                <a
                  key={holder.address}
                  href={`https://explorer.${network}.klever.org/account/${holder.address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-4 rounded-2xl bg-subtle hover:bg-surface border border-border-default hover:border-border-brand transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-brand-primary/20 flex items-center justify-center text-sm font-medium text-brand-primary">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-mono text-text-primary text-sm">{formatAddress(holder.address)}</div>
                      {holder.percentage !== undefined && (
                        <div className="text-xs text-text-muted">{holder.percentage.toFixed(2)}% of supply</div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-text-primary">
                      {formatNumber(holder.balance, precision)}
                    </div>
                    <div className="text-xs text-text-muted">{ticker}</div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* ================================================================ */}
        {/* Liquidity Pools */}
        {/* ================================================================ */}
        {pools.length > 0 && (
          <div className="bg-bg-surface rounded-xl p-4 md:p-5 border border-border-default mb-6">
            <h2 className="text-lg font-medium text-text-primary mb-4 flex items-center gap-2">
              <ArrowLeftRight className="w-6 h-6 text-brand-primary" strokeWidth={1.5} />
              Trading Pools
            </h2>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {pools.map((pool) => {
                const otherAsset = pool.assetA === assetId ? pool.assetB : pool.assetA;
                return (
                  <div
                    key={pool.poolID}
                    className="p-4 rounded-2xl bg-subtle border border-border-default"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex -space-x-2">
                        <TokenImage assetId={assetId} size="sm" />
                        <TokenImage assetId={otherAsset} size="sm" />
                      </div>
                      <div>
                        <div className="font-medium text-text-primary">{ticker} / {otherAsset.split('-')[0]}</div>
                        <div className="text-xs text-text-muted">
                          {pool.active !== false ? 'Active' : 'Inactive'}
                        </div>
                      </div>
                    </div>
                    {pool.feeRate !== undefined && (
                      <div className="text-sm text-text-secondary">
                        Fee: {(pool.feeRate / 100).toFixed(2)}%
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ================================================================ */}
        {/* Token Details */}
        {/* ================================================================ */}
        <div className="bg-bg-surface rounded-xl p-4 md:p-5 border border-border-default mb-6">
          <h2 className="text-lg font-medium text-text-primary mb-6">Token Details</h2>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex justify-between items-center py-3 border-b border-border-default">
              <span className="text-text-secondary">Name</span>
              <span className="text-text-primary font-medium">{tokenData.name || ticker}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-border-default">
              <span className="text-text-secondary">Ticker</span>
              <span className="text-text-primary font-medium">{ticker}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-border-default">
              <span className="text-text-secondary">Asset ID</span>
              <span className="text-text-primary font-mono text-sm">{assetId}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-border-default">
              <span className="text-text-secondary">Precision</span>
              <span className="text-text-primary font-mono">{precision} decimals</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-border-default">
              <span className="text-text-secondary">Blockchain</span>
              <span className="text-text-primary">Klever Blockchain</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-border-default">
              <span className="text-text-secondary">Type</span>
              <span className="text-text-primary">KDA (Klever Digital Asset)</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-border-default">
              <span className="text-text-secondary">Initial Supply</span>
              <span className="text-text-primary font-mono">{formatNumber(tokenData.initialSupply, precision)}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-border-default">
              <span className="text-text-secondary">Total Holders</span>
              <span className="text-text-primary font-mono">{holdersData?.totalHolders?.toLocaleString() || '—'}</span>
            </div>
          </div>
        </div>

        {/* ================================================================ */}
        {/* Token Properties */}
        {/* ================================================================ */}
        {tokenData.properties && (
          <div className="bg-bg-surface rounded-xl p-4 md:p-5 border border-border-default mb-6">
            <h2 className="text-lg font-medium text-text-primary mb-6">Token Properties</h2>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {Object.entries(tokenData.properties).map(([key, value]) => {
                const label = key.replace('can', 'Can ').replace(/([A-Z])/g, ' $1').trim();
                return (
                  <div
                    key={key}
                    className={`p-3 rounded-xl text-center ${
                      value 
                        ? 'bg-success-muted border border-border-success' 
                        : 'bg-subtle border border-border-default'
                    }`}
                  >
                    <div className={`text-sm font-medium ${value ? 'text-success' : 'text-text-muted'}`}>
                      {value ? '✓' : '✗'} {label}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ================================================================ */}
        {/* Recent Owner Transactions */}
        {/* ================================================================ */}
        {transactions.length > 0 && (
          <div className="bg-bg-surface rounded-xl p-4 md:p-5 border border-border-default mb-6">
            <h2 className="text-lg font-medium text-text-primary mb-4 flex items-center gap-2">
              <Clock className="w-6 h-6 text-brand-primary" strokeWidth={1.5} />
              Recent Owner Activity
            </h2>
            
            <div className="space-y-3">
              {transactions.map((tx) => (
                <a
                  key={tx.hash}
                  href={`https://explorer.${network}.klever.org/transaction/${tx.hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-4 rounded-2xl bg-subtle hover:bg-surface border border-border-default hover:border-border-brand transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      tx.status === 'success' ? 'bg-success-muted' : 'bg-error-muted'
                    }`}>
                      {tx.status === 'success' ? (
                        <Check className="w-5 h-5 text-success" strokeWidth={2} />
                      ) : (
                        <X className="w-5 h-5 text-error" strokeWidth={2} />
                      )}
                    </div>
                    <div>
                      <div className="font-mono text-text-primary text-sm">{formatAddress(tx.hash)}</div>
                      <div className="text-xs text-text-muted">
                        {tx.contract?.[0]?.typeString || 'Transaction'}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-text-secondary">{formatTimestamp(tx.timestamp)}</div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* ================================================================ */}
        {/* External Links */}
        {/* ================================================================ */}
        <div className="bg-bg-surface rounded-xl p-4 md:p-5 border border-border-default">
          <h2 className="text-lg font-medium text-text-primary mb-6">Explore More</h2>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <a
              href={`https://explorer.${network}.klever.org/asset/${assetId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-4 rounded-2xl bg-subtle hover:bg-surface border border-border-default hover:border-border-brand transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center">
                  <Search className="w-5 h-5 text-brand-primary" strokeWidth={2} />
                </div>
                <div>
                  <div className="font-medium text-text-primary">Token on Explorer</div>
                  <div className="text-sm text-text-secondary">View full asset details</div>
                </div>
              </div>
              <ExternalLink className="w-5 h-5 text-text-secondary group-hover:text-text-primary transition-colors" strokeWidth={2} />
            </a>

            <a
              href={`https://explorer.${network}.klever.org/account/${tokenData.ownerAddress}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-4 rounded-2xl bg-subtle hover:bg-surface border border-border-default hover:border-border-brand transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-info-muted flex items-center justify-center">
                  <User className="w-5 h-5 text-brand-primary" strokeWidth={2} />
                </div>
                <div>
                  <div className="font-medium text-text-primary">Token Owner</div>
                  <div className="text-sm text-text-secondary">{formatAddress(tokenData.ownerAddress)}</div>
                </div>
              </div>
              <ExternalLink className="w-5 h-5 text-text-secondary group-hover:text-text-primary transition-colors" strokeWidth={2} />
            </a>

            <a
              href={`https://explorer.${network}.klever.org/assets/holders/${assetId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-4 rounded-2xl bg-subtle hover:bg-surface border border-border-default hover:border-border-brand transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-brand-primary" strokeWidth={2} />
                </div>
                <div>
                  <div className="font-medium text-text-primary">All Holders</div>
                  <div className="text-sm text-text-secondary">View complete holder list</div>
                </div>
              </div>
              <ExternalLink className="w-5 h-5 text-text-secondary group-hover:text-text-primary transition-colors" strokeWidth={2} />
            </a>
          </div>
        </div>

        {/* ================================================================ */}
        {/* Footer - Last Updated */}
        {/* ================================================================ */}
        <div className="mt-8 text-center text-sm text-text-muted">
          Data fetched from Klever {network.charAt(0).toUpperCase() + network.slice(1)} API
        </div>

      </div>
    </div>
  );
}
