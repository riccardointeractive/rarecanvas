'use client';

import { useState } from 'react';
import { ComponentPreview } from '../components/ComponentPreview';

export function FoundationsSection() {
  const [copiedColor, setCopiedColor] = useState<string | null>(null);

  const copyColor = (color: string, label: string) => {
    navigator.clipboard.writeText(color);
    setCopiedColor(label);
    setTimeout(() => setCopiedColor(null), 2000);
  };

  const colors = [
    { name: 'Primary Blue', value: '#0070F3', var: 'brand-primary', description: 'Main brand color for CTAs, links, active states' },
    { name: 'Primary Hover', value: '#005FCC', var: 'brand-primary-hover', description: 'Hover states for primary elements' },
    { name: 'Secondary Purple', value: '#7928CA', var: 'brand-secondary', description: 'Secondary accent, used sparingly' },
    { name: 'Info Blue', value: '#0070F3', var: 'info', description: 'Info states and highlights' },
  ];

  const statusColors = [
    { name: 'Success', value: '#00C853', class: 'text-success', bg: 'bg-success-muted', border: 'border-border-success' },
    { name: 'Warning', value: '#F5A623', class: 'text-warning', bg: 'bg-warning-muted', border: 'border-border-warning' },
    { name: 'Error', value: '#FF3B30', class: 'text-error', bg: 'bg-error-muted', border: 'border-border-error' },
    { name: 'Info', value: '#0070F3', class: 'text-info', bg: 'bg-info-muted', border: 'border-border-info' },
  ];

  const textColors = [
    { name: 'Primary', value: '#EDEDED', class: 'text-text-primary', description: 'Main text, headings' },
    { name: 'Secondary', value: '#888888', class: 'text-text-secondary', description: 'Body text, descriptions' },
    { name: 'Muted', value: '#666666', class: 'text-text-muted', description: 'Labels, hints' },
    { name: 'Disabled', value: '#444444', class: 'text-text-disabled', description: 'Disabled states' },
    { name: 'On Brand', value: '#FFFFFF', class: 'text-text-on-brand', description: 'Text on brand color backgrounds' },
    { name: 'Inverse', value: '#000000', class: 'text-text-inverse', description: 'Text on light backgrounds' },
  ];

  return (
    <div>
      {/* COLORS */}
      <section id="colors" className="mb-20">
        <div className="mb-8">
          <h2 className="text-4xl font-semibold text-text-primary mb-2">Colors</h2>
          <p className="text-text-secondary">Rare Canvas color palette for fintech and gaming territories</p>
        </div>

        {/* Primary Colors */}
        <div className="mb-12">
          <h3 className="text-2xl font-semibold text-text-primary mb-6">Primary Colors</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {colors.map((color) => (
              <div
                key={color.var}
                className="bg-bg-surface rounded-2xl p-6 border border-border-default cursor-pointer hover:border-border-active transition-all"
                onClick={() => copyColor(color.value, color.var)}
              >
                <div 
                  className="w-full h-24 rounded-xl mb-4" 
                  style={{ 
                    backgroundColor: color.value,
                    boxShadow: `0 0 40px ${color.value}40`
                  }}
                />
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-text-primary font-semibold mb-1">{color.name}</div>
                    <div className="font-mono text-sm text-text-secondary">{color.value}</div>
                    <div className="text-xs text-text-muted mt-1">{color.var}</div>
                    <p className="text-xs text-text-muted mt-2">{color.description}</p>
                  </div>
                  {copiedColor === color.var && (
                    <div className="text-xs text-success flex-shrink-0">✓ Copied!</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Status Colors */}
        <div className="mb-12">
          <h3 className="text-2xl font-semibold text-text-primary mb-6">Status Colors</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {statusColors.map((color) => (
              <div
                key={color.name}
                className="bg-bg-surface rounded-xl p-4 border border-border-default"
              >
                <div 
                  className={`w-full h-16 rounded-lg mb-3 ${color.bg} ${color.border} border`}
                />
                <div className="text-sm font-medium text-text-primary mb-1">{color.name}</div>
                <div className={`text-xs font-mono ${color.class}`}>{color.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Text Colors */}
        <div className="mb-12">
          <h3 className="text-2xl font-semibold text-text-primary mb-6">Text Colors</h3>
          <div className="bg-bg-surface rounded-2xl p-6 border border-border-default">
            <div className="space-y-3">
              {textColors.map((color) => (
                <div key={color.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div 
                      className="w-12 h-12 rounded-lg border border-border-default flex items-center justify-center" 
                      style={{ backgroundColor: color.value }}
                    >
                      <span className={color.name === 'Primary' || color.name === 'On Brand' ? 'text-black text-xs' : 'text-text-primary text-xs'}>Aa</span>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-text-primary">{color.name}</div>
                      <div className="text-xs font-mono text-text-muted">{color.value}</div>
                      <div className="text-xs text-text-muted">{color.description}</div>
                    </div>
                  </div>
                  <div className="text-xs font-mono text-text-muted">{color.class}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Background Surfaces */}
        <div className="mb-12">
          <h3 className="text-2xl font-semibold text-text-primary mb-6">Background Surfaces</h3>
          <p className="text-text-secondary mb-6">Semantic surface colors for layered UI elements</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-bg-surface rounded-xl p-4 border border-border-default">
              <div className="w-full h-20 rounded-lg mb-3 bg-bg-base border border-border-default" />
              <div className="text-sm font-medium text-text-primary mb-1">Base</div>
              <div className="text-xs font-mono text-text-muted">#000000</div>
              <div className="text-xs text-text-muted mt-1">bg-bg-base</div>
              <p className="text-xs text-text-muted mt-2">Page background</p>
            </div>
            <div className="bg-bg-surface rounded-xl p-4 border border-border-default">
              <div className="w-full h-20 rounded-lg mb-3 bg-bg-surface border border-border-default" />
              <div className="text-sm font-medium text-text-primary mb-1">Surface</div>
              <div className="text-xs font-mono text-text-muted">#0A0A0A</div>
              <div className="text-xs text-text-muted mt-1">bg-bg-surface</div>
              <p className="text-xs text-text-muted mt-2">Cards, panels, containers</p>
            </div>
            <div className="bg-bg-surface rounded-xl p-4 border border-border-default">
              <div className="w-full h-20 rounded-lg mb-3 bg-bg-elevated border border-border-default" />
              <div className="text-sm font-medium text-text-primary mb-1">Elevated</div>
              <div className="text-xs font-mono text-text-muted">#111111</div>
              <div className="text-xs text-text-muted mt-1">bg-bg-elevated</div>
              <p className="text-xs text-text-muted mt-2">Hover states, dropdowns</p>
            </div>
          </div>
        </div>

        {/* Design Tokens for JS */}
        <div className="mb-12">
          <h3 className="text-2xl font-semibold text-text-primary mb-6">Design Tokens (JavaScript)</h3>
          <p className="text-text-secondary mb-6">
            For chart configs, animations, and dynamic styling - import from <code className="text-brand-primary">@/config/design-tokens</code>
          </p>
          <div className="bg-bg-surface rounded-xl border border-border-default overflow-hidden">
            <div className="bg-overlay-subtle px-4 py-2 border-b border-border-default">
              <span className="text-xs font-mono text-text-secondary">src/config/design-tokens.ts</span>
            </div>
            <pre className="bg-bg-elevated p-4 overflow-x-auto">
              <code className="text-sm font-mono text-text-secondary">{`import { colors } from '@/config/design-tokens';

// Brand colors
colors.brand.primary      // '#0070F3'
colors.brand.secondary    // '#7928CA'

// Background surfaces  
colors.bg.base            // '#000000'
colors.bg.surface         // '#0A0A0A'
colors.bg.elevated        // '#111111'

// Chart colors
colors.chart.blue         // '#0070F3'
colors.chart.green        // '#00C853'

// Semantic
colors.success            // '#00C853'
colors.error              // '#FF3B30'`}</code>
            </pre>
          </div>
          <div className="mt-4 p-4 rounded-xl bg-info-muted border border-border-info">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-info mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <div className="text-sm font-medium text-info">When to use</div>
                <p className="text-sm text-text-secondary mt-1">
                  Use Tailwind classes (<code className="text-brand-primary">bg-brand-primary</code>) for styling. 
                  Use JS tokens only for chart configs, canvas drawing, or dynamic values.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TYPOGRAPHY */}
      <section id="typography" className="mb-20">
        <div className="mb-8">
          <h2 className="text-4xl font-semibold text-text-primary mb-2">Typography</h2>
          <p className="text-text-secondary">Geist Sans for UI, Inter for numbers (Linear/Vercel standard)</p>
        </div>

        {/* Font Stack Info */}
        <div className="mb-12">
          <h3 className="text-2xl font-semibold text-text-primary mb-6">Font Stack</h3>
          <div className="bg-bg-surface rounded-2xl p-8 border border-border-default space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-24 text-sm text-text-muted">Sans</div>
              <div>
                <div className="text-text-primary font-semibold mb-1">Geist Sans</div>
                <code className="text-xs text-text-muted font-mono">font-sans → Headings, body text, UI</code>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-24 text-sm text-text-muted">Numbers</div>
              <div>
                <div className="text-text-primary font-mono font-semibold mb-1">Inter</div>
                <code className="text-xs text-text-muted font-mono">font-mono → Numbers, prices, balances</code>
              </div>
            </div>
            <div className="mt-4 p-4 bg-info-muted rounded-xl border border-border-info">
              <p className="text-sm text-text-secondary">
                <span className="text-info font-medium">Why Inter for numbers?</span> Clean zeros (no dots/slashes), 
                tabular figures for perfect alignment, used by Linear and Vercel. Matches our design philosophy.
              </p>
            </div>
          </div>
        </div>

        {/* Headings */}
        <div className="mb-12">
          <h3 className="text-2xl font-semibold text-text-primary mb-6">Headings</h3>
          <div className="bg-bg-surface rounded-2xl p-8 border border-border-default space-y-6">
            <div>
              <h1 className="text-responsive-h1 text-text-primary mb-2">Heading 1</h1>
              <code className="text-xs text-text-muted font-mono">text-responsive-h1 (32px mobile → 48px desktop)</code>
            </div>
            <div>
              <h2 className="text-responsive-h2 text-text-primary mb-2">Heading 2</h2>
              <code className="text-xs text-text-muted font-mono">text-responsive-h2 (28px mobile → 36px desktop)</code>
            </div>
            <div>
              <h3 className="text-responsive-h3 text-text-primary mb-2">Heading 3</h3>
              <code className="text-xs text-text-muted font-mono">text-responsive-h3 (24px mobile → 30px desktop)</code>
            </div>
            <div>
              <h4 className="text-responsive-xl text-text-primary mb-2">Heading 4</h4>
              <code className="text-xs text-text-muted font-mono">text-responsive-xl (20px mobile → 24px desktop)</code>
            </div>
          </div>
        </div>

        {/* Body Text */}
        <div className="mb-12">
          <h3 className="text-2xl font-semibold text-text-primary mb-6">Body Text</h3>
          <div className="bg-bg-surface rounded-2xl p-8 border border-border-default space-y-6">
            <div>
              <p className="text-responsive-lg text-text-primary mb-2">Large body text for emphasis and introductions</p>
              <code className="text-xs text-text-muted font-mono">text-responsive-lg (18px mobile → 20px desktop)</code>
            </div>
            <div>
              <p className="text-responsive-base text-text-primary mb-2">Base body text for general content and descriptions</p>
              <code className="text-xs text-text-muted font-mono">text-responsive-base (16px mobile → 16px desktop)</code>
            </div>
            <div>
              <p className="text-responsive-sm text-text-secondary mb-2">Small text for labels, captions, and secondary information</p>
              <code className="text-xs text-text-muted font-mono">text-responsive-sm (14px mobile → 14px desktop)</code>
            </div>
          </div>
        </div>

        {/* Numbers */}
        <div className="mb-12">
          <h3 className="text-2xl font-semibold text-text-primary mb-6">Numbers & Prices (Inter)</h3>
          <div className="bg-bg-surface rounded-2xl p-8 border border-border-default space-y-6">
            <div>
              <div className="text-3xl font-mono font-medium text-text-primary mb-2">$1,234,567.89</div>
              <code className="text-xs text-text-muted font-mono">font-mono text-3xl → Large price displays</code>
            </div>
            <div>
              <div className="text-xl font-mono text-text-primary mb-2">10,000.0000 DGKO</div>
              <code className="text-xs text-text-muted font-mono">font-mono text-xl → Token balances</code>
            </div>
            <div>
              <div className="font-mono text-sm text-text-secondary mb-2">+12.34% · -5.67%</div>
              <code className="text-xs text-text-muted font-mono">font-mono text-sm → Percentages, changes</code>
            </div>
            <div className="pt-4 border-t border-border-default">
              <p className="text-sm text-text-muted mb-3">Tabular figures ensure numbers align in columns:</p>
              <div className="font-mono text-lg text-text-primary space-y-1">
                <div>1,111.11</div>
                <div>2,222.22</div>
                <div>9,999.99</div>
              </div>
            </div>
            <div className="pt-4 border-t border-border-default">
              <p className="text-sm text-text-muted mb-3">Clean zeros (no dots or slashes):</p>
              <div className="font-mono text-2xl text-text-primary">
                0.00 · 100,000 · 0.0001
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SPACING */}
      <section id="spacing" className="mb-20">
        <div className="mb-8">
          <h2 className="text-4xl font-semibold text-text-primary mb-2">Spacing</h2>
          <p className="text-text-secondary">Mobile-first responsive spacing system</p>
        </div>

        <div className="bg-bg-surface rounded-2xl p-8 border border-border-default">
          <div className="space-y-6">
            <div>
              <div className="text-sm font-medium text-text-primary mb-3">Padding Scale</div>
              <div className="space-y-2">
                <div className="flex items-center gap-4">
                  <code className="text-xs font-mono text-text-secondary w-24">p-4</code>
                  <div className="bg-brand-primary/10 border border-brand-primary/20 p-4">
                    <div className="text-xs text-text-primary">16px - Mobile base</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <code className="text-xs font-mono text-text-secondary w-24">md:p-8</code>
                  <div className="bg-brand-primary/10 border border-brand-primary/20 p-8">
                    <div className="text-xs text-text-primary">32px - Desktop base</div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="text-sm font-medium text-text-primary mb-3">Gap Scale</div>
              <div className="space-y-2">
                <div className="flex items-center gap-4">
                  <code className="text-xs font-mono text-text-secondary w-24">gap-4</code>
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-brand-primary/10 border border-brand-primary/20 rounded" />
                    <div className="w-12 h-12 bg-brand-primary/10 border border-brand-primary/20 rounded" />
                  </div>
                  <span className="text-xs text-text-secondary">16px gap</span>
                </div>
                <div className="flex items-center gap-4">
                  <code className="text-xs font-mono text-text-secondary w-24">md:gap-8</code>
                  <div className="flex gap-8">
                    <div className="w-12 h-12 bg-brand-primary/10 border border-brand-primary/20 rounded" />
                    <div className="w-12 h-12 bg-brand-primary/10 border border-brand-primary/20 rounded" />
                  </div>
                  <span className="text-xs text-text-secondary">32px gap</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-border-default">
              <p className="text-sm text-text-secondary">
                <strong className="text-text-primary">Rule:</strong> Always use mobile-first spacing. 
                Start with p-4, gap-4, then add md:p-8, md:gap-8 for desktop.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SURFACE CARDS */}
      <section id="surface" className="mb-20">
        <div className="mb-8">
          <h2 className="text-4xl font-semibold text-text-primary mb-2">Surface Cards</h2>
          <p className="text-text-secondary">Flat card styling for Core Platform (Linear/Vercel style)</p>
        </div>

        <ComponentPreview
          title="Surface Card"
          description="Standard card with surface background and subtle border"
          code={`<div className="bg-bg-surface rounded-2xl p-6 border border-border-default">
  <h3 className="text-text-primary font-semibold mb-2">Surface Card</h3>
  <p className="text-text-secondary">Content goes here</p>
</div>`}
        >
          <div className="bg-bg-surface rounded-2xl p-6 border border-border-default max-w-sm">
            <h3 className="text-text-primary font-semibold mb-2">Surface Card</h3>
            <p className="text-text-secondary">Flat surface with subtle border - no blur effects</p>
          </div>
        </ComponentPreview>

        <ComponentPreview
          title="Surface Card with Hover"
          description="Interactive card with hover state"
          code={`<div className="bg-bg-surface rounded-2xl p-6 border border-border-default hover:bg-bg-elevated hover:border-border-hover transition-colors cursor-pointer">
  <h3 className="text-text-primary font-semibold mb-2">Hover Me</h3>
  <p className="text-text-secondary">Background elevates on hover</p>
</div>`}
        >
          <div className="bg-bg-surface rounded-2xl p-6 border border-border-default hover:bg-bg-elevated hover:border-border-hover transition-colors cursor-pointer max-w-sm">
            <h3 className="text-text-primary font-semibold mb-2">Hover Me</h3>
            <p className="text-text-secondary">Background elevates on hover - no glow effects</p>
          </div>
        </ComponentPreview>

        <div className="bg-warning-muted border border-border-warning rounded-xl p-4 mt-6">
          <p className="text-sm text-warning">
            <strong>Note:</strong> Glass morphism (backdrop-blur) is deprecated for Core Platform. 
            Use flat bg-bg-surface with border-border-default. Glass effects are only allowed in Games territory.
          </p>
        </div>
      </section>
    </div>
  );
}
