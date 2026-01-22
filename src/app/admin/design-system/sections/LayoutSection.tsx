'use client';

import { ComponentPreview } from '../components/ComponentPreview';
import { SectionTitle } from '@/components/SectionTitle';
import { StatsGrid } from '@/components/StatsGrid';
import { CTASection } from '@/components/ui';
import { CheckCircle, Layout } from 'lucide-react';

/**
 * LayoutSection
 * 
 * Showcases layout components used for page structure:
 * - PageContainer
 * - SectionTitle
 * - StatsGrid
 * - CTASection
 */

export function LayoutSection() {
  return (
    <div className="space-y-16">
      {/* Header */}
      <div>
        <h2 className="text-4xl font-semibold text-text-primary mb-4">Layout Components</h2>
        <p className="text-lg text-text-secondary max-w-3xl">
          Components for page structure and layout. Used to create consistent section patterns across pages.
        </p>
      </div>

      {/* PAGE CONTAINER */}
      <section id="page-container" className="scroll-mt-8">
        <div className="bg-bg-surface rounded-2xl border border-border-default p-8">
          <div className="mb-8">
            <h3 className="text-2xl font-semibold text-text-primary mb-2">PageContainer</h3>
            <p className="text-text-secondary mb-4">Standardized page wrapper for consistent layout across all pages.</p>
            <div className="bg-bg-surface rounded-xl p-4 border border-border-success bg-success-muted">
              <div className="flex items-start gap-3">
                <Layout className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-medium text-text-primary mb-1">Primary Layout Component</div>
                  <p className="text-xs text-text-secondary">Every page should be wrapped in PageContainer for consistent spacing and max-width.</p>
                </div>
              </div>
            </div>
          </div>

          <ComponentPreview
            title="App Page (Default)"
            description="Standard app pages like swap, staking, pool - less vertical padding"
            code={`import { PageContainer } from '@/components/PageContainer';

<PageContainer>
  <YourPageContent />
</PageContainer>

// Props:
// variant?: 'app' | 'content' - affects vertical padding
// maxWidth?: 'dashboard' | 'content' | 'full'
// fullHeight?: boolean - use min-h-screen`}
          >
            <div className="bg-bg-base rounded-xl border border-border-default p-4">
              <div className="text-xs text-text-muted mb-2">PageContainer (variant=&quot;app&quot;)</div>
              <div className="bg-bg-surface rounded-lg p-6 border border-dashed border-border-active">
                <div className="text-sm text-text-secondary text-center">Page Content Area</div>
                <div className="text-xs text-text-muted text-center mt-1">max-w-dashboard, py-4 md:py-8 lg:py-12</div>
              </div>
            </div>
          </ComponentPreview>

          <ComponentPreview
            title="Content Page"
            description="Content pages like blog, docs - more breathing room"
            code={`<PageContainer variant="content" maxWidth="content">
  <BlogPost />
</PageContainer>`}
          >
            <div className="bg-bg-base rounded-xl border border-border-default p-4">
              <div className="text-xs text-text-muted mb-2">PageContainer (variant=&quot;content&quot;)</div>
              <div className="bg-bg-surface rounded-lg p-8 border border-dashed border-border-active max-w-md mx-auto">
                <div className="text-sm text-text-secondary text-center">Content Area</div>
                <div className="text-xs text-text-muted text-center mt-1">max-w-4xl, py-8 md:py-12 lg:py-16</div>
              </div>
            </div>
          </ComponentPreview>

          <ComponentPreview
            title="PageSection (Nested)"
            description="Inner section wrapper for narrower content sections within a page"
            code={`import { PageContainer, PageSection } from '@/components/PageContainer';

<PageContainer>
  <PageSection maxWidth="2xl" centered>
    <NarrowContent />
  </PageSection>
</PageContainer>`}
          >
            <div className="bg-bg-surface rounded-xl p-4 border border-border-default">
              <div className="text-xs text-text-muted mb-2">PageSection Options</div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-overlay-subtle rounded-lg p-3">
                  <div className="text-2xs text-text-muted">sm</div>
                  <div className="text-xs text-text-secondary">max-w-sm</div>
                </div>
                <div className="bg-overlay-subtle rounded-lg p-3">
                  <div className="text-2xs text-text-muted">xl</div>
                  <div className="text-xs text-text-secondary">max-w-xl</div>
                </div>
                <div className="bg-overlay-subtle rounded-lg p-3">
                  <div className="text-2xs text-text-muted">3xl</div>
                  <div className="text-xs text-text-secondary">max-w-3xl</div>
                </div>
              </div>
            </div>
          </ComponentPreview>
        </div>
      </section>

      {/* SectionTitle */}
      <section id="section-title" className="scroll-mt-8">
        <div className="bg-bg-surface rounded-2xl border border-border-default p-8">
          <div className="mb-8">
            <h3 className="text-2xl font-semibold text-text-primary mb-2">SectionTitle</h3>
            <p className="text-text-secondary mb-4">
              Consistent section headers with title and optional description. Used throughout the site for uniform section headings.
            </p>
            <div className="bg-bg-surface rounded-xl p-4 border border-border-success bg-success-muted">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-medium text-text-primary mb-1">Connected Component</div>
                  <p className="text-xs text-text-secondary">Uses the actual SectionTitle component from @/components/SectionTitle</p>
                </div>
              </div>
            </div>
          </div>

          <ComponentPreview
            title="Alignment & Size Variants"
            description="Center (default), Left aligned, and size options"
            code={`<SectionTitle 
  title="Platform Features"
  description="A complete suite of tools for the ecosystem"
  align="center" // 'left' | 'center'
  size="md" // 'sm' | 'md' | 'lg'
/>`}
          >
            <div className="space-y-12">
              <div className="border-b border-border-default pb-8">
                <SectionTitle 
                  title="Centered (Default)"
                  description="This is a centered section title with description."
                />
              </div>
              <div className="border-b border-border-default pb-8">
                <SectionTitle 
                  title="Left Aligned"
                  description="This is a left-aligned section title."
                  align="left"
                />
              </div>
              <div>
                <SectionTitle 
                  title="Large Size"
                  description="This uses the large size variant for hero sections."
                  size="lg"
                />
              </div>
            </div>
          </ComponentPreview>
        </div>
      </section>

      {/* StatsGrid */}
      <section id="stats-grid" className="scroll-mt-8">
        <div className="bg-bg-surface rounded-2xl border border-border-default p-8">
          <div className="mb-8">
            <h3 className="text-2xl font-semibold text-text-primary mb-2">StatsGrid</h3>
            <p className="text-text-secondary mb-4">
              Display statistics in a responsive grid with surface cards. Perfect for hero sections and summaries.
            </p>
            <div className="bg-bg-surface rounded-xl p-4 border border-border-success bg-success-muted">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-medium text-text-primary mb-1">Connected Component</div>
                  <p className="text-xs text-text-secondary">Uses the actual StatsGrid component from @/components/StatsGrid</p>
                </div>
              </div>
            </div>
          </div>

          <ComponentPreview
            title="Column Variations"
            description="Supports 2, 3, or 4 columns with max-width constraints"
            code={`<StatsGrid 
  items={[
    { value: '6', label: 'Core Products' },
    { value: '2', label: 'Native Tokens' },
    { value: '10%', label: 'Staking APR' },
  ]}
  columns={3} // 2 | 3 | 4
  maxWidth="lg" // 'sm' | 'md' | 'lg' | 'full'
/>`}
          >
            <div className="space-y-8">
              <div>
                <p className="text-sm text-text-muted mb-4">3 columns (default)</p>
                <StatsGrid 
                  items={[
                    { value: '6', label: 'Core Products' },
                    { value: '2', label: 'Native Tokens' },
                    { value: '10%', label: 'Staking APR' },
                  ]}
                />
              </div>
              <div>
                <p className="text-sm text-text-muted mb-4">2 columns</p>
                <StatsGrid 
                  items={[
                    { value: '$1.2M', label: 'Total Value Locked' },
                    { value: '5,000+', label: 'Active Users' },
                  ]}
                  columns={2}
                  maxWidth="md"
                />
              </div>
              <div>
                <p className="text-sm text-text-muted mb-4">4 columns</p>
                <StatsGrid 
                  items={[
                    { value: '24/7', label: 'Uptime' },
                    { value: '< 1s', label: 'Finality' },
                    { value: '0.01 KLV', label: 'Avg Fee' },
                    { value: '99.9%', label: 'Success Rate' },
                  ]}
                  columns={4}
                  maxWidth="full"
                />
              </div>
            </div>
          </ComponentPreview>
        </div>
      </section>

      {/* CTASection */}
      <section id="cta-section" className="scroll-mt-8">
        <div className="bg-bg-surface rounded-2xl border border-border-default p-8">
          <div className="mb-8">
            <h3 className="text-2xl font-semibold text-text-primary mb-2">CTASection</h3>
            <p className="text-text-secondary mb-4">
              Full-width call-to-action section with surface card styling. Used at the bottom of pages to encourage user action.
            </p>
            <div className="bg-bg-surface rounded-xl p-4 border border-border-success bg-success-muted">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-medium text-text-primary mb-1">Connected Component</div>
                  <p className="text-xs text-text-secondary">Uses the actual CTASection component from @/components/CTASection</p>
                </div>
              </div>
            </div>
          </div>

          <ComponentPreview
            title="Call-to-Action Section"
            description="With primary and optional secondary actions"
            code={`<CTASection
  title="Ready to Get Started?"
  description="Join the Rare Canvas ecosystem today."
  primaryAction={{
    href: '/dashboard',
    label: 'Launch Dashboard'
  }}
  secondaryAction={{
    href: '/documentation',
    label: 'Read Documentation'
  }}
/>`}
          >
            <CTASection
              title="Ready to Get Started?"
              description="Join the Rare Canvas ecosystem today. Connect your wallet and start managing your digital assets."
              primaryAction={{ href: '/dashboard', label: 'Launch Dashboard' }}
              secondaryAction={{ href: '/documentation', label: 'Read Documentation' }}
            />
          </ComponentPreview>
        </div>
      </section>
    </div>
  );
}
