import { ExchangeList } from '@/components/ExchangeList';
import { TokenPageConfig } from './types';

interface TokenDetailsSectionProps {
  config: TokenPageConfig;
}

/**
 * Token Details Section
 * Two-column layout: Token details and where to trade
 */
export function TokenDetailsSection({ config }: TokenDetailsSectionProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
      {/* Token Details */}
      <div className="bg-bg-surface rounded-xl border border-border-default overflow-hidden">
        <div className="p-6 border-b border-border-default">
          <h3 className="text-xl font-medium text-text-primary">Token Details</h3>
        </div>
        <div className="divide-y divide-border-default">
          {config.tokenDetails.map((item) => (
            <div key={item.label} className="flex justify-between items-center px-6 py-4">
              <span className="text-text-secondary">{item.label}</span>
              <span className={`text-text-primary ${item.mono ? 'font-mono text-sm' : ''}`}>
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Where to Trade - Using reusable ExchangeList */}
      <ExchangeList 
        exchanges={config.exchanges} 
        title={config.exchangeListTitle} 
      />
    </div>
  );
}
