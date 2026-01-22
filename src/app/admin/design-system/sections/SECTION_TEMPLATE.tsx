/**
 * DESIGN SYSTEM SECTION TEMPLATE
 * 
 * Use this template when creating new sections to ensure consistency
 * across the entire design system.
 * 
 * Copy this file and rename the function TemplateSectionExample to [YourSection]Section.
 */

'use client';

import { ComponentPreview } from '../components/ComponentPreview';
// Import real components
import { Button } from '@/components/Button';
// Import Lucide icons
import { CheckCircle, Info, AlertCircle } from 'lucide-react';

export function TemplateSectionExample() {
  return (
    <div>
      {/* SECTION 1: Main content */}
      <section id="main-topic" className="mb-20">
        {/* Header - ALWAYS use this exact structure */}
        <div className="mb-8">
          <h2 className="text-4xl font-semibold text-text-primary mb-2">Section Title</h2>
          <p className="text-text-secondary mb-4">Brief description of what this section covers</p>
          
          {/* Info Cards - Use when explaining important concepts */}
          {/* Single card */}
          <div className="bg-bg-surface rounded-xl p-4 border border-border-success bg-success-muted">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-medium text-text-primary mb-1">Success/Connected</div>
                <p className="text-xs text-text-secondary">Use green for success states or connected components</p>
              </div>
            </div>
          </div>

          {/* Multiple cards - Use grid layout */}
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div className="bg-bg-surface rounded-xl p-4 border border-brand-primary/20 bg-brand-primary/5">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-brand-primary flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-medium text-text-primary mb-1">Information</div>
                  <p className="text-xs text-text-secondary">Use blue for informational content</p>
                </div>
              </div>
            </div>
            
            <div className="bg-bg-surface rounded-xl p-4 border border-warning/20 bg-warning/5">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-medium text-text-primary mb-1">Warning</div>
                  <p className="text-xs text-text-secondary">Use yellow for warnings or important notes</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Component Previews - Main content */}
        <ComponentPreview
          title="Component/Pattern Name"
          description="Clear explanation of what this shows and when to use it"
          code={`// ALWAYS provide code examples
import { Button } from '@/components/Button';

<Button variant="primary">
  Click Me
</Button>

// Include comments explaining key concepts
// Show both component usage AND raw Tailwind if helpful`}
          centered  // Use centered prop for single components
        >
          {/* Actual component demonstration */}
          <Button variant="primary">
            Example Component
          </Button>
        </ComponentPreview>

        {/* Multiple examples */}
        <ComponentPreview
          title="Variants/Options"
          description="Show different variations"
          code={`<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="danger">Danger</Button>`}
          centered
        >
          <div className="flex flex-wrap items-center gap-4">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="danger">Danger</Button>
          </div>
        </ComponentPreview>
      </section>

      {/* SECTION 2: Related content */}
      <section id="related-topic" className="mb-20">
        <div className="mb-8">
          <h2 className="text-4xl font-semibold text-text-primary mb-2">Related Topic</h2>
          <p className="text-text-secondary">Description of related content</p>
        </div>

        {/* More ComponentPreviews */}
        <ComponentPreview
          title="Related Pattern"
          description="Explanation"
          code={`// Code example`}
        >
          <div className="text-text-secondary text-sm">Component example goes here</div>
        </ComponentPreview>
      </section>

      {/* SECTION 3: Usage examples */}
      <section id="usage" className="mb-20">
        <div className="mb-8">
          <h2 className="text-4xl font-semibold text-text-primary mb-2">Usage in Components</h2>
          <p className="text-text-secondary">Show how to use this with other Digiko components</p>
        </div>

        <ComponentPreview
          title="Integration Example"
          description="Show this component/pattern used with other components"
          code={`import { Button } from '@/components/Button';
import { IconBox } from '@/components/IconBox';

<div className="flex items-center gap-4">
  <IconBox icon={<Icon />} />
  <Button>Action</Button>
</div>`}
        >
          <div className="text-text-secondary text-sm">Combined example goes here</div>
        </ComponentPreview>
      </section>

      {/* BEST PRACTICES - ALWAYS include at the end */}
      <section id="best-practices" className="mb-20">
        <div className="bg-bg-surface rounded-2xl p-6 border border-border-default">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Best Practices</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-medium text-text-primary mb-1">Practice 1</div>
                <p className="text-xs text-text-secondary">Explanation of the best practice</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-medium text-text-primary mb-1">Practice 2</div>
                <p className="text-xs text-text-secondary">Another important guideline</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-medium text-text-primary mb-1">Practice 3</div>
                <p className="text-xs text-text-secondary">Additional best practice</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

/**
 * CHECKLIST BEFORE SUBMITTING NEW SECTION
 * 
 * Structure:
 * [ ] Uses 'use client' directive
 * [ ] Exports named function component
 * [ ] All sections have id and className="mb-20"
 * [ ] All headers use consistent structure (mb-8 wrapper)
 * 
 * Typography:
 * [ ] H2: text-4xl font-semibold text-text-primary mb-2
 * [ ] H3: text-lg font-semibold text-text-primary mb-4
 * [ ] Description: text-text-secondary
 * [ ] Info cards: text-sm font-medium text-text-primary mb-1 for titles
 * [ ] Info cards: text-xs text-text-secondary for descriptions
 * 
 * Components:
 * [ ] Uses real components from @/components
 * [ ] Uses Lucide icons (not inline SVG)
 * [ ] All ComponentPreviews have title, description, and code
 * [ ] Code examples are properly formatted
 * 
 * Info Cards (use semantic tokens):
 * [ ] Green for success/connected (border-border-success bg-success-muted)
 * [ ] Blue for info (border-border-info bg-info-muted)
 * [ ] Yellow for warning (border-border-warning bg-warning-muted)
 * [ ] Icons are Lucide with w-5 h-5 text-success/text-info/text-warning
 * 
 * Best Practices:
 * [ ] Included at the end of major sections
 * [ ] Uses CheckCircle icon for all items
 * [ ] Has at least 3-5 practices
 * [ ] Each practice has title and description
 * 
 * Navigation:
 * [ ] Section IDs added to page.tsx navigation array
 * [ ] Section imported and rendered in page.tsx
 * [ ] All section IDs are unique and descriptive
 */
