'use client';

import { ComponentPreview } from '../components/ComponentPreview';
import { Badge, FeatureBadge } from '@/components/ui';
import { CheckCircle, Info } from 'lucide-react';

export function BadgesSection() {
  return (
    <div>
      <section id="badges" className="mb-20">
        <div className="mb-8">
          <h2 className="text-4xl font-semibold text-text-primary mb-2">Badges</h2>
          <p className="text-text-secondary mb-4">Status indicators and feature labels</p>
          
          {/* Connection Status */}
          <div className="bg-bg-surface rounded-xl p-4 border border-border-success bg-success-muted mb-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-medium text-text-primary mb-1">Connected Component</div>
                <p className="text-xs text-text-secondary">Badge uses the actual @/components/ui/Badge component. Changes to Badge.tsx automatically update here.</p>
              </div>
            </div>
          </div>
          
          <div className="bg-bg-surface rounded-xl p-4 border border-brand-primary/20 bg-brand-primary/5">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-brand-primary flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-medium text-text-primary mb-1">Design Principle</div>
                <p className="text-xs text-text-secondary">ALL badges are uppercase for improved readability and to visually distinguish them from buttons. This is enforced at the component level.</p>
              </div>
            </div>
          </div>
        </div>

        <ComponentPreview
          title="Gradient Badge (Beta Style)"
          description="The signature beta badge with gradient background and optional blur effect. All badges are automatically uppercase."
          code={`import { Badge, FeatureBadge } from '@/components/ui';

{/* Direct usage - auto uppercase */}
<Badge variant="gradient" blur>BETA</Badge>

{/* Helper component */}
<FeatureBadge label="BETA" blur />`}
          centered
        >
          <div className="flex flex-wrap items-center gap-4">
            <Badge variant="gradient">BETA</Badge>
            <Badge variant="gradient" blur>BETA</Badge>
            <FeatureBadge label="BETA" blur />
          </div>
        </ComponentPreview>

        <ComponentPreview
          title="Status Badges"
          description="Success, warning, error, and info badges. Always uppercase for readability and to distinguish from buttons."
          code={`import { Badge } from '@/components/ui';

<Badge variant="success">ACTIVE</Badge>
<Badge variant="warning">PENDING</Badge>
<Badge variant="error">FAILED</Badge>
<Badge variant="info">PROCESSING</Badge>`}
          centered
        >
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="success">ACTIVE</Badge>
            <Badge variant="warning">PENDING</Badge>
            <Badge variant="error">FAILED</Badge>
            <Badge variant="info">PROCESSING</Badge>
          </div>
        </ComponentPreview>

        <ComponentPreview
          title="Feature Badges"
          description="SOON, BETA, NEW, LIVE badges. Input can be any case - output is always uppercase."
          code={`import { FeatureBadge } from '@/components/ui';

<FeatureBadge label="SOON" />
<FeatureBadge label="BETA" blur />
<FeatureBadge label="NEW" />
<FeatureBadge label="LIVE" />`}
          centered
        >
          <div className="flex flex-wrap items-center gap-3">
            <FeatureBadge label="SOON" />
            <FeatureBadge label="BETA" blur />
            <FeatureBadge label="NEW" />
            <FeatureBadge label="LIVE" />
          </div>
        </ComponentPreview>

        <ComponentPreview
          title="Badge Sizes"
          description="Small, medium, and large badge variants"
          code={`import { Badge } from '@/components/ui';

<Badge variant="feature" size="sm">SMALL</Badge>
<Badge variant="feature" size="md">MEDIUM</Badge>
<Badge variant="feature" size="lg">LARGE</Badge>`}
          centered
        >
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="feature" size="sm">SMALL</Badge>
            <Badge variant="feature" size="md">MEDIUM</Badge>
            <Badge variant="feature" size="lg">LARGE</Badge>
          </div>
        </ComponentPreview>

        <ComponentPreview
          title="Badges with Dot Indicators"
          description="Status dots for live/active states with optional pulse animation"
          code={`import { Badge } from '@/components/ui';

{/* Static dot */}
<Badge variant="success" dot>ACTIVE</Badge>

{/* Pulsing dot */}
<Badge variant="success" dot pulse>LIVE</Badge>

{/* FeatureBadge auto-adds pulse for LIVE/HOT */}
<FeatureBadge label="LIVE" />`}
          centered
        >
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="success" dot>ACTIVE</Badge>
            <Badge variant="success" dot pulse>LIVE</Badge>
            <FeatureBadge label="LIVE" />
            <Badge variant="info" dot pulse>STREAMING</Badge>
          </div>
        </ComponentPreview>

        <ComponentPreview
          title="Ghost Badge"
          description="Minimal badge with no background for subtle labels"
          code={`import { Badge } from '@/components/ui';

<Badge variant="ghost">GHOST</Badge>`}
          centered
        >
          <Badge variant="ghost">GHOST BADGE</Badge>
        </ComponentPreview>
      </section>
    </div>
  );
}
