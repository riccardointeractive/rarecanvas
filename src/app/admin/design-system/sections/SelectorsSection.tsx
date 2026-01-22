'use client';

import { useState } from 'react';
import { ComponentPreview } from '../components/ComponentPreview';
import { TokenSelector, Token } from '@/components/TokenSelector';
import { CheckCircle, Info, Check } from 'lucide-react';

export function SelectorsSection() {
  const [selectedToken, setSelectedToken] = useState('KLV');

  // Demo tokens for TokenSelector
  const demoTokens: Token[] = [
    {
      id: 'klv',
      symbol: 'KLV',
      name: 'Klever',
      balance: '1,234.56',
      assetId: 'KLV',
    },
    {
      id: 'kfi',
      symbol: 'KFI',
      name: 'Klever Finance',
      balance: '500.00',
      assetId: 'KFI',
    },
  ];

  return (
    <div>
      {/* SELECTORS */}
      <section id="selectors" className="mb-20">
        <div className="mb-8">
          <h2 className="text-4xl font-semibold text-text-primary mb-2">Selectors</h2>
          <p className="text-text-secondary mb-4">Token and trading pair selector components for swap, pool, and staking interfaces</p>
          
          {/* Connection Status */}
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div className="bg-bg-surface rounded-xl p-4 border border-border-success bg-success-muted">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-medium text-text-primary mb-1">Connected Components</div>
                  <p className="text-xs text-text-secondary">TokenSelector and TradingPairSelector use actual @/components</p>
                </div>
              </div>
            </div>
            
            <div className="bg-bg-surface rounded-xl p-4 border border-brand-primary/20 bg-brand-primary/5">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-brand-primary flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-medium text-text-primary mb-1">Full-Width Design</div>
                  <p className="text-xs text-text-secondary">Both selectors expand to full container width for better UX on all devices</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* TOKEN SELECTOR */}
        <ComponentPreview
          title="TokenSelector"
          description="Full-width token selector for staking page - shows token, name, and balance"
          code={`import { TokenSelector, Token } from '@/components/TokenSelector';

const tokens: Token[] = [
  {
    id: 'klv',
    symbol: 'KLV',
    name: 'Klever',
    balance: '1,234.56',
    assetId: 'KLV',
  },
  {
    id: 'dgko',
    symbol: 'RC',
    name: 'Rare Canvas',
    balance: '5,678.90',
    assetId: 'DGKO-CXVJ',
  },
];

<TokenSelector
  tokens={tokens}
  selectedToken={selectedToken}
  onSelect={(symbol) => setSelectedToken(symbol)}
  showBalance={true}
/>`}
        >
          <div className="max-w-xl">
            <TokenSelector
              tokens={demoTokens}
              selectedToken={selectedToken}
              onSelect={setSelectedToken}
              showBalance
            />
          </div>
        </ComponentPreview>

        {/* TOKEN SELECTOR VARIANTS */}
        <ComponentPreview
          title="TokenSelector - Variants"
          description="Different states and configurations"
          code={`// Without balance
<TokenSelector
  tokens={tokens}
  selectedToken={selectedToken}
  onSelect={setSelectedToken}
  showBalance={false}
/>

// Disabled state
<TokenSelector
  tokens={tokens}
  selectedToken={selectedToken}
  onSelect={setSelectedToken}
  disabled
/>`}
        >
          <div className="space-y-6 max-w-xl">
            <div>
              <div className="text-xs text-text-muted uppercase tracking-wider mb-3">Without Balance</div>
              <TokenSelector
                tokens={demoTokens}
                selectedToken={selectedToken}
                onSelect={setSelectedToken}
                showBalance={false}
              />
            </div>
            <div>
              <div className="text-xs text-text-muted uppercase tracking-wider mb-3">Disabled</div>
              <TokenSelector
                tokens={demoTokens}
                selectedToken={selectedToken}
                onSelect={setSelectedToken}
                disabled
              />
            </div>
          </div>
        </ComponentPreview>

        {/* BEST PRACTICES */}
        <div className="bg-bg-surface rounded-2xl p-6 border border-border-default mt-12">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Best Practices</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Check className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-medium text-text-primary mb-1">Use full-width selectors</div>
                <p className="text-xs text-text-secondary">TokenSelector is designed to be full-width for better mobile UX and information display</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Check className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-medium text-text-primary mb-1">Show relevant context</div>
                <p className="text-xs text-text-secondary">Display balance for tokens when available</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Check className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-medium text-text-primary mb-1">Use TokenSelector for single tokens</div>
                <p className="text-xs text-text-secondary">Staking page uses TokenSelector for token selection</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
