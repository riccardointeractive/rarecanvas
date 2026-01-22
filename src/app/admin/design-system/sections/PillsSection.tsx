'use client';

import { useState } from 'react';
import { ComponentPreview } from '../components/ComponentPreview';
import { Pill, PillGroup } from '@/components/ui';

export function PillsSection() {
  return (
    <div>
      <section id="pills" className="mb-20">
        <div className="mb-8">
          <h2 className="text-4xl font-semibold text-text-primary mb-2">Pills</h2>
          <p className="text-text-secondary">Pill-shaped buttons for filters, tabs, and option selection</p>
        </div>

        <ComponentPreview
          title="Filter Pills"
          description="Use for filtering content or switching between views"
          code={`import { Pill, PillGroup } from '@/components/ui';

<PillGroup>
  <Pill active>All</Pill>
  <Pill>Active</Pill>
  <Pill>Completed</Pill>
</PillGroup>`}
        >
          <PillGroupDemo />
        </ComponentPreview>

        <ComponentPreview
          title="Pills with Icons"
          description="Add icons for token filters or category selection"
          code={`import { Pill, PillGroup } from '@/components/ui';

<PillGroup scrollable>
  <Pill active>All</Pill>
  <Pill icon={<TokenIcon />}>KLV</Pill>
  <Pill icon={<TokenIcon />}>DGKO</Pill>
</PillGroup>`}
        >
          <div className="flex gap-2">
            <Pill active>All</Pill>
            <Pill icon={<div className="w-4 h-4 rounded-full bg-brand-secondary" />}>KLV</Pill>
            <Pill icon={<div className="w-4 h-4 rounded-full bg-brand-primary" />}>DGKO</Pill>
            <Pill icon={<div className="w-4 h-4 rounded-full bg-warning" />}>BABYDGKO</Pill>
          </div>
        </ComponentPreview>

        <ComponentPreview
          title="Pill Sizes"
          description="Three size variants for different contexts"
          code={`<Pill size="sm">Small</Pill>
<Pill size="md">Medium</Pill>
<Pill size="lg">Large</Pill>`}
          centered
        >
          <div className="flex items-center gap-3">
            <Pill size="sm" active>Small</Pill>
            <Pill size="md" active>Medium</Pill>
            <Pill size="lg" active>Large</Pill>
          </div>
        </ComponentPreview>

        <ComponentPreview
          title="Scrollable PillGroup"
          description="For many options, enable horizontal scroll"
          code={`<PillGroup scrollable>
  <Pill active>All</Pill>
  <Pill>Option 1</Pill>
  <Pill>Option 2</Pill>
  {/* More pills... */}
</PillGroup>`}
        >
          <PillGroup scrollable>
            <Pill active>All</Pill>
            <Pill>Swaps</Pill>
            <Pill>Deposits</Pill>
            <Pill>Withdrawals</Pill>
            <Pill>Stakes</Pill>
            <Pill>Unstakes</Pill>
            <Pill>Claims</Pill>
          </PillGroup>
        </ComponentPreview>
      </section>
    </div>
  );
}

// Demo component for interactive pills
function PillGroupDemo() {
  const [active, setActive] = useState('all');
  
  return (
    <PillGroup>
      <Pill active={active === 'all'} onClick={() => setActive('all')}>All</Pill>
      <Pill active={active === 'active'} onClick={() => setActive('active')}>Active</Pill>
      <Pill active={active === 'completed'} onClick={() => setActive('completed')}>Completed</Pill>
      <Pill active={active === 'pending'} onClick={() => setActive('pending')}>Pending</Pill>
    </PillGroup>
  );
}
