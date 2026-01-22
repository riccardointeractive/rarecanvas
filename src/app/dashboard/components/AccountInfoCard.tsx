'use client';

import { useState, useEffect } from 'react';
import { useKlever } from '@/context/KleverContext';
import { ExternalLink, Hash, Calendar } from 'lucide-react';

/**
 * AccountInfoCard Component
 * Displays generic account info - transactions count and creation date
 */
export function AccountInfoCard() {
  const { address, isConnected } = useKlever();
  const [accountData, setAccountData] = useState<{
    nonce: number;
    createdAt: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAccountData() {
      if (!isConnected || !address) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`https://api.mainnet.klever.org/v1.0/address/${address}`);
        if (!response.ok) throw new Error('Failed to fetch');
        
        const data = await response.json();
        const account = data?.data?.account;

        if (account) {
          setAccountData({
            nonce: account.nonce || 0,
            createdAt: account.timestamp || 0,
          });
        }
      } catch (err) {
        console.error('Error fetching account data:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchAccountData();
  }, [address, isConnected]);

  const formatDate = (timestamp: number) => {
    if (!timestamp) return 'Unknown';
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="flex items-center justify-between p-3 md:p-4 rounded-xl md:rounded-2xl bg-overlay-default border border-border-default">
      {/* Account Info */}
      <div className="flex items-center gap-4 md:gap-6">
        {/* Transactions */}
        <div className="flex items-center gap-2">
          <Hash className="w-4 h-4 text-text-secondary" />
          <div>
            <div className="text-2xs md:text-xs text-text-muted">Transactions</div>
            <div className="text-sm md:text-base text-text-primary font-mono">
              {loading ? '—' : (accountData?.nonce?.toString() || '0')}
            </div>
          </div>
        </div>

        {/* Account Created */}
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-text-secondary" />
          <div>
            <div className="text-2xs md:text-xs text-text-muted">Created</div>
            <div className="text-sm md:text-base text-text-primary">
              {loading ? '—' : formatDate(accountData?.createdAt || 0)}
            </div>
          </div>
        </div>
      </div>

      {/* Explorer Link */}
      <a
        href={`https://kleverscan.org/account/${address}`}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 rounded-lg hover:bg-overlay-active text-text-secondary hover:text-text-primary transition-all"
        title="View on Explorer"
      >
        <ExternalLink className="w-4 h-4" />
      </a>
    </div>
  );
}
