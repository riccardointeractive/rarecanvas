import Link from 'next/link';
import { Exchange } from '@/types/exchange';

/**
 * ExchangeList Component
 * Reusable component for displaying exchange/trading platform listings
 * Used on token pages and documentation
 */

interface ExchangeListProps {
  exchanges: Exchange[];
  title?: string;
  showArrow?: boolean;
}

export function ExchangeList({ 
  exchanges, 
  title = "Where to Trade",
  showArrow = true 
}: ExchangeListProps) {
  // Arrow icon
  const ArrowIcon = (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
    </svg>
  );

  return (
    <div className="bg-bg-surface rounded-2xl border border-border-default overflow-hidden">
      <div className="p-6 border-b border-border-default">
        <h3 className="text-xl font-medium text-text-primary">{title}</h3>
      </div>
      <div className="p-4 space-y-2">
        {exchanges.map((exchange) => {
          const isExternal = exchange.url.startsWith('http');
          const Component = isExternal ? 'a' : Link;
          const externalProps = isExternal 
            ? { target: '_blank', rel: 'noopener noreferrer' }
            : {};

          return (
            <Component
              key={exchange.name}
              href={exchange.url}
              {...externalProps}
              className="flex items-center justify-between p-4 rounded-xl bg-overlay-default hover:bg-overlay-active transition-colors group"
            >
              <div className="flex items-center gap-3">
                {exchange.logo && (
                  <img 
                    src={exchange.logo} 
                    alt={`${exchange.name} logo`}
                    className="w-8 h-8 rounded-lg object-cover"
                  />
                )}
                <div>
                  <div className="text-text-primary font-medium">{exchange.name}</div>
                  <div className="text-xs text-text-muted">
                    {exchange.type}{exchange.pair && ` • ${exchange.pair}`}
                  </div>
                </div>
              </div>
              {showArrow && (
                <span className="text-text-secondary group-hover:text-text-primary transition-colors">
                  {ArrowIcon}
                </span>
              )}
            </Component>
          );
        })}
      </div>
    </div>
  );
}
