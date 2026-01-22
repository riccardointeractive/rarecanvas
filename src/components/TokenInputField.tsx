'use client';

import { ReactNode } from 'react';
import { TokenImage } from './TokenImage';

/**
 * TokenInputField Component
 * 
 * Consistent token amount input used in swap/pool interfaces.
 * Follows Rare Canvas design system with glass morphism.
 * 
 * @example
 * <TokenInputField
 *   label="You deposit"
 *   value={amount}
 *   onChange={setAmount}
 *   tokenSymbol="KLV"
 *   tokenAssetId="KLV"
 *   balance={userBalance}
 *   onMax={handleMax}
 * />
 */

export interface TokenInputFieldProps {
  /** Label above the input */
  label: string;
  /** Input value */
  value: string;
  /** Change handler */
  onChange: (value: string) => void;
  /** Token symbol to display */
  tokenSymbol: string;
  /** Token asset ID for image */
  tokenAssetId: string;
  /** User's balance of this token */
  balance?: number;
  /** Handler for max button */
  onMax?: () => void;
  /** Whether the input is disabled */
  disabled?: boolean;
  /** Error state - shows balance in red */
  error?: boolean;
  /** Error message to show */
  errorMessage?: string;
  /** Placeholder text */
  placeholder?: string;
  /** Whether this field is read-only (calculated output) */
  readOnly?: boolean;
  /** Read-only display value */
  displayValue?: string | number;
  /** Format balance display */
  formatBalance?: (balance: number) => string;
  /** Optional right action (instead of token badge) */
  rightAction?: ReactNode;
  /** Additional className */
  className?: string;
}

export function TokenInputField({
  label,
  value,
  onChange,
  tokenSymbol,
  tokenAssetId,
  balance,
  onMax,
  disabled = false,
  error = false,
  errorMessage,
  placeholder = '0',
  readOnly = false,
  displayValue,
  formatBalance = (b) => b.toLocaleString('en-US', { maximumFractionDigits: 4 }),
  rightAction,
  className = '',
}: TokenInputFieldProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow valid number inputs
    if (/^\d*\.?\d*$/.test(e.target.value)) {
      onChange(e.target.value);
    }
  };

  return (
    <div className={`
      bg-bg-surface rounded-2xl p-4
      border border-white/5 hover:border-white/10 focus-within:border-white/20 focus-within:hover:border-white/20
      transition-colors duration-150
      ${error ? 'border-error/30 hover:border-error/50 focus-within:border-error/70 focus-within:hover:border-error/70' : ''}
      ${className}
    `}>
      {/* Header Row */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-text-secondary">{label}</span>
        {rightAction || (
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0">
              <TokenImage assetId={tokenAssetId} className="w-full h-full" />
            </div>
            <span className="text-text-primary font-medium">{tokenSymbol}</span>
          </div>
        )}
      </div>

      {/* Input Row */}
      {readOnly ? (
        <div className={`text-2xl font-medium ${error ? 'text-error' : 'text-text-primary/60'}`}>
          {displayValue !== undefined ? displayValue : '0'}
        </div>
      ) : (
        <input
          type="text"
          inputMode="decimal"
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled}
          className={`
            w-full bg-transparent text-2xl font-medium 
            outline-none focus:outline-none focus:ring-0
            placeholder:text-text-primary/20 disabled:opacity-50
            ${error ? 'text-error' : 'text-text-primary'}
          `}
        />
      )}

      {/* Balance Row */}
      {balance !== undefined && (
        <div className={`flex items-center justify-between mt-2 ${error ? 'text-error' : 'text-text-muted'}`}>
          <span className="text-sm">
            Balance: {formatBalance(balance)} {tokenSymbol}
            {errorMessage && <span className="ml-1">({errorMessage})</span>}
          </span>
          {onMax && !readOnly && (
            <button
              onClick={onMax}
              disabled={disabled}
              className="px-2 py-0.5 text-xs font-semibold text-brand-primary bg-brand-primary/10 hover:bg-brand-primary/20 rounded-md transition-colors disabled:opacity-50"
            >
              MAX
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * TokenInputWithPlus Component
 * 
 * Two token inputs with a plus icon between them.
 * Used for liquidity add interfaces.
 */
export interface TokenInputWithPlusProps {
  /** First input props */
  inputA: Omit<TokenInputFieldProps, 'className'>;
  /** Second input props */
  inputB: Omit<TokenInputFieldProps, 'className'>;
  /** Additional className */
  className?: string;
}

export function TokenInputWithPlus({
  inputA,
  inputB,
  className = '',
}: TokenInputWithPlusProps) {
  return (
    <div className={`space-y-3 ${className}`}>
      <TokenInputField {...inputA} />
      
      {/* Plus Icon */}
      <div className="flex justify-center">
        <div className="w-10 h-10 rounded-xl bg-bg-elevated flex items-center justify-center">
          <svg className="w-5 h-5 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        </div>
      </div>

      <TokenInputField {...inputB} />
    </div>
  );
}
