'use client';

import React, { useState, useRef, useEffect } from 'react';
import { TokenImage } from './TokenImage';

export interface Token {
  id: string;
  symbol: string;           // Internal key (DGKO, BABYDGKO)
  displaySymbol?: string;   // What to show in UI (NINJA on testnet)
  name: string;
  balance?: string;
  assetId: string;
}

interface TokenSelectorProps {
  tokens: Token[];
  selectedToken: string;
  onSelect: (symbol: string) => void;
  showBalance?: boolean;
  disabled?: boolean;
}

export function TokenSelector({
  tokens,
  selectedToken,
  onSelect,
  showBalance = true,
  disabled = false,
}: TokenSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const selected = tokens.find(t => t.symbol === selectedToken);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const handleSelect = (symbol: string) => {
    onSelect(symbol);
    setIsOpen(false);
  };

  // Helper to get display symbol (shows NINJA on testnet, DGKO on mainnet)
  const getDisplaySymbol = (token: Token) => token.displaySymbol || token.symbol;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Selected Token Button */}
      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          w-full flex items-center justify-between gap-2 md:gap-4 px-3 py-2.5 md:px-5 md:py-4 
          rounded-xl md:rounded-2xl border transition-all duration-150
          ${isOpen 
            ? 'bg-brand-primary/10 border-border-brand glow-primary-sm' 
            : 'bg-overlay-subtle border-border-default hover:border-border-active hover:bg-overlay-default'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        <div className="flex items-center gap-2 md:gap-4">
          {selected && (
            <>
              <TokenImage assetId={selected.assetId} size="sm" className="md:w-8 md:h-8" />
              <div className="text-left">
                <div className="text-base md:text-lg font-medium text-text-primary">{getDisplaySymbol(selected)}</div>
                <div className="text-xs md:text-sm text-text-muted">{selected.name}</div>
              </div>
            </>
          )}
        </div>
        
        <div className="flex items-center gap-2 md:gap-3">
          {showBalance && selected?.balance && (
            <div className="text-right mr-1 md:mr-2">
              <div className="text-xs text-text-muted uppercase tracking-wider">Balance</div>
              <div className="text-xs md:text-sm font-mono text-text-secondary tabular-nums">{selected.balance}</div>
            </div>
          )}
          
          {/* Chevron */}
          <svg 
            className={`w-4 h-4 md:w-5 md:h-5 text-text-secondary tr-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor" 
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1.5 md:mt-2 bg-bg-surface rounded-xl md:rounded-2xl border border-border-default shadow-dropdown overflow-hidden animate-fade-in">
          {/* Header */}
          <div className="px-3 py-2 md:px-5 md:py-3 border-b border-border-default">
            <span className="text-xs text-text-muted uppercase tracking-wider font-medium">Select Token</span>
          </div>
          
          {/* Token List */}
          <div className="py-1 md:py-2 max-h-[250px] md:max-h-[300px] overflow-y-auto">
            {tokens.map((token) => {
              const isSelected = token.symbol === selectedToken;
              return (
                <button
                  key={token.symbol}
                  onClick={() => handleSelect(token.symbol)}
                  className={`
                    w-full flex items-center justify-between gap-2 md:gap-4 px-3 py-2.5 md:px-5 md:py-3.5
                    transition-all duration-150
                    ${isSelected 
                      ? 'bg-brand-primary/15' 
                      : 'hover:bg-overlay-default'
                    }
                  `}
                >
                  <div className="flex items-center gap-2 md:gap-4">
                    <TokenImage assetId={token.assetId} size="sm" className="md:w-8 md:h-8" />
                    <div className="text-left">
                      <div className="flex items-center gap-1.5 md:gap-2">
                        <span className="text-sm md:text-base font-medium text-text-primary">{getDisplaySymbol(token)}</span>
                        {isSelected && (
                          <svg className="w-3.5 h-3.5 md:w-4 md:h-4 text-brand-primary" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <span className="text-xs md:text-sm text-text-muted">{token.name}</span>
                    </div>
                  </div>
                  
                  {showBalance && token.balance && (
                    <div className="text-right">
                      <div className="text-xs md:text-sm font-mono text-text-secondary tabular-nums">{token.balance}</div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
          
          {/* Footer hint */}
          <div className="px-3 py-2 md:px-5 md:py-2.5 border-t border-border-default bg-overlay-subtle">
            <div className="flex items-center gap-1.5 md:gap-2 text-xs text-text-muted">
              <svg className="w-3 h-3 md:w-3.5 md:h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>More tokens coming soon</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
