'use client';

import { useState, useEffect, useCallback } from 'react';
import { useKlever } from '@/context/KleverContext';
import { getTokenDecimals } from '@/config/tokens';
import { ArrowUpRight, ArrowDownLeft, Lock, Unlock, Gift, Zap, ExternalLink, RefreshCw } from 'lucide-react';

interface Transaction {
  hash: string;
  type: string;
  from: string;
  to?: string;
  amount: string;
  assetId: string;
  timestamp: number;
  status: string;
}

/**
 * Recent Transactions Component
 * FLAT design - no nested cards, gray/white text only
 * Shows 10 transactions, both sent and received
 */
export function RecentTransactions() {
  const { address, isConnected } = useKlever();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const parseTransaction = useCallback((tx: any, userAddress: string): Transaction => {
    let type = 'Transaction';
    let amount = '0';
    let assetId = 'KLV';
    let to = '';

    if (tx.contract && tx.contract.length > 0) {
      const contract = tx.contract[0];
      const param = contract.parameter || {};
      
      switch (contract.type) {
        case 0: // Transfer
          type = tx.sender === userAddress ? 'Send' : 'Receive';
          amount = param.amount?.toString() || '0';
          assetId = param.assetId || 'KLV';
          to = param.toAddress || '';
          break;
        case 4: // Freeze (Stake)
          type = 'Stake';
          amount = param.amount?.toString() || '0';
          assetId = param.assetId || 'KLV';
          break;
        case 5: // Unfreeze (Unstake)
          type = 'Unstake';
          assetId = param.assetId || 'KLV';
          break;
        case 9: // Claim
          type = 'Claim';
          assetId = param.assetId || 'KLV';
          break;
        case 16: // Delegate
          type = 'Delegate';
          assetId = 'KLV';
          break;
        case 17: // Undelegate
          type = 'Undelegate';
          assetId = 'KLV';
          break;
        case 63: // Smart Contract
          type = 'Contract';
          // Try to get amount from callValue
          if (param.callValue) {
            const callValues = Object.entries(param.callValue);
            const firstEntry = callValues[0];
            if (firstEntry) {
              assetId = firstEntry[0];
              amount = String(firstEntry[1] || '0');
            }
          }
          break;
        case 11: // Buy order
          type = 'Buy';
          amount = param.amount?.toString() || '0';
          assetId = param.currencyId || 'KLV';
          break;
        case 12: // Sell order
          type = 'Sell';
          amount = param.amount?.toString() || '0';
          assetId = param.assetId || 'KLV';
          break;
        case 18: // Withdraw
          type = 'Withdraw';
          assetId = param.assetId || 'KLV';
          break;
        default:
          type = `TX-${contract.type}`;
      }
    }

    return {
      hash: tx.hash || '',
      type,
      from: tx.sender || '',
      to,
      amount,
      assetId,
      timestamp: tx.timestamp || 0,
      status: tx.status || 'success',
    };
  }, []);

  const fetchTransactions = useCallback(async () => {
    if (!isConnected || !address) {
      setTransactions([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Fetch both sent AND received transactions for complete history
      const [sentResponse, receivedResponse] = await Promise.all([
        fetch(`https://api.mainnet.klever.org/v1.0/transaction/list?sender=${address}&limit=15`),
        fetch(`https://api.mainnet.klever.org/v1.0/transaction/list?receiver=${address}&limit=15`)
      ]);
      
      const sentData = sentResponse.ok ? await sentResponse.json() : { data: { transactions: [] } };
      const receivedData = receivedResponse.ok ? await receivedResponse.json() : { data: { transactions: [] } };

      const sentTxs = sentData.data?.transactions || [];
      const receivedTxs = receivedData.data?.transactions || [];

      // Combine and deduplicate by hash
      const allTxs = [...sentTxs, ...receivedTxs];
      const uniqueTxs = allTxs.reduce((acc: any[], tx: any) => {
        if (!acc.find(t => t.hash === tx.hash)) {
          acc.push(tx);
        }
        return acc;
      }, []);

      // Sort by timestamp descending and take top 10
      const sortedTxs = uniqueTxs
        .sort((a: any, b: any) => (b.timestamp || 0) - (a.timestamp || 0))
        .slice(0, 10);

      const formattedTxs = sortedTxs.map((tx: any) => parseTransaction(tx, address));
      setTransactions(formattedTxs);
    } catch (err: any) {
      console.error('Error fetching transactions:', err);
      setError('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  }, [address, isConnected, parseTransaction]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Get icon for transaction type - all gray icons
  const getTypeIcon = (type: string) => {
    const icons: Record<string, React.ReactNode> = {
      Send: <ArrowUpRight className="w-4 h-4" />,
      Receive: <ArrowDownLeft className="w-4 h-4" />,
      Stake: <Lock className="w-4 h-4" />,
      Unstake: <Unlock className="w-4 h-4" />,
      Claim: <Gift className="w-4 h-4" />,
      Contract: <Zap className="w-4 h-4" />,
      Delegate: <Lock className="w-4 h-4" />,
      Undelegate: <Unlock className="w-4 h-4" />,
      Buy: <ArrowDownLeft className="w-4 h-4" />,
      Sell: <ArrowUpRight className="w-4 h-4" />,
      Withdraw: <ArrowDownLeft className="w-4 h-4" />,
    };
    return icons[type] || <Zap className="w-4 h-4" />;
  };

  // Format timestamp
  const formatTime = (timestamp: number) => {
    if (!timestamp) return 'Unknown';
    const now = Date.now() / 1000;
    const diff = now - timestamp;

    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  // Format amount with asset precision from centralized token config
  const formatAmount = (amount: string, assetId: string) => {
    const num = parseFloat(amount);
    if (num === 0) return null;
    
    // Get symbol from assetId (e.g., 'DAXDO-1A4L' -> 'DAXDO')
    const symbol = assetId.split('-')[0] || assetId;
    
    // Use centralized token config for decimals (handles DAXDO=8, DGKO=4, etc.)
    const decimals = getTokenDecimals(symbol);
    
    const formatted = (num / Math.pow(10, decimals)).toLocaleString(undefined, { maximumFractionDigits: decimals });
    return `${formatted} ${symbol}`;
  };

  if (loading) {
    return (
      <div>
        <h3 className="text-base md:text-lg font-medium text-text-primary mb-3 md:mb-4">Recent Activity</h3>
        <div className="space-y-2 md:space-y-3">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-12 md:h-14 bg-overlay-default rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header with refresh */}
      <div className="flex items-center justify-between mb-3 md:mb-4">
        <h3 className="text-base md:text-lg font-medium text-text-primary">Recent Activity</h3>
        <button
          onClick={fetchTransactions}
          className="p-1.5 rounded-lg hover:bg-overlay-active text-text-secondary hover:text-text-primary transition-all"
          title="Refresh"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Error state */}
      {error && (
        <div className="text-center py-6 rounded-xl bg-overlay-default border border-border-default">
          <p className="text-text-secondary text-sm mb-2">{error}</p>
          <button
            onClick={fetchTransactions}
            className="text-sm text-text-secondary hover:text-text-primary transition-colors"
          >
            Try again
          </button>
        </div>
      )}

      {/* Empty state */}
      {!error && transactions.length === 0 && (
        <div className="text-center py-6 md:py-8 rounded-xl bg-overlay-default border border-border-default">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-overlay-default flex items-center justify-center mx-auto mb-2.5 md:mb-3">
            <Zap className="w-5 h-5 md:w-6 md:h-6 text-text-muted" />
          </div>
          <p className="text-text-secondary text-sm">No transactions yet</p>
          <p className="text-text-muted text-xs mt-1">Your activity will appear here</p>
        </div>
      )}

      {/* Transaction list - show all 10 */}
      {!error && transactions.length > 0 && (
        <div className="space-y-2">
          {transactions.map((tx) => {
            const formattedAmount = formatAmount(tx.amount, tx.assetId);
            
            return (
              <a
                key={tx.hash}
                href={`https://kleverscan.org/transaction/${tx.hash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 md:p-4 rounded-xl bg-overlay-default border border-border-default hover:bg-overlay-active hover:border-border-default transition-all group"
              >
                {/* Icon */}
                <div className="w-8 h-8 md:w-9 md:h-9 rounded-lg bg-overlay-default flex items-center justify-center flex-shrink-0">
                  <span className="text-text-secondary">{getTypeIcon(tx.type)}</span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm text-text-primary">{tx.type}</span>
                    {tx.status === 'success' && (
                      <span className="w-1.5 h-1.5 rounded-full bg-success" />
                    )}
                  </div>
                  <div className="text-xs text-text-muted">{formatTime(tx.timestamp)}</div>
                </div>

                {/* Amount - gray/white only */}
                {formattedAmount && (
                  <div className="text-right flex-shrink-0">
                    <div className="font-mono text-sm text-text-primary">{formattedAmount}</div>
                  </div>
                )}

                {/* External link */}
                <ExternalLink className="w-4 h-4 text-text-muted group-hover:text-text-primary flex-shrink-0 transition-colors" />
              </a>
            );
          })}
        </div>
      )}

      {/* View all link - always show if there are transactions */}
      {transactions.length > 0 && (
        <div className="mt-3 md:mt-4 text-center">
          <a
            href={`https://kleverscan.org/account/${address}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs md:text-sm text-text-secondary hover:text-text-primary transition-colors inline-flex items-center gap-1"
          >
            View all on Explorer
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      )}
    </div>
  );
}
