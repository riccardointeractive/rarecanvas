'use client';

import { useState } from 'react';
import { X, Copy, Check, ArrowDownLeft } from 'lucide-react';
import { useKlever } from '@/context/KleverContext';
import { Button } from '@/components/Button';

interface ReceiveModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * ReceiveModal Component
 * 
 * Modal showing QR code and address to receive tokens
 * Follows Fintech Minimal design territory
 */
export function ReceiveModal({ isOpen, onClose }: ReceiveModalProps) {
  const { address } = useKlever();
  const [copied, setCopied] = useState(false);

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

  // QR Code API
  const qrCodeUrl = address 
    ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(address)}&bgcolor=ffffff&color=000000&margin=10`
    : '';

  if (!isOpen || !address) return null;

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
          className="bg-bg-surface rounded-2xl md:rounded-3xl p-5 md:p-6 border border-border-default max-w-sm w-full text-center relative pointer-events-auto"
          onClick={e => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 md:top-4 md:right-4 p-2 rounded-lg hover:bg-overlay-active text-text-secondary hover:text-text-primary transition-all"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-success-muted flex items-center justify-center">
              <ArrowDownLeft className="w-5 h-5 text-success" />
            </div>
          </div>
          <h3 className="text-lg md:text-xl font-medium text-text-primary mb-1">Receive Tokens</h3>
          <p className="text-xs md:text-sm text-text-secondary mb-4 md:mb-6">
            Scan this QR code to send tokens to this wallet
          </p>
          
          {/* QR Code */}
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
          
          {/* Copy Button */}
          <Button
            variant="secondary"
            onClick={copyAddress}
            className="w-full"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied!' : 'Copy Address'}
          </Button>
        </div>
      </div>
    </>
  );
}
