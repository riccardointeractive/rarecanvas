'use client';
import { debugLog, debugWarn } from '@/utils/debugMode';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { kleverService } from '@/utils/klever';
import { web, IProvider } from '@klever/sdk-web';
import { KleverContextType, Network, TransactionResponse, AccountInfo } from '@/types/klever';
import { formatKLV } from '@/utils/constants';

const KleverContext = createContext<KleverContextType | undefined>(undefined);

export const KleverProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<string>('0');
  const [network, setNetwork] = useState<Network>('mainnet');
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);

  // Initialize provider on mount and when network changes
  // Provider is set synchronously - no need to track state
  useEffect(() => {
    const provider: IProvider = {
      api: network === 'testnet' 
        ? 'https://api.testnet.klever.org'
        : 'https://api.mainnet.klever.org',
      node: network === 'testnet'
        ? 'https://node.testnet.klever.org'
        : 'https://node.mainnet.klever.org',
    };

    // Set provider - this happens immediately, no async
    web.setProvider(provider);
    
    debugLog('✅ Rare Canvas provider configured for', network);
  }, [network]);

  const getAccountInfo = useCallback(async (): Promise<AccountInfo | null> => {
    if (!address) return null;

    try {
      const info = await kleverService.getAccountInfo(address);
      setBalance(formatKLV(info.balance));
      return info;
    } catch (error) {
      console.error('Error fetching account info:', error);
      return null;
    }
  }, [address]);

  const connect = useCallback(async () => {
    setIsConnecting(true);
    try {
      const hasExtension = await kleverService.checkKleverExtension();
      if (!hasExtension) {
        throw new Error('Klever Extension not found. Please install it from the Chrome Web Store.');
      }

      debugLog('🔗 Connecting wallet to Rare Canvas...');
      debugLog('📱 This establishes dApp identification for transaction branding');

      // This call establishes the dApp connection
      // Extension popup will show "Connect to rarecanvas.io"
      const walletAddress = await kleverService.connectWallet();
      setAddress(walletAddress);
      setIsConnected(true);

      debugLog('✅ Wallet connected:', walletAddress);

      // Fetch initial balance - don't fail connection if this fails
      try {
        const info = await kleverService.getAccountInfo(walletAddress);
        setBalance(formatKLV(info.balance));
        debugLog('💰 Balance fetched:', formatKLV(info.balance));
      } catch (balanceError) {
        debugWarn('⚠️ Could not fetch initial balance:', balanceError);
        // Connection still succeeded, just couldn't get balance
        // This can happen if the account is new or there's a network mismatch
        setBalance('0');
      }
      
      debugLog('🏷️  All transactions will now show as "Rare Canvas" in wallet history');
    } catch (error: unknown) {
      console.error('Connection error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to connect wallet';
      alert(errorMessage);
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setAddress(null);
    setBalance('0');
    setIsConnected(false);
    debugLog('✅ Wallet disconnected');
    debugLog('ℹ️  You\'ll need to reconnect for transactions to be branded as Rare Canvas');
  }, []);

  const switchNetwork = useCallback((newNetwork: Network) => {
    setNetwork(newNetwork);
    kleverService.setNetwork(newNetwork);
    
    // Persist to localStorage so contract utilities can read it
    if (typeof window !== 'undefined') {
      localStorage.setItem('rarecanvas-network', newNetwork);
    }
    
    // Refresh balance if connected
    if (address) {
      getAccountInfo();
    }
  }, [address, getAccountInfo]);

  const sendKLV = useCallback(async (to: string, amount: number): Promise<TransactionResponse> => {
    if (!address) {
      throw new Error('Wallet not connected');
    }

    if (!isConnected) {
      throw new Error('Please connect your wallet first to perform transactions');
    }

    const result = await kleverService.sendKLV(address, to, amount);
    
    // Refresh balance after transaction
    if (result.success) {
      setTimeout(() => {
        getAccountInfo();
      }, 2000);
    }

    return result;
  }, [address, isConnected, getAccountInfo]);

  // Initialize network on mount - only runs once
  useEffect(() => {
    // First check localStorage, then env, then default to mainnet
    let initialNetwork: Network = 'mainnet';
    
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('rarecanvas-network');
      if (stored === 'testnet' || stored === 'mainnet') {
        initialNetwork = stored;
      }
    }
    
    // Environment variable override (only if localStorage was empty)
    if (typeof window !== 'undefined' && !localStorage.getItem('rarecanvas-network')) {
      const envNetwork = process.env.NEXT_PUBLIC_DEFAULT_NETWORK as Network;
      if (envNetwork === 'testnet' || envNetwork === 'mainnet') {
        initialNetwork = envNetwork;
      }
    }
    
    switchNetwork(initialNetwork);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Manual refresh function for balance
  const refreshBalance = useCallback(() => {
    if (address) {
      getAccountInfo();
    }
  }, [address, getAccountInfo]);

  // Memoize context value to prevent unnecessary re-renders
  const value = useMemo<KleverContextType>(() => ({
    address,
    balance,
    network,
    isConnected,
    isConnecting,
    connect,
    disconnect,
    switchNetwork,
    sendKLV,
    getAccountInfo,
    refreshBalance,
  }), [address, balance, network, isConnected, isConnecting, connect, disconnect, switchNetwork, sendKLV, getAccountInfo, refreshBalance]);

  return <KleverContext.Provider value={value}>{children}</KleverContext.Provider>;
};

export const useKlever = (): KleverContextType => {
  const context = useContext(KleverContext);
  if (context === undefined) {
    throw new Error('useKlever must be used within a KleverProvider')
    ;
  }
  return context;
};