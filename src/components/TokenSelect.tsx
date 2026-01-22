'use client';

import React, { useState, useRef, useEffect } from 'react';
import { TokenImage } from './TokenImage';
import { 
  TOKEN_REGISTRY, 
  TokenConfig, 
  getActiveTokens,
} from '@/config/tokens';
import { useNetworkConfig } from '@/hooks/useNetworkConfig';
import { ChevronDown, Check, Search, X } from 'lucide-react';

// ============================================================================
// Types
// ============================================================================

interface TokenSelectProps {
  /** Currently selected token symbol or asset ID */
  value: string;
  /** Callback when token is selected - returns asset ID */
  onChange: (assetId: string, isKlv: boolean) => void;
  /** Placeholder text when no token selected */
  placeholder?: string;
  /** Label text */
  label?: string;
  /** Whether the select is disabled */
  disabled?: boolean;
  /** Filter tokens (e.g., exclude already selected) */
  excludeTokens?: string[];
  /** Allow custom token input */
  allowCustom?: boolean;
  /** Show only KLV option */
  klvOnly?: boolean;
  /** Additional class names */
  className?: string;
}

// ============================================================================
// Component
// ============================================================================

export function TokenSelect({
  value,
  onChange,
  placeholder = 'Select token',
  label,
  disabled = false,
  excludeTokens = [],
  allowCustom = true,
  klvOnly = false,
  className = '',
}: TokenSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customToken, setCustomToken] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { network } = useNetworkConfig();

  // Get tokens list
  const allTokens = klvOnly 
    ? [TOKEN_REGISTRY.KLV].filter(Boolean) 
    : getActiveTokens();
  
  // Filter out excluded tokens
  const availableTokens = allTokens.filter((token): token is TokenConfig => {
    if (!token) return false;
    const assetId = network === 'mainnet' ? token.assetIdMainnet : token.assetIdTestnet;
    return !excludeTokens.includes(token.symbol) && !excludeTokens.includes(assetId);
  });

  // Filter by search query
  const filteredTokens = availableTokens.filter(token => {
    const query = searchQuery.toLowerCase();
    return (
      token.symbol.toLowerCase().includes(query) ||
      token.name.toLowerCase().includes(query) ||
      token.assetIdMainnet.toLowerCase().includes(query)
    );
  });

  // Find selected token
  const selectedToken = Object.values(TOKEN_REGISTRY).find(token => {
    const assetId = network === 'mainnet' ? token.assetIdMainnet : token.assetIdTestnet;
    return token.symbol === value || assetId === value || token.symbol.toLowerCase() === value.toLowerCase();
  });

  // Get asset ID for display
  const getTokenAssetId = (token: TokenConfig) => {
    return network === 'mainnet' ? token.assetIdMainnet : token.assetIdTestnet;
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowCustomInput(false);
        setSearchQuery('');
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        setShowCustomInput(false);
        setSearchQuery('');
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const handleSelect = (token: TokenConfig) => {
    const assetId = getTokenAssetId(token);
    onChange(assetId, token.isNative);
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleCustomSubmit = () => {
    if (customToken.trim()) {
      // Determine if it's KLV
      const isKlv = customToken.trim().toUpperCase() === 'KLV';
      onChange(customToken.trim(), isKlv);
      setIsOpen(false);
      setShowCustomInput(false);
      setCustomToken('');
      setSearchQuery('');
    }
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {label && (
        <label className="block text-sm text-text-secondary mb-2">
          {label}
        </label>
      )}
      
      {/* Selected Token Button */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          w-full flex items-center justify-between gap-3 px-4 py-3
          rounded-xl border transition-all duration-100
          ${isOpen 
            ? 'bg-overlay-hover border-border-brand ring-1 ring-brand-primary/20' 
            : 'bg-overlay-subtle border-border-default hover:border-border-active hover:bg-overlay-default'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        <div className="flex items-center gap-3 min-w-0">
          {selectedToken ? (
            <>
              <TokenImage 
                assetId={getTokenAssetId(selectedToken)} 
                size="sm" 
              />
              <div className="text-left min-w-0">
                <div className="text-text-primary font-medium">{selectedToken.symbol}</div>
                <div className="text-xs text-text-muted truncate font-mono">
                  {getTokenAssetId(selectedToken)}
                </div>
              </div>
            </>
          ) : value ? (
            // Custom token entered
            <div className="text-left min-w-0">
              <div className="text-text-primary font-medium font-mono">{value}</div>
              <div className="text-xs text-text-muted">Custom token</div>
            </div>
          ) : (
            <span className="text-text-muted">{placeholder}</span>
          )}
        </div>
        
        <ChevronDown 
          className={`w-5 h-5 text-text-secondary tr-transform-micro shrink-0 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-bg-surface rounded-xl border border-border-default shadow-dropdown overflow-hidden animate-fade-in">
          {/* Search Input */}
          <div className="p-3 border-b border-border-default">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tokens..."
                className="w-full pl-10 pr-4 py-2 bg-overlay-default border border-border-default rounded-lg text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-border-brand"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
          
          {/* Token List */}
          <div className="max-h-[280px] overflow-y-auto">
            {filteredTokens.length > 0 ? (
              <div className="py-1">
                {filteredTokens.map((token) => {
                  const assetId = getTokenAssetId(token);
                  const isSelected = selectedToken?.symbol === token.symbol || value === assetId;
                  
                  return (
                    <button
                      key={token.symbol}
                      type="button"
                      onClick={() => handleSelect(token)}
                      className={`
                        w-full flex items-center justify-between gap-3 px-4 py-3
                        transition-all duration-100
                        ${isSelected 
                          ? 'bg-brand-primary/15' 
                          : 'hover:bg-overlay-default'
                        }
                      `}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <TokenImage assetId={assetId} size="sm" />
                        <div className="text-left min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-text-primary font-medium">{token.symbol}</span>
                            {token.isNative && (
                              <span className="px-1.5 py-0.5 text-2xs font-medium bg-brand-primary/10 text-brand-primary rounded">
                                NATIVE
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-text-muted">{token.name}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs text-text-muted font-mono">
                          {token.decimals}d
                        </span>
                        {isSelected && (
                          <Check className="w-4 h-4 text-brand-primary" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="px-4 py-8 text-center text-text-muted text-sm">
                No tokens found
              </div>
            )}
          </div>

          {/* Custom Token Option */}
          {allowCustom && !klvOnly && (
            <div className="border-t border-border-default p-3">
              {showCustomInput ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customToken}
                    onChange={(e) => setCustomToken(e.target.value)}
                    placeholder="Enter asset ID (e.g., TOKEN-XXXX)"
                    className="flex-1 px-3 py-2 bg-overlay-default border border-border-default rounded-lg text-sm text-text-primary placeholder-text-muted font-mono focus:outline-none focus:border-border-brand"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleCustomSubmit();
                      }
                    }}
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={handleCustomSubmit}
                    disabled={!customToken.trim()}
                    className="px-3 py-2 bg-brand-primary/20 text-brand-primary rounded-lg text-sm font-medium hover:bg-brand-primary/30 transition-colors disabled:opacity-50"
                  >
                    Add
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowCustomInput(true)}
                  className="w-full px-4 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-overlay-default rounded-lg transition-colors text-left"
                >
                  + Enter custom token ID
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
