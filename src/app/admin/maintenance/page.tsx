'use client';

import { useState, useEffect } from 'react';
import { 
  Construction, 
  Clock, 
  AlertTriangle, 
  Check, 
  X, 
  RefreshCw,
  Calendar,
  MessageSquare,
  Eye,
  Timer,
  Power,
  ExternalLink,
} from 'lucide-react';
import { isSessionValidSync, isSessionValid } from '../utils/adminAuth.secure';
import { LoginFormSecure as LoginForm } from '../components/LoginForm.secure';
import { AdminLayout } from '../components/AdminLayout';
import { Card, SectionTitle } from '@/components/ui';
import { Button } from '@/components/Button';
import { 
  MaintenanceConfig, 
  MaintenancePage, 
  PageMaintenanceSettings 
} from './types/maintenance.types';
import { 
  MAINTAINABLE_PAGES, 
  PAGE_ICONS, 
  fetchMaintenanceConfig, 
  saveMaintenanceConfig,
  DEFAULT_MAINTENANCE_CONFIG,
} from './config/maintenance.config';

/**
 * Maintenance Mode Admin Page
 * 
 * Allows administrators to enable/disable maintenance mode on individual pages
 * with optional countdown timers and custom messages.
 */

// Helper to format datetime for input
function formatDatetimeLocal(date: Date): string {
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60 * 1000);
  return localDate.toISOString().slice(0, 16);
}

// Page settings card component
function PageSettingsCard({ 
  pageId, 
  settings, 
  onChange, 
  onQuickEnable,
  onQuickDisable,
}: { 
  pageId: MaintenancePage; 
  settings: PageMaintenanceSettings;
  onChange: (pageId: MaintenancePage, settings: PageMaintenanceSettings) => void;
  onQuickEnable: (pageId: MaintenancePage, duration: number) => void;
  onQuickDisable: (pageId: MaintenancePage) => void;
}) {
  // Hooks must be called unconditionally at the top
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [localReason, setLocalReason] = useState(settings.reason);
  const [localEndTime, setLocalEndTime] = useState(settings.endTime || '');

  // Update local state when settings change
  useEffect(() => {
    setLocalReason(settings.reason);
    setLocalEndTime(settings.endTime || '');
  }, [settings]);

  // Find the page after hooks
  const page = MAINTAINABLE_PAGES.find(p => p.id === pageId);
  if (!page) return null;

  // Calculate time remaining if maintenance is active
  const getTimeRemaining = () => {
    if (!settings.enabled || !settings.endTime) return null;
    const end = new Date(settings.endTime);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    if (diff <= 0) return 'Expired';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h remaining`;
    }
    return `${hours}h ${minutes}m remaining`;
  };

  const timeRemaining = getTimeRemaining();

  return (
    <div className={`
      glass rounded-2xl border transition-all duration-300
      ${settings.enabled 
        ? 'border-orange-500/30 bg-orange-500/5' 
        : 'border-border-default hover:border-border-hover'
      }
    `}>
      {/* Header */}
      <div className="p-5 border-b border-border-default">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`
              flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center
              ${settings.enabled 
                ? 'bg-orange-500/20 text-orange-400' 
                : 'bg-overlay-subtle text-text-secondary'
              }
            `}>
              {PAGE_ICONS[pageId]}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2">
                {page.name}
                {settings.enabled && (
                  <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30">
                    In Maintenance
                  </span>
                )}
              </h3>
              <p className="text-sm text-text-muted">{page.description}</p>
            </div>
          </div>

          {/* Main Toggle */}
          <button
            onClick={() => {
              if (settings.enabled) {
                onQuickDisable(pageId);
              } else {
                setShowAdvanced(true);
              }
            }}
            className={`
              relative w-14 h-8 rounded-full transition-all duration-300 flex-shrink-0
              ${settings.enabled 
                ? 'bg-orange-500' 
                : 'bg-overlay-default hover:bg-white/20'
              }
            `}
          >
            <span className={`
              absolute top-1 w-6 h-6 rounded-full bg-white shadow-lg transition-all duration-300
              ${settings.enabled ? 'left-7' : 'left-1'}
            `} />
          </button>
        </div>

        {/* Time remaining badge */}
        {settings.enabled && timeRemaining && (
          <div className="mt-3 flex items-center gap-2 text-sm text-orange-400">
            <Clock className="w-4 h-4" />
            <span>{timeRemaining}</span>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="p-5 border-b border-border-default">
        <div className="text-xs text-text-muted mb-3">Quick Actions</div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onQuickEnable(pageId, 15)}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-overlay-subtle text-text-secondary hover:bg-overlay-default border border-border-default hover:border-border-hover transition-all"
          >
            15 min
          </button>
          <button
            onClick={() => onQuickEnable(pageId, 60)}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-overlay-subtle text-text-secondary hover:bg-overlay-default border border-border-default hover:border-border-hover transition-all"
          >
            1 hour
          </button>
          <button
            onClick={() => onQuickEnable(pageId, 240)}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-overlay-subtle text-text-secondary hover:bg-overlay-default border border-border-default hover:border-border-hover transition-all"
          >
            4 hours
          </button>
          <button
            onClick={() => onQuickEnable(pageId, 1440)}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-overlay-subtle text-text-secondary hover:bg-overlay-default border border-border-default hover:border-border-hover transition-all"
          >
            24 hours
          </button>
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-brand-primary/20 text-brand-primary hover:bg-brand-primary/30 border border-brand-primary/30 transition-all"
          >
            Custom...
          </button>
        </div>
      </div>

      {/* Advanced Settings (Expandable) */}
      {showAdvanced && (
        <div className="p-5 space-y-4 bg-white/[0.02]">
          {/* End Time */}
          <div>
            <label className="block text-sm text-text-secondary mb-2">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                End Time (leave empty for indefinite)
              </div>
            </label>
            <input
              type="datetime-local"
              value={localEndTime ? formatDatetimeLocal(new Date(localEndTime)) : ''}
              onChange={(e) => {
                const value = e.target.value ? new Date(e.target.value).toISOString() : '';
                setLocalEndTime(value);
              }}
              min={formatDatetimeLocal(new Date())}
              className="w-full px-4 py-3 rounded-xl glass border border-border-default bg-overlay-subtle text-text-primary placeholder-gray-500 focus:outline-none focus:border-brand-primary/50 focus:ring-1 focus:ring-brand-primary/50 transition-all"
            />
          </div>

          {/* Reason */}
          <div>
            <label className="block text-sm text-text-secondary mb-2">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Maintenance Message
              </div>
            </label>
            <textarea
              value={localReason}
              onChange={(e) => setLocalReason(e.target.value)}
              rows={2}
              className="w-full px-4 py-3 rounded-xl glass border border-border-default bg-overlay-subtle text-text-primary placeholder-gray-500 focus:outline-none focus:border-brand-primary/50 focus:ring-1 focus:ring-brand-primary/50 transition-all resize-none"
              placeholder="This feature is temporarily undergoing maintenance."
            />
          </div>

          {/* Show Countdown Toggle */}
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm text-text-secondary">
              <Timer className="w-4 h-4" />
              Show countdown timer
            </label>
            <button
              onClick={() => onChange(pageId, { ...settings, showCountdown: !settings.showCountdown })}
              className={`
                relative w-12 h-6 rounded-full transition-all duration-300
                ${settings.showCountdown 
                  ? 'bg-brand-primary' 
                  : 'bg-overlay-default'
                }
              `}
            >
              <span className={`
                absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all duration-300
                ${settings.showCountdown ? 'left-6' : 'left-0.5'}
              `} />
            </button>
          </div>

          {/* Apply Changes Button */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="warning"
              onClick={() => {
                onChange(pageId, {
                  ...settings,
                  enabled: true,
                  endTime: localEndTime || null,
                  reason: localReason,
                });
                setShowAdvanced(false);
              }}
              className="flex-1"
            >
              <Power className="w-4 h-4" />
              Enable Maintenance
            </Button>
            <Button
              variant="secondary"
              onClick={() => setShowAdvanced(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Preview Link */}
      <div className="px-5 py-3 border-t border-border-default">
        <a
          href={page.path}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-sm text-text-muted hover:text-text-secondary transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
          Preview {page.name} page
        </a>
      </div>
    </div>
  );
}

export default function MaintenanceAdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [config, setConfig] = useState<MaintenanceConfig | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  // Check auth and load config
  useEffect(() => {
    const loadConfig = async () => {
      const syncValid = isSessionValidSync();
    setIsAuthenticated(syncValid);
    if (syncValid) {
      isSessionValid().then(valid => { if (!valid) setIsAuthenticated(false); });
    }
      try {
        const loadedConfig = await fetchMaintenanceConfig();
        setConfig(loadedConfig);
      } catch (error) {
        console.error('Error loading config:', error);
        setConfig(DEFAULT_MAINTENANCE_CONFIG);
      }
      setIsLoading(false);
    };
    loadConfig();
  }, []);

  // Auto-save after changes
  useEffect(() => {
    if (!hasChanges || !config) return;

    const timeout = setTimeout(async () => {
      setSaveStatus('saving');
      const success = await saveMaintenanceConfig(config);
      if (success) {
        setSaveStatus('saved');
        setHasChanges(false);
        setTimeout(() => setSaveStatus('idle'), 2000);
      } else {
        setSaveStatus('error');
        setTimeout(() => setSaveStatus('idle'), 3000);
      }
    }, 500);

    return () => clearTimeout(timeout);
  }, [config, hasChanges]);

  // Handle page settings change
  const handlePageChange = (pageId: MaintenancePage, settings: PageMaintenanceSettings) => {
    if (!config) return;

    setConfig({
      ...config,
      pages: {
        ...config.pages,
        [pageId]: settings,
      },
      updatedAt: new Date().toISOString(),
    });
    setHasChanges(true);
  };

  // Quick enable with duration (in minutes)
  const handleQuickEnable = (pageId: MaintenancePage, durationMinutes: number) => {
    if (!config) return;

    const endTime = new Date(Date.now() + durationMinutes * 60 * 1000);
    
    handlePageChange(pageId, {
      ...config.pages[pageId],
      enabled: true,
      endTime: endTime.toISOString(),
      showCountdown: true,
    });
  };

  // Quick disable
  const handleQuickDisable = (pageId: MaintenancePage) => {
    if (!config) return;

    handlePageChange(pageId, {
      ...config.pages[pageId],
      enabled: false,
      endTime: null,
    });
  };

  // Disable all maintenance
  const handleDisableAll = () => {
    if (!config) return;

    const newPages = { ...config.pages };
    for (const key of Object.keys(newPages) as MaintenancePage[]) {
      newPages[key] = {
        ...newPages[key],
        enabled: false,
        endTime: null,
      };
    }

    setConfig({
      ...config,
      pages: newPages,
      updatedAt: new Date().toISOString(),
    });
    setHasChanges(true);
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

  // Count active maintenance pages
  const activeCount = config ? Object.values(config.pages).filter(p => p.enabled).length : 0;

  return (
    <AdminLayout onLogout={() => setIsAuthenticated(false)}>
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-4xl font-bold text-text-primary mb-2 flex items-center gap-3">
              <Construction className="w-10 h-10 text-orange-400" />
              Maintenance Mode
            </h1>
            <p className="text-text-secondary">
              Enable maintenance mode on individual pages with optional countdown timers
            </p>
          </div>

          {/* Save Status */}
          <div className="flex items-center gap-4">
            {saveStatus === 'saving' && (
              <div className="flex items-center gap-2 text-text-secondary">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span className="text-sm">Saving...</span>
              </div>
            )}
            {saveStatus === 'saved' && (
              <div className="flex items-center gap-2 text-success">
                <Check className="w-4 h-4" />
                <span className="text-sm">Saved</span>
              </div>
            )}
            
            {activeCount > 0 && (
              <Button
                variant="danger"
                onClick={handleDisableAll}
              >
                <X className="w-4 h-4" />
                Disable All ({activeCount})
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Status Banner */}
      {activeCount > 0 && (
        <div className="mb-8 p-4 rounded-2xl bg-orange-500/10 border border-orange-500/30 flex items-center gap-4">
          <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-orange-400" />
          </div>
          <div>
            <div className="font-semibold text-text-primary">
              {activeCount} {activeCount === 1 ? 'page is' : 'pages are'} currently in maintenance mode
            </div>
            <div className="text-sm text-orange-300/80">
              Users visiting these pages will see the maintenance screen with countdown
            </div>
          </div>
        </div>
      )}

      {/* Page Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {config && MAINTAINABLE_PAGES.map(page => (
          <PageSettingsCard
            key={page.id}
            pageId={page.id}
            settings={config.pages[page.id]}
            onChange={handlePageChange}
            onQuickEnable={handleQuickEnable}
            onQuickDisable={handleQuickDisable}
          />
        ))}
      </div>

      {/* Help Section */}
      <Card className="mt-12">
        <SectionTitle title="How It Works" align="left" size="sm" className="mb-4" />
        <div className="grid md:grid-cols-3 gap-6">
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-brand-primary/20 flex items-center justify-center">
              <Power className="w-5 h-5 text-brand-primary" />
            </div>
            <div>
              <div className="font-medium text-text-primary mb-1">Enable</div>
              <div className="text-sm text-text-secondary">
                Toggle maintenance mode on any page using quick presets or custom settings
              </div>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
              <Timer className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <div className="font-medium text-text-primary mb-1">Countdown</div>
              <div className="text-sm text-text-secondary">
                Set an end time and users will see a countdown timer until maintenance ends
              </div>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <Eye className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <div className="font-medium text-text-primary mb-1">Auto-Restore</div>
              <div className="text-sm text-text-secondary">
                Pages automatically return to normal when the countdown expires
              </div>
            </div>
          </div>
        </div>
      </Card>
    </AdminLayout>
  );
}
