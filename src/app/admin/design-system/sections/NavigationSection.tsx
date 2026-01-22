'use client';

import { Info, ChevronRight, Home, Repeat, Droplets, Wallet, MoreHorizontal, BookOpen, FileText, Settings, HelpCircle, ExternalLink, AlertTriangle } from 'lucide-react';
import { ComponentPreview } from '../components/ComponentPreview';

export function NavigationSection() {
  return (
    <div>
      {/* Section Header */}
      <div className="mb-12">
        <h1 className="text-5xl font-semibold text-text-primary mb-4">Navigation</h1>
        <p className="text-xl text-text-secondary max-w-3xl">
          Components for navigation patterns and route-based UI control.
        </p>
      </div>

      {/* CONDITIONAL NAV */}
      <section id="conditional-nav" className="mb-20">
        <div className="mb-8">
          <h2 className="text-4xl font-semibold text-text-primary mb-2">ConditionalNav</h2>
          <p className="text-text-secondary">Conditionally renders navigation based on route. Hides header/footer for admin routes.</p>
        </div>

        <ComponentPreview
          title="Route-Based Navigation"
          description="Wraps header/footer to hide them on admin routes"
          code={`import { ConditionalNav } from '@/components/ConditionalNav';

// In layout.tsx
<body>
  <ConditionalNav>
    <Header />
  </ConditionalNav>
  
  {children}
  
  <ConditionalNav>
    <Footer />
  </ConditionalNav>
</body>

// Behavior:
// - /admin/* routes: returns null (hidden)
// - All other routes: renders children`}
        >
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-bg-surface rounded-xl p-4 border border-border-default">
              <div className="text-xs text-success mb-2">✓ Public Routes</div>
              <div className="space-y-1">
                <div className="bg-overlay-subtle rounded p-2 text-xs text-text-secondary">Header visible</div>
                <div className="bg-overlay-default rounded p-4 text-xs text-text-muted text-center">Page</div>
                <div className="bg-overlay-subtle rounded p-2 text-xs text-text-secondary">Footer visible</div>
              </div>
            </div>
            <div className="bg-bg-surface rounded-xl p-4 border border-border-default">
              <div className="text-xs text-warning mb-2">→ Admin Routes</div>
              <div className="space-y-1">
                <div className="bg-overlay-subtle rounded p-2 text-xs text-text-muted opacity-30">Header hidden</div>
                <div className="bg-overlay-default rounded p-4 text-xs text-text-secondary text-center">Admin Panel</div>
                <div className="bg-overlay-subtle rounded p-2 text-xs text-text-muted opacity-30">Footer hidden</div>
              </div>
            </div>
          </div>
        </ComponentPreview>
      </section>

      {/* TESTNET BANNER */}
      <section id="testnet-banner" className="mb-20">
        <div className="mb-8">
          <h2 className="text-4xl font-semibold text-text-primary mb-2">TestnetBanner</h2>
          <p className="text-text-secondary mb-4">Warning banner displayed when user is on testnet. Shows token remapping and contract status.</p>
          <div className="bg-bg-surface rounded-xl p-4 border border-border-warning bg-warning-muted">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-medium text-text-primary mb-1">Network Awareness</div>
                <p className="text-xs text-text-secondary">Always visible at top of page when on testnet. Cannot be permanently dismissed.</p>
              </div>
            </div>
          </div>
        </div>

        <ComponentPreview
          title="Full TestnetBanner"
          description="Expandable banner with token remapping info and faucet link"
          code={`import { TestnetBanner } from '@/components/TestnetBanner';

// In layout.tsx - placed at very top
<div className="fixed top-0 left-0 right-0 z-50">
  <TestnetBanner />
</div>

// Features:
// - Auto-hides on mainnet
// - Shows token remapping (DGKO → KFI, etc.)
// - Contract deployment status
// - Link to testnet faucet
// - Switch to mainnet button`}
        >
          <div className="rounded-xl overflow-hidden border border-border-warning">
            <div className="bg-amber-950 border-b border-border-warning">
              <div className="px-4 py-2 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 rounded-lg bg-warning-muted">
                    <AlertTriangle className="w-4 h-4 text-warning" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-amber-300 font-medium text-sm">Testnet Mode</span>
                    <span className="text-warning/80 text-xs">Using test tokens & contracts</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="flex items-center gap-1.5 px-2 py-1 text-xs text-warning hover:text-amber-300 rounded">
                    <Info className="w-3.5 h-3.5" />
                    <span>Details</span>
                  </button>
                  <a className="flex items-center gap-1.5 px-2 py-1 text-xs text-warning hover:text-amber-300 rounded">
                    Get KLV
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </ComponentPreview>

        <ComponentPreview
          title="TestnetIndicator (Compact)"
          description="Small indicator for headers/footers"
          code={`import { TestnetIndicator } from '@/components/TestnetBanner';

<TestnetIndicator />

// Renders a compact pill:
// 🟡 TESTNET`}
        >
          <div className="flex items-center justify-center">
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-warning-muted border border-border-warning">
              <span className="w-1.5 h-1.5 rounded-full bg-warning animate-pulse" />
              <span className="text-2xs font-medium text-warning uppercase tracking-wider">Testnet</span>
            </div>
          </div>
        </ComponentPreview>
      </section>

      {/* MOBILE BOTTOM NAV */}
      <section id="mobile-nav" className="mb-20">
        <div className="mb-8">
          <h2 className="text-4xl font-semibold text-text-primary mb-2">MobileBottomNav</h2>
          <p className="text-text-secondary">Fixed bottom navigation bar for mobile devices. Shows on screens below lg breakpoint.</p>
        </div>

        <ComponentPreview
          title="Mobile Bottom Navigation"
          description="5 primary nav items + expandable More menu"
          code={`import { MobileBottomNav } from '@/components/MobileBottomNav';

// In layout.tsx
<MobileBottomNav />

// Features:
// - Fixed bottom positioning
// - Safe area inset padding for notched devices
// - Active state highlighting
// - More menu for additional links
// - Auto-hides on lg+ screens`}
        >
          <div className="max-w-xs mx-auto">
            <div className="bg-bg-surface rounded-t-2xl border border-border-default p-2">
              <div className="grid grid-cols-5 gap-1">
                {[
                  { icon: Home, label: 'Home', active: true },
                  { icon: Repeat, label: 'Swap', active: false },
                  { icon: Droplets, label: 'Pool', active: false },
                  { icon: Wallet, label: 'Stake', active: false },
                  { icon: MoreHorizontal, label: 'More', active: false },
                ].map((item, i) => (
                  <button
                    key={i}
                    className={`flex flex-col items-center gap-1 py-2 px-1 rounded-xl transition-colors ${
                      item.active 
                        ? 'bg-brand-primary/10 text-brand-primary' 
                        : 'text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="text-2xs font-medium">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="h-6 bg-bg-base rounded-b-xl text-center text-2xs text-text-muted pt-1">
              Safe area padding
            </div>
          </div>
        </ComponentPreview>
      </section>

      {/* DESKTOP MORE MENU */}
      <section id="desktop-more" className="mb-20">
        <div className="mb-8">
          <h2 className="text-4xl font-semibold text-text-primary mb-2">DesktopMoreMenu</h2>
          <p className="text-text-secondary">Dropdown menu for secondary navigation items on desktop.</p>
        </div>

        <ComponentPreview
          title="More Menu Dropdown"
          description="Groups secondary links into a single dropdown"
          code={`import { DesktopMoreMenu } from '@/components/DesktopMoreMenu';

<DesktopMoreMenu />

// Items:
// - Documentation
// - Updates
// - FAQ
// - Admin (if authorized)`}
        >
          <div className="flex justify-center">
            <div className="relative">
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-overlay-subtle text-text-secondary hover:text-text-primary transition-colors">
                <span className="text-sm">More</span>
                <ChevronRight className="w-4 h-4 rotate-90" />
              </button>
              <div className="absolute top-full left-0 mt-2 w-48 bg-bg-surface rounded-xl border border-border-default shadow-dropdown p-1.5">
                {[
                  { icon: BookOpen, label: 'Documentation' },
                  { icon: FileText, label: 'Updates' },
                  { icon: HelpCircle, label: 'FAQ' },
                  { icon: Settings, label: 'Admin' },
                ].map((item, i) => (
                  <button
                    key={i}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-overlay-default transition-colors"
                  >
                    <item.icon className="w-4 h-4" />
                    <span className="text-sm">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </ComponentPreview>
      </section>

      {/* NAVIGATION LINKS */}
      <section id="nav-links" className="mb-20">
        <div className="mb-8">
          <h2 className="text-4xl font-semibold text-text-primary mb-2">NavigationLinks</h2>
          <p className="text-text-secondary">Primary navigation links used in header. Handles active state automatically.</p>
        </div>

        <ComponentPreview
          title="Primary Nav Links"
          description="Main navigation items with active state"
          code={`import { NavigationLinks } from '@/components/NavigationLinks';

// Desktop header
<NavigationLinks variant="desktop" />

// Mobile menu
<NavigationLinks variant="mobile" onItemClick={closeMenu} />`}
        >
          <div className="flex items-center gap-1 bg-bg-surface rounded-xl p-2 border border-border-default">
            {[
              { label: 'Swap', active: true },
              { label: 'Pool', active: false },
              { label: 'Stake', active: false },
              { label: 'Dashboard', active: false },
              { label: 'Games', active: false },
            ].map((item, i) => (
              <button
                key={i}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  item.active
                    ? 'bg-brand-primary/10 text-brand-primary'
                    : 'text-text-secondary hover:text-text-primary hover:bg-overlay-subtle'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </ComponentPreview>
      </section>

      {/* BEST PRACTICES */}
      <section id="best-practices" className="mb-20">
        <div className="mb-8">
          <h2 className="text-4xl font-semibold text-text-primary mb-2">Best Practices</h2>
          <p className="text-text-secondary">Guidelines for navigation and layout patterns.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-bg-surface rounded-xl p-6 border border-border-success">
            <h3 className="text-lg font-medium text-success mb-4">✓ Do</h3>
            <ul className="space-y-3 text-sm text-text-secondary">
              <li className="flex items-start gap-2">
                <span className="text-success">•</span>
                Always wrap pages in PageContainer
              </li>
              <li className="flex items-start gap-2">
                <span className="text-success">•</span>
                Use ConditionalNav to hide public nav on admin
              </li>
              <li className="flex items-start gap-2">
                <span className="text-success">•</span>
                Keep TestnetBanner at z-50 (highest)
              </li>
              <li className="flex items-start gap-2">
                <span className="text-success">•</span>
                Account for bottom nav safe area on mobile
              </li>
              <li className="flex items-start gap-2">
                <span className="text-success">•</span>
                Show clear active state on nav items
              </li>
            </ul>
          </div>

          <div className="bg-bg-surface rounded-xl p-6 border border-border-error">
            <h3 className="text-lg font-medium text-error mb-4">✗ Don&apos;t</h3>
            <ul className="space-y-3 text-sm text-text-secondary">
              <li className="flex items-start gap-2">
                <span className="text-error">•</span>
                Hardcode padding/max-width in pages
              </li>
              <li className="flex items-start gap-2">
                <span className="text-error">•</span>
                Allow testnet banner to be dismissed permanently
              </li>
              <li className="flex items-start gap-2">
                <span className="text-error">•</span>
                Show admin header/footer on public routes
              </li>
              <li className="flex items-start gap-2">
                <span className="text-error">•</span>
                Forget to handle notched device safe areas
              </li>
              <li className="flex items-start gap-2">
                <span className="text-error">•</span>
                Use different nav patterns on desktop vs mobile
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
