'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { APP_CONFIG } from '@/config/app';
import { isSessionValidSync, isSessionValid, logout } from './utils/adminAuth.secure';
import { tools, quickActions, quickLinks } from './config/admin.config';
import { LoginFormSecure as LoginForm } from './components/LoginForm.secure';
import { AdminLayout } from './components/AdminLayout';
import { 
  Card, 
  StatCard, 
  FeatureCard, 
  SectionTitle,
  FeatureBadge,
} from '@/components/ui';
import { IconBox } from '@/components/IconBox';
import { 
  Wrench, 
  CheckCircle2, 
  Clock,
  Info,
  ExternalLink,
  ChevronRight,
  Copy,
  Check,
} from 'lucide-react';

/**
 * Admin Page - Modular Architecture with Sidebar
 * 
 * Password-protected admin panel for managing platform tools and settings.
 * Authentication handled via SHA-256 hashed passwords with session management.
 * All tools and configuration in config/admin.config.tsx.
 * 
 * Features responsive sidebar:
 * - Desktop: 240px (collapsible to 64px)
 * - Mobile: 60px icon-only
 * 
 * Uses shared UI components from @/components/ui for consistency.
 */
export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedItem, setCopiedItem] = useState<string | null>(null);

  useEffect(() => {
    // Quick sync check for initial render
    const syncValid = isSessionValidSync();
    setIsAuthenticated(syncValid);
    setIsLoading(false);
    
    // Then verify with server (async)
    if (syncValid) {
      isSessionValid().then(valid => {
        if (!valid) {
          setIsAuthenticated(false);
        }
      });
    }
  }, []);

  const handleLogout = async () => {
    await logout();
    setIsAuthenticated(false);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedItem(label);
    setTimeout(() => setCopiedItem(null), 2000);
  };

  // Loading state
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

  // Login screen
  if (!isAuthenticated) {
    return <LoginForm onSuccess={() => setIsAuthenticated(true)} />;
  }

  // Calculate stats
  const totalTools = tools.reduce((acc, cat) => acc + cat.items.length, 0);
  const activeTools = tools.reduce((acc, cat) => acc + cat.items.filter(i => i.status === 'active').length, 0);
  const comingTools = tools.reduce((acc, cat) => acc + cat.items.filter(i => i.status === 'coming').length, 0);

  // Authenticated admin panel
  return (
    <AdminLayout onLogout={handleLogout}>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-text-primary mb-2">Admin Dashboard</h1>
        <p className="text-text-secondary">Manage platform tools, content, and settings</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        <StatCard
          label="Total Tools"
          value={totalTools}
          icon={<IconBox icon={<Wrench className="w-5 h-5" />} size="sm" variant="blue" />}
        />
        <StatCard
          label="Active"
          value={activeTools}
          icon={<IconBox icon={<CheckCircle2 className="w-5 h-5" />} size="sm" variant="cyan" />}
          trend="up"
          trendValue={`${Math.round((activeTools / totalTools) * 100)}%`}
        />
        <StatCard
          label="Coming Soon"
          value={comingTools}
          icon={<IconBox icon={<Clock className="w-5 h-5" />} size="sm" variant="purple" />}
        />
        <StatCard
          label="Version"
          value={APP_CONFIG.versionDisplay}
          icon={<IconBox icon={<Info className="w-5 h-5" />} size="sm" variant="gray" />}
        />
      </div>

      {/* Tools by Category */}
      <div className="space-y-12 mb-12">
        {tools.map((category) => (
          <div key={category.category}>
            <SectionTitle title={category.category} align="left" size="sm" className="mb-6" />
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {category.items.map((tool) => (
                <Link 
                  key={tool.id}
                  href={tool.href}
                  className={tool.status === 'coming' ? 'pointer-events-none' : ''}
                  onClick={(e) => tool.status === 'coming' && e.preventDefault()}
                >
                  <FeatureCard
                    icon={tool.icon}
                    title={tool.title}
                    description={tool.description}
                    badge={
                      <FeatureBadge 
                        label={tool.badge} 
                      />
                    }
                    className={tool.status === 'coming' ? 'opacity-60' : ''}
                  />
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions & Links Grid */}
      <div className="grid md:grid-cols-2 gap-6 mb-12">
        {/* Quick Actions */}
        <Card>
          <h3 className="text-lg font-semibold text-text-primary mb-4">Quick Actions</h3>
          <div className="space-y-3">
            {quickActions.map((action, idx) => (
              <button
                key={idx}
                onClick={action.action}
                className="w-full flex items-center gap-4 p-4 rounded-xl bg-overlay-subtle hover:bg-overlay-default border border-border-default hover:border-border-hover transition-all text-left"
              >
                <div className="flex-shrink-0">{action.icon}</div>
                <div>
                  <div className="text-sm font-medium text-text-primary">{action.title}</div>
                  <div className="text-xs text-text-secondary">{action.description}</div>
                </div>
              </button>
            ))}
          </div>
        </Card>

        {/* Quick Links */}
        <Card>
          <h3 className="text-lg font-semibold text-text-primary mb-4">Quick Links</h3>
          <div className="space-y-3">
            {quickLinks.map((link, idx) => (
              link.url.startsWith('http') ? (
                <a
                  key={idx}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-4 rounded-xl bg-overlay-subtle hover:bg-overlay-default border border-border-default hover:border-border-hover transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-text-primary">{link.title}</span>
                    <ExternalLink className="w-4 h-4 text-text-secondary" />
                  </div>
                </a>
              ) : (
                <Link
                  key={idx}
                  href={link.url}
                  className="block p-4 rounded-xl bg-overlay-subtle hover:bg-overlay-default border border-border-default hover:border-border-hover transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-text-primary">{link.title}</span>
                    <ChevronRight className="w-4 h-4 text-text-secondary" />
                  </div>
                </Link>
              )
            ))}
          </div>
        </Card>
      </div>

      {/* System Information */}
      <Card>
        <h3 className="text-lg font-semibold text-text-primary mb-6">System Information</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <div className="text-sm text-text-muted mb-1">Platform Version</div>
              <div className="flex items-center gap-3">
                <div className="text-text-primary font-mono">{APP_CONFIG.versionDisplay}</div>
                <button
                  onClick={() => copyToClipboard(APP_CONFIG.version, 'version')}
                  className="text-xs text-text-secondary hover:text-text-primary transition-colors flex items-center gap-1"
                >
                  {copiedItem === 'version' ? (
                    <>
                      <Check className="w-3 h-3" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      Copy
                    </>
                  )}
                </button>
              </div>
            </div>
            <div>
              <div className="text-sm text-text-muted mb-1">App Name</div>
              <div className="text-text-primary">{APP_CONFIG.name}</div>
            </div>
            <div>
              <div className="text-sm text-text-muted mb-1">Status</div>
              <FeatureBadge label={APP_CONFIG.status} />
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <div className="text-sm text-text-muted mb-1">Network</div>
              <FeatureBadge label={APP_CONFIG.network} />
            </div>
            <div>
              <div className="text-sm text-text-muted mb-1">Framework</div>
              <div className="text-text-primary">Next.js 14</div>
            </div>
            <div>
              <div className="text-sm text-text-muted mb-1">Blockchain</div>
              <div className="text-text-primary">Klever</div>
            </div>
          </div>
        </div>
      </Card>
    </AdminLayout>
  );
}
