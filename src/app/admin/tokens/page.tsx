'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  Coins, 
  Hash, 
  Image as ImageIcon, 
  Settings,
  ChevronRight,
  FileCode,
} from 'lucide-react';
import { isSessionValidSync, isSessionValid, logout } from '../utils/adminAuth.secure';
import { LoginFormSecure as LoginForm } from '../components/LoginForm.secure';
import { AdminLayout } from '../components/AdminLayout';
import { AdminPageHeader } from '../components/AdminPageHeader';
import { 
  Card, 
  StatCard, 
  FeatureCard,
  StatusBadge,
  FeatureBadge,
  Alert,
} from '@/components/ui';
import { IconBox } from '@/components/IconBox';
import { TokenImage } from '@/components/TokenImage';
import { getAllTokens } from '@/config/tokens';

/**
 * Admin Tokens Overview Page
 * 
 * Central hub for token management with navigation to subpages.
 * Uses design system components for consistency.
 */

interface TokenPageLink {
  id: string;
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  status: 'active' | 'coming';
}

const tokenPages: TokenPageLink[] = [
  {
    id: 'precision',
    title: 'Token Precision',
    description: 'Decimal places, precision multipliers, and asset IDs for all tokens.',
    href: '/admin/tokens/precision',
    icon: <Hash className="w-5 h-5 text-brand-primary" />,
    status: 'active',
  },
  {
    id: 'images',
    title: 'Token Images',
    description: 'Visual reference for logos, colors, and fallback gradients.',
    href: '/admin/tokens/images',
    icon: <ImageIcon className="w-5 h-5 text-purple-400" />,
    status: 'active',
  },
  {
    id: 'metadata',
    title: 'Token Metadata',
    description: 'Edit token names, descriptions, and display information.',
    href: '/admin/tokens/metadata',
    icon: <Settings className="w-5 h-5 text-info" />,
    status: 'coming',
  },
];

export default function TokensAdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const tokens = useMemo(() => getAllTokens(), []);
  const activeTokens = tokens.filter(t => t.isActive).length;
  const decimalTypes = new Set(tokens.map(t => t.decimals)).size;
  const nativeTokens = tokens.filter(t => t.isNative).length;

  useEffect(() => {
    const syncValid = isSessionValidSync();
    setIsAuthenticated(syncValid);
    setIsLoading(false);
    
    if (syncValid) {
      isSessionValid().then(valid => {
        if (!valid) setIsAuthenticated(false);
      });
    }
  }, []);

  const handleLogout = async () => {
    await logout();
    setIsAuthenticated(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-text-primary font-medium">Loading...</span>
        </Card>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginForm onSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <AdminLayout onLogout={handleLogout}>
      <div className="space-y-8">
        {/* Header */}
        <AdminPageHeader
          title="Tokens"
          description="Centralized management for all token configurations in the Rare Canvas ecosystem."
        />

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            label="Total Tokens"
            value={tokens.length}
            icon={<IconBox icon={<Coins className="w-5 h-5" />} size="sm" variant="blue" />}
          />
          <StatCard
            label="Active"
            value={activeTokens}
            icon={<IconBox icon={<Coins className="w-5 h-5" />} size="sm" variant="cyan" />}
            trend="up"
            trendValue={`${Math.round((activeTokens / tokens.length) * 100)}%`}
          />
          <StatCard
            label="Decimal Types"
            value={decimalTypes}
            icon={<IconBox icon={<Hash className="w-5 h-5" />} size="sm" variant="purple" />}
          />
          <StatCard
            label="Native"
            value={nativeTokens}
            icon={<IconBox icon={<Coins className="w-5 h-5" />} size="sm" variant="gray" />}
          />
        </div>

        {/* Token Management Section */}
        <div>
          <h2 className="text-lg font-medium text-text-primary mb-4">Token Management</h2>
          
          <div className="grid gap-4 md:grid-cols-3">
            {tokenPages.map((page) => (
              <Link
                key={page.id}
                href={page.href}
                className={page.status === 'coming' ? 'pointer-events-none' : ''}
              >
                <FeatureCard
                  icon={page.icon}
                  title={page.title}
                  description={page.description}
                  badge={
                    page.status === 'active' 
                      ? <StatusBadge status="active" />
                      : <FeatureBadge label="SOON" />
                  }
                  className={page.status === 'coming' ? 'opacity-60' : ''}
                />
              </Link>
            ))}
          </div>
        </div>

        {/* Quick Token List */}
        <div>
          <h2 className="text-lg font-medium text-text-primary mb-4">Registered Tokens</h2>
          
          <Card>
            <div className="divide-y divide-white/5">
              {tokens.slice(0, 6).map((token) => (
                <div key={token.symbol} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
                  <TokenImage 
                    assetId={token.assetIdMainnet} 
                    size="md" 
                  />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-text-primary font-medium">{token.symbol}</span>
                      {token.isNative && (
                        <FeatureBadge label="NATIVE" />
                      )}
                    </div>
                    <div className="text-text-muted text-sm truncate">{token.name}</div>
                  </div>
                  
                  <div className="text-right hidden sm:block">
                    <div className="text-text-primary font-mono text-sm">{token.decimals} decimals</div>
                    <div className="text-text-muted text-xs font-mono">
                      {token.precision.toLocaleString()}
                    </div>
                  </div>
                  
                  <div className="flex-shrink-0">
                    {token.isActive ? (
                      <StatusBadge status="active" pulse />
                    ) : (
                      <StatusBadge status="inactive" />
                    )}
                  </div>
                  
                  <Link 
                    href="/admin/tokens/precision"
                    className="text-text-secondary hover:text-text-primary transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </Link>
                </div>
              ))}
            </div>
            
            <div className="mt-4 pt-4 border-t border-border-default">
              <Link
                href="/admin/tokens/precision"
                className="text-sm text-brand-primary hover:text-info transition-colors flex items-center gap-1"
              >
                View all tokens <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </Card>
        </div>

        {/* Configuration Source */}
        <Alert variant="info" title="Configuration Source">
          <div className="flex items-start gap-2">
            <FileCode className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <div>
              All token data is sourced from <code className="text-blue-300 bg-info/10 px-1.5 py-0.5 rounded">/src/config/tokens.ts</code>. 
              This file serves as the single source of truth for token configurations across the entire application.
            </div>
          </div>
        </Alert>
      </div>
    </AdminLayout>
  );
}
