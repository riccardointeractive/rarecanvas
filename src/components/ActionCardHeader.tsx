import { ReactNode } from 'react';
import { RefreshButton } from './RefreshButton';

/**
 * ActionCardHeader Component
 * 
 * Consistent header for action cards with title, optional icon, and optional refresh button.
 * Used in staking, swap, pool, and other interactive cards.
 * 
 * @example
 * // Simple title
 * <ActionCardHeader title="Stake" />
 * 
 * // With icon (matches Pool page style)
 * <ActionCardHeader 
 *   title="Stake" 
 *   icon={<Coins className="w-5 h-5" />}
 *   iconColor="blue"
 * />
 * 
 * // With refresh button
 * <ActionCardHeader 
 *   title="Stake" 
 *   icon={<Coins className="w-5 h-5" />}
 *   onRefresh={handleRefresh} 
 *   isLoading={isLoading} 
 * />
 */

export interface ActionCardHeaderProps {
  /** Header title */
  title: string;
  /** Optional icon (lucide-react or custom) */
  icon?: ReactNode;
  /** Icon color variant */
  iconColor?: 'blue' | 'green' | 'red' | 'purple' | 'cyan' | 'amber';
  /** Refresh callback */
  onRefresh?: () => void;
  /** Loading state */
  isLoading?: boolean;
  /** Right side content (instead of refresh button) */
  rightContent?: ReactNode;
  /** Additional className */
  className?: string;
}

const iconColorMap = {
  blue: 'text-info',
  green: 'text-success',
  red: 'text-error',
  purple: 'text-brand-primary',
  cyan: 'text-info',
  amber: 'text-warning',
};

export function ActionCardHeader({
  title,
  icon,
  iconColor = 'blue',
  onRefresh,
  isLoading = false,
  rightContent,
  className = '',
}: ActionCardHeaderProps) {
  return (
    <div className={`flex items-center justify-between mb-4 md:mb-6 ${className}`}>
      <div className="flex items-center gap-2">
        {icon && (
          <span className={iconColorMap[iconColor]}>
            {icon}
          </span>
        )}
        <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
      </div>
      {rightContent ? (
        rightContent
      ) : onRefresh ? (
        <RefreshButton 
          onClick={onRefresh} 
          isLoading={isLoading} 
          title={`Refresh ${title.toLowerCase()}`}
        />
      ) : null}
    </div>
  );
}
