'use client';

import React from 'react';
import { useKlever } from '@/context/KleverContext';
import { Button } from './Button';

interface WalletConnectProps {
  variant?: 'default' | 'compact';
}

export const WalletConnect: React.FC<WalletConnectProps> = ({ variant = 'default' }) => {
  const { address, isConnected, isConnecting, connect, disconnect } = useKlever();

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const formatAddressShort = (addr: string) => {
    return `${addr.slice(0, 4)}...${addr.slice(-3)}`;
  };

  // Wallet icon
  const WalletIcon = () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6v12c0 1.1.9 2 2 2h14v-4" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M18 12a2 2 0 0 0-2 2c0 1.1.9 2 2 2h4v-4h-4z" />
    </svg>
  );

  // Disconnect icon
  const DisconnectIcon = () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  );

  // Compact variant
  if (variant === 'compact') {
    if (!isConnected) {
      return (
        <Button
          variant="connect"
          size="sm"
          onClick={connect}
          disabled={isConnecting}
          className="gap-2"
        >
          <WalletIcon />
          <span className="text-xs">
            {isConnecting ? 'Connecting...' : 'Connect'}
          </span>
        </Button>
      );
    }

    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-overlay-default border border-border-default">
          <div className="w-2 h-2 rounded-full bg-success" />
          <span className="text-xs font-mono text-text-primary">{formatAddress(address!)}</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={disconnect}
          title="Disconnect"
          className="px-2"
        >
          <DisconnectIcon />
        </Button>
      </div>
    );
  }

  // Default variant
  return (
    <div className="flex items-center gap-2 md:gap-3">
      {!isConnected ? (
        <Button
          variant="connect"
          onClick={connect}
          disabled={isConnecting}
        >
          <WalletIcon />
          <span className="hidden md:inline">
            {isConnecting ? 'Connecting...' : 'Connect'}
          </span>
          <span className="md:hidden text-sm">
            {isConnecting ? '...' : 'Connect'}
          </span>
        </Button>
      ) : (
        <div className="flex items-center gap-2">
          {/* Address display - compact on mobile */}
          <div className="bg-bg-surface px-3 py-2 md:px-4 md:py-2.5 rounded-xl flex items-center gap-2 md:gap-3 border border-border-default">
            <div className="w-2 h-2 rounded-full bg-success flex-shrink-0" />
            <span className="text-text-primary font-mono text-xs md:text-sm stat-number hidden md:inline">
              {formatAddress(address!)}
            </span>
            <span className="text-text-primary font-mono text-xs stat-number md:hidden">
              {formatAddressShort(address!)}
            </span>
          </div>
          {/* Disconnect button */}
          <Button
            variant="ghost"
            onClick={disconnect}
            title="Disconnect"
            className="p-2 md:px-4 md:py-2.5"
          >
            <DisconnectIcon />
          </Button>
        </div>
      )}
    </div>
  );
};