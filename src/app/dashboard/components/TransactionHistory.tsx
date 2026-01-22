'use client';

import { useState, useEffect, useCallback } from 'react';
import { useKlever } from '@/context/KleverContext';
import { getTokenDecimals } from '@/config/tokens';
import { Select } from '@/components/ui';
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  Lock, 
  Unlock, 
  Gift, 
  Zap, 
  ExternalLink, 
  RefreshCw,
  FileCode,
  Users,
  Coins,
  ShoppingCart,
  Tag,
  UserPlus,
  Settings
} from 'lucide-react';

interface Transaction {
  hash: string;
  type: string;
  typeId: number;
  from: string;
  to?: string;
  amount: string;
  assetId: string;
  timestamp: number;
  status: string;
}

type FilterType = 'all' | 'transfers' | 'staking' | 'contracts' | 'market';

// Klever transaction type IDs mapped to human-readable names
const TX_TYPE_NAMES: Record<number, string> = {
  0: 'Transfer',
  1: 'Create Asset',
  2: 'Create Validator',
  3: 'Config Validator',
  4: 'Freeze',
  5: 'Unfreeze',
  6: 'Delegate',
  7: 'Undelegate',
  8: 'Withdraw',
  9: 'Claim',
  10: 'Unjail',
  11: 'Asset Trigger',
  12: 'Set Name',
  13: 'Proposal',
  14: 'Vote',
  15: 'Config ITO',
  16: 'Set ITO Prices',
  17: 'Buy',
  18: 'Sell',
  19: 'Cancel Order',
  20: 'Create Marketplace',
  21: 'Config Marketplace',
  22: 'Update Permission',
  23: 'Deposit',
  24: 'ITO Trigger',
  63: 'Smart Contract',
};

/**
 * TransactionHistory Component
 * 
 * Full history view showing 30 transactions with filtering
 */
export function TransactionHistory() {
  const { address, isConnected } = useKlever();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>('all');

  const parseTransaction = useCallback((tx: any, userAddress: string): Transaction => {
    let amount = '0';
    let assetId = 'KLV';
    let to = '';
    let typeId = 0;
    let type = 'Transaction';

    if (tx.contract && tx.contract.length > 0) {
      const contract = tx.contract[0];
      const param = contract.parameter || {};
      typeId = contract.type;
      
      // Get human-readable type name
      type = TX_TYPE_NAMES[typeId] || `TX-${typeId}`;
      
      // Special handling for Transfer to show Send/Receive
      if (typeId === 0) {
        type = tx.sender === userAddress ? 'Send' : 'Receive';
        amount = param.amount?.toString() || '0';
        assetId = param.assetId || 'KLV';
        to = param.toAddress || '';
      } else if (typeId === 4 || typeId === 5) {
        // Freeze/Unfreeze (Stake/Unstake)
        amount = param.amount?.toString() || '0';
        assetId = param.assetId || 'KLV';
      } else if (typeId === 6 || typeId === 7) {
        // Delegate/Undelegate
        amount = param.amount?.toString() || '0';
        assetId = 'KLV';
      } else if (typeId === 9) {
        // Claim
        assetId = param.assetId || 'KLV';
      } else if (typeId === 17 || typeId === 18) {
        // Buy/Sell
        amount = param.amount?.toString() || '0';
        assetId = param.assetId || param.currencyId || 'KLV';
      } else if (typeId === 63) {
        // Smart Contract
        if (param.callValue) {
          const callValues = Object.entries(param.callValue);
          const firstEntry = callValues[0];
          if (firstEntry) {
            assetId = firstEntry[0];
            amount = String(firstEntry[1] || '0');
          }
        }
      }
    }

    return {
      hash: tx.hash || '',
      type,
      typeId,
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
      // Fetch both sent AND received transactions
      const [sentResponse, receivedResponse] = await Promise.all([
        fetch(`https://api.mainnet.klever.org/v1.0/transaction/list?sender=${address}&limit=30`),
        fetch(`https://api.mainnet.klever.org/v1.0/transaction/list?receiver=${address}&limit=30`)
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

      // Sort by timestamp descending and take top 30
      const sortedTxs = uniqueTxs
        .sort((a: any, b: any) => (b.timestamp || 0) - (a.timestamp || 0))
        .slice(0, 30);

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

  // Filter transactions
  const filteredTransactions = transactions.filter(tx => {
    if (filter === 'all') return true;
    if (filter === 'transfers') return tx.typeId === 0;
    if (filter === 'staking') return [4, 5, 6, 7, 8, 9].includes(tx.typeId);
    if (filter === 'contracts') return tx.typeId === 63;
    if (filter === 'market') return [17, 18, 19].includes(tx.typeId);
    return true;
  });

  // Get icon for transaction type based on typeId
  const getTypeIcon = (typeId: number, type: string) => {
    // Transfer types
    if (typeId === 0) {
      return type === 'Send' 
        ? <ArrowUpRight className="w-4 h-4" />
        : <ArrowDownLeft className="w-4 h-4" />;
    }
    
    // Staking/Freezing
    if (typeId === 4) return <Lock className="w-4 h-4" />;           // Freeze
    if (typeId === 5) return <Unlock className="w-4 h-4" />;         // Unfreeze
    if (typeId === 6) return <Users className="w-4 h-4" />;          // Delegate
    if (typeId === 7) return <Users className="w-4 h-4" />;          // Undelegate
    if (typeId === 8) return <ArrowDownLeft className="w-4 h-4" />;  // Withdraw
    if (typeId === 9) return <Gift className="w-4 h-4" />;           // Claim
    
    // Validator
    if (typeId === 2 || typeId === 3) return <UserPlus className="w-4 h-4" />;
    if (typeId === 10) return <Unlock className="w-4 h-4" />;        // Unjail
    
    // Asset creation
    if (typeId === 1 || typeId === 11) return <Coins className="w-4 h-4" />;
    
    // Account
    if (typeId === 12) return <Settings className="w-4 h-4" />;      // Set Name
    if (typeId === 22) return <Settings className="w-4 h-4" />;      // Update Permission
    
    // Governance
    if (typeId === 13 || typeId === 14) return <FileCode className="w-4 h-4" />;
    
    // ITO
    if (typeId >= 15 && typeId <= 16) return <Tag className="w-4 h-4" />;
    if (typeId === 24) return <Tag className="w-4 h-4" />;           // ITO Trigger
    
    // Market
    if (typeId === 17) return <ArrowDownLeft className="w-4 h-4" />; // Buy (receiving)
    if (typeId === 18) return <ArrowUpRight className="w-4 h-4" />;  // Sell (sending)
    if (typeId === 19) return <Zap className="w-4 h-4" />;           // Cancel Order
    if (typeId === 20 || typeId === 21) return <ShoppingCart className="w-4 h-4" />;
    
    // Deposit
    if (typeId === 23) return <ArrowDownLeft className="w-4 h-4" />;
    
    // Smart Contract
    if (typeId === 63) return <FileCode className="w-4 h-4" />;
    
    return <Zap className="w-4 h-4" />;
  };

  // Format timestamp
  const formatTime = (timestamp: number) => {
    if (!timestamp) return 'Unknown';
    const date = new Date(timestamp * 1000);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else {
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    }
  };

  // Format full date for tooltip
  const formatFullDate = (timestamp: number) => {
    if (!timestamp) return '';
    return new Date(timestamp * 1000).toLocaleString();
  };

  // Format amount with asset precision
  const formatAmount = (amount: string, assetId: string) => {
    const num = parseFloat(amount);
    if (num === 0) return null;
    
    const symbol = assetId.split('-')[0] || assetId;
    const decimals = getTokenDecimals(symbol);
    const formatted = (num / Math.pow(10, decimals)).toLocaleString(undefined, { maximumFractionDigits: decimals });
    return `${formatted} ${symbol}`;
  };

  // Truncate hash
  const truncateHash = (hash: string) => {
    if (!hash) return '';
    return `${hash.slice(0, 8)}...${hash.slice(-6)}`;
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
          <div key={i} className="h-14 bg-overlay-default rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div>
      {/* Header with filter and refresh */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-text-primary">Transaction History</h3>
        <div className="flex items-center gap-2">
          {/* Filter dropdown */}
          <Select
            value={filter}
            onChange={(e) => setFilter(e.target.value as FilterType)}
            options={[
              { value: 'all', label: 'All' },
              { value: 'transfers', label: 'Transfers' },
              { value: 'staking', label: 'Staking' },
              { value: 'contracts', label: 'Contracts' },
              { value: 'market', label: 'Market' },
            ]}
            size="sm"
          />
          <button
            onClick={fetchTransactions}
            className="p-1.5 rounded-lg hover:bg-overlay-active text-text-secondary hover:text-text-primary transition-all"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="text-center py-8 rounded-xl bg-overlay-default border border-border-default">
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
      {!error && filteredTransactions.length === 0 && (
        <div className="text-center py-12 rounded-xl bg-overlay-default border border-border-default">
          <div className="w-12 h-12 rounded-lg bg-overlay-default flex items-center justify-center mx-auto mb-3">
            <Zap className="w-6 h-6 text-text-muted" />
          </div>
          <p className="text-text-secondary">No transactions found</p>
          {filter !== 'all' && (
            <button
              onClick={() => setFilter('all')}
              className="text-sm text-text-muted hover:text-text-primary mt-2 transition-colors"
            >
              Clear filter
            </button>
          )}
        </div>
      )}

      {/* Transaction list */}
      {!error && filteredTransactions.length > 0 && (
        <div className="space-y-2">
          {filteredTransactions.map((tx) => {
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
                <div className="w-9 h-9 rounded-lg bg-overlay-default flex items-center justify-center flex-shrink-0">
                  <span className="text-text-secondary">{getTypeIcon(tx.typeId, tx.type)}</span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm text-text-primary">{tx.type}</span>
                    {tx.status === 'success' && (
                      <span className="w-1.5 h-1.5 rounded-full bg-success" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-text-muted">
                    <span title={formatFullDate(tx.timestamp)}>{formatTime(tx.timestamp)}</span>
                    <span>•</span>
                    <span className="font-mono">{truncateHash(tx.hash)}</span>
                  </div>
                </div>

                {/* Amount */}
                {formattedAmount && (
                  <div className="text-right flex-shrink-0">
                    <div className="font-mono text-sm text-text-primary">
                      {tx.type === 'Send' ? '-' : tx.type === 'Receive' ? '+' : ''}{formattedAmount}
                    </div>
                  </div>
                )}

                {/* External link */}
                <ExternalLink className="w-4 h-4 text-text-muted group-hover:text-text-primary flex-shrink-0 transition-colors" />
              </a>
            );
          })}
        </div>
      )}

      {/* View all on explorer */}
      {filteredTransactions.length > 0 && (
        <div className="mt-4 text-center">
          <a
            href={`https://kleverscan.org/account/${address}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-text-secondary hover:text-text-primary transition-colors inline-flex items-center gap-1"
          >
            View all on KleverScan
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      )}
    </div>
  );
}
