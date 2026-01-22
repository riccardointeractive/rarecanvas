'use client';
import { debugLog } from '@/utils/debugMode';

import { useState, useEffect } from 'react';
import { X, ArrowUpRight, ChevronDown, AlertCircle } from 'lucide-react';
import { useKlever } from '@/context/KleverContext';
import { useTokenBalances } from '../hooks/useTokenBalances';
import { TokenImage } from '@/components/TokenImage';
import { LazyTransactionModal } from '@/components/LazyTransactionModal';
import { Button, AddressInput, TextInput } from '@/components/ui';
import { web, TransactionType } from '@klever/sdk-web';

interface SendModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface TokenOption {
  assetId: string;
  symbol: string;
  balance: string;
  balanceFormatted: string;
  decimals: number;
}

/**
 * SendModal Component
 * 
 * Modal for sending KLV and KDA tokens on the Klever blockchain
 * Follows Fintech Minimal design territory
 */
export function SendModal({ isOpen, onClose }: SendModalProps) {
  const { address, network } = useKlever();
  const { tokens } = useTokenBalances();
  
  // Form state
  const [selectedToken, setSelectedToken] = useState<TokenOption | null>(null);
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [showTokenSelect, setShowTokenSelect] = useState(false);
  
  // Transaction state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Transaction modal state
  const [txModalOpen, setTxModalOpen] = useState(false);
  const [txStatus, setTxStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [txHash, setTxHash] = useState<string>('');
  const [txMessage, setTxMessage] = useState<string>('');

  // Build token options from balances
  const tokenOptions: TokenOption[] = tokens
    .filter(t => parseFloat(t.availableFormatted) > 0)
    .map(t => ({
      assetId: t.assetId,
      symbol: t.assetId.split('-')[0] || t.assetId,
      balance: t.availableRaw,
      balanceFormatted: t.availableFormatted,
      decimals: t.decimals,
    }));

  // Set default token (KLV) when tokens load
  useEffect(() => {
    if (tokenOptions.length > 0 && !selectedToken) {
      const klv = tokenOptions.find(t => t.assetId === 'KLV');
      setSelectedToken(klv ?? tokenOptions[0] ?? null);
    }
  }, [tokenOptions, selectedToken]);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setRecipient('');
      setAmount('');
      setError(null);
    }
  }, [isOpen]);

  // Validate recipient address
  const validateRecipient = (addr: string): boolean => {
    if (!addr) return false;
    if (!addr.startsWith('klv1')) return false;
    if (addr.length !== 62) return false;
    return true;
  };

  // Validate amount
  const validateAmount = (amt: string, token: TokenOption | null): string | null => {
    if (!amt || !token) return 'Enter an amount';
    
    const num = parseFloat(amt);
    if (isNaN(num) || num <= 0) return 'Enter a valid amount';
    
    const available = parseFloat(token.balanceFormatted);
    if (num > available) return 'Insufficient balance';
    
    return null;
  };

  // Handle max button
  const handleMax = () => {
    if (selectedToken) {
      // For KLV, leave some for fees (~3 KLV)
      if (selectedToken.assetId === 'KLV') {
        const available = parseFloat(selectedToken.balanceFormatted);
        const maxAmount = Math.max(0, available - 3); // Leave 3 KLV for fees
        setAmount(maxAmount.toString());
      } else {
        setAmount(selectedToken.balanceFormatted);
      }
    }
  };

  // Send transaction
  const handleSend = async () => {
    setError(null);

    // Validate inputs
    if (!selectedToken) {
      setError('Please select a token');
      return;
    }

    if (!validateRecipient(recipient)) {
      setError('Invalid Klever address. Must start with klv1 and be 62 characters');
      return;
    }

    const amountError = validateAmount(amount, selectedToken);
    if (amountError) {
      setError(amountError);
      return;
    }

    if (!address) {
      setError('Wallet not connected');
      return;
    }

    setIsLoading(true);
    setTxModalOpen(true);
    setTxStatus('loading');
    setTxMessage('Sending transaction...');

    try {
      // Convert amount to raw units
      const amountNum = parseFloat(amount);
      const rawAmount = Math.floor(amountNum * Math.pow(10, selectedToken.decimals));

      // Build transfer transaction
      const payload: any = {
        amount: rawAmount,
        receiver: recipient,
      };

      // Add assetId for KDA tokens (not needed for native KLV)
      if (selectedToken.assetId !== 'KLV') {
        payload.kda = selectedToken.assetId;
      }

      debugLog('📤 Sending transfer:', {
        token: selectedToken.symbol,
        amount: amountNum,
        rawAmount,
        to: recipient,
      });

      // Build and send transaction using Klever SDK
      // Using TransactionType.Transfer (0) - no metadata to avoid base64 errors
      const unsignedTx = await web.buildTransaction([
        {
          payload,
          type: TransactionType.Transfer,
        }
      ]);

      // Sign and broadcast
      const signedTx = await web.signTransaction(unsignedTx);
      const response = await web.broadcastTransactions([signedTx]);

      if (response && response.data && response.data.txsHashes) {
        const hash = response.data.txsHashes[0] || '';
        setTxHash(hash);
        setTxStatus('success');
        setTxMessage(`Successfully sent ${amount} ${selectedToken.symbol}`);
        
        // Reset form
        setRecipient('');
        setAmount('');
      } else {
        throw new Error('Transaction failed - no hash returned');
      }
    } catch (err: any) {
      console.error('❌ Send error:', err);
      setTxStatus('error');
      setTxMessage(err.message || 'Transaction failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTxModalClose = () => {
    setTxModalOpen(false);
    if (txStatus === 'success') {
      onClose();
    }
  };

  if (!isOpen) return null;

  const isValid = selectedToken && 
    validateRecipient(recipient) && 
    !validateAmount(amount, selectedToken);

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-50 bg-backdrop"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div 
          className="bg-bg-surface w-full max-w-md rounded-2xl md:rounded-3xl border border-border-default pointer-events-auto"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 md:p-6 border-b border-border-default">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-info-muted flex items-center justify-center">
                <ArrowUpRight className="w-5 h-5 text-info" />
              </div>
              <div>
                <h2 className="text-lg font-medium text-text-primary">Send</h2>
                <p className="text-xs text-text-muted">Transfer tokens</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-overlay-active text-text-secondary hover:text-text-primary transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4 md:p-6 space-y-4">
            {/* Token Selector */}
            <div>
              <label className="block text-xs text-text-muted mb-2">Token</label>
              <div className="relative">
                <button
                  onClick={() => setShowTokenSelect(!showTokenSelect)}
                  className="w-full flex items-center justify-between p-3 md:p-4 rounded-xl bg-overlay-default border border-border-default hover:border-border-active transition-colors"
                >
                  {selectedToken ? (
                    <div className="flex items-center gap-3">
                      <TokenImage 
                        assetId={selectedToken.assetId}
                        size="sm"
                      />
                      <div className="text-left">
                        <div className="text-sm font-medium text-text-primary">{selectedToken.symbol}</div>
                        <div className="text-xs text-text-muted">
                          Balance: {parseFloat(selectedToken.balanceFormatted).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <span className="text-text-secondary">Select token</span>
                  )}
                  <ChevronDown className={`w-5 h-5 text-text-secondary transition-transform ${showTokenSelect ? 'rotate-180' : ''}`} />
                </button>

                {/* Token dropdown */}
                {showTokenSelect && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-bg-elevated border border-border-default rounded-xl overflow-hidden z-10 max-h-60 overflow-y-auto">
                    {tokenOptions.map(token => (
                      <button
                        key={token.assetId}
                        onClick={() => {
                          setSelectedToken(token);
                          setShowTokenSelect(false);
                        }}
                        className={`w-full flex items-center gap-3 p-3 hover:bg-overlay-default transition-colors ${
                          selectedToken?.assetId === token.assetId ? 'bg-overlay-default' : ''
                        }`}
                      >
                        <TokenImage 
                          assetId={token.assetId}
                          size="sm"
                        />
                        <div className="flex-1 text-left">
                          <div className="text-sm text-text-primary">{token.symbol}</div>
                        </div>
                        <div className="text-sm text-text-secondary font-mono">
                          {parseFloat(token.balanceFormatted).toLocaleString()}
                        </div>
                      </button>
                    ))}
                    {tokenOptions.length === 0 && (
                      <div className="p-4 text-center text-text-muted text-sm">
                        No tokens with balance
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Recipient Address */}
            <AddressInput
              label="Recipient Address"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value.trim())}
              error={recipient && !validateRecipient(recipient) ? 'Invalid address format' : undefined}
              size="md"
            />

            {/* Amount */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-text-primary">Amount</label>
                {selectedToken && (
                  <button
                    onClick={handleMax}
                    className="text-xs text-info hover:text-brand-primary transition-colors"
                  >
                    MAX
                  </button>
                )}
              </div>
              <div className="relative">
                <TextInput
                  type="text"
                  inputMode="decimal"
                  value={amount}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9.]/g, '');
                    const parts = val.split('.');
                    if (parts.length > 2) return;
                    setAmount(val);
                  }}
                  placeholder="0.00"
                  className="font-mono text-lg pr-16"
                  trailingIcon={
                    <span className="text-text-secondary text-sm">
                      {selectedToken?.symbol || 'TOKEN'}
                    </span>
                  }
                  error={amount && selectedToken && validateAmount(amount, selectedToken) ? validateAmount(amount, selectedToken)! : undefined}
                  size="md"
                />
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-error-muted border border-border-error">
                <AlertCircle className="w-4 h-4 text-error flex-shrink-0 mt-0.5" />
                <p className="text-sm text-error">{error}</p>
              </div>
            )}

            {/* Summary */}
            {isValid && (
              <div className="p-3 rounded-xl bg-overlay-default border border-border-default space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-muted">Sending</span>
                  <span className="text-text-primary font-mono">
                    {parseFloat(amount).toLocaleString()} {selectedToken?.symbol}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-muted">To</span>
                  <span className="text-text-primary font-mono text-xs">
                    {recipient.slice(0, 10)}...{recipient.slice(-8)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-muted">Network Fee</span>
                  <span className="text-text-primary font-mono">~3 KLV</span>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 md:p-6 border-t border-border-default">
            <Button
              variant="primary"
              size="lg"
              onClick={handleSend}
              disabled={!isValid || isLoading}
              loading={isLoading}
              className="w-full"
            >
              {isLoading ? 'Sending...' : 'Send'}
            </Button>
          </div>
        </div>
      </div>

      {/* Transaction Modal - Lazy loaded */}
      {txModalOpen && (
        <LazyTransactionModal
          isOpen={txModalOpen}
          status={txStatus}
          title={txStatus === 'success' ? 'Transfer Complete' : txStatus === 'error' ? 'Transfer Failed' : 'Processing'}
          message={txMessage}
          txHash={txHash}
          network={network}
          onClose={handleTxModalClose}
        />
      )}
    </>
  );
}
