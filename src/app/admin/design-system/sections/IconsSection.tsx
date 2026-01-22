'use client';

import { ComponentPreview } from '../components/ComponentPreview';
import { IconBox } from '@/components/IconBox';
import { Button } from '@/components/Button';
import { 
  // Finance & Crypto
  Wallet, TrendingUp, TrendingDown, DollarSign, Coins,
  ArrowUpRight, Repeat, Lock, Unlock,
  
  // Actions
  Zap, Shield, Target, Award, Sparkles,
  
  // Navigation
  Home, BarChart3, Gamepad2, FileText,
  
  // Status & Feedback
  CheckCircle, XCircle, AlertCircle, Info, Clock,
  
  // Interface
  ChevronRight, ChevronDown, Plus, X, Search,
  Menu, ExternalLink
} from 'lucide-react';

export function IconsSection() {
  return (
    <div>
      {/* OVERVIEW */}
      <section id="overview" className="mb-20">
        <div className="mb-8">
          <h2 className="text-4xl font-semibold text-text-primary mb-2">Icons</h2>
          <p className="text-text-secondary mb-4">Icon system powered by Lucide React - 1000+ beautiful, consistent icons</p>
          
          {/* Info Cards */}
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div className="bg-bg-surface rounded-xl p-4 border border-border-success bg-success-muted">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-medium text-text-primary mb-1">Lucide React v0.263.1</div>
                  <p className="text-xs text-text-secondary">Already installed - tree-shakeable, TypeScript native, only 1KB per icon</p>
                </div>
              </div>
            </div>
            
            <div className="bg-bg-surface rounded-xl p-4 border border-brand-primary/20 bg-brand-primary/5">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-brand-primary flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-medium text-text-primary mb-1">Perfect for Fintech</div>
                  <p className="text-xs text-text-secondary">Clean stroke-based design matches Apple, Linear, Vercel aesthetic</p>
                </div>
              </div>
            </div>
          </div>

          {/* Usage Example */}
          <div className="bg-bg-surface rounded-xl p-4 border border-border-default">
            <div className="text-sm font-medium text-text-primary mb-2">Quick Start</div>
            <pre className="text-xs text-text-secondary font-mono overflow-x-auto">
{`import { Wallet, TrendingUp, Shield } from 'lucide-react';

<Wallet className="w-5 h-5 text-brand-primary" />
<TrendingUp className="w-6 h-6 text-success" />
<Shield className="w-4 h-4" strokeWidth={2.5} />`}
            </pre>
          </div>
        </div>

        {/* Size Reference */}
        <ComponentPreview
          title="Icon Sizes"
          description="Standard size scale for consistent icon usage"
          code={`import { Wallet } from 'lucide-react';

{/* xs - 12px */}
<Wallet className="w-3 h-3" />

{/* sm - 16px */}
<Wallet className="w-4 h-4" />

{/* md - 20px (default) */}
<Wallet className="w-5 h-5" />

{/* lg - 24px */}
<Wallet className="w-6 h-6" />

{/* xl - 32px */}
<Wallet className="w-8 h-8" />`}
          centered
        >
          <div className="flex items-end gap-8">
            <div className="flex flex-col items-center gap-2">
              <Wallet className="w-3 h-3 text-text-primary" />
              <span className="text-xs text-text-secondary">xs (12px)</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Wallet className="w-4 h-4 text-text-primary" />
              <span className="text-xs text-text-secondary">sm (16px)</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Wallet className="w-5 h-5 text-text-primary" />
              <span className="text-xs text-text-secondary">md (20px)</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Wallet className="w-6 h-6 text-text-primary" />
              <span className="text-xs text-text-secondary">lg (24px)</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Wallet className="w-8 h-8 text-text-primary" />
              <span className="text-xs text-text-secondary">xl (32px)</span>
            </div>
          </div>
        </ComponentPreview>

        {/* Stroke Width */}
        <ComponentPreview
          title="Stroke Width"
          description="Adjust icon weight with strokeWidth prop"
          code={`<Wallet className="w-6 h-6" strokeWidth={1} />   {/* Light */}
<Wallet className="w-6 h-6" strokeWidth={2} />   {/* Default */}
<Wallet className="w-6 h-6" strokeWidth={2.5} /> {/* Medium */}
<Wallet className="w-6 h-6" strokeWidth={3} />   {/* Bold */}`}
          centered
        >
          <div className="flex items-center gap-8">
            <div className="flex flex-col items-center gap-2">
              <Wallet className="w-6 h-6 text-text-primary" strokeWidth={1} />
              <span className="text-xs text-text-secondary">Light (1)</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Wallet className="w-6 h-6 text-text-primary" strokeWidth={2} />
              <span className="text-xs text-text-secondary">Default (2)</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Wallet className="w-6 h-6 text-text-primary" strokeWidth={2.5} />
              <span className="text-xs text-text-secondary">Medium (2.5)</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Wallet className="w-6 h-6 text-text-primary" strokeWidth={3} />
              <span className="text-xs text-text-secondary">Bold (3)</span>
            </div>
          </div>
        </ComponentPreview>
      </section>

      {/* FINANCE & CRYPTO ICONS */}
      <section id="finance" className="mb-20">
        <div className="mb-8">
          <h2 className="text-4xl font-semibold text-text-primary mb-2">Finance & Crypto Icons</h2>
          <p className="text-text-secondary">Essential icons for DeFi applications</p>
        </div>

        <ComponentPreview
          title="Core Finance Icons"
          description="Primary icons for crypto and financial operations"
          code={`import { 
  Wallet, Coins, DollarSign, 
  TrendingUp, TrendingDown, 
  Lock, Unlock, Repeat 
} from 'lucide-react';

<Wallet className="w-6 h-6 text-brand-primary" />
<Coins className="w-6 h-6 text-warning" />
<DollarSign className="w-6 h-6 text-success" />
<TrendingUp className="w-6 h-6 text-success" />
<TrendingDown className="w-6 h-6 text-error" />
<Lock className="w-6 h-6 text-brand-primary" />
<Unlock className="w-6 h-6 text-warning" />
<Repeat className="w-6 h-6 text-info" />`}
        >
          <div className="grid grid-cols-4 md:grid-cols-8 gap-6">
            <div className="flex flex-col items-center gap-2">
              <div className="p-3 rounded-xl bg-brand-primary/10 border border-brand-primary/20">
                <Wallet className="w-6 h-6 text-brand-primary" />
              </div>
              <span className="text-xs text-text-secondary">Wallet</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="p-3 rounded-xl bg-warning/10 border border-warning/20">
                <Coins className="w-6 h-6 text-warning" />
              </div>
              <span className="text-xs text-text-secondary">Coins</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="p-3 rounded-xl bg-success/10 border border-success/20">
                <DollarSign className="w-6 h-6 text-success" />
              </div>
              <span className="text-xs text-text-secondary">Dollar</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="p-3 rounded-xl bg-success/10 border border-success/20">
                <TrendingUp className="w-6 h-6 text-success" />
              </div>
              <span className="text-xs text-text-secondary">Up</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="p-3 rounded-xl bg-error/10 border border-error/20">
                <TrendingDown className="w-6 h-6 text-error" />
              </div>
              <span className="text-xs text-text-secondary">Down</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="p-3 rounded-xl bg-brand-primary/10 border border-brand-primary/20">
                <Lock className="w-6 h-6 text-brand-primary" />
              </div>
              <span className="text-xs text-text-secondary">Lock</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="p-3 rounded-xl bg-warning/10 border border-warning/20">
                <Unlock className="w-6 h-6 text-warning" />
              </div>
              <span className="text-xs text-text-secondary">Unlock</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="p-3 rounded-xl bg-info/10 border border-info/20">
                <Repeat className="w-6 h-6 text-info" />
              </div>
              <span className="text-xs text-text-secondary">Swap</span>
            </div>
          </div>
        </ComponentPreview>

        <ComponentPreview
          title="Feature Icons"
          description="Icons for highlighting features and benefits"
          code={`import { Zap, Shield, Target, Award, Sparkles } from 'lucide-react';

<Zap className="w-6 h-6 text-warning" />
<Shield className="w-6 h-6 text-brand-primary" />
<Target className="w-6 h-6 text-info" />
<Award className="w-6 h-6 text-brand-secondary" />
<Sparkles className="w-6 h-6 text-info" />`}
        >
          <div className="grid grid-cols-5 gap-6">
            <div className="flex flex-col items-center gap-2">
              <div className="p-3 rounded-xl bg-warning/10 border border-warning/20">
                <Zap className="w-6 h-6 text-warning" />
              </div>
              <span className="text-xs text-text-secondary">Fast</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="p-3 rounded-xl bg-brand-primary/10 border border-brand-primary/20">
                <Shield className="w-6 h-6 text-brand-primary" />
              </div>
              <span className="text-xs text-text-secondary">Secure</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="p-3 rounded-xl bg-info/10 border border-info/20">
                <Target className="w-6 h-6 text-info" />
              </div>
              <span className="text-xs text-text-secondary">Accurate</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="p-3 rounded-xl bg-brand-secondary/10 border border-brand-secondary/20">
                <Award className="w-6 h-6 text-brand-secondary" />
              </div>
              <span className="text-xs text-text-secondary">Premium</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="p-3 rounded-xl bg-info/10 border border-info/20">
                <Sparkles className="w-6 h-6 text-info" />
              </div>
              <span className="text-xs text-text-secondary">Magic</span>
            </div>
          </div>
        </ComponentPreview>
      </section>

      {/* NAVIGATION ICONS */}
      <section id="navigation" className="mb-20">
        <div className="mb-8">
          <h2 className="text-4xl font-semibold text-text-primary mb-2">Navigation Icons</h2>
          <p className="text-text-secondary">Icons for menus, links, and navigation</p>
        </div>

        <ComponentPreview
          title="App Navigation"
          description="Main navigation icons used in Rare Canvas"
          code={`import { Home, BarChart3, Repeat, Gamepad2, FileText } from 'lucide-react';

<Home className="w-5 h-5" />
<BarChart3 className="w-5 h-5" />
<Repeat className="w-5 h-5" />
<Gamepad2 className="w-5 h-5" />
<FileText className="w-5 h-5" />`}
        >
          <div className="grid grid-cols-5 gap-6">
            <div className="flex flex-col items-center gap-2">
              <Home className="w-5 h-5 text-text-primary" />
              <span className="text-xs text-text-secondary">Dashboard</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <BarChart3 className="w-5 h-5 text-text-primary" />
              <span className="text-xs text-text-secondary">Staking</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Repeat className="w-5 h-5 text-text-primary" />
              <span className="text-xs text-text-secondary">Swap</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Gamepad2 className="w-5 h-5 text-text-primary" />
              <span className="text-xs text-text-secondary">Games</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <FileText className="w-5 h-5 text-text-primary" />
              <span className="text-xs text-text-secondary">Docs</span>
            </div>
          </div>
        </ComponentPreview>

        <ComponentPreview
          title="Interface Controls"
          description="Common UI control icons"
          code={`import { 
  ChevronRight, ChevronDown, Plus, X, 
  Search, Menu, ExternalLink 
} from 'lucide-react';

<ChevronRight className="w-5 h-5" />
<ChevronDown className="w-5 h-5" />
<Plus className="w-5 h-5" />
<X className="w-5 h-5" />
<Search className="w-5 h-5" />
<Menu className="w-5 h-5" />
<ExternalLink className="w-4 h-4" />`}
        >
          <div className="grid grid-cols-7 gap-6">
            <div className="flex flex-col items-center gap-2">
              <ChevronRight className="w-5 h-5 text-text-secondary" />
              <span className="text-xs text-text-secondary">Right</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <ChevronDown className="w-5 h-5 text-text-secondary" />
              <span className="text-xs text-text-secondary">Down</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Plus className="w-5 h-5 text-text-secondary" />
              <span className="text-xs text-text-secondary">Add</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <X className="w-5 h-5 text-text-secondary" />
              <span className="text-xs text-text-secondary">Close</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Search className="w-5 h-5 text-text-secondary" />
              <span className="text-xs text-text-secondary">Search</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Menu className="w-5 h-5 text-text-secondary" />
              <span className="text-xs text-text-secondary">Menu</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <ExternalLink className="w-4 h-4 text-text-secondary" />
              <span className="text-xs text-text-secondary">External</span>
            </div>
          </div>
        </ComponentPreview>
      </section>

      {/* STATUS ICONS */}
      <section id="status" className="mb-20">
        <div className="mb-8">
          <h2 className="text-4xl font-semibold text-text-primary mb-2">Status & Feedback Icons</h2>
          <p className="text-text-secondary">Icons for alerts, confirmations, and status indicators</p>
        </div>

        <ComponentPreview
          title="Status Indicators"
          description="Success, error, warning, and info states"
          code={`import { CheckCircle, XCircle, AlertCircle, Info, Clock } from 'lucide-react';

<CheckCircle className="w-6 h-6 text-success" />
<XCircle className="w-6 h-6 text-error" />
<AlertCircle className="w-6 h-6 text-warning" />
<Info className="w-6 h-6 text-info" />
<Clock className="w-6 h-6 text-text-secondary" />`}
        >
          <div className="grid grid-cols-5 gap-6">
            <div className="flex flex-col items-center gap-2">
              <CheckCircle className="w-6 h-6 text-success" />
              <span className="text-xs text-text-secondary">Success</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <XCircle className="w-6 h-6 text-error" />
              <span className="text-xs text-text-secondary">Error</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <AlertCircle className="w-6 h-6 text-warning" />
              <span className="text-xs text-text-secondary">Warning</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Info className="w-6 h-6 text-info" />
              <span className="text-xs text-text-secondary">Info</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Clock className="w-6 h-6 text-text-secondary" />
              <span className="text-xs text-text-secondary">Pending</span>
            </div>
          </div>
        </ComponentPreview>
      </section>

      {/* USAGE IN COMPONENTS */}
      <section id="usage" className="mb-20">
        <div className="mb-8">
          <h2 className="text-4xl font-semibold text-text-primary mb-2">Icons in Components</h2>
          <p className="text-text-secondary">Using icons with Rare Canvas components</p>
        </div>

        <ComponentPreview
          title="Icons with IconBox"
          description="Combine Lucide icons with IconBox component"
          code={`import { Wallet, Shield, Zap } from 'lucide-react';
import { IconBox } from '@/components/IconBox';

<IconBox 
  icon={<Wallet className="w-5 h-5" />} 
  size="sm" 
  variant="blue" 
/>

<IconBox 
  icon={<Shield className="w-6 h-6" />} 
  size="md" 
  variant="purple" 
/>

<IconBox 
  icon={<Zap className="w-7 h-7" />} 
  size="lg" 
  variant="cyan" 
/>`}
          centered
        >
          <div className="flex items-center gap-6">
            <IconBox 
              icon={<Wallet className="w-5 h-5" />} 
              size="sm" 
              variant="blue" 
            />
            <IconBox 
              icon={<Shield className="w-6 h-6" />} 
              size="md" 
              variant="purple" 
            />
            <IconBox 
              icon={<Zap className="w-7 h-7" />} 
              size="lg" 
              variant="cyan" 
            />
          </div>
        </ComponentPreview>

        <ComponentPreview
          title="Icons in Buttons"
          description="Add icons to buttons for better visual hierarchy"
          code={`import { Wallet, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/Button';

<Button variant="primary">
  <Wallet className="w-5 h-5" />
  Connect Wallet
</Button>

<Button variant="secondary">
  View Details
  <ArrowUpRight className="w-4 h-4" />
</Button>`}
          centered
        >
          <div className="flex flex-wrap items-center gap-4">
            <Button variant="primary">
              <Wallet className="w-5 h-5 mr-2" />
              Connect Wallet
            </Button>
            <Button variant="secondary">
              View Details
              <ArrowUpRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </ComponentPreview>

        <ComponentPreview
          title="Icons in Cards"
          description="Feature cards with Lucide icons"
          code={`import { Zap, Shield } from 'lucide-react';

<div className="bg-bg-surface rounded-2xl p-6 border border-border-default">
  <div className="p-3 rounded-xl bg-warning/10 border border-warning/20 inline-flex mb-4">
    <Zap className="w-6 h-6 text-warning" />
  </div>
  <h3 className="text-lg font-semibold text-text-primary mb-2">Fast Transactions</h3>
  <p className="text-sm text-text-secondary">Lightning-fast swaps and staking</p>
</div>`}
        >
          <div className="grid md:grid-cols-2 gap-4 max-w-2xl">
            <div className="bg-bg-surface rounded-2xl p-6 border border-border-default">
              <div className="p-3 rounded-xl bg-warning/10 border border-warning/20 inline-flex mb-4">
                <Zap className="w-6 h-6 text-warning" />
              </div>
              <h3 className="text-lg font-semibold text-text-primary mb-2">Fast Transactions</h3>
              <p className="text-sm text-text-secondary">Lightning-fast swaps and staking</p>
            </div>
            <div className="bg-bg-surface rounded-2xl p-6 border border-border-default">
              <div className="p-3 rounded-xl bg-brand-primary/10 border border-brand-primary/20 inline-flex mb-4">
                <Shield className="w-6 h-6 text-brand-primary" />
              </div>
              <h3 className="text-lg font-semibold text-text-primary mb-2">Secure Platform</h3>
              <p className="text-sm text-text-secondary">Bank-grade security for your assets</p>
            </div>
          </div>
        </ComponentPreview>
      </section>

      {/* BEST PRACTICES */}
      <section id="best-practices" className="mb-20">
        <div className="bg-bg-surface rounded-2xl p-6 border border-border-default">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Best Practices</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-medium text-text-primary mb-1">Use consistent sizes</div>
                <p className="text-xs text-text-secondary">Stick to w-4 h-4 (16px) or w-5 h-5 (20px) for most UI elements</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-medium text-text-primary mb-1">Match icon color to context</div>
                <p className="text-xs text-text-secondary">Green for positive, red for negative, blue for primary actions</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-medium text-text-primary mb-1">Use strokeWidth={2} as default</div>
                <p className="text-xs text-text-secondary">Matches Rare Canvas clean, modern aesthetic</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-medium text-text-primary mb-1">Import only what you need</div>
                <p className="text-xs text-text-secondary">Tree-shaking ensures only imported icons are bundled</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-medium text-text-primary mb-1">Pair with IconBox for emphasis</div>
                <p className="text-xs text-text-secondary">Use IconBox component for feature highlights and important actions</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-medium text-text-primary mb-1">Browse full library</div>
                <p className="text-xs text-text-secondary">
                  1000+ icons available at{' '}
                  <a 
                    href="https://lucide.dev/icons" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-brand-primary hover:text-brand-primary-hover transition-colors"
                  >
                    lucide.dev/icons
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
