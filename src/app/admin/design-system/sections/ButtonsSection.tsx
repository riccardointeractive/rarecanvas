'use client';

import { ComponentPreview } from '../components/ComponentPreview';
import { Button } from '@/components/Button';
import { CheckCircle, Info } from 'lucide-react';

export function ButtonsSection() {
  return (
    <div>
      {/* BUTTONS */}
      <section id="buttons" className="mb-20">
        <div className="mb-8">
          <h2 className="text-4xl font-semibold text-text-primary mb-2">Buttons</h2>
          <p className="text-text-secondary mb-4">Button variants for different actions and contexts</p>
          
          {/* Connection Status */}
          <div className="bg-bg-surface rounded-xl p-4 border border-border-success bg-success-muted mb-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-medium text-text-primary mb-1">Connected Component</div>
                <p className="text-xs text-text-secondary">Button uses the actual @/components/Button component. Changes to Button.tsx automatically update here.</p>
              </div>
            </div>
          </div>
          
          <div className="bg-bg-surface rounded-xl p-4 border border-brand-primary/20 bg-brand-primary/5">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-brand-primary flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-medium text-text-primary mb-1">Signature Effects</div>
                <p className="text-xs text-text-secondary">Primary buttons use purple glow shadows and a shimmer animation on hover. This is a key part of Rare Canvas premium fintech aesthetic.</p>
              </div>
            </div>
          </div>
        </div>

        <ComponentPreview
          title="Primary Button (Real Component)"
          description="Main call-to-action buttons with glow effect and shimmer animation"
          code={`import { Button } from '@/components/Button';

<Button variant="primary">
  Primary Action
</Button>

// Or build from scratch:
<button className="group relative bg-brand-primary hover:bg-brand-primary-hover text-text-primary px-6 py-4 rounded-2xl font-medium transition-all duration-500 shadow-[0_0_40px_rgba(0,102,255,0.3)] hover:shadow-[0_0_60px_rgba(0,102,255,0.5)] hover:scale-[1.02] overflow-hidden">
  <span className="relative z-10">Primary Action</span>
  <div className="absolute inset-0 bg-gradient-to-r from-info/0 via-info/30 to-brand-secondary/0 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
</button>`}
          centered
        >
          <div className="p-12 bg-bg-base rounded-xl">
            <Button variant="primary">
              Primary Action
            </Button>
          </div>
        </ComponentPreview>

        <ComponentPreview
          title="Secondary Button (Real Component)"
          description="Secondary actions with surface styling"
          code={`import { Button } from '@/components/Button';

<Button variant="secondary">
  Secondary Action
</Button>

// Or build from scratch:
<button className="bg-overlay-subtle hover:bg-overlay-default border border-border-default hover:border-border-hover text-text-primary px-6 py-4 rounded-2xl font-medium transition-all duration-300">
  Secondary Action
</button>`}
          centered
        >
          <Button variant="secondary">
            Secondary Action
          </Button>
        </ComponentPreview>

        <ComponentPreview
          title="Danger Button (Real Component)"
          description="Destructive or warning actions"
          code={`import { Button } from '@/components/Button';

<Button variant="danger">
  Danger Action
</Button>`}
          centered
        >
          <Button variant="danger">
            Danger Action
          </Button>
        </ComponentPreview>

        <ComponentPreview
          title="Ghost Button (Real Component)"
          description="Minimal button for tertiary actions"
          code={`import { Button } from '@/components/Button';

<Button variant="ghost">
  Ghost Action
</Button>`}
          centered
        >
          <Button variant="ghost">
            Ghost Action
          </Button>
        </ComponentPreview>

        <ComponentPreview
          title="Disabled State (Real Component)"
          description="Disabled button appearance - works with any variant"
          code={`import { Button } from '@/components/Button';

<Button variant="primary" disabled>
  Disabled
</Button>`}
          centered
        >
          <Button variant="primary" disabled>
            Disabled
          </Button>
        </ComponentPreview>

        <ComponentPreview
          title="Loading State (Real Component)"
          description="Button with loading spinner - works with any variant"
          code={`import { Button } from '@/components/Button';

<Button variant="primary" loading>
  Loading...
</Button>`}
          centered
        >
          <Button variant="primary" loading>
            Loading...
          </Button>
        </ComponentPreview>

        <ComponentPreview
          title="Button Sizes (Real Component)"
          description="Small, medium, and large button variants"
          code={`import { Button } from '@/components/Button';

{/* Small */}
<Button variant="primary" size="sm">
  Small
</Button>

{/* Medium (default) */}
<Button variant="primary" size="md">
  Medium
</Button>

{/* Large */}
<Button variant="primary" size="lg">
  Large
</Button>`}
          centered
        >
          <div className="flex items-center gap-6 flex-wrap p-8">
            <Button variant="primary" size="sm">
              Small
            </Button>
            <Button variant="primary" size="md">
              Medium
            </Button>
            <Button variant="primary" size="lg">
              Large
            </Button>
          </div>
        </ComponentPreview>
      </section>
    </div>
  );
}
