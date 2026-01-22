'use client';

import { Calculator, Sparkles, Check } from 'lucide-react';

export function OverviewSection() {
  return (
    <div>
      {/* OVERVIEW */}
      <section id="overview" className="mb-20">
        <div className="mb-8">
          <h2 className="text-4xl font-semibold text-text-primary mb-2">Overview</h2>
          <p className="text-text-secondary">Complete design system for the Rare Canvas Web3 platform</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <div className="bg-bg-surface rounded-2xl p-6 border border-border-default">
            <div className="text-3xl font-mono font-semibold text-text-primary mb-1">95+</div>
            <div className="text-sm text-text-secondary">Components</div>
          </div>
          <div className="bg-bg-surface rounded-2xl p-6 border border-border-default">
            <div className="text-3xl font-mono font-semibold text-text-primary mb-1">24</div>
            <div className="text-sm text-text-secondary">Colors</div>
          </div>
          <div className="bg-bg-surface rounded-2xl p-6 border border-border-default">
            <div className="text-3xl font-mono font-semibold text-text-primary mb-1">14</div>
            <div className="text-sm text-text-secondary">Categories</div>
          </div>
          <div className="bg-bg-surface rounded-2xl p-6 border border-border-default">
            <div className="text-3xl font-mono font-semibold text-text-primary mb-1">2</div>
            <div className="text-sm text-text-secondary">Territories</div>
          </div>
        </div>

        {/* Design Territories */}
        <div className="mb-12">
          <h3 className="text-2xl font-semibold text-text-primary mb-6">Design Territories</h3>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Fintech Territory */}
            <div className="bg-bg-surface rounded-2xl p-6 border border-border-default">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-brand-primary/10 flex items-center justify-center">
                  <Calculator className="w-6 h-6 text-brand-primary" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-text-primary">Linear/Vercel Style</h4>
                  <p className="text-xs text-text-muted">Primary Territory</p>
                </div>
              </div>
              <p className="text-sm text-text-secondary mb-4">
                Clean, professional, and trustworthy. Flat design with minimal effects. Used for dashboard, staking, swap, and token pages.
              </p>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-muted">Primary Color</span>
                  <span className="text-brand-primary font-mono">#0070F3</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-muted">Style</span>
                  <span className="text-text-primary">Flat surfaces, subtle borders, no blur</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-muted">Typography</span>
                  <span className="text-text-primary">Geist (clean, modern)</span>
                </div>
              </div>
            </div>

            {/* Vegas Territory */}
            <div className="bg-bg-surface rounded-2xl p-6 border border-border-default">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-warning/20 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-warning" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-text-primary">Vegas Dramatic</h4>
                  <p className="text-xs text-text-muted">Games Territory</p>
                </div>
              </div>
              <p className="text-sm text-text-secondary mb-4">
                Bold, exciting, and high-energy. Used exclusively for the games section (roulette, slots). Allows gradients and glow effects.
              </p>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-muted">Primary Color</span>
                  <span className="text-warning font-mono">#FFD700</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-muted">Style</span>
                  <span className="text-text-primary">Strong glows, gradients allowed</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-muted">Typography</span>
                  <span className="text-text-primary">Bold weights, larger sizes</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Component Categories */}
        <div className="mb-12">
          <h3 className="text-2xl font-semibold text-text-primary mb-6">Component Categories</h3>
          <div className="bg-bg-surface rounded-2xl p-6 border border-border-default">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-overlay-subtle">
                <div className="text-sm font-medium text-text-primary mb-1">Foundations</div>
                <div className="text-xs text-text-secondary">Colors, Typography, Spacing, Glass</div>
              </div>
              <div className="p-4 rounded-xl bg-overlay-subtle">
                <div className="text-sm font-medium text-text-primary mb-1">Buttons & Badges</div>
                <div className="text-xs text-text-secondary">Primary, Secondary, Status, Labels</div>
              </div>
              <div className="p-4 rounded-xl bg-overlay-subtle">
                <div className="text-sm font-medium text-text-primary mb-1">Cards & Containers</div>
                <div className="text-xs text-text-secondary">IconBox, Glass Cards, Feature Cards</div>
              </div>
              <div className="p-4 rounded-xl bg-overlay-subtle">
                <div className="text-sm font-medium text-text-primary mb-1">Forms & Inputs</div>
                <div className="text-xs text-text-secondary">AmountInput, TokenSelector, Search</div>
              </div>
              <div className="p-4 rounded-xl bg-overlay-subtle">
                <div className="text-sm font-medium text-text-primary mb-1">Navigation</div>
                <div className="text-xs text-text-secondary">Headers, Menus, Sidebars, Dropdowns</div>
              </div>
              <div className="p-4 rounded-xl bg-overlay-subtle">
                <div className="text-sm font-medium text-text-primary mb-1">Data Visualization</div>
                <div className="text-xs text-text-secondary">Charts, Tables, Grids, Stats</div>
              </div>
              <div className="p-4 rounded-xl bg-overlay-subtle">
                <div className="text-sm font-medium text-text-primary mb-1">Modals & Overlays</div>
                <div className="text-xs text-text-secondary">Transaction, Game, Alert Modals</div>
              </div>
              <div className="p-4 rounded-xl bg-overlay-subtle">
                <div className="text-sm font-medium text-text-primary mb-1">Wallet Components</div>
                <div className="text-xs text-text-secondary">Connect, Balance, Transactions</div>
              </div>
              <div className="p-4 rounded-xl bg-overlay-subtle">
                <div className="text-sm font-medium text-text-primary mb-1">Game Components</div>
                <div className="text-xs text-text-secondary">Roulette, Slots, Prizes, History</div>
              </div>
            </div>
          </div>
        </div>

        {/* Usage Guidelines */}
        <div>
          <h3 className="text-2xl font-semibold text-text-primary mb-6">Usage Guidelines</h3>
          <div className="space-y-4">
            <div className="bg-bg-surface rounded-xl p-4 border border-border-default">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center flex-shrink-0">
                  <Check className="w-4 h-4 text-success" />
                </div>
                <div>
                  <div className="text-sm font-medium text-text-primary mb-1">Mobile-First Responsive</div>
                  <p className="text-xs text-text-secondary">Always start with mobile sizing, then enhance for desktop with md: and lg: breakpoints.</p>
                </div>
              </div>
            </div>

            <div className="bg-bg-surface rounded-xl p-4 border border-border-default">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center flex-shrink-0">
                  <Check className="w-4 h-4 text-success" />
                </div>
                <div>
                  <div className="text-sm font-medium text-text-primary mb-1">Consistent Spacing</div>
                  <p className="text-xs text-text-secondary">Use p-4 / md:p-8 for padding, gap-4 / md:gap-8 for gaps. Maintain 40% reduction on mobile.</p>
                </div>
              </div>
            </div>

            <div className="bg-bg-surface rounded-xl p-4 border border-border-default">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center flex-shrink-0">
                  <Check className="w-4 h-4 text-success" />
                </div>
                <div>
                  <div className="text-sm font-medium text-text-primary mb-1">Flat Surface Design</div>
                  <p className="text-xs text-text-secondary">Use bg-bg-surface with border-border-default for cards. No glass blur effects in Core Platform.</p>
                </div>
              </div>
            </div>

            <div className="bg-bg-surface rounded-xl p-4 border border-border-default">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center flex-shrink-0">
                  <Check className="w-4 h-4 text-success" />
                </div>
                <div>
                  <div className="text-sm font-medium text-text-primary mb-1">Color Minimalism</div>
                  <p className="text-xs text-text-secondary">Use color functionally. White/gray for data, blue for interactive, green/red for status.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
