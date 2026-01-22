'use client';

import { useState } from 'react';
import { ComponentPreview } from '../components/ComponentPreview';
import { TokenAmountInput } from '@/components/AmountInput';
import { Input } from '@/components/Input';
import { CheckCircle, Info, Check, Search } from 'lucide-react';

export function FormsSection() {
  const [textValue, setTextValue] = useState('');
  const [numberValue, setNumberValue] = useState('100');
  const [emailValue, setEmailValue] = useState('');

  return (
    <div>
      {/* FORMS & INPUTS */}
      <section id="forms" className="mb-20">
        <div className="mb-8">
          <h2 className="text-4xl font-semibold text-text-primary mb-2">Forms & Inputs</h2>
          <p className="text-text-secondary mb-4">Input components for user data entry</p>
          
          {/* Connection Status */}
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div className="bg-bg-surface rounded-xl p-4 border border-border-success bg-success-muted">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-medium text-text-primary mb-1">Connected Components</div>
                  <p className="text-xs text-text-secondary">Input and AmountInput use actual @/components</p>
                </div>
              </div>
            </div>
            
            <div className="bg-bg-surface rounded-xl p-4 border border-brand-primary/20 bg-brand-primary/5">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-brand-primary flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-medium text-text-primary mb-1">Hybrid Approach</div>
                  <p className="text-xs text-text-secondary">Shows both component usage AND raw code for flexibility</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-bg-surface rounded-xl p-4 border border-brand-primary/20 bg-brand-primary/5">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-brand-primary flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-medium text-text-primary mb-1">Focus Management</div>
                <p className="text-xs text-text-secondary">All inputs use container focus states (focus-within:border-brand-primary) with explicit input focus prevention (focus:outline-none focus:ring-0) to ensure the focus indicator matches the full input area, not a smaller inner rectangle.</p>
              </div>
            </div>
          </div>
        </div>

        {/* TEXT INPUT - REAL COMPONENT */}
        <ComponentPreview
          title="Text Input (Real Component)"
          description="Standard text input with surface card styling"
          code={`import { Input } from '@/components/Input';

<Input
  type="text"
  label="Label"
  placeholder="Enter text..."
/>

// Or build from scratch:
<div className="space-y-2">
  <label className="block text-sm font-medium text-text-primary">Label</label>
  <input
    type="text"
    placeholder="Enter text..."
    className="w-full px-4 py-3 bg-overlay-subtle border border-border-default focus:border-brand-primary rounded-xl text-text-primary placeholder-text-muted outline-none focus:outline-none focus:ring-0 transition-colors duration-300"
  />
</div>`}
        >
          <div className="max-w-md">
            <Input
              type="text"
              label="Label"
              value={textValue}
              onChange={(e) => setTextValue(e.target.value)}
              placeholder="Enter text..."
            />
          </div>
        </ComponentPreview>

        {/* NUMBER INPUT - BASIC */}
        <ComponentPreview
          title="Number Input - Basic"
          description="Simple number input for amounts"
          code={`<div className="space-y-2">
  <label className="block text-sm font-medium text-text-primary">
    Amount
  </label>
  <input
    type="text"
    placeholder="0.00"
    className="w-full px-4 py-3 bg-overlay-subtle border border-border-default focus:border-brand-primary rounded-xl text-text-primary text-2xl font-mono placeholder-text-muted outline-none focus:outline-none focus:ring-0 transition-colors duration-300"
  />
</div>`}
        >
          <div className="max-w-md">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-text-primary">
                Amount
              </label>
              <input
                type="text"
                value={numberValue}
                onChange={(e) => setNumberValue(e.target.value)}
                placeholder="0.00"
                className="w-full px-4 py-3 bg-overlay-subtle border border-border-default focus:border-brand-primary rounded-xl text-text-primary text-2xl font-mono placeholder-text-muted outline-none focus:outline-none focus:ring-0 transition-colors duration-300"
              />
            </div>
          </div>
        </ComponentPreview>

        {/* TOKEN AMOUNT INPUT - UNIFIED COMPONENT */}
        <ComponentPreview
          title="Token Amount Input (Unified)"
          description="Unified amount input matching SwapCard style - no border, surface background"
          code={`import { TokenAmountInput } from '@/components/AmountInput';

// Staking usage
<TokenAmountInput
  label="Amount to Stake"
  value={amount}
  onChange={setAmount}
  token="DGKO"
  balance={1000}
  onMaxClick={() => setAmount('1000')}
/>

// Swap usage (large)
<TokenAmountInput
  label="Sell"
  value={amount}
  onChange={setAmount}
  token="KLV"
  tokenAssetId="KLV"
  balance={500}
  usdValue={25.50}
  onMaxClick={handleMax}
  size="large"
/>`}
        >
          <div className="max-w-md space-y-4">
            <TokenAmountInput
              label="Amount to Stake"
              value={numberValue}
              onChange={setNumberValue}
              token="DGKO"
              balance={1000}
              onMaxClick={() => setNumberValue('1000')}
            />
          </div>
        </ComponentPreview>

        {/* TOKEN AMOUNT INPUT - LARGE VARIANT */}
        <ComponentPreview
          title="Token Amount Input (Large - Swap Style)"
          description="Large variant with token image and USD value - matches SwapCard"
          code={`<TokenAmountInput
  label="Sell"
  value={amount}
  onChange={setAmount}
  token="KLV"
  tokenAssetId="KLV"
  balance={5000}
  usdValue={parseFloat(amount) * 0.005}
  onMaxClick={() => setAmount('5000')}
  size="large"
/>`}
        >
          <div className="max-w-md">
            <TokenAmountInput
              label="Sell"
              value={numberValue}
              onChange={setNumberValue}
              token="KLV"
              tokenAssetId="KLV"
              balance={5000}
              usdValue={parseFloat(numberValue || '0') * 0.005}
              onMaxClick={() => setNumberValue('5000')}
              size="large"
            />
          </div>
        </ComponentPreview>

        {/* INPUT WITH HELPER TEXT */}
        <ComponentPreview
          title="Input with Helper Text"
          description="Input with supporting information below"
          code={`<div className="space-y-2">
  <label className="block text-sm font-medium text-text-primary">
    Email Address
  </label>
  <input
    type="email"
    placeholder="you@example.com"
    className="w-full px-4 py-3 bg-overlay-subtle border border-border-default focus:border-brand-primary rounded-xl text-text-primary placeholder-text-muted outline-none focus:outline-none focus:ring-0 transition-colors duration-300"
  />
  <p className="text-xs text-text-muted">
    We'll never share your email with anyone else.
  </p>
</div>`}
        >
          <div className="max-w-md">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-text-primary">
                Email Address
              </label>
              <input
                type="email"
                value={emailValue}
                onChange={(e) => setEmailValue(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 bg-overlay-subtle border border-border-default focus:border-brand-primary rounded-xl text-text-primary placeholder-text-muted outline-none focus:outline-none focus:ring-0 transition-colors duration-300"
              />
              <p className="text-xs text-text-muted">
                We'll never share your email with anyone else.
              </p>
            </div>
          </div>
        </ComponentPreview>

        {/* VALIDATION STATES */}
        <div className="mb-8">
          <h3 className="text-2xl font-semibold text-text-primary mb-6">Validation States</h3>
        </div>

        <ComponentPreview
          title="Success State (Real Component)"
          description="Input with successful validation"
          code={`import { Input } from '@/components/Input';

<Input
  type="text"
  label="Amount"
  value="100.00"
  success="Valid amount"
  readOnly
/>`}
        >
          <div className="max-w-md">
            <Input
              type="text"
              label="Amount"
              value="100.00"
              success="Valid amount"
              readOnly
            />
          </div>
        </ComponentPreview>

        <ComponentPreview
          title="Error State (Real Component)"
          description="Input with validation error"
          code={`import { Input } from '@/components/Input';

<Input
  type="text"
  label="Amount"
  value="10000"
  error="Insufficient balance"
  readOnly
/>`}
        >
          <div className="max-w-md">
            <Input
              type="text"
              label="Amount"
              value="10000"
              error="Insufficient balance"
              readOnly
            />
          </div>
        </ComponentPreview>

        <ComponentPreview
          title="Warning State (Real Component)"
          description="Input with warning message"
          code={`import { Input } from '@/components/Input';

<Input
  type="text"
  label="Amount"
  value="50.00"
  warning="High price impact (~5%)"
  readOnly
/>`}
        >
          <div className="max-w-md">
            <Input
              type="text"
              label="Amount"
              value="50.00"
              warning="High price impact (~5%)"
              readOnly
            />
          </div>
        </ComponentPreview>

        {/* DISABLED STATE */}
        <ComponentPreview
          title="Disabled State"
          description="Input that cannot be edited"
          code={`<div className="space-y-2">
  <label className="block text-sm font-medium text-text-primary opacity-50">
    Amount
  </label>
  <input
    type="text"
    disabled
    placeholder="0.00"
    className="w-full px-4 py-3 bg-overlay-subtle border border-border-default rounded-xl text-text-primary placeholder-text-muted outline-none opacity-50 cursor-not-allowed"
  />
  <p className="text-xs text-text-muted">
    This field is disabled
  </p>
</div>`}
        >
          <div className="max-w-md">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-text-primary opacity-50">
                Amount
              </label>
              <input
                type="text"
                disabled
                placeholder="0.00"
                className="w-full px-4 py-3 bg-overlay-subtle border border-border-default rounded-xl text-text-primary placeholder-text-muted outline-none opacity-50 cursor-not-allowed"
              />
              <p className="text-xs text-text-muted">
                This field is disabled
              </p>
            </div>
          </div>
        </ComponentPreview>

        {/* READ-ONLY INPUT */}
        <ComponentPreview
          title="Read-Only Input"
          description="Display-only input (used in swap output)"
          code={`<div className="space-y-2">
  <label className="block text-sm font-medium text-text-primary">
    You Receive
  </label>
  <input
    type="text"
    value="125.50"
    readOnly
    className="w-full px-4 py-3 bg-overlay-subtle border border-border-default rounded-xl text-text-primary text-2xl font-mono outline-none cursor-default"
  />
</div>`}
        >
          <div className="max-w-md">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-text-primary">
                You Receive
              </label>
              <input
                type="text"
                value="125.50"
                readOnly
                className="w-full px-4 py-3 bg-overlay-subtle border border-border-default rounded-xl text-text-primary text-2xl font-mono outline-none cursor-default"
              />
            </div>
          </div>
        </ComponentPreview>

        {/* INPUT WITH ICON */}
        <ComponentPreview
          title="Input with Icon"
          description="Input with leading icon"
          code={`<div className="space-y-2">
  <label className="block text-sm font-medium text-text-primary">
    Search
  </label>
  <div className="relative">
    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
    <input
      type="text"
      placeholder="Search tokens..."
      className="w-full pl-10 pr-4 py-3 bg-overlay-subtle border border-border-default focus:border-brand-primary rounded-xl text-text-primary placeholder-text-muted outline-none focus:outline-none focus:ring-0 transition-colors duration-300"
    />
  </div>
</div>`}
        >
          <div className="max-w-md">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-text-primary">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                <input
                  type="text"
                  placeholder="Search tokens..."
                  className="w-full pl-10 pr-4 py-3 bg-overlay-subtle border border-border-default focus:border-brand-primary rounded-xl text-text-primary placeholder-text-muted outline-none focus:outline-none focus:ring-0 transition-colors duration-300"
                />
              </div>
            </div>
          </div>
        </ComponentPreview>

        {/* TEXTAREA */}
        <ComponentPreview
          title="Textarea"
          description="Multi-line text input"
          code={`<div className="space-y-2">
  <label className="block text-sm font-medium text-text-primary">
    Message
  </label>
  <textarea
    rows={4}
    placeholder="Enter your message..."
    className="w-full px-4 py-3 bg-overlay-subtle border border-border-default focus:border-brand-primary rounded-xl text-text-primary placeholder-text-muted outline-none focus:outline-none focus:ring-0 transition-colors duration-300 resize-none"
  />
</div>`}
        >
          <div className="max-w-md">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-text-primary">
                Message
              </label>
              <textarea
                rows={4}
                placeholder="Enter your message..."
                className="w-full px-4 py-3 bg-overlay-subtle border border-border-default focus:border-brand-primary rounded-xl text-text-primary placeholder-text-muted outline-none focus:outline-none focus:ring-0 transition-colors duration-300 resize-none"
              />
            </div>
          </div>
        </ComponentPreview>
      </section>

      {/* TOKEN INPUT FIELD SECTION */}
      <section id="token-input" className="mb-20">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-text-primary mb-2">Token Input Field</h2>
          <p className="text-text-secondary">Specialized input for token amounts with balance display, max button, and error states</p>
        </div>

        <ComponentPreview
          title="TokenInputField"
          description="Complete token amount input with balance, max button, and token image"
          code={`import { TokenInputField } from '@/components/TokenInputField';

// Basic usage
<TokenInputField
  label="You deposit"
  value={amount}
  onChange={setAmount}
  tokenSymbol="KLV"
  tokenAssetId="KLV"
  balance={1000}
  onMax={() => setAmount('1000')}
/>

// Read-only with display value
<TokenInputField
  label="You receive"
  value=""
  onChange={() => {}}
  tokenSymbol="DGKO"
  tokenAssetId="DGKO-CXVJ"
  balance={500}
  readOnly
  displayValue="850.5"
/>

// With error state
<TokenInputField
  label="Amount"
  value="5000"
  onChange={setAmount}
  tokenSymbol="KLV"
  tokenAssetId="KLV"
  balance={1000}
  error={true}
  errorMessage="Insufficient balance"
/>`}
        >
          <div className="space-y-4 max-w-md">
            <div className="text-xs text-text-muted uppercase tracking-wider mb-2">Basic Input</div>
            <div className="bg-bg-surface rounded-xl p-4 border border-border-default">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-text-primary/60">You deposit</span>
                <span className="text-xs text-text-primary/40">Balance: 1,000 KLV</span>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  placeholder="0"
                  className="flex-1 bg-transparent text-2xl font-semibold text-text-primary placeholder-text-muted outline-none font-mono"
                  defaultValue="100"
                />
                <button className="text-xs text-info hover:text-info font-medium">MAX</button>
                <div className="flex items-center gap-2 px-3 py-2 bg-overlay-subtle rounded-lg">
                  <div className="w-6 h-6 rounded-full bg-overlay-default" />
                  <span className="text-text-primary font-medium">KLV</span>
                </div>
              </div>
            </div>
            
            <div className="text-xs text-text-muted uppercase tracking-wider mb-2 mt-6">Read-Only (Auto-calculated)</div>
            <div className="bg-bg-surface rounded-xl p-4 border border-border-default opacity-75">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-text-primary/60">You receive</span>
                <span className="text-xs text-text-primary/40">Balance: 500 DGKO</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 text-2xl font-semibold text-text-primary font-mono">850.5</div>
                <div className="flex items-center gap-2 px-3 py-2 bg-overlay-subtle rounded-lg">
                  <div className="w-6 h-6 rounded-full bg-brand-primary" />
                  <span className="text-text-primary font-medium">DGKO</span>
                </div>
              </div>
            </div>
            
            <div className="text-xs text-text-muted uppercase tracking-wider mb-2 mt-6">Error State</div>
            <div className="bg-bg-surface rounded-xl p-4 border border-border-error bg-error-muted">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-text-primary/60">Amount</span>
                <span className="text-xs text-error">Insufficient balance</span>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  className="flex-1 bg-transparent text-2xl font-semibold text-text-primary outline-none font-mono"
                  defaultValue="5000"
                />
                <div className="flex items-center gap-2 px-3 py-2 bg-overlay-subtle rounded-lg">
                  <div className="w-6 h-6 rounded-full bg-overlay-default" />
                  <span className="text-text-primary font-medium">KLV</span>
                </div>
              </div>
            </div>
          </div>
        </ComponentPreview>
      </section>

      {/* FORMS & INPUTS SECTION CONTINUES */}
      <section id="forms-best-practices" className="mb-20">

        {/* BEST PRACTICES */}
        <div className="bg-bg-surface rounded-2xl p-6 border border-border-default mt-12">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Best Practices</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Check className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-medium text-text-primary mb-1">Always use labels</div>
                <p className="text-xs text-text-secondary">Every input should have a clear label for accessibility</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Check className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-medium text-text-primary mb-1">Use monospace for numbers</div>
                <p className="text-xs text-text-secondary">Font-mono ensures proper alignment of numerical values</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Check className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-medium text-text-primary mb-1">Container focus, not input focus</div>
                <p className="text-xs text-text-secondary">Use focus-within:border-brand-primary on container with focus:outline-none focus:ring-0 on input to ensure focus area matches full input size</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Check className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-medium text-text-primary mb-1">Provide clear validation feedback</div>
                <p className="text-xs text-text-secondary">Use colored borders and helpful error messages</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Check className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-medium text-text-primary mb-1">MAX button for balance-related inputs</div>
                <p className="text-xs text-text-secondary">Always include MAX button when user needs to select their full balance</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
