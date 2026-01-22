'use client';

import { useState } from 'react';
import { ComponentPreview } from '../components/ComponentPreview';
import { Alert } from '@/components/Alert';
import { ProgressSteps, Step } from '@/components/ProgressSteps';
import { PercentageSelector } from '@/components/PercentageSelector';
import { TokenPairBadge, TokenPairLabel } from '@/components/TokenPairBadge';
import { CheckCircle, Info, Check } from 'lucide-react';

export function FeedbackSection() {
  const [_showAlert, _setShowAlert] = useState(true);
  const [percentage, setPercentage] = useState(50);

  // Demo progress steps
  const pendingSteps: Step[] = [
    { label: 'Add DGKO', status: 'pending' },
    { label: 'Add KLV', status: 'pending' },
  ];

  const inProgressSteps: Step[] = [
    { label: 'Add DGKO', status: 'complete' },
    { label: 'Add KLV', status: 'current' },
  ];

  const completeSteps: Step[] = [
    { label: 'Add DGKO', status: 'complete' },
    { label: 'Add KLV', status: 'complete' },
  ];

  const errorSteps: Step[] = [
    { label: 'Add DGKO', status: 'complete' },
    { label: 'Add KLV', status: 'error' },
  ];

  return (
    <div>
      {/* FEEDBACK & STATUS */}
      <section id="feedback" className="mb-20">
        <div className="mb-8">
          <h2 className="text-4xl font-semibold text-text-primary mb-2">Feedback & Status</h2>
          <p className="text-text-secondary mb-4">Components for user feedback, progress indication, and status display</p>
          
          {/* Connection Status */}
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div className="bg-bg-surface rounded-xl p-4 border border-border-success bg-success-muted">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-medium text-text-primary mb-1">Connected Components</div>
                  <p className="text-xs text-text-secondary">Alert, ProgressSteps, PercentageSelector, TokenPairBadge use actual @/components</p>
                </div>
              </div>
            </div>
            
            <div className="bg-bg-surface rounded-xl p-4 border border-brand-primary/20 bg-brand-primary/5">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-brand-primary flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-medium text-text-primary mb-1">Usage Context</div>
                  <p className="text-xs text-text-secondary">These components are used in Pool, Swap, and transaction flows</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ALERT COMPONENT */}
        <ComponentPreview
          title="Alert"
          description="Contextual feedback messages with dismissible option and optional links"
          code={`import { Alert } from '@/components/Alert';

// Success alert
<Alert variant="success" onDismiss={() => {}}>
  Transaction completed successfully
</Alert>

// Error alert
<Alert variant="error" onDismiss={() => {}}>
  Transaction failed: insufficient balance
</Alert>

// Warning alert
<Alert variant="warning">
  This action cannot be undone
</Alert>

// Info alert with link
<Alert 
  variant="info"
  link={{
    href: 'https://kleverscan.org/tx/...',
    label: 'View transaction',
    external: true
  }}
>
  Your transaction is being processed
</Alert>

// With title
<Alert variant="success" title="Success!">
  Your liquidity has been added to the pool
</Alert>`}
        >
          <div className="space-y-4">
            <Alert variant="success" onDismiss={() => {}}>
              Transaction completed successfully
            </Alert>
            
            <Alert variant="error" onDismiss={() => {}}>
              Transaction failed: insufficient balance
            </Alert>
            
            <Alert variant="warning">
              This action cannot be undone
            </Alert>
            
            <Alert 
              variant="info"
              link={{
                href: '#',
                label: 'View transaction',
                external: true
              }}
            >
              Your transaction is being processed
            </Alert>
          </div>
        </ComponentPreview>

        {/* ALERT VARIANTS */}
        <ComponentPreview
          title="Alert Variants"
          description="All four semantic variants with their icons and colors"
          code={`// Variants: success, error, warning, info

// Each variant has:
// - Appropriate icon (CheckCircle, XCircle, AlertTriangle, AlertCircle)
// - Semantic background color (green, red, yellow, blue)
// - Matching border color
// - Optional dismiss button (X)`}
        >
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="text-xs text-text-muted uppercase tracking-wider mb-2">Success</div>
              <Alert variant="success">Liquidity added successfully</Alert>
            </div>
            <div className="space-y-2">
              <div className="text-xs text-text-muted uppercase tracking-wider mb-2">Error</div>
              <Alert variant="error">Failed to connect wallet</Alert>
            </div>
            <div className="space-y-2">
              <div className="text-xs text-text-muted uppercase tracking-wider mb-2">Warning</div>
              <Alert variant="warning">High slippage detected</Alert>
            </div>
            <div className="space-y-2">
              <div className="text-xs text-text-muted uppercase tracking-wider mb-2">Info</div>
              <Alert variant="info">Swap fee: 1% of transaction</Alert>
            </div>
          </div>
        </ComponentPreview>

        {/* PROGRESS STEPS */}
        <ComponentPreview
          title="Progress Steps"
          description="Multi-step transaction progress indicator for sequential operations"
          code={`import { ProgressSteps, Step } from '@/components/ProgressSteps';

const steps: Step[] = [
  { label: 'Add DGKO', status: 'complete' },
  { label: 'Add KLV', status: 'current' },
];

<ProgressSteps steps={steps} />

// Step status options: 'pending' | 'current' | 'complete' | 'error'

// Horizontal variant for compact displays
<ProgressSteps steps={steps} variant="horizontal" />`}
        >
          <div className="space-y-8">
            <div>
              <div className="text-xs text-text-muted uppercase tracking-wider mb-3">Pending State</div>
              <ProgressSteps steps={pendingSteps} />
            </div>
            
            <div>
              <div className="text-xs text-text-muted uppercase tracking-wider mb-3">In Progress</div>
              <ProgressSteps steps={inProgressSteps} />
            </div>
            
            <div>
              <div className="text-xs text-text-muted uppercase tracking-wider mb-3">Complete</div>
              <ProgressSteps steps={completeSteps} />
            </div>
            
            <div>
              <div className="text-xs text-text-muted uppercase tracking-wider mb-3">Error State</div>
              <ProgressSteps steps={errorSteps} />
            </div>
          </div>
        </ComponentPreview>

        {/* PROGRESS STEPS HORIZONTAL */}
        <ComponentPreview
          title="Progress Steps - Horizontal"
          description="Compact horizontal layout for inline progress display"
          code={`<ProgressSteps steps={steps} variant="horizontal" />`}
        >
          <div className="space-y-6">
            <div>
              <div className="text-xs text-text-muted uppercase tracking-wider mb-3">In Progress (Horizontal)</div>
              <ProgressSteps steps={inProgressSteps} variant="horizontal" />
            </div>
            <div>
              <div className="text-xs text-text-muted uppercase tracking-wider mb-3">Complete (Horizontal)</div>
              <ProgressSteps steps={completeSteps} variant="horizontal" />
            </div>
          </div>
        </ComponentPreview>

        {/* PERCENTAGE SELECTOR */}
        <ComponentPreview
          title="Percentage Selector"
          description="Quick percentage selection buttons with optional slider for fine control"
          code={`import { PercentageSelector } from '@/components/PercentageSelector';

<PercentageSelector
  value={percentage}
  onChange={setPercentage}
  variant="blue"
/>

// With slider for precise control
<PercentageSelector
  value={percentage}
  onChange={setPercentage}
  variant="red"
  withSlider
/>

// Variants: blue, red, green, gray`}
        >
          <div className="space-y-8">
            <div>
              <div className="text-xs text-text-muted uppercase tracking-wider mb-3">Blue Variant (Default)</div>
              <PercentageSelector
                value={percentage}
                onChange={setPercentage}
                variant="blue"
              />
            </div>
            
            <div>
              <div className="text-xs text-text-muted uppercase tracking-wider mb-3">Red Variant (For Remove Actions)</div>
              <PercentageSelector
                value={percentage}
                onChange={setPercentage}
                variant="red"
              />
            </div>
            
            <div>
              <div className="text-xs text-text-muted uppercase tracking-wider mb-3">With Slider</div>
              <PercentageSelector
                value={percentage}
                onChange={setPercentage}
                variant="blue"
                withSlider
              />
            </div>
          </div>
        </ComponentPreview>

        {/* TOKEN PAIR BADGE */}
        <ComponentPreview
          title="Token Pair Badge"
          description="Overlapping token images for displaying trading pairs"
          code={`import { TokenPairBadge, TokenPairLabel } from '@/components/TokenPairBadge';

// Basic badge
<TokenPairBadge 
  tokenA="DGKO" 
  tokenB="KLV"
  size="md"
/>

// Sizes: xs, sm, md, lg
<TokenPairBadge tokenA="DGKO" tokenB="KLV" size="xs" />
<TokenPairBadge tokenA="DGKO" tokenB="KLV" size="sm" />
<TokenPairBadge tokenA="DGKO" tokenB="KLV" size="md" />
<TokenPairBadge tokenA="DGKO" tokenB="KLV" size="lg" />

// With label
<TokenPairLabel 
  tokenA="DGKO" 
  tokenB="KLV"
  symbolA="DGKO"
  symbolB="KLV"
/>`}
        >
          <div className="space-y-6">
            <div>
              <div className="text-xs text-text-muted uppercase tracking-wider mb-3">Sizes</div>
              <div className="flex items-center gap-6">
                <div className="flex flex-col items-center gap-2">
                  <TokenPairBadge tokenA="DGKO" tokenB="KLV" size="xs" />
                  <span className="text-xs text-text-muted">xs</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <TokenPairBadge tokenA="DGKO" tokenB="KLV" size="sm" />
                  <span className="text-xs text-text-muted">sm</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <TokenPairBadge tokenA="DGKO" tokenB="KLV" size="md" />
                  <span className="text-xs text-text-muted">md</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <TokenPairBadge tokenA="DGKO" tokenB="KLV" size="lg" />
                  <span className="text-xs text-text-muted">lg</span>
                </div>
              </div>
            </div>
            
            <div>
              <div className="text-xs text-text-muted uppercase tracking-wider mb-3">With Label</div>
              <TokenPairLabel 
                tokenA="DGKO" 
                tokenB="KLV"
                symbolA="DGKO"
                symbolB="KLV"
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
                <div className="text-sm font-medium text-text-primary mb-1">Use semantic variants</div>
                <p className="text-xs text-text-secondary">Success for completions, error for failures, warning for cautions, info for neutral messages</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Check className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-medium text-text-primary mb-1">Make alerts dismissible when appropriate</div>
                <p className="text-xs text-text-secondary">Allow users to dismiss non-critical alerts to reduce visual clutter</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Check className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-medium text-text-primary mb-1">Show progress for multi-step operations</div>
                <p className="text-xs text-text-secondary">Use ProgressSteps to give users visibility into sequential transaction flows</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Check className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-medium text-text-primary mb-1">Link to transaction explorers</div>
                <p className="text-xs text-text-secondary">Always provide links to view transactions on KleverScan for transparency</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Check className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-medium text-text-primary mb-1">Use color-coded percentage selectors</div>
                <p className="text-xs text-text-secondary">Red for removals/destructive actions, blue for additions, green for rewards</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
