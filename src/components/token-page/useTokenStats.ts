import { useState, useEffect } from 'react';
import { TokenStats } from './types';

/**
 * Custom hook for fetching token statistics from Klever API
 * Works with any KDA token given its assetId and precision
 */
export function useTokenStats(
  assetId: string,
  precision: number,
  network: 'mainnet' | 'testnet' = 'mainnet'
) {
  const [stats, setStats] = useState<TokenStats>({
    totalSupply: '—',
    circulatingSupply: '—',
    stakingHolders: 0,
    totalStaked: '—',
    stakedPercent: 0,
    apr: 0,
    burned: '—',
    minted: '—',
  });
  const [loading, setLoading] = useState(true);

  const fetchTokenStats = async () => {
    try {
      setLoading(true);
      
      const apiUrl = network === 'mainnet' 
        ? `https://api.mainnet.klever.org/v1.0/assets/${assetId}`
        : `https://api.testnet.klever.org/v1.0/assets/${assetId}`;
      
      const response = await fetch(apiUrl);
      
      if (response.ok) {
        const data = await response.json();
        const asset = data.data?.asset;
        
        if (asset) {
          const maxSupply = parseFloat(asset.maxSupply || '0') / precision;
          const circulatingSupply = parseFloat(asset.circulatingSupply || '0') / precision;
          const totalStaked = parseFloat(asset.staking?.totalStaked || '0') / precision;
          const burned = parseFloat(asset.burnedValue || '0') / precision;
          const minted = parseFloat(asset.mintedValue || '0') / precision;
          
          // Get current APR (last entry in apr array)
          const aprArray = asset.staking?.apr || [];
          const currentApr = aprArray.length > 0 
            ? aprArray[aprArray.length - 1].value / 100 
            : 0;
          
          // Calculate staked percentage
          const stakedPercent = circulatingSupply > 0 
            ? (totalStaked / circulatingSupply) * 100 
            : 0;
          
          setStats({
            totalSupply: maxSupply.toLocaleString('en-US', { maximumFractionDigits: 0 }),
            circulatingSupply: circulatingSupply.toLocaleString('en-US', { maximumFractionDigits: 0 }),
            stakingHolders: asset.stakingHolders || 0,
            totalStaked: totalStaked.toLocaleString('en-US', { maximumFractionDigits: 0 }),
            stakedPercent: Math.round(stakedPercent),
            apr: currentApr,
            burned: burned.toLocaleString('en-US', { maximumFractionDigits: 0 }),
            minted: minted.toLocaleString('en-US', { maximumFractionDigits: 0 }),
          });
        }
      }
    } catch (error) {
      console.error(`Error fetching ${assetId} token stats:`, error);
    } finally {
      setLoading(false);
    }
  };

  // fetchTokenStats uses assetId, precision, and network from the outer scope
  useEffect(() => {
    fetchTokenStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assetId, network]);

  return { stats, loading, refetch: fetchTokenStats };
}
