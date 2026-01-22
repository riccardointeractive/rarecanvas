/**
 * NFTListingModal Component
 *
 * Modal for listing an NFT for sale on Rare Canvas marketplace.
 * Allows setting price, currency, and duration.
 */

import { useState, useEffect } from 'react';
import { NFT } from '../types/nft.types';
import { NFT_CONFIG } from '../config/nft.config';
import { Button } from '@/components/Button';
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@/components/ui/Modal';
import { TextInput, Select } from '@/components/ui';

interface NFTListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  nft: NFT | null;
  onSubmit: (nft: NFT, price: number, currency: string, durationDays: number) => Promise<void>;
}

const DURATION_OPTIONS = [
  { value: 7, label: '7 Days' },
  { value: 14, label: '14 Days' },
  { value: 30, label: '30 Days' },
  { value: 90, label: '90 Days' },
  { value: 180, label: '180 Days' },
];

export function NFTListingModal({
  isOpen,
  onClose,
  nft,
  onSubmit,
}: NFTListingModalProps) {
  const [price, setPrice] = useState('');
  const [currency, setCurrency] = useState(NFT_CONFIG.defaultCurrency);
  const [duration, setDuration] = useState(NFT_CONFIG.defaultListingDurationDays);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setPrice('');
      setCurrency(NFT_CONFIG.defaultCurrency);
      setDuration(NFT_CONFIG.defaultListingDurationDays);
      setError(null);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    if (!nft || !price) return;

    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum <= 0) {
      setError('Please enter a valid price');
      return;
    }

    if (priceNum < NFT_CONFIG.minListingPrice) {
      setError(`Minimum price is ${NFT_CONFIG.minListingPrice} ${currency}`);
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      await onSubmit(nft, priceNum, currency, duration);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to list NFT');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !nft) return null;

  const imageUrl = nft.metadata.image || NFT_CONFIG.defaultNFTImage;

  return (
    <Modal
      isOpen={isOpen}
      onClose={isSubmitting ? () => {} : onClose}
      size="lg"
      showCloseButton={!isSubmitting}
      closeOnBackdropClick={!isSubmitting}
      closeOnEscape={!isSubmitting}
      title="List NFT for Sale"
    >
      {/* Header */}
      <ModalHeader>List NFT for Sale</ModalHeader>

      {/* Content */}
      <ModalBody className="space-y-6">
        {/* NFT Preview */}
        <div className="flex gap-4 p-4 rounded-xl bg-overlay-default">
          <div className="w-20 h-20 rounded-lg overflow-hidden bg-overlay-default flex-shrink-0">
            <img
              src={imageUrl}
              alt={nft.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-brand-primary font-medium">{nft.collection}</p>
            <p className="text-base font-medium text-text-primary truncate">{nft.name}</p>
            <p className="text-xs text-text-muted mt-1">Token #{nft.nonce}</p>
          </div>
        </div>

        {/* Price Input */}
        <div className="flex gap-2">
          <TextInput
            label="Price"
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="0.00"
            min={0}
            step={0.01}
            disabled={isSubmitting}
            containerClassName="flex-1"
          />
          <Select
            label="Currency"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            disabled={isSubmitting}
            options={NFT_CONFIG.supportedCurrencies.map((c) => ({ value: c, label: c }))}
            containerClassName="w-24"
          />
        </div>

        {/* Duration Select */}
        <div>
          <label className="block text-sm text-text-secondary mb-2">
            Listing Duration
          </label>
          <div className="grid grid-cols-5 gap-2">
            {DURATION_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setDuration(opt.value)}
                disabled={isSubmitting}
                className={`
                  px-3 py-2 rounded-lg text-sm font-medium
                  tr-colors disabled:opacity-50
                  ${duration === opt.value
                    ? 'bg-brand-primary text-text-on-brand'
                    : 'bg-overlay-default text-text-secondary hover:text-text-primary hover:bg-overlay-hover'
                  }
                `}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Marketplace Info */}
        <div className="p-4 rounded-xl bg-overlay-subtle border border-border-default">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-brand-primary/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-text-primary">Rare Canvas Marketplace</p>
              <p className="text-xs text-text-muted">Platform fee: {NFT_CONFIG.platformFeePercent / 100}%</p>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-3 rounded-lg bg-error-muted border border-error/30 text-error text-sm">
            {error}
          </div>
        )}
      </ModalBody>

      {/* Footer */}
      <ModalFooter centered={false} className="flex gap-3">
        <Button
          variant="ghost"
          className="flex-1"
          onClick={onClose}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          variant="primary"
          className="flex-1"
          onClick={handleSubmit}
          disabled={!price || isSubmitting}
        >
          {isSubmitting ? (
            <>
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Listing...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              List for {price || '0'} {currency}
            </>
          )}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
