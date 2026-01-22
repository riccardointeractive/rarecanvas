import { TokenImage } from './TokenImage';

/**
 * TokenPairBadge Component
 * 
 * Displays two token images overlapping, commonly used in DEX/pool interfaces.
 * 
 * @example
 * <TokenPairBadge
 *   tokenA="DGKO-1X2Y"
 *   tokenB="KLV"
 *   size="md"
 * />
 */

export type TokenPairBadgeSize = 'xs' | 'sm' | 'md' | 'lg';

export interface TokenPairBadgeProps {
  /** First token asset ID */
  tokenA: string;
  /** Second token asset ID */
  tokenB: string;
  /** Size variant */
  size?: TokenPairBadgeSize;
  /** Additional className */
  className?: string;
}

const sizeStyles = {
  xs: {
    wrapper: '-space-x-1',
    token: 'w-4 h-4',
  },
  sm: {
    wrapper: '-space-x-1.5',
    token: 'w-5 h-5',
  },
  md: {
    wrapper: '-space-x-2',
    token: 'w-6 h-6',
  },
  lg: {
    wrapper: '-space-x-2.5',
    token: 'w-8 h-8',
  },
};

export function TokenPairBadge({
  tokenA,
  tokenB,
  size = 'md',
  className = '',
}: TokenPairBadgeProps) {
  const styles = sizeStyles[size];

  return (
    <div className={`flex ${styles.wrapper} ${className}`}>
      <div className={`${styles.token} rounded-full overflow-hidden relative z-10`}>
        <TokenImage assetId={tokenA} className="w-full h-full" />
      </div>
      <div className={`${styles.token} rounded-full overflow-hidden`}>
        <TokenImage assetId={tokenB} className="w-full h-full" />
      </div>
    </div>
  );
}

/**
 * TokenPairLabel Component
 * 
 * Token pair badge with label text (e.g., "DGKO/KLV")
 */
export interface TokenPairLabelProps extends TokenPairBadgeProps {
  /** First token symbol */
  symbolA: string;
  /** Second token symbol */
  symbolB: string;
  /** Show pair name after icons */
  showLabel?: boolean;
}

export function TokenPairLabel({
  tokenA,
  tokenB,
  symbolA,
  symbolB,
  size = 'md',
  showLabel = true,
  className = '',
}: TokenPairLabelProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <TokenPairBadge tokenA={tokenA} tokenB={tokenB} size={size} />
      {showLabel && (
        <span className="text-text-primary font-medium">
          {symbolA}/{symbolB}
        </span>
      )}
    </div>
  );
}
