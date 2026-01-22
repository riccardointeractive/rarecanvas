'use client';

import { ReactNode, useRef, useEffect } from 'react';
import { TokenImage } from './TokenImage';

/**
 * TokenAmountInput Component
 * 
 * Unified amount input for all token-related inputs (swap, pool, staking).
 * Matches SwapCard style: no border, surface background.
 * 
 * Variants:
 * - default: Standard size for staking/forms
 * - large: Larger size for swap interface
 * 
 * @example
 * // Staking
 * <TokenAmountInput
 *   label="Amount to Stake"
 *   value={amount}
 *   onChange={setAmount}
 *   token="DGKO"
 *   balance={1000}
 *   onMaxClick={handleMax}
 * />
 * 
 * // Swap (large)
 * <TokenAmountInput
 *   label="Sell"
 *   value={amount}
 *   onChange={setAmount}
 *   token="KLV"
 *   tokenAssetId="KLV"
 *   balance={500}
 *   usdValue={25.50}
 *   onMaxClick={handleMax}
 *   size="large"
 * />
 */

export interface TokenAmountInputProps {
  /** Label above/beside input */
  label?: string;
  /** Input value */
  value: string;
  /** Change handler */
  onChange: (value: string) => void;
  /** Token symbol */
  token?: string;
  /** Token asset ID for image (if provided, shows token image) */
  tokenAssetId?: string;
  /** Custom token icon (alternative to tokenAssetId) */
  tokenIcon?: ReactNode;
  /** User balance */
  balance?: number;
  /** USD value to display */
  usdValue?: number;
  /** Placeholder */
  placeholder?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Read-only state (shows value but not editable) */
  readOnly?: boolean;
  /** Display value for read-only (overrides value) */
  displayValue?: string;
  /** Error message */
  error?: string;
  /** Helper text below input */
  helperText?: string;
  /** Show MAX button */
  showMaxButton?: boolean;
  /** MAX button click handler */
  onMaxClick?: () => void;
  /** Size variant */
  size?: 'default' | 'large';
  /** Additional className */
  className?: string;
  /** Auto focus on mount */
  autoFocus?: boolean;
  /** Number of decimal places for balance display */
  balancePrecision?: number;
}

/**
 * Format balance with smart abbreviation
 */
function formatBalance(val: number, precision: number = 4): string {
  if (val >= 1_000_000) {
    return (val / 1_000_000).toFixed(2) + 'M';
  } else if (val >= 1_000) {
    return (val / 1_000).toFixed(2) + 'K';
  }
  return val.toLocaleString('en-US', { maximumFractionDigits: precision });
}

/**
 * Format USD with smart micro-price notation
 */
function formatUSD(value: number): string {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(2)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(2)}K`;
  if (value >= 1) return `$${value.toFixed(2)}`;
  if (value >= 0.01) return `$${value.toFixed(4)}`;
  if (value >= 0.0001) return `$${value.toFixed(6)}`;
  if (value === 0) return '$0.00';
  
  // Compact notation for micro-prices: $0.(5)9384
  const priceStr = value.toFixed(20);
  const afterDecimal = priceStr.split('.')[1] || '';
  let zeroCount = 0;
  for (const char of afterDecimal) {
    if (char === '0') zeroCount++;
    else break;
  }
  const significantPart = afterDecimal.slice(zeroCount, zeroCount + 4);
  return `$0.(${zeroCount})${significantPart}`;
}

/**
 * Get dynamic font size based on value length (for large variant)
 */
function getDynamicFontSize(value: string): number {
  const length = value.length;
  if (length <= 6) return 36;
  if (length <= 8) return 30;
  if (length <= 10) return 26;
  if (length <= 12) return 22;
  if (length <= 15) return 18;
  if (length <= 18) return 16;
  if (length <= 22) return 14;
  return 12;
}

export function TokenAmountInput({
  label,
  value,
  onChange,
  token,
  tokenAssetId,
  tokenIcon,
  balance,
  usdValue,
  placeholder = '0',
  disabled = false,
  readOnly = false,
  displayValue,
  error,
  helperText,
  showMaxButton = true,
  onMaxClick,
  size = 'default',
  className = '',
  autoFocus = false,
  balancePrecision = 4,
}: TokenAmountInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (readOnly) return;
    const newValue = e.target.value;
    if (newValue === '' || /^\d*\.?\d*$/.test(newValue)) {
      onChange(newValue);
    }
  };

  const isLarge = size === 'large';
  const showMax = showMaxButton && onMaxClick && !readOnly && !disabled;

  // Token display component
  const TokenDisplay = () => {
    if (!token && !tokenAssetId && !tokenIcon) return null;
    
    return (
      <div className="flex items-center gap-2 flex-shrink-0">
        {tokenAssetId && (
          <TokenImage assetId={tokenAssetId} size="sm" />
        )}
        {tokenIcon && !tokenAssetId && tokenIcon}
        {token && (
          <span className={`font-medium ${isLarge ? 'text-text-primary/60' : 'text-text-secondary'}`}>
            {token}
          </span>
        )}
      </div>
    );
  };

  return (
    <div className={`
      bg-bg-surface rounded-2xl 
      border border-white/5 hover:border-white/10 focus-within:border-white/20 focus-within:hover:border-white/20
      transition-colors duration-150
      ${isLarge ? 'p-4 md:p-6' : 'p-4'} 
      ${error ? 'border-error/30 hover:border-error/50 focus-within:border-error/70 focus-within:hover:border-error/70' : ''}
      ${className}
    `}>
      {/* Header Row */}
      <div className={`flex items-center justify-between ${isLarge ? 'mb-2 md:mb-4' : 'mb-2'}`}>
        {label && (
          <span className={`text-text-secondary ${isLarge ? 'text-xs md:text-sm' : 'text-sm'}`}>
            {label}
          </span>
        )}
        <TokenDisplay />
      </div>

      {/* Input */}
      {readOnly ? (
        <div 
          style={isLarge ? { fontSize: `${getDynamicFontSize(displayValue || value || '0')}px` } : undefined}
          className={`font-medium text-text-primary/60 ${!isLarge ? 'text-2xl font-mono' : ''}`}
        >
          {displayValue || value || '0'}
        </div>
      ) : (
        <input
          ref={inputRef}
          type="text"
          inputMode="decimal"
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled}
          style={isLarge ? { fontSize: `${getDynamicFontSize(value || '0')}px` } : undefined}
          className={`
            w-full bg-transparent font-medium text-text-primary
            outline-none focus:outline-none focus:ring-0
            placeholder:text-text-primary/20
            disabled:opacity-50 disabled:cursor-not-allowed
            ${!isLarge ? 'text-2xl font-mono' : ''}
          `}
        />
      )}

      {/* Footer Row */}
      <div className={`flex items-center justify-between ${isLarge ? 'mt-2 md:mt-4' : 'mt-2'}`}>
        {/* USD Value */}
        {usdValue !== undefined && (
          <span className={`text-text-muted ${isLarge ? 'text-sm md:text-lg' : 'text-sm'}`}>
            {formatUSD(usdValue)}
          </span>
        )}
        {!usdValue && <div />}

        {/* Balance + MAX */}
        <div className="flex items-center gap-2">
          {balance !== undefined && (
            <span className={`text-text-muted ${isLarge ? 'text-xs md:text-sm' : 'text-sm'}`}>
              Balance: {formatBalance(balance, balancePrecision)}
            </span>
          )}
          {showMax && (
            <button
              type="button"
              onClick={onMaxClick}
              disabled={disabled}
              className="px-2 py-0.5 text-xs font-semibold text-brand-primary bg-brand-primary/10 hover:bg-brand-primary/20 rounded-md transition-colors disabled:opacity-50"
            >
              MAX
            </button>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <p className="mt-2 text-sm text-error">{error}</p>
      )}

      {/* Helper Text */}
      {helperText && !error && (
        <p className="mt-2 text-xs text-text-muted">{helperText}</p>
      )}
    </div>
  );
}

// ============================================
// BACKWARDS COMPATIBILITY EXPORTS
// ============================================

/**
 * AmountInput - Alias for TokenAmountInput (backwards compatibility)
 */
export function AmountInput(props: Omit<TokenAmountInputProps, 'tokenAssetId'>) {
  return <TokenAmountInput {...props} />;
}

/**
 * AmountInputCompact - Minimal inline variant
 */
export function AmountInputCompact({
  value,
  onChange,
  placeholder = '0',
  disabled = false,
  readOnly = false,
  token,
  tokenIcon,
  onMaxClick,
  className = '',
}: Pick<TokenAmountInputProps, 'value' | 'onChange' | 'placeholder' | 'disabled' | 'readOnly' | 'token' | 'tokenIcon' | 'onMaxClick' | 'className'>) {
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (readOnly) return;
    const newValue = e.target.value;
    if (newValue === '' || /^\d*\.?\d*$/.test(newValue)) {
      onChange(newValue);
    }
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {tokenIcon && (
        <div className="w-5 h-5 flex-shrink-0">
          {tokenIcon}
        </div>
      )}
      
      <input
        type="text"
        inputMode="decimal"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        readOnly={readOnly}
        className="
          flex-1 min-w-0 bg-transparent
          text-xl font-mono text-text-primary
          outline-none focus:outline-none focus:ring-0
          placeholder:text-text-primary/20
          disabled:cursor-not-allowed
        "
      />
      
      {onMaxClick && !readOnly && (
        <button
          type="button"
          onClick={onMaxClick}
          disabled={disabled}
          className="text-xs font-medium text-text-muted hover:text-brand-primary transition-colors"
        >
          Max
        </button>
      )}

      {token && (
        <span className="text-sm text-text-secondary">{token}</span>
      )}
    </div>
  );
}
