'use client';

import { Info, Wallet, Globe, Shield, Zap, Key, X, ArrowRightLeft } from 'lucide-react';
import { ComponentPreview } from '../components/ComponentPreview';
import { Button } from '@/components/Button';

export function WalletNetworkSection() {
  return (
    <div>
      {/* Section Header */}
      <div className="mb-12">
        <h1 className="text-5xl font-semibold text-text-primary mb-4">Wallet & Network</h1>
        <p className="text-xl text-text-secondary max-w-3xl">
          Components for wallet connection, network switching, and Web3 authentication flows.
        </p>
      </div>

      {/* WALLET CONNECT */}
      <section id="wallet-connect" className="mb-20">
        <div className="mb-8">
          <h2 className="text-4xl font-semibold text-text-primary mb-2">WalletConnect</h2>
          <p className="text-text-secondary mb-4">Primary wallet connection button with connected state display.</p>
          <div className="bg-bg-surface rounded-xl p-4 border border-border-success bg-success-muted">
            <div className="flex items-start gap-3">
              <Wallet className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-medium text-text-primary mb-1">Core Web3 Component</div>
                <p className="text-xs text-text-secondary">Uses KleverContext for wallet state. Always placed in header.</p>
              </div>
            </div>
          </div>
        </div>

        <ComponentPreview
          title="Default Variant - Disconnected"
          description="Full-width button for prominent placement"
          code={`import { WalletConnect } from '@/components/WalletConnect';

// Default variant
<WalletConnect />

// Compact variant for tight spaces
<WalletConnect variant="compact" />`}
        >
          <div className="flex flex-col gap-4 items-center">
            <Button variant="connect">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6v12c0 1.1.9 2 2 2h14v-4" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 12a2 2 0 0 0-2 2c0 1.1.9 2 2 2h4v-4h-4z" />
              </svg>
              Connect Wallet
            </Button>
          </div>
        </ComponentPreview>

        <ComponentPreview
          title="Default Variant - Connected"
          description="Shows truncated address with disconnect option"
          code={`// When connected, shows:
// - Green status dot
// - Truncated address (klv1a2...x7z)
// - Disconnect button`}
        >
          <div className="flex items-center gap-2 justify-center">
            <div className="bg-bg-surface px-4 py-2.5 rounded-xl flex items-center gap-3 border border-border-default">
              <div className="w-2 h-2 rounded-full bg-success flex-shrink-0" />
              <span className="text-text-primary font-mono text-sm">klv1a2b...x7z9</span>
            </div>
            <Button variant="ghost" className="p-2.5">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </Button>
          </div>
        </ComponentPreview>

        <ComponentPreview
          title="Compact Variant"
          description="Smaller version for admin headers and tight spaces"
          code={`<WalletConnect variant="compact" />`}
        >
          <div className="flex flex-col gap-4 items-center">
            <div className="text-xs text-text-muted mb-2">Disconnected:</div>
            <Button variant="connect" size="sm" className="gap-2">
              <Wallet className="w-4 h-4" />
              <span className="text-xs">Connect</span>
            </Button>
            
            <div className="text-xs text-text-muted mt-4 mb-2">Connected:</div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-overlay-default border border-border-default">
                <div className="w-2 h-2 rounded-full bg-success" />
                <span className="text-xs font-mono text-text-primary">klv1...x7z</span>
              </div>
              <Button variant="ghost" size="sm" className="px-2">
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </ComponentPreview>
      </section>

      {/* CONNECT WALLET PROMPT */}
      <section id="connect-prompt" className="mb-20">
        <div className="mb-8">
          <h2 className="text-4xl font-semibold text-text-primary mb-2">ConnectWalletPrompt</h2>
          <p className="text-text-secondary">Full-page prompt shown when wallet connection is required to view content.</p>
        </div>

        <ComponentPreview
          title="Wallet Connection Prompt"
          description="Informative card explaining wallet requirements"
          code={`import { ConnectWalletPrompt } from '@/components/ConnectWalletPrompt';

// Used in pages that require wallet
{!isConnected && <ConnectWalletPrompt />}
{isConnected && <PageContent />}`}
        >
          <div className="max-w-md mx-auto bg-bg-surface rounded-2xl p-8 border border-border-default">
            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-2xl bg-overlay-default border border-border-default flex items-center justify-center">
                <Wallet className="w-8 h-8 text-text-primary" />
              </div>
            </div>

            {/* Title */}
            <h2 className="text-2xl font-medium text-text-primary text-center mb-2">
              Connect Your Wallet
            </h2>
            <p className="text-text-secondary text-center mb-6 text-sm">
              Connect to start managing your digital assets
            </p>

            {/* Features */}
            <div className="grid grid-cols-3 gap-2 mb-6">
              {[
                { icon: Shield, label: 'Secure' },
                { icon: Zap, label: 'Fast' },
                { icon: Key, label: 'Non-custodial' },
              ].map((item, i) => (
                <div key={i} className="text-center p-3 rounded-xl bg-overlay-default border border-border-default">
                  <item.icon className="w-4 h-4 text-text-secondary mx-auto mb-1" />
                  <div className="text-xs text-text-secondary">{item.label}</div>
                </div>
              ))}
            </div>

            {/* Info */}
            <div className="p-3 rounded-xl bg-overlay-default border border-border-default mb-4">
              <div className="flex items-start gap-3">
                <Info className="w-4 h-4 text-text-secondary flex-shrink-0 mt-0.5" />
                <p className="text-xs text-text-secondary">
                  Make sure you have the Klever Wallet extension installed
                </p>
              </div>
            </div>

            {/* Download link */}
            <p className="text-center text-xs text-text-muted">
              Don&apos;t have Klever Wallet?{' '}
              <a className="text-brand-primary hover:underline">Download here →</a>
            </p>
          </div>
        </ComponentPreview>
      </section>

      {/* NETWORK TOGGLE */}
      <section id="network-toggle" className="mb-20">
        <div className="mb-8">
          <h2 className="text-4xl font-semibold text-text-primary mb-2">NetworkToggle</h2>
          <p className="text-text-secondary mb-4">Switch between mainnet and testnet with visual feedback.</p>
          <div className="bg-bg-surface rounded-xl p-4 border border-border-warning bg-warning-muted">
            <div className="flex items-start gap-3">
              <Globe className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-medium text-text-primary mb-1">Development Tool</div>
                <p className="text-xs text-text-secondary">Primarily used in admin panel. Users should typically stay on mainnet.</p>
              </div>
            </div>
          </div>
        </div>

        <ComponentPreview
          title="Full Network Toggle"
          description="Sliding toggle with status indicator"
          code={`import { NetworkToggle } from '@/components/NetworkToggle';

// Full version with label
<NetworkToggle />

// Compact without label
<NetworkToggle compact showLabel={false} />`}
        >
          <div className="flex flex-col gap-6 items-center">
            {/* Mainnet State */}
            <div className="flex items-center gap-3">
              <span className="text-xs text-text-muted uppercase tracking-wider">Network</span>
              <div className="relative flex items-center rounded-full p-1 bg-success-muted border border-border-success">
                <div className="relative flex items-center rounded-full w-[88px] h-8 bg-black/40">
                  <div className="absolute transition-all duration-150 ease-out rounded-full w-[42px] h-6 translate-x-1 bg-success-muted" />
                  <div className="relative z-10 flex items-center justify-between w-full px-2 text-xs font-medium">
                    <span className="text-text-primary w-[36px] text-center">Main</span>
                    <span className="text-text-muted w-[36px] text-center">Test</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                <span className="text-xs font-medium text-success">Mainnet</span>
              </div>
            </div>

            {/* Testnet State */}
            <div className="flex items-center gap-3">
              <span className="text-xs text-text-muted uppercase tracking-wider">Network</span>
              <div className="relative flex items-center rounded-full p-1 bg-warning-muted border border-border-warning">
                <div className="relative flex items-center rounded-full w-[88px] h-8 bg-black/40">
                  <div className="absolute transition-all duration-150 ease-out rounded-full w-[42px] h-6 translate-x-[44px] bg-warning-muted" />
                  <div className="relative z-10 flex items-center justify-between w-full px-2 text-xs font-medium">
                    <span className="text-text-muted w-[36px] text-center">Main</span>
                    <span className="text-text-primary w-[36px] text-center">Test</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-warning animate-pulse" />
                <span className="text-xs font-medium text-warning">Testnet</span>
              </div>
            </div>
          </div>
        </ComponentPreview>

        <ComponentPreview
          title="Inline Toggle"
          description="Minimal version for menus and footers"
          code={`import { NetworkToggleInline } from '@/components/NetworkToggle';

<NetworkToggleInline />`}
        >
          <div className="flex gap-4 justify-center">
            <button className="flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium bg-success-muted text-success border border-border-success">
              <span className="w-1.5 h-1.5 rounded-full bg-success" />
              Mainnet
              <ArrowRightLeft className="w-3 h-3 opacity-50" />
            </button>
            <button className="flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium bg-warning-muted text-warning border border-border-warning">
              <span className="w-1.5 h-1.5 rounded-full bg-warning" />
              Testnet
              <ArrowRightLeft className="w-3 h-3 opacity-50" />
            </button>
          </div>
        </ComponentPreview>
      </section>

      {/* USAGE PATTERNS */}
      <section id="patterns" className="mb-20">
        <div className="mb-8">
          <h2 className="text-4xl font-semibold text-text-primary mb-2">Usage Patterns</h2>
          <p className="text-text-secondary">Common patterns for wallet and network components.</p>
        </div>

        <ComponentPreview
          title="Header Integration"
          description="Standard placement of wallet and network controls"
          code={`// Header layout
<header className="flex items-center justify-between">
  <Logo />
  <NavigationLinks />
  <div className="flex items-center gap-4">
    <NetworkToggle compact showLabel={false} />
    <WalletConnect variant="compact" />
  </div>
</header>`}
        >
          <div className="bg-bg-surface rounded-xl border border-border-default p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="w-8 h-8 rounded-lg bg-brand-primary/20 flex items-center justify-center">
                  <span className="text-brand-primary font-bold text-xs">D</span>
                </div>
                <div className="flex gap-2">
                  {['Swap', 'Pool', 'Stake'].map((item) => (
                    <span key={item} className="px-3 py-1.5 text-sm text-text-secondary">{item}</span>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium bg-success-muted text-success border border-border-success">
                  <span className="w-1.5 h-1.5 rounded-full bg-success" />
                  Main
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-overlay-default border border-border-default">
                  <div className="w-2 h-2 rounded-full bg-success" />
                  <span className="text-xs font-mono text-text-primary">klv1...x7z</span>
                </div>
              </div>
            </div>
          </div>
        </ComponentPreview>

        <ComponentPreview
          title="Progressive Disclosure Pattern"
          description="Show wallet prompt only when needed"
          code={`function StakingPage() {
  const { isConnected } = useKlever();
  
  return (
    <PageContainer>
      {/* Always visible - allows exploration */}
      <StakingInfo />
      <StakingCalculator />
      
      {/* Requires wallet */}
      {isConnected ? (
        <StakingForm />
      ) : (
        <Card className="text-center py-8">
          <p className="text-text-secondary mb-4">
            Connect wallet to stake your tokens
          </p>
          {/* WalletConnect button is in header */}
        </Card>
      )}
    </PageContainer>
  );
}`}
        >
          <div className="space-y-4">
            <div className="bg-bg-surface rounded-xl p-4 border border-border-default">
              <div className="text-sm text-text-primary mb-2">Staking Info</div>
              <div className="text-xs text-text-muted">Always visible to all users</div>
            </div>
            <div className="bg-bg-surface rounded-xl p-4 border border-border-default">
              <div className="text-sm text-text-primary mb-2">APR Calculator</div>
              <div className="text-xs text-text-muted">Interactive, no wallet needed</div>
            </div>
            <div className="bg-bg-surface rounded-xl p-6 border border-dashed border-border-active text-center">
              <Wallet className="w-8 h-8 text-text-muted mx-auto mb-2" />
              <div className="text-sm text-text-secondary">Connect wallet to stake</div>
            </div>
          </div>
        </ComponentPreview>
      </section>

      {/* BEST PRACTICES */}
      <section id="best-practices" className="mb-20">
        <div className="mb-8">
          <h2 className="text-4xl font-semibold text-text-primary mb-2">Best Practices</h2>
          <p className="text-text-secondary">Guidelines for wallet and network UX.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-bg-surface rounded-xl p-6 border border-border-success">
            <h3 className="text-lg font-medium text-success mb-4">✓ Do</h3>
            <ul className="space-y-3 text-sm text-text-secondary">
              <li className="flex items-start gap-2">
                <span className="text-success">•</span>
                Allow content exploration before requiring wallet
              </li>
              <li className="flex items-start gap-2">
                <span className="text-success">•</span>
                Show clear connection status (green dot)
              </li>
              <li className="flex items-start gap-2">
                <span className="text-success">•</span>
                Provide easy disconnect option
              </li>
              <li className="flex items-start gap-2">
                <span className="text-success">•</span>
                Color-code network status (green=main, amber=test)
              </li>
              <li className="flex items-start gap-2">
                <span className="text-success">•</span>
                Truncate addresses appropriately for space
              </li>
            </ul>
          </div>

          <div className="bg-bg-surface rounded-xl p-6 border border-border-error">
            <h3 className="text-lg font-medium text-error mb-4">✗ Don&apos;t</h3>
            <ul className="space-y-3 text-sm text-text-secondary">
              <li className="flex items-start gap-2">
                <span className="text-error">•</span>
                Block entire page for unconnected users
              </li>
              <li className="flex items-start gap-2">
                <span className="text-error">•</span>
                Hide network indicator from users
              </li>
              <li className="flex items-start gap-2">
                <span className="text-error">•</span>
                Auto-connect without user action
              </li>
              <li className="flex items-start gap-2">
                <span className="text-error">•</span>
                Make testnet too easy to switch to accidentally
              </li>
              <li className="flex items-start gap-2">
                <span className="text-error">•</span>
                Show full addresses (privacy + space concerns)
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
