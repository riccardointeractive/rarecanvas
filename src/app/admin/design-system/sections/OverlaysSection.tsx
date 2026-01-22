'use client';

import { useState } from 'react';
import { 
  Dropdown, 
  DropdownItem, 
  DropdownSection, 
  DropdownFooter, 
  DropdownDivider,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalIcon,
  ModalDescription,
  Button,
} from '@/components/ui';

// Code block component for displaying code snippets
function CodeBlock({ children, title }: { children: string; title?: string }) {
  return (
    <div className="rounded-xl overflow-hidden border border-border-default">
      {title && (
        <div className="bg-overlay-subtle px-4 py-2 border-b border-border-default">
          <span className="text-xs font-mono text-text-secondary">{title}</span>
        </div>
      )}
      <pre className="bg-bg-elevated p-4 overflow-x-auto">
        <code className="text-sm font-mono text-text-secondary">{children}</code>
      </pre>
    </div>
  );
}

// Component preview wrapper
function Preview({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-bg-surface rounded-xl border border-border-default p-6 ${className}`}>
      {children}
    </div>
  );
}

export function OverlaysSection() {
  const [basicModalOpen, setBasicModalOpen] = useState(false);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [customModalOpen, setCustomModalOpen] = useState(false);

  return (
    <div className="space-y-16">
      {/* Section Header */}
      <div>
        <h2 className="text-4xl font-semibold text-text-primary mb-4">Overlays</h2>
        <p className="text-lg text-text-secondary max-w-3xl">
          Dropdown menus and modal dialogs for user interactions and confirmations.
        </p>
      </div>

      {/* ==================== DROPDOWN ==================== */}
      <section id="dropdown" className="space-y-8">
        <div>
          <h3 className="text-2xl font-semibold text-text-primary mb-2">Dropdown</h3>
          <p className="text-text-secondary">
            Flexible dropdown menu with consistent styling. Handles click-outside, escape key, and keyboard navigation.
          </p>
        </div>

        {/* Basic Dropdown */}
        <div className="space-y-4">
          <h4 className="text-lg font-medium text-text-primary">Basic Usage</h4>
          <Preview className="flex gap-4 items-start">
            <Dropdown
              trigger={
                <button className="px-4 py-2 bg-overlay-default hover:bg-overlay-hover rounded-lg text-text-primary text-sm transition-colors">
                  Open Menu
                </button>
              }
              width={200}
            >
              <DropdownSection>
                <DropdownItem>Profile</DropdownItem>
                <DropdownItem>Settings</DropdownItem>
                <DropdownItem>Help</DropdownItem>
              </DropdownSection>
              <DropdownDivider />
              <DropdownSection>
                <DropdownItem>Logout</DropdownItem>
              </DropdownSection>
            </Dropdown>

            <Dropdown
              trigger={
                <button className="px-4 py-2 bg-brand-primary hover:bg-brand-primary/90 rounded-lg text-text-primary text-sm transition-colors">
                  With Icons
                </button>
              }
              width={220}
            >
              <DropdownSection>
                <DropdownItem 
                  icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}
                >
                  Profile
                </DropdownItem>
                <DropdownItem 
                  icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
                >
                  Settings
                </DropdownItem>
              </DropdownSection>
              <DropdownFooter>
                <span className="text-xs text-text-muted">v1.0.0</span>
              </DropdownFooter>
            </Dropdown>

            <Dropdown
              trigger={
                <button className="px-4 py-2 bg-overlay-default hover:bg-overlay-hover rounded-lg text-text-primary text-sm transition-colors">
                  Right Aligned →
                </button>
              }
              align="right"
              width={180}
            >
              <DropdownSection>
                <DropdownItem active>Active Item</DropdownItem>
                <DropdownItem>Normal Item</DropdownItem>
                <DropdownItem disabled>Disabled Item</DropdownItem>
              </DropdownSection>
            </Dropdown>
          </Preview>

          <CodeBlock title="Basic Dropdown">{`import { Dropdown, DropdownItem, DropdownSection } from '@/components/ui';

<Dropdown
  trigger={<button>Open Menu</button>}
  width={200}
>
  <DropdownSection>
    <DropdownItem href="/profile">Profile</DropdownItem>
    <DropdownItem onClick={handleSettings}>Settings</DropdownItem>
    <DropdownItem active>Active Item</DropdownItem>
    <DropdownItem disabled>Disabled</DropdownItem>
  </DropdownSection>
</Dropdown>`}</CodeBlock>
        </div>

        {/* Dropdown Props */}
        <div className="space-y-4">
          <h4 className="text-lg font-medium text-text-primary">Props Reference</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-default">
                  <th className="text-left py-3 px-4 text-text-secondary font-medium">Prop</th>
                  <th className="text-left py-3 px-4 text-text-secondary font-medium">Type</th>
                  <th className="text-left py-3 px-4 text-text-secondary font-medium">Default</th>
                  <th className="text-left py-3 px-4 text-text-secondary font-medium">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-default">
                <tr>
                  <td className="py-3 px-4 font-mono text-brand-primary">trigger</td>
                  <td className="py-3 px-4 text-text-secondary">ReactNode</td>
                  <td className="py-3 px-4 text-text-muted">required</td>
                  <td className="py-3 px-4 text-text-secondary">Element that triggers the dropdown</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-mono text-brand-primary">align</td>
                  <td className="py-3 px-4 text-text-secondary">'left' | 'right'</td>
                  <td className="py-3 px-4 text-text-muted">'left'</td>
                  <td className="py-3 px-4 text-text-secondary">Horizontal alignment</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-mono text-brand-primary">width</td>
                  <td className="py-3 px-4 text-text-secondary">'auto' | 'trigger' | number</td>
                  <td className="py-3 px-4 text-text-muted">'auto'</td>
                  <td className="py-3 px-4 text-text-secondary">Width of dropdown panel</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-mono text-brand-primary">closeOnClick</td>
                  <td className="py-3 px-4 text-text-secondary">boolean</td>
                  <td className="py-3 px-4 text-text-muted">true</td>
                  <td className="py-3 px-4 text-text-secondary">Close when clicking inside</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-mono text-brand-primary">disabled</td>
                  <td className="py-3 px-4 text-text-secondary">boolean</td>
                  <td className="py-3 px-4 text-text-muted">false</td>
                  <td className="py-3 px-4 text-text-secondary">Disable the dropdown</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Sub-components */}
        <div className="space-y-4">
          <h4 className="text-lg font-medium text-text-primary">Sub-components</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-bg-surface rounded-xl border border-border-default p-4">
              <h5 className="font-medium text-text-primary mb-2">DropdownItem</h5>
              <p className="text-sm text-text-secondary mb-3">Individual menu item. Renders as Link if href provided.</p>
              <code className="text-xs text-brand-primary">href, onClick, icon, description, active, disabled</code>
            </div>
            <div className="bg-bg-surface rounded-xl border border-border-default p-4">
              <h5 className="font-medium text-text-primary mb-2">DropdownSection</h5>
              <p className="text-sm text-text-secondary mb-3">Groups items with optional title and padding.</p>
              <code className="text-xs text-brand-primary">title, padded</code>
            </div>
            <div className="bg-bg-surface rounded-xl border border-border-default p-4">
              <h5 className="font-medium text-text-primary mb-2">DropdownFooter</h5>
              <p className="text-sm text-text-secondary mb-3">Footer section with border separator.</p>
              <code className="text-xs text-brand-primary">className</code>
            </div>
            <div className="bg-bg-surface rounded-xl border border-border-default p-4">
              <h5 className="font-medium text-text-primary mb-2">DropdownDivider</h5>
              <p className="text-sm text-text-secondary mb-3">Visual separator between items.</p>
              <code className="text-xs text-brand-primary">className</code>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== MODAL ==================== */}
      <section id="modal" className="space-y-8">
        <div>
          <h3 className="text-2xl font-semibold text-text-primary mb-2">Modal</h3>
          <p className="text-text-secondary">
            Dialog component for confirmations, forms, and focused interactions. Handles backdrop click, escape key, and body scroll lock.
          </p>
        </div>

        {/* Modal Examples */}
        <div className="space-y-4">
          <h4 className="text-lg font-medium text-text-primary">Examples</h4>
          <Preview className="flex flex-wrap gap-4">
            <Button onClick={() => setBasicModalOpen(true)}>
              Basic Modal
            </Button>
            <Button variant="secondary" onClick={() => setSuccessModalOpen(true)}>
              Success Modal
            </Button>
            <Button variant="ghost" onClick={() => setCustomModalOpen(true)}>
              Custom Content
            </Button>
          </Preview>

          {/* Basic Modal */}
          <Modal
            isOpen={basicModalOpen}
            onClose={() => setBasicModalOpen(false)}
            title="Basic Modal"
          >
            <ModalBody centered>
              <ModalHeader>Confirm Action</ModalHeader>
              <ModalDescription>
                Are you sure you want to proceed? This action cannot be undone.
              </ModalDescription>
            </ModalBody>
            <ModalFooter>
              <Button onClick={() => setBasicModalOpen(false)} className="w-full">
                Confirm
              </Button>
              <Button variant="ghost" onClick={() => setBasicModalOpen(false)} className="w-full">
                Cancel
              </Button>
            </ModalFooter>
          </Modal>

          {/* Success Modal - Core Platform Style */}
          <Modal
            isOpen={successModalOpen}
            onClose={() => setSuccessModalOpen(false)}
            title="Success"
          >
            <ModalBody centered>
              <ModalIcon>
                <div className="w-20 h-20 rounded-full bg-success/10 border border-success/20 flex items-center justify-center">
                  <svg className="w-10 h-10 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </ModalIcon>
              <ModalHeader>Success!</ModalHeader>
              <ModalDescription>
                Your transaction has been completed successfully.
              </ModalDescription>
            </ModalBody>
            <ModalFooter>
              <Button onClick={() => setSuccessModalOpen(false)} variant="success" className="w-full">
                Done
              </Button>
            </ModalFooter>
          </Modal>

          {/* Custom Modal */}
          <Modal
            isOpen={customModalOpen}
            onClose={() => setCustomModalOpen(false)}
            title="Custom Content"
            size="md"
          >
            <ModalBody>
              <h3 className="text-xl font-semibold text-text-primary mb-4">Custom Layout</h3>
              <p className="text-text-secondary mb-4">
                Modals can contain any content - forms, lists, images, etc.
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-overlay-subtle">
                  <div className="w-10 h-10 rounded-full bg-brand-primary/20 flex items-center justify-center">
                    <span className="text-brand-primary">1</span>
                  </div>
                  <div>
                    <div className="text-text-primary font-medium">Step One</div>
                    <div className="text-sm text-text-secondary">Description here</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-overlay-subtle">
                  <div className="w-10 h-10 rounded-full bg-brand-primary/20 flex items-center justify-center">
                    <span className="text-brand-primary">2</span>
                  </div>
                  <div>
                    <div className="text-text-primary font-medium">Step Two</div>
                    <div className="text-sm text-text-secondary">Description here</div>
                  </div>
                </div>
              </div>
            </ModalBody>
            <ModalFooter centered={false}>
              <Button variant="ghost" onClick={() => setCustomModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setCustomModalOpen(false)}>
                Continue
              </Button>
            </ModalFooter>
          </Modal>

          <CodeBlock title="Modal Usage">{`import { Modal, ModalHeader, ModalBody, ModalFooter, ModalIcon } from '@/components/ui';

// Basic Modal
<Modal isOpen={isOpen} onClose={onClose}>
  <ModalBody centered>
    <ModalHeader>Title</ModalHeader>
    <ModalDescription>Description text</ModalDescription>
  </ModalBody>
  <ModalFooter>
    <Button onClick={onClose}>Close</Button>
  </ModalFooter>
</Modal>

// With Glow Effect (Games Territory ONLY)
// Note: Glow and gradients are deprecated for Core Platform
<Modal
  isOpen={isOpen}
  onClose={onClose}
  glow="shadow-[0_0_80px_rgba(0,200,83,0.4)]"
  gradientOverlay="from-success/20 via-success/10 to-success/20"
>
  ...
</Modal>`}</CodeBlock>
        </div>

        {/* Modal Props */}
        <div className="space-y-4">
          <h4 className="text-lg font-medium text-text-primary">Props Reference</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-default">
                  <th className="text-left py-3 px-4 text-text-secondary font-medium">Prop</th>
                  <th className="text-left py-3 px-4 text-text-secondary font-medium">Type</th>
                  <th className="text-left py-3 px-4 text-text-secondary font-medium">Default</th>
                  <th className="text-left py-3 px-4 text-text-secondary font-medium">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-default">
                <tr>
                  <td className="py-3 px-4 font-mono text-brand-primary">isOpen</td>
                  <td className="py-3 px-4 text-text-secondary">boolean</td>
                  <td className="py-3 px-4 text-text-muted">required</td>
                  <td className="py-3 px-4 text-text-secondary">Whether modal is visible</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-mono text-brand-primary">onClose</td>
                  <td className="py-3 px-4 text-text-secondary">() =&gt; void</td>
                  <td className="py-3 px-4 text-text-muted">required</td>
                  <td className="py-3 px-4 text-text-secondary">Close callback</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-mono text-brand-primary">size</td>
                  <td className="py-3 px-4 text-text-secondary">'sm' | 'md' | 'lg' | 'xl' | 'full'</td>
                  <td className="py-3 px-4 text-text-muted">'lg'</td>
                  <td className="py-3 px-4 text-text-secondary">Modal width</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-mono text-brand-primary">showCloseButton</td>
                  <td className="py-3 px-4 text-text-secondary">boolean</td>
                  <td className="py-3 px-4 text-text-muted">true</td>
                  <td className="py-3 px-4 text-text-secondary">Show X button</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-mono text-brand-primary">closeOnBackdropClick</td>
                  <td className="py-3 px-4 text-text-secondary">boolean</td>
                  <td className="py-3 px-4 text-text-muted">true</td>
                  <td className="py-3 px-4 text-text-secondary">Close on backdrop click</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-mono text-brand-primary">closeOnEscape</td>
                  <td className="py-3 px-4 text-text-secondary">boolean</td>
                  <td className="py-3 px-4 text-text-muted">true</td>
                  <td className="py-3 px-4 text-text-secondary">Close on ESC key</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-mono text-brand-primary">glow</td>
                  <td className="py-3 px-4 text-text-secondary">string</td>
                  <td className="py-3 px-4 text-text-muted">''</td>
                  <td className="py-3 px-4 text-text-secondary">Glow effect class</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-mono text-brand-primary">gradientOverlay</td>
                  <td className="py-3 px-4 text-text-secondary">string</td>
                  <td className="py-3 px-4 text-text-muted">undefined</td>
                  <td className="py-3 px-4 text-text-secondary">Gradient overlay class</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Sub-components */}
        <div className="space-y-4">
          <h4 className="text-lg font-medium text-text-primary">Sub-components</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-bg-surface rounded-xl border border-border-default p-4">
              <h5 className="font-medium text-text-primary mb-2">ModalHeader</h5>
              <p className="text-sm text-text-secondary">Title section with proper typography</p>
            </div>
            <div className="bg-bg-surface rounded-xl border border-border-default p-4">
              <h5 className="font-medium text-text-primary mb-2">ModalBody</h5>
              <p className="text-sm text-text-secondary">Main content area (centered, padded props)</p>
            </div>
            <div className="bg-bg-surface rounded-xl border border-border-default p-4">
              <h5 className="font-medium text-text-primary mb-2">ModalFooter</h5>
              <p className="text-sm text-text-secondary">Action buttons section</p>
            </div>
            <div className="bg-bg-surface rounded-xl border border-border-default p-4">
              <h5 className="font-medium text-text-primary mb-2">ModalIcon</h5>
              <p className="text-sm text-text-secondary">Icon/visual with proper spacing</p>
            </div>
            <div className="bg-bg-surface rounded-xl border border-border-default p-4">
              <h5 className="font-medium text-text-primary mb-2">ModalDescription</h5>
              <p className="text-sm text-text-secondary">Subtitle/description text</p>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== BEST PRACTICES ==================== */}
      <section id="best-practices" className="space-y-6">
        <h3 className="text-2xl font-semibold text-text-primary">Best Practices</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-bg-surface rounded-xl border border-success/20 p-6">
            <h4 className="text-lg font-medium text-success mb-4">✅ Do</h4>
            <ul className="space-y-2 text-text-secondary text-sm">
              <li>• Use Dropdown for navigation menus and action lists</li>
              <li>• Use Modal for confirmations and focused tasks</li>
              <li>• Provide clear close mechanisms (X button, backdrop, ESC)</li>
              <li>• Keep dropdown items concise and scannable</li>
              <li>• Use icons to improve recognition in dropdowns</li>
              <li>• Show active state for current selection</li>
            </ul>
          </div>
          <div className="bg-bg-surface rounded-xl border border-error/20 p-6">
            <h4 className="text-lg font-medium text-error mb-4">❌ Don't</h4>
            <ul className="space-y-2 text-text-secondary text-sm">
              <li>• Don't nest dropdowns inside dropdowns</li>
              <li>• Don't use modals for simple confirmations (use inline)</li>
              <li>• Don't disable all close mechanisms at once</li>
              <li>• Don't put long forms in modals (use pages)</li>
              <li>• Don't stack multiple modals</li>
              <li>• Don't use dropdowns for single actions (use buttons)</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
