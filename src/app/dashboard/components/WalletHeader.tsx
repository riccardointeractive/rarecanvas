'use client';

import { useState } from 'react';
import { useKlever } from '@/context/KleverContext';
import { usePortfolioStats } from '../hooks/usePortfolioStats';
import { Copy, Check, QrCode, ExternalLink, RefreshCw, X } from 'lucide-react';
import { Button } from '@/components/Button';

/**
 * WalletHeader Component
 * Displays total portfolio value and wallet address
 * 
 * NO auto-refresh - only manual refresh on button click
 * Gray/white text only
 */
export function WalletHeader() {
  const { address } = useKlever();
  const { stats, loading, refetch } = usePortfolioStats();
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const copyAddress = async () => {
    if (!address) return;
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy address:', err);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const formatAddress = (addr: string) => {
    if (addr.length < 20) return addr;
    return `${addr.slice(0, 10)}...${addr.slice(-8)}`;
  };

  const formatAddressShort = (addr: string) => {
    if (addr.length < 12) return addr;
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  // Format USD with full value, no abbreviations
  const formatUSD = (value: number) => {
    return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Get font size class based on value length
  const getValueFontSize = (value: number) => {
    const formatted = formatUSD(value);
    const length = formatted.length;
    
    if (length > 15) return 'text-xl md:text-2xl lg:text-3xl';
    if (length > 12) return 'text-2xl md:text-3xl lg:text-4xl';
    return 'text-3xl md:text-4xl lg:text-5xl';
  };

  const explorerUrl = `https://kleverscan.org/account/${address}`;
  
  // QR Code API
  const qrCodeUrl = address 
    ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(address)}&bgcolor=ffffff&color=000000&margin=10`
    : '';

  if (!address) return null;

  return (
    <>
      <div className="bg-bg-surface rounded-2xl md:rounded-3xl p-4 md:p-6 lg:p-8 border border-border-default mb-4 md:mb-6">
        {/* Main value display */}
        <div className="flex items-start justify-between mb-4 md:mb-5">
          <div>
            {loading ? (
              <div className="h-8 md:h-10 w-32 md:w-40 bg-overlay-active rounded animate-pulse" />
            ) : (
              <span className={`${getValueFontSize(stats.totalValueUSD)} font-mono font-semibold text-text-primary`}>
                {formatUSD(stats.totalValueUSD)}
              </span>
            )}
            <div className="flex items-center gap-2 md:gap-3 mt-1.5 md:mt-2">
              <span className="text-xs md:text-sm text-text-secondary">{stats.totalAssets} assets</span>
            </div>
          </div>
          
          {/* Refresh button - MANUAL only */}
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2 md:p-2.5 rounded-lg md:rounded-xl bg-overlay-default hover:bg-overlay-active border border-border-default transition-all group disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 md:w-5 md:h-5 text-text-secondary group-hover:text-text-primary transition-colors ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Address bar */}
        <div className="flex items-center gap-2 p-2.5 md:p-3 rounded-lg md:rounded-xl bg-overlay-default border border-border-default">
          {/* Address */}
          <div className="flex-1 min-w-0">
            <span className="font-mono text-xs md:text-sm text-text-primary md:hidden">
              {formatAddressShort(address)}
            </span>
            <span className="font-mono text-xs md:text-sm text-text-primary hidden md:inline">
              {formatAddress(address)}
            </span>
          </div>
          
          {/* Action buttons */}
          <div className="flex items-center gap-0.5 md:gap-1">
            <button
              onClick={copyAddress}
              className={`p-1.5 md:p-2 rounded-lg transition-all duration-100 ${
                copied
                  ? 'bg-success-muted text-success'
                  : 'hover:bg-overlay-active text-text-secondary hover:text-text-primary'
              }`}
              title={copied ? 'Copied!' : 'Copy address'}
            >
              {copied ? <Check className="w-3.5 h-3.5 md:w-4 md:h-4" /> : <Copy className="w-3.5 h-3.5 md:w-4 md:h-4" />}
            </button>
            <button
              onClick={() => setShowQR(true)}
              className="p-1.5 md:p-2 rounded-lg hover:bg-overlay-active text-text-secondary hover:text-text-primary transition-all duration-100"
              title="Show QR Code"
            >
              <QrCode className="w-3.5 h-3.5 md:w-4 md:h-4" />
            </button>
            <a
              href={explorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 md:p-2 rounded-lg hover:bg-overlay-active text-text-secondary hover:text-text-primary transition-all duration-100"
              title="View on Explorer"
            >
              <ExternalLink className="w-3.5 h-3.5 md:w-4 md:h-4" />
            </a>
          </div>
        </div>
      </div>

      {/* QR Code Modal */}
      {showQR && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-backdrop p-4"
          onClick={() => setShowQR(false)}
        >
          <div 
            className="bg-bg-surface rounded-2xl md:rounded-3xl p-5 md:p-6 border border-border-default max-w-sm w-full text-center relative"
            onClick={e => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setShowQR(false)}
              className="absolute top-3 right-3 md:top-4 md:right-4 p-2 rounded-lg hover:bg-overlay-active text-text-secondary hover:text-text-primary transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg md:text-xl font-medium text-text-primary mb-2">Receive Tokens</h3>
            <p className="text-xs md:text-sm text-text-secondary mb-4 md:mb-6">
              Scan this QR code to send tokens to this wallet
            </p>
            
            {/* Real QR Code */}
            <div className="bg-bg-inverse rounded-xl md:rounded-2xl p-3 md:p-4 mx-auto w-48 h-48 md:w-56 md:h-56 flex items-center justify-center mb-4 md:mb-6">
              <img 
                src={qrCodeUrl} 
                alt="Wallet QR Code"
                className="w-full h-full"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
            
            {/* Address */}
            <div className="bg-overlay-default rounded-lg md:rounded-xl p-2.5 md:p-3 mb-3 md:mb-4">
              <p className="text-2xs md:text-xs text-text-secondary mb-1">Wallet Address</p>
              <p className="text-2xs md:text-xs text-text-primary font-mono break-all">{address}</p>
            </div>
            
            <Button
              variant="secondary"
              onClick={() => {
                copyAddress();
                setTimeout(() => setShowQR(false), 500);
              }}
              className="w-full"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy Address'}
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
