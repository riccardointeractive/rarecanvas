import Link from 'next/link';
import { TokenImage } from './TokenImage';

/**
 * TokenShowcaseCard Component - Linear Style
 * 
 * Compact showcase card for ecosystem tokens.
 */

export interface TokenStat {
  label: string;
  value: string;
  highlight?: boolean;
}

export interface TokenShowcaseCardProps {
  tokenId: string;
  name: string;
  ticker: string;
  href: string;
  description: string;
  stats: TokenStat[];
  accentColor?: 'blue' | 'cyan';
  className?: string;
}

export function TokenShowcaseCard({
  tokenId,
  name,
  ticker,
  href,
  description,
  stats,
  className = '',
}: TokenShowcaseCardProps) {
  return (
    <Link 
      href={href} 
      className={`group block p-5 rounded-xl border border-border-default bg-bg-surface hover:bg-bg-elevated hover:border-border-hover transition-colors duration-150 ${className}`}
    >
      {/* Token header */}
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-lg bg-bg-elevated flex items-center justify-center overflow-hidden">
          <TokenImage assetId={tokenId} size="md" />
        </div>
        <div>
          <h3 className="text-base font-medium text-text-primary">{name}</h3>
          <p className="text-xs text-text-muted font-mono">{ticker}</p>
        </div>
      </div>
      
      {/* Description */}
      <p className="text-sm text-text-secondary leading-relaxed mb-4">
        {description}
      </p>
      
      {/* Stats */}
      <div className="flex gap-6 text-sm">
        {stats.map((stat, index) => (
          <div key={index}>
            <div className="text-text-muted text-xs mb-0.5">{stat.label}</div>
            <div className={`font-medium ${stat.highlight ? 'text-brand-primary' : 'text-text-primary'}`}>
              {stat.value}
            </div>
          </div>
        ))}
      </div>
    </Link>
  );
}
