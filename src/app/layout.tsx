import type { Metadata } from 'next';
import { Suspense } from 'react';
import { DM_Sans, Inter } from 'next/font/google';
import './globals.css';

// DM Sans - Primary font
const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-dm-sans',
  display: 'swap',
});
import { KleverProvider } from '@/context/KleverContext';
import { NetworkTokensProvider } from '@/context/NetworkTokensContext';
import { TokenPricesProvider } from '@/context/TokenPricesContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { QueryProvider } from '@/providers/QueryProvider';
import Link from 'next/link';
import Image from 'next/image';
import { WalletConnect } from '@/components/WalletConnect';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { DesktopMoreMenu } from '@/components/DesktopMoreMenu';
import { NavigationLinks } from '@/components/NavigationLinks';
import { DebugMenu } from '@/components/DebugMenu';
import { ConditionalNav } from '@/components/ConditionalNav';
import { TestnetBanner } from '@/components/TestnetBanner';
import { NumberInputScrollProtector } from '@/components/NumberInputScrollProtector';
import { APP_CONFIG } from '@/config/app';
import { Analytics } from '@vercel/analytics/react';

// Inter for tabular numbers - clean zeros, used by Linear/Vercel
const interMono = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Rare Canvas - Web3 on Klever',
  description: 'Rare Canvas - Web3 application on Klever Blockchain',
  keywords: 'Rare Canvas, Klever, Blockchain, Web3, DApp, Cryptocurrency, NFT',
  authors: [{ name: 'Rare Canvas' }],
  creator: 'Rare Canvas',
  publisher: 'Rare Canvas',
  metadataBase: new URL('https://rarecanvas.io'),
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      { rel: 'android-chrome-192x192', url: '/android-chrome-192x192.png' },
      { rel: 'android-chrome-512x512', url: '/android-chrome-512x512.png' },
    ],
  },
  manifest: '/site.webmanifest',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://rarecanvas.io',
    siteName: 'Rare Canvas',
    title: 'Rare Canvas - Web3 on Klever Blockchain',
    description: 'Explore and manage your digital assets on Klever Blockchain.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Rare Canvas - Web3 on Klever Blockchain',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Rare Canvas - Web3 on Klever Blockchain',
    description: 'Explore and manage your digital assets on Klever Blockchain.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${dmSans.variable} ${interMono.variable}`} suppressHydrationWarning>
      <body className="font-sans">
        <QueryProvider>
        <ThemeProvider>
        <NumberInputScrollProtector />
        <KleverProvider>
          <NetworkTokensProvider>
          <TokenPricesProvider autoRefresh={0}>
          <div className="min-h-screen bg-bg-base">
            {/* Navigation - Solid on mobile, glass on desktop - Hidden on admin routes */}
            <ConditionalNav>
              <nav className="fixed top-0 left-0 right-0 z-50 bg-bg-base md:glass border-b border-border-default">
                <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8">
                  <div className="flex items-center justify-between h-12 md:h-20">
                    {/* Logo with Badge */}
                    <div className="flex items-center">
                      <Link
                        href="/"
                        className="relative flex items-center gap-1.5 md:gap-2 group"
                      >
                        <Image
                          src="/images/rarecanvas-logo.png"
                          alt="Rare Canvas"
                          width={28}
                          height={28}
                          className="w-6 h-6 md:w-7 md:h-7 rounded-full"
                        />
                        <span className="relative z-10 text-lg md:text-xl font-semibold tracking-tight">
                          <span className="text-text-primary">Rare</span>
                          <span className="text-brand-primary">Canvas</span>
                        </span>
                        <span className="absolute -inset-2 bg-brand-primary/10 rounded-lg opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-150" />
                      </Link>
                    </div>
                    
                    {/* Desktop Navigation */}
                    <NavigationLinks />
                    
                    {/* Right side actions - Desktop */}
                    <div className="hidden md:flex items-center gap-3">
                      <WalletConnect />
                      {/* Desktop More Menu (Documentation, Updates) */}
                      <DesktopMoreMenu />
                    </div>

                    {/* Mobile: Just Wallet */}
                    <div className="flex md:hidden items-center">
                      <WalletConnect />
                    </div>
                  </div>
                </div>
              </nav>
            </ConditionalNav>

            {/* Main content with proper spacing for fixed nav (except admin routes) */}
            <ConditionalNav>
              <div className="h-12 md:h-20" />
            </ConditionalNav>
            
            {/* Testnet Warning Banner - Shows only when on testnet */}
            <TestnetBanner />
            
            <main>{children}</main>

            {/* Footer - Hidden on admin routes */}
            <ConditionalNav>
              <footer className="relative mt-8 md:mt-16 border-t border-border-default pb-20 md:pb-0">
                <div className="relative max-w-dashboard mx-auto px-4 md:px-6 lg:px-8 py-8 md:py-12">
                  {/* Main footer content - Grid layout */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 mb-8">
                    {/* Brand Column */}
                    <div className="col-span-2 md:col-span-1">
                      <div className="flex items-center gap-2 mb-3">
                        <Image
                          src="/images/rarecanvas-logo.png"
                          alt="Rare Canvas"
                          width={24}
                          height={24}
                          className="w-6 h-6 rounded-full"
                        />
                        <span className="text-lg font-semibold">
                          <span className="text-text-primary">Rare</span>
                          <span className="text-brand-primary">Canvas</span>
                        </span>
                      </div>
                      <p className="text-sm text-text-muted mb-2">
                        DeFi on Klever Blockchain
                      </p>
                      <p className="text-xs text-text-muted font-mono">
                        {APP_CONFIG.versionDisplay}
                      </p>
                    </div>

                    {/* Klever Blockchain */}
                    <div>
                      <h4 className="text-sm font-medium text-text-primary mb-3">Klever</h4>
                      <ul className="space-y-2 text-sm text-text-muted">
                        <li>
                          <a href="https://klever.io" target="_blank" rel="noopener noreferrer" className="hover:text-text-primary transition-colors duration-150">
                            Klever.io
                          </a>
                        </li>
                        <li>
                          <a href="https://kleverscan.org" target="_blank" rel="noopener noreferrer" className="hover:text-text-primary transition-colors duration-150">
                            Kleverscan
                          </a>
                        </li>
                        <li>
                          <a href="https://docs.klever.org" target="_blank" rel="noopener noreferrer" className="hover:text-text-primary transition-colors duration-150">
                            Klever Docs
                          </a>
                        </li>
                      </ul>
                    </div>

                    {/* Exchanges */}
                    <div>
                      <h4 className="text-sm font-medium text-text-primary mb-3">Exchanges</h4>
                      <ul className="space-y-2 text-sm text-text-muted">
                        <li>
                          <a href="https://swopus.com" target="_blank" rel="noopener noreferrer" className="hover:text-text-primary transition-colors duration-150">
                            Swopus
                          </a>
                        </li>
                        <li>
                          <a href="https://same.exchange" target="_blank" rel="noopener noreferrer" className="hover:text-text-primary transition-colors duration-150">
                            SAME Exchange
                          </a>
                        </li>
                        <li>
                          <a href="https://bitcoin.me" target="_blank" rel="noopener noreferrer" className="hover:text-text-primary transition-colors duration-150">
                            Bitcoin.me
                          </a>
                        </li>
                      </ul>
                    </div>

                    {/* Tools & Resources */}
                    <div>
                      <h4 className="text-sm font-medium text-text-primary mb-3">Tools</h4>
                      <ul className="space-y-2 text-sm text-text-muted">
                        <li>
                          <a href="https://dexscan.me" target="_blank" rel="noopener noreferrer" className="hover:text-brand-primary transition-colors duration-150">
                            DexScan
                          </a>
                        </li>
                        <li>
                          <a href="https://kleverscan.org" target="_blank" rel="noopener noreferrer" className="hover:text-text-primary transition-colors duration-150">
                            Kleverscan
                          </a>
                        </li>
                      </ul>
                    </div>
                  </div>

                  {/* Bottom bar */}
                  <div className="pt-6 border-t border-border-default flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-text-muted">
                    <span>© 2025 Rare Canvas. All rights reserved.</span>
                    <div className="flex gap-4">
                      <a href="https://klever.io" target="_blank" rel="noopener noreferrer" className="hover:text-text-primary transition-colors duration-150">
                        Klever
                      </a>
                      <a href="https://kleverscan.org" target="_blank" rel="noopener noreferrer" className="hover:text-text-primary transition-colors duration-150">
                        Kleverscan
                      </a>
                    </div>
                  </div>
                </div>
              </footer>
            </ConditionalNav>

            {/* Mobile Bottom Navigation - Fixed bottom nav bar */}
            <ConditionalNav>
              <Suspense fallback={null}>
                <MobileBottomNav />
              </Suspense>
            </ConditionalNav>

            {/* Debug Menu - Shows floating bug button when ?debug=true */}
            <Suspense fallback={null}>
              <DebugMenu />
            </Suspense>
          </div>
          </TokenPricesProvider>
          </NetworkTokensProvider>
        </KleverProvider>
        </ThemeProvider>
        </QueryProvider>
        <Analytics />
      </body>
    </html>
  );
}