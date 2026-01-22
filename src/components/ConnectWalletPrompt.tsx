/**
 * ConnectWalletPrompt Component
 *
 * A visually distinctive wallet connection prompt with gradient accent,
 * feature highlights, and clear call-to-action.
 */

export function ConnectWalletPrompt() {
  return (
    <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8 py-8 md:py-12">
      <div className="max-w-xl mx-auto">
        <div className="relative overflow-hidden rounded-2xl md:rounded-3xl bg-bg-surface border border-border-default">
          {/* Gradient background accent - subtle */}
          <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/8 via-transparent to-transparent pointer-events-none" />

          {/* Content */}
          <div className="relative p-6 md:p-10 lg:p-12">
            {/* Icon */}
            <div className="flex justify-center mb-8">
              <div className="w-20 h-20 rounded-2xl bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center">
                <svg className="w-10 h-10 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6v12c0 1.1.9 2 2 2h14v-4" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18 12a2 2 0 0 0-2 2c0 1.1.9 2 2 2h4v-4h-4z" />
                </svg>
              </div>
            </div>

            {/* Title & Subtitle */}
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-semibold text-text-primary mb-3">
                Connect Your Wallet
              </h2>
              <p className="text-text-secondary text-sm md:text-base">
                Start exploring NFTs on Klever Chain
              </p>
            </div>

            {/* Feature pills - horizontal on desktop */}
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-accent-emerald/10 border border-accent-emerald/20">
                <svg className="w-4 h-4 text-accent-emerald" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
                <span className="text-sm font-medium text-accent-emerald">Secure</span>
              </div>

              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-accent-amber/10 border border-accent-amber/20">
                <svg className="w-4 h-4 text-accent-amber" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                </svg>
                <span className="text-sm font-medium text-accent-amber">Fast</span>
              </div>

              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-accent-cyan/10 border border-accent-cyan/20">
                <svg className="w-4 h-4 text-accent-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
                </svg>
                <span className="text-sm font-medium text-accent-cyan">Non-custodial</span>
              </div>
            </div>

            {/* Info Box */}
            <div className="mb-8 p-4 rounded-xl bg-overlay-default border border-border-default">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-brand-primary/10 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-sm text-text-secondary">
                  Click <span className="text-text-primary font-medium">Connect Wallet</span> in the navigation to get started
                </p>
              </div>
            </div>

            {/* Download link */}
            <p className="text-center text-sm text-text-muted">
              Need Klever Wallet?{' '}
              <a
                href="https://klever.io/extension/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-primary hover:text-brand-secondary transition-colors font-medium inline-flex items-center gap-1"
              >
                Download here
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}