'use client';

import { useState } from 'react';
import { Info, ArrowDownUp, Check, Loader2, X, ExternalLink, ChevronDown, Search, Repeat } from 'lucide-react';
import { ComponentPreview } from '../components/ComponentPreview';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';

export function TradingSection() {
  const [activeTab, setActiveTab] = useState<'swap' | 'pool'>('swap');

  return (
    <div>
      {/* Section Header */}
      <div className="mb-12">
        <h1 className="text-5xl font-semibold text-text-primary mb-4">Trading & Transactions</h1>
        <p className="text-xl text-text-secondary max-w-3xl">
          Components for swapping, liquidity, token selection, and transaction feedback.
        </p>
      </div>

      {/* SWAP POOL TABS */}
      <section id="swap-pool-tabs" className="mb-20">
        <div className="mb-8">
          <h2 className="text-4xl font-semibold text-text-primary mb-2">SwapPoolTabs</h2>
          <p className="text-text-secondary">Tab switcher for Swap/Pool modes on the DEX page.</p>
        </div>

        <ComponentPreview
          title="Swap/Pool Toggle"
          description="Primary navigation within DEX interface"
          code={`import { SwapPoolTabs } from '@/components/SwapPoolTabs';

<SwapPoolTabs 
  activeTab={activeTab} 
  onTabChange={setActiveTab} 
/>`}
        >
          <div className="flex justify-center">
            <div className="inline-flex bg-bg-surface rounded-xl p-1 border border-border-default">
              {(['swap', 'pool'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    activeTab === tab
                      ? 'bg-brand-primary text-white'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  {tab === 'swap' ? 'Swap' : 'Pool'}
                </button>
              ))}
            </div>
          </div>
        </ComponentPreview>
      </section>

      {/* TOKEN SELECT */}
      <section id="token-select" className="mb-20">
        <div className="mb-8">
          <h2 className="text-4xl font-semibold text-text-primary mb-2">TokenSelect</h2>
          <p className="text-text-secondary mb-4">Dropdown for selecting tokens with search and balance display.</p>
          <div className="bg-bg-surface rounded-xl p-4 border border-border-info bg-info-muted">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-info flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-medium text-text-primary mb-1">Uses BottomSheet on Mobile</div>
                <p className="text-xs text-text-secondary">Automatically switches to BottomSheet on mobile for better UX.</p>
              </div>
            </div>
          </div>
        </div>

        <ComponentPreview
          title="Token Selector Button"
          description="Trigger button that opens token selection modal"
          code={`import { TokenSelect } from '@/components/TokenSelect';

<TokenSelect
  value={selectedToken}
  onChange={setSelectedToken}
  tokens={availableTokens}
  showBalance
/>`}
        >
          <div className="flex justify-center gap-4">
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-overlay-default hover:bg-overlay-hover border border-border-default transition-colors">
              <div className="w-6 h-6 rounded-full bg-brand-primary/20 flex items-center justify-center">
                <span className="text-xs text-brand-primary font-bold">K</span>
              </div>
              <span className="text-sm font-medium text-text-primary">KLV</span>
              <ChevronDown className="w-4 h-4 text-text-muted" />
            </button>
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-overlay-default hover:bg-overlay-hover border border-border-default transition-colors">
              <div className="w-6 h-6 rounded-full bg-success/20 flex items-center justify-center">
                <span className="text-xs text-success font-bold">D</span>
              </div>
              <span className="text-sm font-medium text-text-primary">DGKO</span>
              <ChevronDown className="w-4 h-4 text-text-muted" />
            </button>
          </div>
        </ComponentPreview>

        <ComponentPreview
          title="Token List (In Modal/Sheet)"
          description="Searchable list with balances"
          code={`// Inside TokenSelect modal
<div className="p-4">
  <SearchInput placeholder="Search tokens..." />
  <TokenList>
    {tokens.map(token => (
      <TokenRow 
        key={token.assetId}
        token={token}
        balance={balances[token.assetId]}
        onSelect={() => selectToken(token)}
      />
    ))}
  </TokenList>
</div>`}
        >
          <div className="max-w-sm mx-auto bg-bg-surface rounded-xl border border-border-default overflow-hidden">
            <div className="p-3 border-b border-border-default">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input 
                  type="text" 
                  placeholder="Search tokens..."
                  className="w-full pl-9 pr-3 py-2 bg-overlay-subtle rounded-lg text-sm text-text-primary placeholder-text-muted border border-border-default focus:border-brand-primary outline-none"
                />
              </div>
            </div>
            <div className="max-h-[200px] overflow-y-auto">
              {[
                { symbol: 'KLV', name: 'Klever', balance: '1,234.56', color: 'brand-primary' },
                { symbol: 'RC', name: 'Rare Canvas', balance: '500.00', color: 'success' },
                { symbol: 'KLV', name: 'Klever', balance: '10,000', color: 'warning' },
              ].map((token) => (
                <button
                  key={token.symbol}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-overlay-subtle transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full bg-${token.color}/20 flex items-center justify-center`}>
                      <span className={`text-xs text-${token.color} font-bold`}>{token.symbol[0]}</span>
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-medium text-text-primary">{token.symbol}</div>
                      <div className="text-xs text-text-muted">{token.name}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-mono text-text-primary">{token.balance}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </ComponentPreview>
      </section>

      {/* TRANSACTION MODAL */}
      <section id="transaction-modal" className="mb-20">
        <div className="mb-8">
          <h2 className="text-4xl font-semibold text-text-primary mb-2">TransactionModal</h2>
          <p className="text-text-secondary mb-4">Multi-step modal showing transaction progress and results.</p>
          <div className="bg-bg-surface rounded-xl p-4 border border-border-success bg-success-muted">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-medium text-text-primary mb-1">Critical UX Component</div>
                <p className="text-xs text-text-secondary">Shows clear feedback during blockchain transactions. Never close while pending.</p>
              </div>
            </div>
          </div>
        </div>

        <ComponentPreview
          title="Transaction States"
          description="Pending, success, and error states"
          code={`import { TransactionModal } from '@/components/TransactionModal';

<TransactionModal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  status={txStatus} // 'pending' | 'success' | 'error'
  txHash={txHash}
  title="Swap Tokens"
  description="Swapping 100 KLV for DGKO"
  errorMessage={error}
/>`}
        >
          <div className="grid md:grid-cols-3 gap-4">
            {/* Pending */}
            <Card className="text-center py-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-brand-primary/10 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-brand-primary animate-spin" />
              </div>
              <h3 className="text-lg font-medium text-text-primary mb-1">Processing</h3>
              <p className="text-sm text-text-secondary mb-4">Please wait...</p>
              <div className="text-xs text-text-muted">Do not close this window</div>
            </Card>

            {/* Success */}
            <Card className="text-center py-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-success/10 flex items-center justify-center">
                <Check className="w-8 h-8 text-success" />
              </div>
              <h3 className="text-lg font-medium text-text-primary mb-1">Success!</h3>
              <p className="text-sm text-text-secondary mb-4">Transaction confirmed</p>
              <a className="inline-flex items-center gap-1 text-xs text-brand-primary hover:underline">
                View on Explorer <ExternalLink className="w-3 h-3" />
              </a>
            </Card>

            {/* Error */}
            <Card className="text-center py-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-error/10 flex items-center justify-center">
                <X className="w-8 h-8 text-error" />
              </div>
              <h3 className="text-lg font-medium text-text-primary mb-1">Failed</h3>
              <p className="text-sm text-text-secondary mb-4">Transaction failed</p>
              <Button variant="ghost" size="sm">Try Again</Button>
            </Card>
          </div>
        </ComponentPreview>
      </section>

      {/* SWAP CARD */}
      <section id="swap-card" className="mb-20">
        <div className="mb-8">
          <h2 className="text-4xl font-semibold text-text-primary mb-2">SwapCard</h2>
          <p className="text-text-secondary">Main swap interface with token inputs and swap button.</p>
        </div>

        <ComponentPreview
          title="Swap Card Layout"
          description="From/To inputs with swap direction toggle"
          code={`import { SwapCard } from '@/components/SwapCard';

<SwapCard
  fromToken={fromToken}
  toToken={toToken}
  fromAmount={fromAmount}
  toAmount={toAmount}
  onFromAmountChange={setFromAmount}
  onSwapDirection={handleSwapDirection}
  onSwap={handleSwap}
  isLoading={isSwapping}
/>`}
        >
          <div className="max-w-md mx-auto">
            <Card size="lg">
              {/* From Input */}
              <div className="bg-overlay-subtle rounded-xl p-4 mb-2">
                <div className="flex justify-between mb-2">
                  <span className="text-xs text-text-muted">From</span>
                  <span className="text-xs text-text-muted">Balance: 1,234.56</span>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    placeholder="0.00"
                    className="flex-1 bg-transparent text-2xl font-medium text-text-primary placeholder-text-muted outline-none"
                  />
                  <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-overlay-default hover:bg-overlay-hover transition-colors">
                    <div className="w-6 h-6 rounded-full bg-brand-primary/20" />
                    <span className="text-sm font-medium text-text-primary">KLV</span>
                    <ChevronDown className="w-4 h-4 text-text-muted" />
                  </button>
                </div>
              </div>

              {/* Swap Direction Button */}
              <div className="flex justify-center -my-3 relative z-10">
                <button className="w-10 h-10 rounded-full bg-bg-surface border border-border-default flex items-center justify-center hover:bg-overlay-subtle transition-colors">
                  <ArrowDownUp className="w-4 h-4 text-text-secondary" />
                </button>
              </div>

              {/* To Input */}
              <div className="bg-overlay-subtle rounded-xl p-4 mt-2 mb-4">
                <div className="flex justify-between mb-2">
                  <span className="text-xs text-text-muted">To</span>
                  <span className="text-xs text-text-muted">Balance: 500.00</span>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    placeholder="0.00"
                    readOnly
                    className="flex-1 bg-transparent text-2xl font-medium text-text-primary placeholder-text-muted outline-none"
                  />
                  <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-overlay-default hover:bg-overlay-hover transition-colors">
                    <div className="w-6 h-6 rounded-full bg-success/20" />
                    <span className="text-sm font-medium text-text-primary">DGKO</span>
                    <ChevronDown className="w-4 h-4 text-text-muted" />
                  </button>
                </div>
              </div>

              {/* Swap Button */}
              <Button variant="primary" className="w-full">
                <Repeat className="w-4 h-4 mr-2" />
                Swap
              </Button>
            </Card>
          </div>
        </ComponentPreview>
      </section>

      {/* SEND FORM */}
      <section id="send-form" className="mb-20">
        <div className="mb-8">
          <h2 className="text-4xl font-semibold text-text-primary mb-2">SendForm</h2>
          <p className="text-text-secondary">Form for sending tokens to another address.</p>
        </div>

        <ComponentPreview
          title="Token Send Form"
          description="Recipient address, amount, and token selection"
          code={`import { SendForm } from '@/components/SendForm';

<SendForm
  selectedToken={token}
  onTokenChange={setToken}
  recipient={recipient}
  onRecipientChange={setRecipient}
  amount={amount}
  onAmountChange={setAmount}
  onSend={handleSend}
/>`}
        >
          <div className="max-w-md mx-auto">
            <Card size="lg">
              <div className="space-y-4">
                {/* Recipient */}
                <div>
                  <label className="block text-sm text-text-secondary mb-2">Recipient Address</label>
                  <input
                    type="text"
                    placeholder="klv1..."
                    className="w-full px-4 py-3 bg-overlay-subtle rounded-xl text-text-primary placeholder-text-muted border border-border-default focus:border-brand-primary outline-none transition-colors"
                  />
                </div>

                {/* Amount */}
                <div>
                  <label className="block text-sm text-text-secondary mb-2">Amount</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="0.00"
                      className="flex-1 px-4 py-3 bg-overlay-subtle rounded-xl text-text-primary placeholder-text-muted border border-border-default focus:border-brand-primary outline-none transition-colors"
                    />
                    <button className="flex items-center gap-2 px-4 py-3 rounded-xl bg-overlay-subtle border border-border-default hover:border-brand-primary transition-colors">
                      <div className="w-5 h-5 rounded-full bg-brand-primary/20" />
                      <span className="text-sm text-text-primary">KLV</span>
                      <ChevronDown className="w-4 h-4 text-text-muted" />
                    </button>
                  </div>
                </div>

                {/* Send Button */}
                <Button variant="primary" className="w-full">
                  Send
                </Button>
              </div>
            </Card>
          </div>
        </ComponentPreview>
      </section>

      {/* BEST PRACTICES */}
      <section id="best-practices" className="mb-20">
        <div className="mb-8">
          <h2 className="text-4xl font-semibold text-text-primary mb-2">Best Practices</h2>
          <p className="text-text-secondary">Guidelines for trading components.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-bg-surface rounded-xl p-6 border border-border-success">
            <h3 className="text-lg font-medium text-success mb-4">✓ Do</h3>
            <ul className="space-y-3 text-sm text-text-secondary">
              <li className="flex items-start gap-2">
                <span className="text-success">•</span>
                Show clear transaction status feedback
              </li>
              <li className="flex items-start gap-2">
                <span className="text-success">•</span>
                Display balances prominently
              </li>
              <li className="flex items-start gap-2">
                <span className="text-success">•</span>
                Provide explorer links for completed txs
              </li>
              <li className="flex items-start gap-2">
                <span className="text-success">•</span>
                Validate addresses before submission
              </li>
              <li className="flex items-start gap-2">
                <span className="text-success">•</span>
                Show estimated fees before confirming
              </li>
            </ul>
          </div>

          <div className="bg-bg-surface rounded-xl p-6 border border-border-error">
            <h3 className="text-lg font-medium text-error mb-4">✗ Don&apos;t</h3>
            <ul className="space-y-3 text-sm text-text-secondary">
              <li className="flex items-start gap-2">
                <span className="text-error">•</span>
                Allow closing modal during pending tx
              </li>
              <li className="flex items-start gap-2">
                <span className="text-error">•</span>
                Hide error messages from users
              </li>
              <li className="flex items-start gap-2">
                <span className="text-error">•</span>
                Let users swap to same token
              </li>
              <li className="flex items-start gap-2">
                <span className="text-error">•</span>
                Submit without balance validation
              </li>
              <li className="flex items-start gap-2">
                <span className="text-error">•</span>
                Use ambiguous button text ("Submit")
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
