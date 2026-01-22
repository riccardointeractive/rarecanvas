'use client';

import { useState } from 'react';
import { Info, ChevronDown, Settings, User, LogOut, HelpCircle, Bell, Shield } from 'lucide-react';
import { ComponentPreview } from '../components/ComponentPreview';
import { Button } from '@/components/Button';
import { Card, StatCard, FeatureCard } from '@/components/Card';
import { Modal, ModalHeader, ModalBody, ModalFooter, ModalDescription } from '@/components/ui/Modal';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Dropdown, DropdownItem, DropdownSection, DropdownDivider } from '@/components/ui/Dropdown';
import { Pill, PillGroup } from '@/components/ui/Pill';
import { Checkbox } from '@/components/ui/Checkbox';
import { Slider } from '@/components/ui/Slider';
import { Select } from '@/components/ui/Select';

export function PrimitivesSection() {
  const [modalOpen, setModalOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [activePill, setActivePill] = useState('all');
  const [checked, setChecked] = useState(false);
  const [sliderValue, setSliderValue] = useState(50);
  const [selectValue, setSelectValue] = useState('option1');

  return (
    <div>
      {/* Section Header */}
      <div className="mb-12">
        <h1 className="text-5xl font-semibold text-text-primary mb-4">UI Primitives</h1>
        <p className="text-xl text-text-secondary max-w-3xl">
          Low-level building blocks: modals, dropdowns, pills, form controls, and cards.
        </p>
      </div>

      {/* CARD */}
      <section id="card" className="mb-20">
        <div className="mb-8">
          <h2 className="text-4xl font-semibold text-text-primary mb-2">Card</h2>
          <p className="text-text-secondary mb-4">Base container component with multiple variants and accent options.</p>
          <div className="bg-bg-surface rounded-xl p-4 border border-border-success bg-success-muted">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-medium text-text-primary mb-1">Foundation Component</div>
                <p className="text-xs text-text-secondary">Most feature cards extend this base. Uses semantic tokens for consistent styling.</p>
              </div>
            </div>
          </div>
        </div>

        <ComponentPreview
          title="Card Variants"
          description="Different visual styles for different contexts"
          code={`import { Card } from '@/components/Card';

<Card variant="surface">Default surface card</Card>
<Card variant="success">Success state</Card>
<Card variant="warning">Warning state</Card>
<Card variant="error">Error state</Card>
<Card variant="info">Info state</Card>
<Card variant="minimal">No background</Card>`}
        >
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Card variant="surface" size="sm">
              <div className="text-sm text-text-primary">Surface</div>
              <div className="text-xs text-text-muted">Default variant</div>
            </Card>
            <Card variant="success" size="sm">
              <div className="text-sm text-text-primary">Success</div>
              <div className="text-xs text-text-muted">Positive feedback</div>
            </Card>
            <Card variant="warning" size="sm">
              <div className="text-sm text-text-primary">Warning</div>
              <div className="text-xs text-text-muted">Caution state</div>
            </Card>
            <Card variant="error" size="sm">
              <div className="text-sm text-text-primary">Error</div>
              <div className="text-xs text-text-muted">Error state</div>
            </Card>
            <Card variant="info" size="sm">
              <div className="text-sm text-text-primary">Info</div>
              <div className="text-xs text-text-muted">Information</div>
            </Card>
            <Card variant="minimal" size="sm">
              <div className="text-sm text-text-primary">Minimal</div>
              <div className="text-xs text-text-muted">No background</div>
            </Card>
          </div>
        </ComponentPreview>

        <ComponentPreview
          title="Card with Accent Border"
          description="Left border accent for categorization"
          code={`<Card accent="blue">Blue accent</Card>
<Card accent="green">Green accent</Card>
<Card accent="purple">Purple accent</Card>`}
        >
          <div className="grid grid-cols-3 gap-4">
            <Card accent="blue" size="sm">
              <div className="text-sm text-text-primary">Blue Accent</div>
            </Card>
            <Card accent="green" size="sm">
              <div className="text-sm text-text-primary">Green Accent</div>
            </Card>
            <Card accent="purple" size="sm">
              <div className="text-sm text-text-primary">Purple Accent</div>
            </Card>
          </div>
        </ComponentPreview>

        <ComponentPreview
          title="StatCard & FeatureCard"
          description="Pre-built card compositions"
          code={`import { StatCard, FeatureCard } from '@/components/Card';

<StatCard 
  label="Total Value"
  value="$12,450"
  subValue="≈ 15,230 KLV"
  trend="up"
  trendValue="+5.2%"
/>

<FeatureCard
  icon={<Shield />}
  title="Secure Staking"
  description="Non-custodial staking"
  href="/stake"
/>`}
        >
          <div className="grid md:grid-cols-2 gap-4">
            <StatCard 
              label="Total Value Locked"
              value="$12,450.00"
              subValue="≈ 15,230 KLV"
              trend="up"
              trendValue="+5.2%"
              icon={<Shield className="w-5 h-5" />}
            />
            <FeatureCard
              icon={<Shield className="w-5 h-5 text-text-secondary" />}
              title="Secure Staking"
              description="Non-custodial staking with 10% APR"
              href="#"
            />
          </div>
        </ComponentPreview>
      </section>

      {/* MODAL */}
      <section id="modal" className="mb-20">
        <div className="mb-8">
          <h2 className="text-4xl font-semibold text-text-primary mb-2">Modal</h2>
          <p className="text-text-secondary">Dialog overlay for focused interactions. Handles escape key and backdrop click.</p>
        </div>

        <ComponentPreview
          title="Modal with Sub-components"
          description="Composable modal with header, body, footer"
          code={`import { Modal, ModalHeader, ModalBody, ModalFooter } from '@/components/ui/Modal';

<Modal isOpen={isOpen} onClose={() => setIsOpen(false)} size="md">
  <ModalHeader>Confirm Action</ModalHeader>
  <ModalBody>
    <ModalDescription>Are you sure you want to proceed?</ModalDescription>
  </ModalBody>
  <ModalFooter>
    <Button variant="ghost" onClick={onClose}>Cancel</Button>
    <Button variant="primary" onClick={onConfirm}>Confirm</Button>
  </ModalFooter>
</Modal>`}
        >
          <div className="flex justify-center">
            <Button onClick={() => setModalOpen(true)}>Open Modal</Button>
          </div>
          <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} size="sm">
            <ModalHeader centered>Confirm Action</ModalHeader>
            <ModalBody centered>
              <ModalDescription>Are you sure you want to proceed with this action?</ModalDescription>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" onClick={() => setModalOpen(false)} className="w-full">Cancel</Button>
              <Button variant="primary" onClick={() => setModalOpen(false)} className="w-full">Confirm</Button>
            </ModalFooter>
          </Modal>
        </ComponentPreview>

        <ComponentPreview
          title="Modal Sizes"
          description="sm, md, lg, xl, full width options"
          code={`<Modal size="sm">Small modal</Modal>
<Modal size="md">Medium modal (default)</Modal>
<Modal size="lg">Large modal</Modal>
<Modal size="xl">Extra large</Modal>
<Modal size="full">Full width (max-w-4xl)</Modal>`}
        >
          <div className="flex flex-wrap gap-2 justify-center">
            {['sm', 'md', 'lg', 'xl'].map((size) => (
              <div key={size} className="px-4 py-2 bg-bg-surface rounded-lg border border-border-default">
                <span className="text-sm text-text-primary">{size}</span>
              </div>
            ))}
          </div>
        </ComponentPreview>
      </section>

      {/* BOTTOM SHEET */}
      <section id="bottom-sheet" className="mb-20">
        <div className="mb-8">
          <h2 className="text-4xl font-semibold text-text-primary mb-2">BottomSheet</h2>
          <p className="text-text-secondary mb-4">Mobile-friendly sheet that slides up from bottom. Only shows on mobile (md:hidden).</p>
          <div className="bg-bg-surface rounded-xl p-4 border border-border-info bg-info-muted">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-info flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-medium text-text-primary mb-1">Mobile Only</div>
                <p className="text-xs text-text-secondary">Use Modal on desktop, BottomSheet on mobile for the same content.</p>
              </div>
            </div>
          </div>
        </div>

        <ComponentPreview
          title="BottomSheet Usage"
          description="With drag handle and optional title"
          code={`import { BottomSheet } from '@/components/ui/BottomSheet';

<BottomSheet 
  isOpen={isOpen} 
  onClose={() => setIsOpen(false)}
  title="Select Token"
  height="auto" // or 'full' or '50vh'
>
  <TokenList />
</BottomSheet>`}
        >
          <div className="flex justify-center">
            <Button onClick={() => setSheetOpen(true)}>Open Bottom Sheet (Mobile)</Button>
          </div>
          <BottomSheet isOpen={sheetOpen} onClose={() => setSheetOpen(false)} title="Select Option">
            <div className="p-4 space-y-2">
              {['Option 1', 'Option 2', 'Option 3'].map((opt) => (
                <button
                  key={opt}
                  onClick={() => setSheetOpen(false)}
                  className="w-full p-3 text-left rounded-xl bg-overlay-subtle hover:bg-overlay-default text-text-primary transition-colors"
                >
                  {opt}
                </button>
              ))}
            </div>
          </BottomSheet>
        </ComponentPreview>
      </section>

      {/* DROPDOWN */}
      <section id="dropdown" className="mb-20">
        <div className="mb-8">
          <h2 className="text-4xl font-semibold text-text-primary mb-2">Dropdown</h2>
          <p className="text-text-secondary">Flexible dropdown menu with items, sections, and dividers.</p>
        </div>

        <ComponentPreview
          title="Dropdown with Sections"
          description="Grouped items with optional icons and descriptions"
          code={`import { Dropdown, DropdownItem, DropdownSection, DropdownDivider } from '@/components/ui/Dropdown';

<Dropdown
  trigger={<Button>Open Menu</Button>}
  align="left"
  width={200}
>
  <DropdownSection title="Account">
    <DropdownItem icon={<User />} href="/profile">Profile</DropdownItem>
    <DropdownItem icon={<Settings />}>Settings</DropdownItem>
  </DropdownSection>
  <DropdownDivider />
  <DropdownSection>
    <DropdownItem icon={<LogOut />} onClick={logout}>Logout</DropdownItem>
  </DropdownSection>
</Dropdown>`}
        >
          <div className="flex justify-center">
            <Dropdown
              trigger={
                <Button variant="secondary" className="gap-2">
                  Account <ChevronDown className="w-4 h-4" />
                </Button>
              }
              align="left"
              width={220}
              open={dropdownOpen}
              onOpenChange={setDropdownOpen}
            >
              <DropdownSection title="Account">
                <DropdownItem icon={<User className="w-4 h-4" />}>Profile</DropdownItem>
                <DropdownItem icon={<Settings className="w-4 h-4" />}>Settings</DropdownItem>
                <DropdownItem icon={<Bell className="w-4 h-4" />}>Notifications</DropdownItem>
              </DropdownSection>
              <DropdownDivider />
              <DropdownSection>
                <DropdownItem icon={<HelpCircle className="w-4 h-4" />}>Help</DropdownItem>
                <DropdownItem icon={<LogOut className="w-4 h-4" />}>Logout</DropdownItem>
              </DropdownSection>
            </Dropdown>
          </div>
        </ComponentPreview>
      </section>

      {/* PILL */}
      <section id="pill" className="mb-20">
        <div className="mb-8">
          <h2 className="text-4xl font-semibold text-text-primary mb-2">Pill</h2>
          <p className="text-text-secondary">Pill-shaped buttons for filters, tabs, and toggles.</p>
        </div>

        <ComponentPreview
          title="Pill Group"
          description="Filter tabs with active state"
          code={`import { Pill, PillGroup } from '@/components/ui/Pill';

<PillGroup>
  <Pill active={filter === 'all'} onClick={() => setFilter('all')}>All</Pill>
  <Pill active={filter === 'active'} onClick={() => setFilter('active')}>Active</Pill>
  <Pill active={filter === 'pending'} onClick={() => setFilter('pending')}>Pending</Pill>
</PillGroup>`}
        >
          <PillGroup>
            {['all', 'active', 'pending', 'completed'].map((filter) => (
              <Pill 
                key={filter}
                active={activePill === filter}
                onClick={() => setActivePill(filter)}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </Pill>
            ))}
          </PillGroup>
        </ComponentPreview>

        <ComponentPreview
          title="Pill Sizes & Icons"
          description="Three size variants with optional icons"
          code={`<Pill size="sm">Small</Pill>
<Pill size="md">Medium</Pill>
<Pill size="lg">Large</Pill>
<Pill icon={<TokenIcon />}>KLV</Pill>`}
        >
          <div className="flex flex-wrap gap-3 items-center justify-center">
            <Pill size="sm" active>Small</Pill>
            <Pill size="md" active>Medium</Pill>
            <Pill size="lg" active>Large</Pill>
            <Pill 
              active 
              icon={<div className="w-4 h-4 rounded-full bg-brand-primary" />}
            >
              With Icon
            </Pill>
          </div>
        </ComponentPreview>
      </section>

      {/* CHECKBOX */}
      <section id="checkbox" className="mb-20">
        <div className="mb-8">
          <h2 className="text-4xl font-semibold text-text-primary mb-2">Checkbox</h2>
          <p className="text-text-secondary">Custom checkbox with label and description support.</p>
        </div>

        <ComponentPreview
          title="Checkbox Variants"
          description="With label, description, and sizes"
          code={`import { Checkbox } from '@/components/ui/Checkbox';

<Checkbox checked={checked} onChange={(e) => setChecked(e.target.checked)} />

<Checkbox 
  label="Accept terms" 
  checked={checked} 
  onChange={handleChange} 
/>

<Checkbox 
  label="Email notifications"
  description="Receive updates about your account"
  checked={checked}
  onChange={handleChange}
/>`}
        >
          <div className="space-y-4 max-w-sm mx-auto">
            <Checkbox 
              checked={checked} 
              onChange={(e) => setChecked(e.target.checked)}
              label="Simple checkbox"
            />
            <Checkbox 
              checked={!checked} 
              onChange={(e) => setChecked(!e.target.checked)}
              label="Email notifications"
              description="Receive updates about your staking rewards"
            />
            <Checkbox 
              checked={true}
              disabled
              label="Disabled checked"
            />
          </div>
        </ComponentPreview>
      </section>

      {/* SLIDER */}
      <section id="slider" className="mb-20">
        <div className="mb-8">
          <h2 className="text-4xl font-semibold text-text-primary mb-2">Slider</h2>
          <p className="text-text-secondary">Range slider with optional presets and value display.</p>
        </div>

        <ComponentPreview
          title="Slider with Presets"
          description="Quick selection buttons for common values"
          code={`import { Slider } from '@/components/ui/Slider';

<Slider 
  label="Amount"
  value={value}
  onChange={(e) => setValue(Number(e.target.value))}
  showValue
  valueSuffix="%"
  presets={[25, 50, 75, 100]}
  onPresetClick={(val) => setValue(val)}
/>`}
        >
          <div className="max-w-sm mx-auto">
            <Slider
              label="Percentage"
              value={sliderValue}
              onChange={(e) => setSliderValue(Number(e.target.value))}
              showValue
              valueSuffix="%"
              presets={[25, 50, 75, 100]}
              onPresetClick={(val) => setSliderValue(val)}
            />
          </div>
        </ComponentPreview>
      </section>

      {/* SELECT */}
      <section id="select" className="mb-20">
        <div className="mb-8">
          <h2 className="text-4xl font-semibold text-text-primary mb-2">Select</h2>
          <p className="text-text-secondary">Native select dropdown with custom styling.</p>
        </div>

        <ComponentPreview
          title="Select with Options"
          description="Using options prop or children"
          code={`import { Select } from '@/components/ui/Select';

<Select 
  label="Sort by"
  value={value}
  onChange={(e) => setValue(e.target.value)}
  options={[
    { value: 'asc', label: 'Ascending' },
    { value: 'desc', label: 'Descending' },
  ]}
/>

// Or with children
<Select label="Filter">
  <option value="all">All</option>
  <option value="active">Active</option>
</Select>`}
        >
          <div className="max-w-xs mx-auto">
            <Select
              label="Sort Order"
              value={selectValue}
              onChange={(e) => setSelectValue(e.target.value)}
              options={[
                { value: 'option1', label: 'Newest First' },
                { value: 'option2', label: 'Oldest First' },
                { value: 'option3', label: 'Highest Value' },
                { value: 'option4', label: 'Lowest Value' },
              ]}
            />
          </div>
        </ComponentPreview>
      </section>

      {/* BEST PRACTICES */}
      <section id="best-practices" className="mb-20">
        <div className="mb-8">
          <h2 className="text-4xl font-semibold text-text-primary mb-2">Best Practices</h2>
          <p className="text-text-secondary">Guidelines for UI primitives.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-bg-surface rounded-xl p-6 border border-border-success">
            <h3 className="text-lg font-medium text-success mb-4">✓ Do</h3>
            <ul className="space-y-3 text-sm text-text-secondary">
              <li className="flex items-start gap-2">
                <span className="text-success">•</span>
                Use Modal on desktop, BottomSheet on mobile
              </li>
              <li className="flex items-start gap-2">
                <span className="text-success">•</span>
                Close dropdowns on item selection
              </li>
              <li className="flex items-start gap-2">
                <span className="text-success">•</span>
                Show clear active state on pills
              </li>
              <li className="flex items-start gap-2">
                <span className="text-success">•</span>
                Use Card variants for semantic meaning
              </li>
              <li className="flex items-start gap-2">
                <span className="text-success">•</span>
                Add presets to sliders for quick selection
              </li>
            </ul>
          </div>

          <div className="bg-bg-surface rounded-xl p-6 border border-border-error">
            <h3 className="text-lg font-medium text-error mb-4">✗ Don&apos;t</h3>
            <ul className="space-y-3 text-sm text-text-secondary">
              <li className="flex items-start gap-2">
                <span className="text-error">•</span>
                Nest modals within modals
              </li>
              <li className="flex items-start gap-2">
                <span className="text-error">•</span>
                Use pills for navigation (use tabs)
              </li>
              <li className="flex items-start gap-2">
                <span className="text-error">•</span>
                Hardcode colors in Card components
              </li>
              <li className="flex items-start gap-2">
                <span className="text-error">•</span>
                Forget escape key handling in overlays
              </li>
              <li className="flex items-start gap-2">
                <span className="text-error">•</span>
                Use checkboxes for mutually exclusive options
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
