'use client';

import { ComponentPreview } from '../components/ComponentPreview';
import { IconBox } from '@/components/IconBox';
import { FeatureLinkCard } from '@/components/FeatureLinkCard';
import { TokenShowcaseCard } from '@/components/TokenShowcaseCard';
import { TOKEN_IDS } from '@/components/TokenImage';
import { InfoCard } from '@/components/InfoCard';
import { EmptyStateCard } from '@/components/EmptyStateCard';
import { GuideItem } from '@/components/GuideItem';
import { FeatureBadge } from '@/components/ui/Badge';
import { RefreshButton } from '@/components/RefreshButton';
import { BalanceRow, BalanceRowGroup } from '@/components/BalanceRow';
import { InfoTip } from '@/components/InfoTip';
import { ActionCardHeader } from '@/components/ActionCardHeader';
import { PageHeader } from '@/components/PageHeader';
import { MetricCard, MetricCardGrid } from '@/components/MetricCard';
import { DataGrid, DataGridItem } from '@/components/DataGrid';
import { SocialLinks } from '@/components/SocialLinks';
import { DonutChart, DonutChartLegend } from '@/components/DonutChart';
import { CheckCircle, Zap, ChevronRight, Wallet, Compass, Shield, TrendingUp, ImageIcon, Activity } from 'lucide-react';

// Sample icon for demos
const SampleIcon = (
  <svg className="w-6 h-6 md:w-7 md:h-7 lg:w-8 lg:h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
  </svg>
);

const LightningIcon = (
  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
  </svg>
);

export function CardsSection() {
  return (
    <div>
      {/* ICON BOX */}
      <section id="iconbox" className="mb-20">
        <div className="mb-8">
          <h2 className="text-4xl font-semibold text-text-primary mb-2">Icon Box (Real Component)</h2>
          <p className="text-text-secondary mb-4">Reusable icon container with gradient backgrounds - imported from @/components/IconBox</p>
          <div className="bg-bg-surface rounded-xl p-4 border border-border-success bg-success-muted">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-medium text-text-primary mb-1">Connected Component</div>
                <p className="text-xs text-text-secondary">This section uses the actual IconBox component from the app. Any changes to IconBox.tsx automatically update here.</p>
              </div>
            </div>
          </div>
        </div>

        <ComponentPreview
          title="Icon Box Sizes"
          description="Small (40px), Medium (56px), Large (64px)"
          code={`import { IconBox } from '@/components/IconBox';

<IconBox 
  icon={<Icon className="w-5 h-5" />} 
  size="sm" 
  variant="blue" 
/>

<IconBox 
  icon={<Icon className="w-6 h-6" />} 
  size="md" 
  variant="blue" 
/>

<IconBox 
  icon={<Icon className="w-7 h-7" />} 
  size="lg" 
  variant="blue" 
/>`}
          centered
        >
          <div className="flex items-end gap-6">
            <div className="flex flex-col items-center gap-2">
              <IconBox 
                icon={<Zap className="w-5 h-5" />} 
                size="sm" 
                variant="blue" 
              />
              <span className="text-xs text-text-secondary">Small</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <IconBox 
                icon={<Zap className="w-6 h-6" />} 
                size="md" 
                variant="blue" 
              />
              <span className="text-xs text-text-secondary">Medium</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <IconBox 
                icon={<Zap className="w-7 h-7" />} 
                size="lg" 
                variant="blue" 
              />
              <span className="text-xs text-text-secondary">Large</span>
            </div>
          </div>
        </ComponentPreview>

        <ComponentPreview
          title="Icon Box Variants"
          description="Blue, Purple, Cyan, Gray color variants"
          code={`<IconBox icon={<Icon />} variant="blue" />
<IconBox icon={<Icon />} variant="purple" />
<IconBox icon={<Icon />} variant="cyan" />
<IconBox icon={<Icon />} variant="gray" /> // For disabled states`}
          centered
        >
          <div className="flex items-center gap-6">
            <div className="flex flex-col items-center gap-2">
              <IconBox 
                icon={<Zap className="w-6 h-6" />} 
                size="md" 
                variant="blue" 
              />
              <span className="text-xs text-text-secondary">Blue</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <IconBox 
                icon={<Zap className="w-6 h-6" />} 
                size="md" 
                variant="purple" 
              />
              <span className="text-xs text-text-secondary">Purple</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <IconBox 
                icon={<Zap className="w-6 h-6" />} 
                size="md" 
                variant="cyan" 
              />
              <span className="text-xs text-text-secondary">Cyan</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <IconBox 
                icon={<Zap className="w-6 h-6" />} 
                size="md" 
                variant="gray" 
              />
              <span className="text-xs text-text-secondary">Gray</span>
            </div>
          </div>
        </ComponentPreview>
      </section>

      {/* BASIC CARDS */}
      <section id="cards" className="mb-20">
        <div className="mb-8">
          <h2 className="text-4xl font-semibold text-text-primary mb-2">Basic Cards</h2>
          <p className="text-text-secondary">Fundamental card patterns and layouts</p>
        </div>

        <ComponentPreview
          title="Basic Surface Card"
          description="Standard card with surface background"
          code={`<div className="bg-bg-surface rounded-2xl p-6 border border-border-default">
  <h3 className="text-text-primary font-semibold mb-2">Card Title</h3>
  <p className="text-text-secondary">Card description goes here</p>
</div>`}
        >
          <div className="bg-bg-surface rounded-2xl p-6 border border-border-default max-w-sm">
            <h3 className="text-text-primary font-semibold mb-2">Card Title</h3>
            <p className="text-text-secondary">Card description with flat surface styling</p>
          </div>
        </ComponentPreview>

        <ComponentPreview
          title="Stat Card"
          description="Card for displaying statistics"
          code={`<div className="bg-bg-surface rounded-2xl p-6 border border-border-default">
  <div className="text-3xl font-mono font-semibold text-text-primary mb-1">
    1,234.56
  </div>
  <div className="text-sm text-text-secondary">Total Value</div>
</div>`}
        >
          <div className="bg-bg-surface rounded-2xl p-6 border border-border-default max-w-xs">
            <div className="text-3xl font-mono font-semibold text-text-primary mb-1">
              1,234.56
            </div>
            <div className="text-sm text-text-secondary">Total Value</div>
          </div>
        </ComponentPreview>

        <ComponentPreview
          title="Feature Card with Icon"
          description="Card with icon, title, and description"
          code={`<div className="bg-bg-surface rounded-2xl p-6 border border-border-default hover:border-border-active transition-all cursor-pointer">
  <IconBox 
    icon={<Icon />} 
    size="sm" 
    variant="blue" 
  />
  <h3 className="text-text-primary font-semibold mb-1 mt-4">Feature Title</h3>
  <p className="text-sm text-text-secondary">Feature description explaining what this does</p>
</div>`}
        >
          <div className="bg-bg-surface rounded-2xl p-6 border border-border-default hover:border-border-active transition-all cursor-pointer max-w-sm">
            <IconBox 
              icon={<Zap className="w-5 h-5" />} 
              size="sm" 
              variant="blue" 
            />
            <h3 className="text-text-primary font-semibold mb-1 mt-4">Feature Title</h3>
            <p className="text-sm text-text-secondary">Feature description explaining what this does and why it matters</p>
          </div>
        </ComponentPreview>

        <ComponentPreview
          title="Horizontal Feature Card"
          description="Card with icon and content side-by-side"
          code={`<div className="bg-bg-surface rounded-xl p-4 border border-border-default flex items-center gap-4 hover:bg-overlay-subtle transition-all cursor-pointer">
  <IconBox 
    icon={<Icon />} 
    size="sm" 
    variant="blue" 
  />
  <div className="flex-1">
    <h3 className="text-text-primary font-medium mb-1">Feature Title</h3>
    <p className="text-sm text-text-secondary">Brief description</p>
  </div>
  <ChevronRight className="w-5 h-5 text-text-disabled" />
</div>`}
        >
          <div className="bg-bg-surface rounded-xl p-4 border border-border-default flex items-center gap-4 hover:bg-overlay-subtle transition-all cursor-pointer max-w-md">
            <IconBox 
              icon={<Zap className="w-5 h-5" />} 
              size="sm" 
              variant="blue" 
            />
            <div className="flex-1">
              <h3 className="text-text-primary font-medium mb-1">Feature Title</h3>
              <p className="text-sm text-text-secondary">Brief description of the feature</p>
            </div>
            <ChevronRight className="w-5 h-5 text-text-disabled group-hover:text-text-primary transition-colors" />
          </div>
        </ComponentPreview>

        <ComponentPreview
          title="Card with Border Accent"
          description="Card with colored top border"
          code={`<div className="bg-bg-surface rounded-2xl p-6 border border-border-default border-t-4 border-t-brand-primary">
  <h3 className="text-text-primary font-semibold mb-2">Highlighted Card</h3>
  <p className="text-text-secondary">Card with accent border on top</p>
</div>`}
        >
          <div className="bg-bg-surface rounded-2xl p-6 border border-border-default border-t-4 border-t-brand-primary max-w-sm">
            <h3 className="text-text-primary font-semibold mb-2">Highlighted Card</h3>
            <p className="text-text-secondary">Card with colored top border for emphasis</p>
          </div>
        </ComponentPreview>
      </section>

      {/* FEATURE LINK CARD */}
      <section id="feature-link-card" className="mb-20">
        <div className="mb-8">
          <h2 className="text-4xl font-semibold text-text-primary mb-2">FeatureLinkCard</h2>
          <p className="text-text-secondary mb-4">Feature cards with icon, title, description, and optional link. Used for showcasing platform features.</p>
          <div className="bg-bg-surface rounded-xl p-4 border border-border-success bg-success-muted">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-medium text-text-primary mb-1">Connected Component</div>
                <p className="text-xs text-text-secondary">Uses the actual FeatureLinkCard component from @/components/FeatureLinkCard</p>
              </div>
            </div>
          </div>
        </div>

        <ComponentPreview
          title="Active Card with Link"
          description="Clickable card that links to another page"
          code={`<FeatureLinkCard
  icon={<DashboardIcon />}
  title="Dashboard"
  description="Comprehensive asset management interface."
  href="/dashboard"
  linkText="Explore Dashboard"
  iconVariant="blue"
/>`}
        >
          <div className="max-w-md">
            <FeatureLinkCard
              icon={SampleIcon}
              title="Dashboard"
              description="Comprehensive asset management interface. View balances and monitor your portfolio."
              href="/dashboard"
              linkText="Explore Dashboard"
              iconVariant="blue"
            />
          </div>
        </ComponentPreview>

        <ComponentPreview
          title="Disabled Card with Badge"
          description="Card for upcoming features"
          code={`<FeatureLinkCard
  icon={<SwapIcon />}
  title="Swap"
  description="Coming soon."
  disabled
  badge={<FeatureBadge label="Coming Soon" />}
/>`}
        >
          <div className="max-w-md">
            <FeatureLinkCard
              icon={SampleIcon}
              title="Coming Soon Feature"
              description="This feature is not yet available. Stay tuned for updates."
              disabled
              badge={<FeatureBadge label="Coming Soon" />}
            />
          </div>
        </ComponentPreview>

        <ComponentPreview
          title="Card with Multiple Links"
          description="Card with multiple navigation options"
          code={`<FeatureLinkCard
  icon={<TokenIcon />}
  title="Token Information"
  description="View token details."
  links={[
    { href: '/dgko', label: 'DGKO' },
    { href: '/babydgko', label: 'BABYDGKO' },
  ]}
  iconVariant="cyan"
/>`}
        >
          <div className="max-w-md">
            <FeatureLinkCard
              icon={SampleIcon}
              title="Token Information"
              description="Dedicated pages for DGKO and BABYDGKO with real-time stats."
              links={[
                { href: '/dgko', label: 'DGKO' },
                { href: '/babydgko', label: 'BABYDGKO' },
              ]}
              iconVariant="cyan"
            />
          </div>
        </ComponentPreview>
      </section>

      {/* INFO CARD */}
      <section id="info-card" className="mb-20">
        <div className="mb-8">
          <h2 className="text-4xl font-semibold text-text-primary mb-2">InfoCard</h2>
          <p className="text-text-secondary mb-4">Centered information cards with icon, title, and description. Used in feature grids.</p>
          <div className="bg-bg-surface rounded-xl p-4 border border-border-success bg-success-muted">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-medium text-text-primary mb-1">Connected Component</div>
                <p className="text-xs text-text-secondary">Uses the actual InfoCard component from @/components/InfoCard</p>
              </div>
            </div>
          </div>
        </div>

        <ComponentPreview
          title="InfoCard Grid"
          description="Centered cards for feature sections"
          code={`<InfoCard
  icon={<LightningIcon />}
  title="Fast Performance"
  description="Built for instant transaction finality."
  iconVariant="blue" // 'blue' | 'cyan' | 'purple'
  align="center" // 'left' | 'center'
/>`}
        >
          <div className="grid md:grid-cols-3 gap-8">
            <InfoCard
              icon={LightningIcon}
              title="Fast Performance"
              description="Built for instant transaction finality and minimal fees."
              iconVariant="blue"
            />
            <InfoCard
              icon={LightningIcon}
              title="Secure"
              description="Your private keys stay secure in your wallet."
              iconVariant="cyan"
            />
            <InfoCard
              icon={LightningIcon}
              title="Complete Suite"
              description="Everything you need in one interface."
              iconVariant="purple"
            />
          </div>
        </ComponentPreview>
      </section>

      {/* EMPTY STATE CARD */}
      <section id="empty-state-card" className="mb-20">
        <div className="mb-8">
          <h2 className="text-4xl font-semibold text-text-primary mb-2">EmptyStateCard</h2>
          <p className="text-text-secondary mb-4">Reusable empty state/prompt card for connect wallet, empty lists, onboarding, etc.</p>
          <div className="bg-bg-surface rounded-xl p-4 border border-border-success bg-success-muted">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-medium text-text-primary mb-1">Connected Component</div>
                <p className="text-xs text-text-secondary">Uses the actual EmptyStateCard component from @/components/EmptyStateCard</p>
              </div>
            </div>
          </div>
        </div>

        <ComponentPreview
          title="Connect Wallet Prompt (Purple)"
          description="Used when user needs to connect wallet"
          code={`<EmptyStateCard
  icon={<WalletIcon />}
  title="Connect to View Your Dashboard"
  description="Connect your wallet to see your portfolio"
  variant="purple"
  action={{
    label: 'Connect Wallet',
    onClick: connect,
    variant: 'connect',
  }}
/>`}
        >
          <EmptyStateCard
            icon={<Wallet />}
            title="Connect to View Your Dashboard"
            description="Connect your Klever wallet to see your portfolio, balances, and account information"
            variant="purple"
            action={{
              label: 'Connect Wallet',
              onClick: () => {},
              variant: 'connect',
            }}
            secondaryAction={{
              label: "Don't have Klever Wallet?",
              href: 'https://klever.io/extension/',
            }}
          />
        </ComponentPreview>

        <ComponentPreview
          title="Empty State (Cyan)"
          description="For guiding users to another page"
          code={`<EmptyStateCard
  icon={<CompassIcon />}
  title="No Transactions Yet"
  description="Start by making your first transaction"
  variant="cyan"
  action={{
    label: 'Go to Dashboard',
    href: '/dashboard',
  }}
  secondaryAction={{
    label: "Learn more",
    href: "https://docs.klever.org",
  }}
/>`}
        >
          <EmptyStateCard
            icon={<Compass />}
            title="No Transactions Yet"
            description="Start by making your first transaction on the platform"
            variant="cyan"
            action={{
              label: 'Go to Dashboard',
              href: '/dashboard',
            }}
            secondaryAction={{
              label: "Learn more",
              href: "https://docs.klever.org",
            }}
          />
        </ComponentPreview>

        <ComponentPreview
          title="Empty State (Pink)"
          description="NFT marketplace empty state"
          code={`<EmptyStateCard
  icon={<ImageIcon />}
  title="No NFTs Listed"
  description="Be the first to list!"
  variant="pink"
/>`}
        >
          <EmptyStateCard
            icon={<ImageIcon />}
            title="No NFTs Listed"
            description="Be the first to list an NFT on the Rare Canvas marketplace!"
            variant="pink"
          />
        </ComponentPreview>

        <ComponentPreview
          title="Empty State (Emerald)"
          description="Success-themed empty state"
          code={`<EmptyStateCard
  icon={<Activity />}
  title="Activity Feed Coming Soon"
  description="Track marketplace activity"
  variant="emerald"
/>`}
        >
          <EmptyStateCard
            icon={<Activity />}
            title="Activity Feed Coming Soon"
            description="Track all marketplace activity including sales, listings, and transfers"
            variant="emerald"
          />
        </ComponentPreview>
      </section>

      {/* GUIDE ITEM */}
      <section id="guide-item" className="mb-20">
        <div className="mb-8">
          <h2 className="text-4xl font-semibold text-text-primary mb-2">GuideItem</h2>
          <p className="text-text-secondary mb-4">Horizontal guide/feature item with icon, title, and description. Used in quick guides, feature lists, step indicators.</p>
          <div className="bg-bg-surface rounded-xl p-4 border border-border-success bg-success-muted">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-medium text-text-primary mb-1">Connected Component</div>
                <p className="text-xs text-text-secondary">Uses the actual GuideItem component from @/components/GuideItem</p>
              </div>
            </div>
          </div>
        </div>

        <ComponentPreview
          title="Basic GuideItem"
          description="Static guide item without link"
          code={`<GuideItem
  icon={<ZapIcon className="w-5 h-5" />}
  title="Start Staking"
  description="Stake tokens to earn rewards"
  variant="cyan"
/>`}
        >
          <div className="max-w-md">
            <GuideItem
              icon={<Zap className="w-5 h-5" />}
              title="Start Staking"
              description="Stake your tokens to earn up to 10% APY rewards while maintaining custody"
              variant="cyan"
            />
          </div>
        </ComponentPreview>

        <ComponentPreview
          title="GuideItem with Link"
          description="Clickable guide item that navigates to another page"
          code={`<GuideItem
  icon={<TrendingUpIcon className="w-5 h-5" />}
  title="Track Portfolio"
  description="Monitor your holdings and performance"
  variant="blue"
  href="/dashboard"
/>`}
        >
          <div className="max-w-md">
            <GuideItem
              icon={<TrendingUp className="w-5 h-5" />}
              title="Track Portfolio"
              description="Monitor your complete token holdings and transaction history"
              variant="blue"
              href="/dashboard"
            />
          </div>
        </ComponentPreview>

        <ComponentPreview
          title="GuideItem Grid"
          description="Multiple guide items in a grid layout"
          code={`<div className="grid md:grid-cols-2 gap-4">
  <GuideItem icon={<WalletIcon />} title="Dashboard" ... href="/dashboard" />
  <GuideItem icon={<TrendingUpIcon />} title="Portfolio" ... href="/dashboard" />
  <GuideItem icon={<ImageIcon />} title="NFT Marketplace" ... href="/nft" />
  <GuideItem icon={<CompassIcon />} title="Explore" ... href="/" />
</div>`}
        >
          <div className="grid md:grid-cols-2 gap-4">
            <GuideItem
              icon={<Wallet className="w-5 h-5" />}
              title="View Dashboard"
              description="Manage your digital assets"
              variant="cyan"
              href="/dashboard"
            />
            <GuideItem
              icon={<TrendingUp className="w-5 h-5" />}
              title="Track Portfolio"
              description="Monitor your holdings"
              variant="blue"
              href="/dashboard"
            />
            <GuideItem
              icon={<ImageIcon className="w-5 h-5" />}
              title="NFT Marketplace"
              description="Browse and trade NFTs"
              variant="purple"
              href="/nft"
            />
            <GuideItem
              icon={<Compass className="w-5 h-5" />}
              title="Explore"
              description="Discover the ecosystem"
              variant="cyan"
              href="/"
            />
          </div>
        </ComponentPreview>
      </section>

      {/* TOKEN SHOWCASE CARD */}
      <section id="token-showcase-card" className="mb-20">
        <div className="mb-8">
          <h2 className="text-4xl font-semibold text-text-primary mb-2">TokenShowcaseCard</h2>
          <p className="text-text-secondary mb-4">Showcase card for ecosystem tokens with logo, details, and stats.</p>
          <div className="bg-bg-surface rounded-xl p-4 border border-border-success bg-success-muted">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-medium text-text-primary mb-1">Connected Component</div>
                <p className="text-xs text-text-secondary">Uses the actual TokenShowcaseCard component from @/components/TokenShowcaseCard</p>
              </div>
            </div>
          </div>
        </div>

        <ComponentPreview
          title="Token Cards"
          description="Showcase cards with token info and stats"
          code={`<TokenShowcaseCard
  tokenId={TOKEN_IDS.DGKO}
  name="DGKO"
  ticker="DGKO-CXVJ"
  href="/dgko"
  description="The primary utility token of the ecosystem."
  stats={[
    { label: 'Max Supply', value: '100 Million' },
    { label: 'Staking APR', value: '10%', highlight: true },
  ]}
  accentColor="blue" // 'blue' | 'cyan'
/>`}
        >
          <div className="grid md:grid-cols-2 gap-6">
            <TokenShowcaseCard
              tokenId={TOKEN_IDS.DGKO}
              name="DGKO"
              ticker="DGKO-CXVJ"
              href="/dgko"
              description="The primary utility token of the Rare Canvas ecosystem."
              stats={[
                { label: 'Max Supply', value: '100 Million' },
                { label: 'Staking APR', value: '10%', highlight: true },
              ]}
              accentColor="blue"
            />
            <TokenShowcaseCard
              tokenId={TOKEN_IDS.BABYDGKO}
              name="BABYDGKO"
              ticker="BABYDGKO-3S67"
              href="/babydgko"
              description="Community meme token with staking rewards."
              stats={[
                { label: 'Max Supply', value: '50 Billion' },
                { label: 'Staking APR', value: '10%', highlight: true },
              ]}
              accentColor="cyan"
            />
          </div>
        </ComponentPreview>
      </section>

      {/* ACTION COMPONENTS */}
      <section id="action-components" className="mb-20">
        <div className="mb-8">
          <h2 className="text-4xl font-semibold text-text-primary mb-2">Action Components (Real Components)</h2>
          <p className="text-text-secondary mb-4">Reusable components for interactive cards - RefreshButton, BalanceRow, InfoTip, ActionCardHeader</p>
          <div className="bg-bg-surface rounded-xl p-4 border border-border-success bg-success-muted">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-medium text-text-primary mb-1">Connected Components</div>
                <p className="text-xs text-text-secondary">These components are used in staking, swap, and other action cards.</p>
              </div>
            </div>
          </div>
        </div>

        <ComponentPreview
          title="RefreshButton"
          description="Refresh button with loading state"
          code={`import { RefreshButton } from '@/components/ui';

<RefreshButton onClick={handleRefresh} />
<RefreshButton onClick={handleRefresh} isLoading />
<RefreshButton onClick={handleRefresh} size="sm" />`}
          centered
        >
          <div className="flex items-center gap-6">
            <div className="flex flex-col items-center gap-2">
              <RefreshButton onClick={() => {}} />
              <span className="text-xs text-text-secondary">Default</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <RefreshButton onClick={() => {}} isLoading />
              <span className="text-xs text-text-secondary">Loading</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <RefreshButton onClick={() => {}} size="sm" />
              <span className="text-xs text-text-secondary">Small</span>
            </div>
          </div>
        </ComponentPreview>

        <ComponentPreview
          title="BalanceRow"
          description="Display label-value pairs with token symbols"
          code={`import { BalanceRow, BalanceRowGroup } from '@/components/ui';

<BalanceRowGroup>
  <BalanceRow label="Available" value="1,234.56" token="DGKO" />
  <BalanceRow label="Staked" value="5,000.00" token="DGKO" />
</BalanceRowGroup>`}
        >
          <div className="max-w-md mx-auto">
            <BalanceRowGroup>
              <BalanceRow label="Available" value="1,234.56" token="DGKO" />
              <BalanceRow label="Staked" value="5,000.00" token="DGKO" />
            </BalanceRowGroup>
          </div>
        </ComponentPreview>

        <ComponentPreview
          title="BalanceRow Sizes"
          description="Small, Medium, Large size variants"
          code={`<BalanceRow label="Small" value="100" token="KLV" size="sm" />
<BalanceRow label="Medium" value="1,000" token="KLV" size="md" />
<BalanceRow label="Large" value="10,000" token="KLV" size="lg" highlight />`}
        >
          <div className="max-w-md mx-auto space-y-4">
            <BalanceRow label="Small" value="100" token="KLV" size="sm" />
            <BalanceRow label="Medium" value="1,000" token="KLV" size="md" />
            <BalanceRow label="Large" value="10,000" token="KLV" size="lg" highlight />
          </div>
        </ComponentPreview>

        <ComponentPreview
          title="InfoTip"
          description="Informational tip boxes with variants"
          code={`import { InfoTip } from '@/components/ui';

<InfoTip>Default info message</InfoTip>
<InfoTip variant="warning">Warning message</InfoTip>
<InfoTip variant="success">Success message</InfoTip>
<InfoTip variant="neutral">Neutral message</InfoTip>`}
        >
          <div className="space-y-4 max-w-lg mx-auto">
            <InfoTip>Rewards accumulate automatically while staking. Claim anytime!</InfoTip>
            <InfoTip variant="warning">This action cannot be undone.</InfoTip>
            <InfoTip variant="success">Transaction completed successfully!</InfoTip>
            <InfoTip variant="neutral">No tokens are currently staking.</InfoTip>
          </div>
        </ComponentPreview>

        <ComponentPreview
          title="ActionCardHeader"
          description="Card header with title and refresh button"
          code={`import { ActionCardHeader } from '@/components/ui';

<ActionCardHeader 
  title="Stake" 
  onRefresh={handleRefresh} 
  isLoading={isLoading} 
/>`}
        >
          <div className="max-w-md mx-auto bg-bg-surface rounded-2xl p-6 border border-border-default">
            <ActionCardHeader 
              title="Stake" 
              onRefresh={() => {}} 
              isLoading={false} 
            />
            <div className="p-4 bg-klever-dark rounded-xl text-text-secondary text-center">
              Card content goes here...
            </div>
          </div>
        </ComponentPreview>
      </section>

      {/* PAGE HEADER */}
      <section id="pageheader" className="mb-20">
        <div className="mb-8">
          <h2 className="text-4xl font-semibold text-text-primary mb-2">Page Header (Real Component)</h2>
          <p className="text-text-secondary mb-4">Page header with optional icon/image and description - imported from @/components/PageHeader</p>
          <div className="bg-bg-surface rounded-xl p-4 border border-border-success bg-success-muted">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-medium text-text-primary mb-1">Connected Component</div>
                <p className="text-xs text-text-secondary">This section uses the actual PageHeader component. Used on token pages and other landing pages.</p>
              </div>
            </div>
          </div>
        </div>

        <ComponentPreview
          title="Page Header with Icon"
          description="Standard page header with icon and description"
          code={`import { PageHeader } from '@/components/ui';
import { TOKEN_IDS } from '@/components/TokenImage';

<PageHeader
  icon={<TokenImage assetId={TOKEN_IDS.DGKO} size="xl" />}
  title="DGKO Token"
  description="The native utility token powering the Digiko ecosystem"
/>`}
        >
          <div className="max-w-2xl mx-auto">
            <PageHeader
              icon={<IconBox icon={<Zap className="w-7 h-7" />} size="lg" variant="blue" />}
              title="Sample Page"
              description="This is an example page header with an icon box instead of a token image"
            />
          </div>
        </ComponentPreview>

        <ComponentPreview
          title="Simple Page Header"
          description="Page header without icon"
          code={`<PageHeader
  title="Documentation"
  description="Learn how to use the Digiko platform"
/>`}
        >
          <div className="max-w-2xl mx-auto">
            <PageHeader
              title="Documentation"
              description="Learn how to use the Digiko platform effectively"
            />
          </div>
        </ComponentPreview>
      </section>

      {/* METRIC CARD */}
      <section id="metriccard" className="mb-20">
        <div className="mb-8">
          <h2 className="text-4xl font-semibold text-text-primary mb-2">Metric Card (Real Component)</h2>
          <p className="text-text-secondary mb-4">Card displaying a metric with icon, label, value, and description - imported from @/components/MetricCard</p>
          <div className="bg-bg-surface rounded-xl p-4 border border-border-success bg-success-muted">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-medium text-text-primary mb-1">Connected Component</div>
                <p className="text-xs text-text-secondary">Used for token activity cards, stats summaries, and similar metric displays.</p>
              </div>
            </div>
          </div>
        </div>

        <ComponentPreview
          title="Metric Card Grid"
          description="Responsive grid of metric cards"
          code={`import { MetricCard, MetricCardGrid } from '@/components/ui';

<MetricCardGrid columns={2}>
  <MetricCard
    icon={<FireIcon />}
    iconColor="red"
    label="Total Burned"
    value="1,234,567"
    description="Tokens permanently removed"
  />
  <MetricCard
    icon={<PlusIcon />}
    iconColor="blue"
    label="Total Minted"
    value="5,000,000"
    description="Tokens created since launch"
  />
</MetricCardGrid>`}
        >
          <div className="max-w-4xl mx-auto">
            <MetricCardGrid columns={2}>
              <MetricCard
                icon={<TrendingUp className="w-5 h-5" />}
                iconColor="red"
                label="Total Burned"
                value="1,234,567"
                description="Tokens permanently removed from circulation"
              />
              <MetricCard
                icon={<Zap className="w-5 h-5" />}
                iconColor="blue"
                label="Total Minted"
                value="5,000,000"
                description="Tokens created since launch"
              />
            </MetricCardGrid>
          </div>
        </ComponentPreview>
      </section>

      {/* DATA GRID */}
      <section id="datagrid" className="mb-20">
        <div className="mb-8">
          <h2 className="text-4xl font-semibold text-text-primary mb-2">Data Grid (Real Component)</h2>
          <p className="text-text-secondary mb-4">Section with title and grid of data items - imported from @/components/DataGrid</p>
          <div className="bg-bg-surface rounded-xl p-4 border border-border-success bg-success-muted">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-medium text-text-primary mb-1">Connected Component</div>
                <p className="text-xs text-text-secondary">Used for on-chain data displays, supply stats, and similar data grids.</p>
              </div>
            </div>
          </div>
        </div>

        <ComponentPreview
          title="Data Grid with Items"
          description="Grid of data items with optional actions"
          code={`import { DataGrid, DataGridItem } from '@/components/ui';

<DataGrid title="On-Chain Data" columns={3}>
  <DataGridItem label="Total Supply" value="100,000,000" />
  <DataGridItem label="Circulating" value="50,000,000" />
  <DataGridItem 
    label="Holders" 
    value="1,234" 
    action={{ label: "View all →", href: "https://...", external: true }}
  />
</DataGrid>`}
        >
          <div className="max-w-4xl mx-auto">
            <DataGrid title="On-Chain Data" columns={3}>
              <DataGridItem label="Total Supply" value="100,000,000" />
              <DataGridItem label="Circulating Supply" value="50,000,000" />
              <DataGridItem 
                label="Holders" 
                value="1,234" 
                action={{ label: "View all holders →", href: "#", external: false }}
              />
            </DataGrid>
          </div>
        </ComponentPreview>
      </section>

      {/* SOCIAL LINKS */}
      <section id="sociallinks" className="mb-20">
        <div className="mb-8">
          <h2 className="text-4xl font-semibold text-text-primary mb-2">Social Links (Real Component)</h2>
          <p className="text-text-secondary mb-4">Community/social media links section - imported from @/components/SocialLinks</p>
          <div className="bg-bg-surface rounded-xl p-4 border border-border-success bg-success-muted">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-medium text-text-primary mb-1">Connected Component</div>
                <p className="text-xs text-text-secondary">Used on token pages and community sections for social media links.</p>
              </div>
            </div>
          </div>
        </div>

        <ComponentPreview
          title="Social Links"
          description="Row of social media links with icons"
          code={`import { SocialLinks } from '@/components/ui';

<SocialLinks
  title="Community"
  links={[
    { name: 'Twitter', icon: <XIcon />, url: 'https://x.com/...' },
    { name: 'Telegram', icon: <TelegramIcon />, url: 'https://t.me/...' },
  ]}
/>`}
        >
          <div className="max-w-2xl mx-auto">
            <SocialLinks
              title="Community"
              links={[
                { 
                  name: 'X (Twitter)', 
                  icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>, 
                  url: 'https://x.com', 
                  hoverColor: 'hover:text-text-primary' 
                },
                { 
                  name: 'Telegram', 
                  icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" /></svg>, 
                  url: 'https://t.me', 
                  hoverColor: 'hover:text-sky-400' 
                },
              ]}
            />
          </div>
        </ComponentPreview>
      </section>

      {/* DONUT CHART */}
      <section id="donutchart" className="mb-20">
        <div className="mb-8">
          <h2 className="text-4xl font-semibold text-text-primary mb-2">Donut Chart (Real Component)</h2>
          <p className="text-text-secondary mb-4">Animated donut chart for distributions - imported from @/components/DonutChart</p>
          <div className="bg-bg-surface rounded-xl p-4 border border-border-success bg-success-muted">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-medium text-text-primary mb-1">Connected Component</div>
                <p className="text-xs text-text-secondary">Used for tokenomics displays and similar percentage-based visualizations.</p>
              </div>
            </div>
          </div>
        </div>

        <ComponentPreview
          title="Donut Chart with Legend"
          description="Animated chart with center content and legend"
          code={`import { DonutChart, DonutChartLegend } from '@/components/ui';

const segments = [
  { label: 'Community', percent: 40, color: '#0066FF' },
  { label: 'Ecosystem', percent: 25, color: '#00D4FF' },
  { label: 'Team', percent: 15, color: '#6366F1' },
  { label: 'Reserve', percent: 20, color: '#A855F7' },
];

<DonutChart
  segments={segments}
  centerContent={
    <>
      <div className="text-4xl font-mono text-text-primary">100M</div>
      <div className="text-sm text-text-muted">Max Supply</div>
    </>
  }
/>
<DonutChartLegend segments={segments} />`}
        >
          <div className="flex flex-col lg:flex-row items-center justify-center gap-8 max-w-2xl mx-auto">
            <DonutChart
              segments={[
                { label: 'Community', percent: 40, color: '#0066FF' },
                { label: 'Ecosystem', percent: 25, color: '#00D4FF' },
                { label: 'Team', percent: 15, color: '#6366F1' },
                { label: 'Reserve', percent: 20, color: '#A855F7' },
              ]}
              size={200}
              centerContent={
                <>
                  <div className="text-2xl font-mono font-medium text-text-primary">100M</div>
                  <div className="text-xs text-text-muted">Max Supply</div>
                </>
              }
            />
            <DonutChartLegend
              segments={[
                { label: 'Community', percent: 40, color: '#0066FF' },
                { label: 'Ecosystem', percent: 25, color: '#00D4FF' },
                { label: 'Team', percent: 15, color: '#6366F1' },
                { label: 'Reserve', percent: 20, color: '#A855F7' },
              ]}
            />
          </div>
        </ComponentPreview>
      </section>

      {/* UX PATTERNS - NEW v1.20.0 */}
      <section id="ux-patterns" className="mb-20">
        <div className="mb-8">
          <h2 className="text-4xl font-semibold text-text-primary mb-2">UX Patterns</h2>
          <p className="text-text-secondary mb-4">Established interaction patterns and UX principles used across the platform.</p>
          <div className="bg-bg-surface rounded-xl p-4 border border-brand-secondary/20 bg-brand-secondary/5">
            <div className="flex items-start gap-3">
              <Zap className="w-5 h-5 text-brand-secondary flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-medium text-text-primary mb-1">v1.20.0 Patterns</div>
                <p className="text-xs text-text-secondary">Progressive disclosure, always-visible cards, and connect wallet UX patterns.</p>
              </div>
            </div>
          </div>
        </div>

        <ComponentPreview
          title="Always-Visible Card Pattern"
          description="Cards remain visible with contextual empty states instead of hiding"
          code={`// ❌ OLD PATTERN - Hiding cards
{isConnected && hasPosition && (
  <Card>Position Card</Card>
)}

// ✅ NEW PATTERN - Always visible with empty state
<Card>
  {isConnected && hasPosition ? (
    <PositionContent />
  ) : (
    <EmptyState 
      icon={<Droplets />}
      message={isConnected ? "No position yet" : "Connect wallet to view"} 
    />
  )}
</Card>`}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
            {/* Card with data */}
            <div className="bg-bg-surface rounded-2xl p-6 border border-border-default">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-text-primary/60" />
                  <h3 className="text-text-primary font-semibold">Your Position</h3>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-success/20 text-success">Active</span>
              </div>
              <div className="text-2xl font-mono text-text-primary mb-1">500 DGKO + 50 KLV</div>
              <div className="text-sm text-text-secondary">Pool share: 2.34%</div>
            </div>
            {/* Card with empty state */}
            <div className="bg-bg-surface rounded-2xl p-6 border border-border-default">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-text-primary/60" />
                <h3 className="text-text-primary font-semibold">Your Position</h3>
              </div>
              <div className="text-center py-4 text-text-primary/60">
                <Shield className="w-10 h-10 mx-auto mb-2 opacity-40" />
                <p>No liquidity position yet</p>
                <p className="text-sm mt-1 text-text-muted">Add liquidity to start earning</p>
              </div>
            </div>
          </div>
        </ComponentPreview>

        <ComponentPreview
          title="Connect Wallet Button Pattern"
          description="Action buttons transform to Connect Wallet when not connected"
          code={`// ✅ Button changes based on connection state
<Button
  onClick={isConnected ? handleAction : connect}
  variant={isConnected ? "primary" : "connect"}
>
  {isConnected ? 'Add Liquidity' : 'Connect Wallet'}
</Button>

// Key: No page-level blockers, just button-level changes`}
        >
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
            <div className="text-center">
              <div className="text-xs text-text-muted mb-2">Connected State</div>
              <button className="px-6 py-3 rounded-xl bg-brand-primary text-text-primary font-medium hover:bg-brand-primary/90 transition-all">
                Add Liquidity
              </button>
            </div>
            <div className="text-text-primary/40">→</div>
            <div className="text-center">
              <div className="text-xs text-text-muted mb-2">Not Connected</div>
              <button className="px-6 py-3 rounded-xl bg-gradient-to-r from-brand-primary to-brand-secondary text-text-primary font-medium hover:opacity-90 transition-all flex items-center gap-2">
                <Wallet className="w-4 h-4" />
                Connect Wallet
              </button>
            </div>
          </div>
        </ComponentPreview>

        <ComponentPreview
          title="Progressive Disclosure"
          description="Users can explore interface before connecting wallet"
          code={`// Pool Page Structure
<PageContent>
  {/* Always visible - no wallet blocker */}
  <PairSelector />
  
  <div className="grid grid-cols-2 gap-6">
    {/* Left column */}
    <YourPosition />  {/* Shows empty state if not connected */}
    <ClaimFees />     {/* Shows empty state if no fees */}
    
    {/* Right column */}
    <AddLiquidity />  {/* Button becomes "Connect Wallet" */}
    <RemoveLiquidity /> {/* Shows empty state if no position */}
  </div>
</PageContent>

// Benefit: Users see full interface, understand features,
// THEN connect when ready to take action`}
        >
          <div className="max-w-lg mx-auto">
            <div className="bg-bg-surface rounded-xl p-4 border border-border-default mb-4">
              <div className="flex items-center justify-between">
                <span className="text-text-primary font-medium">DGKO / KLV</span>
                <ChevronRight className="w-5 h-5 text-text-muted" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-bg-surface rounded-xl p-3 border border-border-default text-center">
                <div className="text-xs text-text-muted mb-1">Your Position</div>
                <div className="text-sm text-text-primary/60">Connect to view</div>
              </div>
              <div className="bg-bg-surface rounded-xl p-3 border border-border-default text-center">
                <div className="text-xs text-text-muted mb-1">Add Liquidity</div>
                <button className="text-xs px-3 py-1 rounded-lg bg-brand-primary/20 text-brand-primary mt-1">
                  Connect Wallet
                </button>
              </div>
              <div className="bg-bg-surface rounded-xl p-3 border border-border-default text-center">
                <div className="text-xs text-text-muted mb-1">Claim Fees</div>
                <div className="text-sm text-text-primary/60">No fees yet</div>
              </div>
              <div className="bg-bg-surface rounded-xl p-3 border border-border-default text-center">
                <div className="text-xs text-text-muted mb-1">Remove</div>
                <div className="text-sm text-text-primary/60">No position</div>
              </div>
            </div>
          </div>
        </ComponentPreview>
      </section>
    </div>
  );
}
