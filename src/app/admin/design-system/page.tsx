'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { OverviewSection } from './sections/OverviewSection';
import { FoundationsSection } from './sections/FoundationsSection';
import { ButtonsSection } from './sections/ButtonsSection';
import { BadgesSection } from './sections/BadgesSection';
import { PillsSection } from './sections/PillsSection';
import { RoadmapSection } from './sections/RoadmapSection';
import { CardsSection } from './sections/CardsSection';
import { FormsSection } from './sections/FormsSection';
import { FeedbackSection } from './sections/FeedbackSection';
import { SelectorsSection } from './sections/SelectorsSection';
import { IconsSection } from './sections/IconsSection';
import { LayoutSection } from './sections/LayoutSection';
import { OverlaysSection } from './sections/OverlaysSection';
import { NavigationSection } from './sections/NavigationSection';
import { WalletNetworkSection } from './sections/WalletNetworkSection';
import { PrimitivesSection } from './sections/PrimitivesSection';
import { TradingSection } from './sections/TradingSection';
import { isSessionValidSync, isSessionValid } from '../utils/adminAuth.secure';
import { LoginFormSecure as LoginForm } from '../components/LoginForm.secure';
import { AdminLayout } from '../components/AdminLayout';

export default function DesignSystemPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('overview');

  // Check authentication on mount
  useEffect(() => {
    const syncValid = isSessionValidSync();
    setIsAuthenticated(syncValid);
    if (syncValid) {
      isSessionValid().then(valid => { if (!valid) setIsAuthenticated(false); });
    }
    setIsLoading(false);
  }, []);

  // Navigation: Overview & Foundations pinned, rest A-Z
  const navigation = [
    // Pinned at top
    { id: 'overview', label: 'Overview' },
    { id: 'foundations', label: 'Foundations' },
    // A-Z
    { id: 'badges', label: 'Badges' },
    { id: 'buttons', label: 'Buttons' },
    { id: 'cards', label: 'Cards' },
    { id: 'feedback', label: 'Feedback' },
    { id: 'forms', label: 'Forms' },
    { id: 'icons', label: 'Icons' },
    { id: 'layout', label: 'Layout' },
    { id: 'navigation', label: 'Navigation' },
    { id: 'overlays', label: 'Overlays' },
    { id: 'pills', label: 'Pills' },
    { id: 'primitives', label: 'Primitives' },
    { id: 'roadmap', label: 'Roadmap' },
    { id: 'selectors', label: 'Selectors' },
    { id: 'trading', label: 'Trading' },
    { id: 'wallet', label: 'Wallet & Network' },
  ];

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-bg-surface rounded-2xl border border-border-default p-8">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
            <div className="text-text-primary font-medium">Loading...</div>
          </div>
        </div>
      </div>
    );
  }

  // Login screen
  if (!isAuthenticated) {
    return <LoginForm onSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <AdminLayout onLogout={() => setIsAuthenticated(false)}>
      {/* Fixed Navigation Sidebar - Outside content flow */}
      <div className="hidden lg:block fixed top-32 left-[19.5rem] w-56 z-30">
        <div className="bg-bg-surface rounded-2xl border border-border-default p-4 max-h-[calc(100vh-10rem)] overflow-y-auto">
          <h3 className="text-sm font-semibold text-text-primary mb-4 px-3">Components</h3>
          <nav className="space-y-1">
            {navigation.map((item, index) => (
              <div key={item.id}>
                {index === 2 && <div className="my-3 border-t border-border-default" />}
                <button
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeSection === item.id
                      ? 'bg-brand-primary text-white'
                      : 'text-text-secondary hover:text-text-primary hover:bg-overlay-subtle'
                  }`}
                >
                  {item.label}
                </button>
              </div>
            ))}
          </nav>
          <div className="mt-6 pt-6 border-t border-border-default">
            <h4 className="text-xs font-semibold text-text-muted mb-3 px-3 uppercase tracking-wider">Resources</h4>
            <Link href="/admin" className="block px-3 py-2 rounded-lg text-sm text-text-secondary hover:text-text-primary hover:bg-overlay-subtle transition-all">
              Admin Panel
            </Link>
            <a href="https://docs.klever.org" target="_blank" rel="noopener noreferrer" className="block px-3 py-2 rounded-lg text-sm text-text-secondary hover:text-text-primary hover:bg-overlay-subtle transition-all">
              Klever Docs
            </a>
          </div>
        </div>
      </div>

      {/* Main Content - with left margin for fixed sidebar */}
      <div className="lg:ml-64">
        <div className="max-w-[1200px]">
        
          {/* Hero */}
          <div className="mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-primary/10 border border-brand-primary/20 mb-6">
              <div className="w-2 h-2 rounded-full bg-brand-primary animate-pulse" />
              <span className="text-xs font-semibold text-brand-primary tracking-wide">LIVE DESIGN SYSTEM</span>
            </div>
            <h1 className="text-6xl font-semibold text-text-primary mb-4 tracking-tight">Design System</h1>
            <p className="text-xl text-text-secondary max-w-3xl">
              Complete reference for Rare Canvas design language - foundations, components, patterns, and best practices.
            </p>
          </div>

          {/* Mobile Navigation */}
          <div className="lg:hidden bg-bg-surface rounded-2xl border border-border-default p-4 mb-8">
            <div className="flex flex-wrap gap-2">
              {navigation.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    activeSection === item.id
                      ? 'bg-brand-primary text-white'
                      : 'bg-overlay-subtle text-text-secondary hover:text-text-primary hover:bg-overlay-default'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Section Content */}
          <div>
            {activeSection === 'overview' && <OverviewSection />}
            {activeSection === 'foundations' && <FoundationsSection />}
            {activeSection === 'icons' && <IconsSection />}
            {activeSection === 'badges' && <BadgesSection />}
            {activeSection === 'buttons' && <ButtonsSection />}
            {activeSection === 'cards' && <CardsSection />}
            {activeSection === 'forms' && <FormsSection />}
            {activeSection === 'selectors' && <SelectorsSection />}
            {activeSection === 'overlays' && <OverlaysSection />}
            {activeSection === 'pills' && <PillsSection />}
            {activeSection === 'feedback' && <FeedbackSection />}
            {activeSection === 'layout' && <LayoutSection />}
            {activeSection === 'primitives' && <PrimitivesSection />}
            {activeSection === 'roadmap' && <RoadmapSection />}
            {activeSection === 'navigation' && <NavigationSection />}
            {activeSection === 'wallet' && <WalletNetworkSection />}
            {activeSection === 'trading' && <TradingSection />}
          </div>

          {/* Footer */}
          <div className="bg-bg-surface rounded-2xl p-8 border border-border-default text-center mt-12">
            <div className="w-16 h-16 rounded-2xl bg-success/10 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-text-primary mb-2">Comprehensive Documentation</h3>
            <p className="text-text-secondary mb-4">
              All 64 components documented across 14 sections. Games & Charts coming soon.
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-success/10 border border-border-success text-success text-sm">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              64 components documented
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
