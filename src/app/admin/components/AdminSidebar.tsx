'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  TrendingUp,
  Palette,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Construction,
  ChevronDown,
  LayoutDashboard,
  Image as ImageIcon,
  Coins,
  Hash,
  ExternalLink,
} from 'lucide-react';

/**
 * Admin Sidebar Component
 * 
 * Responsive sidebar navigation with localStorage persistence:
 * - Desktop: ~240px (collapsible to ~64px)
 * - Tablet: ~180px
 * - Mobile: ~60px icon-only
 * - Collapse state persists across page refreshes
 * - Supports nested navigation sections
 */

interface NavItem {
  id: string;
  label: string;
  href?: string;
  icon: React.ReactNode;
  badge?: string;
  children?: NavItem[];
}

const navigationItems: NavItem[] = [
  {
    id: 'overview',
    label: 'Overview',
    href: '/admin',
    icon: <Home className="w-5 h-5" />,
  },
  {
    id: 'maintenance',
    label: 'Maintenance',
    href: '/admin/maintenance',
    icon: <Construction className="w-5 h-5" />,
  },
  {
    id: 'tokens',
    label: 'Tokens',
    icon: <Coins className="w-5 h-5" />,
    children: [
      {
        id: 'tokens-overview',
        label: 'Overview',
        href: '/admin/tokens',
        icon: <LayoutDashboard className="w-4 h-4" />,
      },
      {
        id: 'tokens-prices',
        label: 'Prices',
        href: '/admin/tokens/prices',
        icon: <TrendingUp className="w-4 h-4" />,
      },
      {
        id: 'tokens-precision',
        label: 'Precision',
        href: '/admin/tokens/precision',
        icon: <Hash className="w-4 h-4" />,
      },
      {
        id: 'tokens-images',
        label: 'Images',
        href: '/admin/tokens/images',
        icon: <ImageIcon className="w-4 h-4" />,
      },
    ],
  },
  {
    id: 'social-media',
    label: 'Social Media',
    href: '/admin/social-media',
    icon: <ImageIcon className="w-5 h-5" />,
  },
  {
    id: 'design-system',
    label: 'Design System',
    href: '/admin/design-system',
    icon: <Palette className="w-5 h-5" />,
  },
];

interface AdminSidebarProps {
  onLogout: () => void;
  showBannerOffset?: boolean;
}

const STORAGE_KEY = 'rarecanvas-admin-sidebar-collapsed';
const EXPANDED_SECTIONS_KEY = 'rarecanvas-admin-expanded-sections';

export function AdminSidebar({ onLogout, showBannerOffset = false }: AdminSidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>(['tokens']);

  // Load collapsed state and expanded sections from localStorage
  useEffect(() => {
    setMounted(true);
    const savedCollapsed = localStorage.getItem(STORAGE_KEY);
    if (savedCollapsed !== null) {
      setIsCollapsed(savedCollapsed === 'true');
    }

    const savedExpanded = localStorage.getItem(EXPANDED_SECTIONS_KEY);
    if (savedExpanded) {
      try {
        setExpandedSections(JSON.parse(savedExpanded));
      } catch {}
    }

    // Auto-expand section if we're on a child page
    if (pathname?.startsWith('/admin/tokens')) {
      setExpandedSections(prev => prev.includes('tokens') ? prev : [...prev, 'tokens']);
    }
  }, [pathname]);

  const toggleCollapse = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem(STORAGE_KEY, String(newState));
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const newState = prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId];
      localStorage.setItem(EXPANDED_SECTIONS_KEY, JSON.stringify(newState));
      return newState;
    });
  };

  if (!mounted) {
    return null;
  }

  const isActive = (href: string | undefined) => {
    if (!href) return false;
    if (href === '/admin') {
      return pathname === '/admin';
    }
    return pathname?.startsWith(href);
  };

  const isParentActive = (item: NavItem) => {
    if (item.href) return isActive(item.href);
    if (item.children) {
      return item.children.some(child => isActive(child.href));
    }
    return false;
  };

  const renderNavItem = (item: NavItem, isChild = false) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedSections.includes(item.id);
    const active = isParentActive(item);
    const showLabel = isMobileOpen || !isCollapsed;

    if (hasChildren) {
      return (
        <div key={item.id} className="relative group">
          <button
            onClick={() => toggleSection(item.id)}
            className={`
              w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
              transition-all duration-200
              ${active 
                ? 'bg-brand-primary/20 text-text-primary' 
                : 'text-text-secondary hover:text-text-primary hover:bg-overlay-subtle'
              }
              ${isCollapsed ? 'lg:justify-center' : ''}
            `}
            title={!showLabel ? item.label : undefined}
          >
            <span className="flex-shrink-0">{item.icon}</span>
            
            {showLabel && (
              <>
                <span className="whitespace-nowrap text-sm font-medium flex-1 hidden lg:block text-left">
                  {item.label}
                </span>
                <ChevronDown 
                  className={`w-4 h-4 transition-transform hidden lg:block ${isExpanded ? 'rotate-180' : ''}`}
                />
              </>
            )}
            
            {isMobileOpen && (
              <>
                <span className="lg:hidden whitespace-nowrap text-sm font-medium flex-1 text-left">
                  {item.label}
                </span>
                <ChevronDown 
                  className={`w-4 h-4 transition-transform lg:hidden ${isExpanded ? 'rotate-180' : ''}`}
                />
              </>
            )}
          </button>

          {/* Children - only show when expanded and sidebar is not collapsed */}
          {isExpanded && showLabel && (
            <div className="ml-4 mt-1 space-y-1 border-l border-border-default pl-3">
              {item.children?.map(child => renderNavItem(child, true))}
            </div>
          )}

          {/* Hover tooltip for collapsed sidebar */}
          {isCollapsed && !isMobileOpen && (
            <div className="hidden lg:block absolute left-full ml-2 top-0 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
              <div className="glass rounded-lg border border-border-default p-2 min-w-[160px] shadow-xl">
                <div className="text-sm font-medium text-text-primary mb-2 px-2">{item.label}</div>
                {item.children?.map(child => (
                  <Link
                    key={child.id}
                    href={child.href || '#'}
                    onClick={() => setIsMobileOpen(false)}
                    className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm transition-colors ${
                      isActive(child.href)
                        ? 'bg-brand-primary/20 text-text-primary'
                        : 'text-text-secondary hover:text-text-primary hover:bg-overlay-subtle'
                    }`}
                  >
                    {child.icon}
                    {child.label}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      );
    }

    // Regular nav item (or child item)
    return (
      <Link
        key={item.id}
        href={item.href || '#'}
        onClick={() => setIsMobileOpen(false)}
        className={`
          group flex items-center gap-3 px-3 rounded-xl
          transition-all duration-200
          ${isChild ? 'py-2' : 'py-2.5'}
          ${isChild
            ? pathname === item.href 
              ? 'text-text-primary font-semibold'
              : 'text-text-secondary hover:text-text-primary'
            : isActive(item.href) 
              ? 'bg-overlay-subtle text-text-primary' 
              : 'text-text-secondary hover:text-text-primary hover:bg-overlay-subtle'
          }
          ${isCollapsed && !isChild ? 'lg:justify-center' : ''}
        `}
        title={(!showLabel && !isChild) ? item.label : undefined}
      >
        <span className="flex-shrink-0">{item.icon}</span>
        
        {showLabel && (
          <span className={`whitespace-nowrap font-medium flex-1 hidden lg:block ${isChild ? 'text-xs' : 'text-sm'}`}>
            {item.label}
          </span>
        )}
        
        {isMobileOpen && (
          <span className={`lg:hidden whitespace-nowrap font-medium flex-1 ${isChild ? 'text-xs' : 'text-sm'}`}>
            {item.label}
          </span>
        )}

        {item.badge && showLabel && (
          <span className="px-1.5 py-0.5 text-xs rounded-md bg-blue-500/20 text-info hidden lg:inline-block">
            {item.badge}
          </span>
        )}
        
        {item.badge && isMobileOpen && (
          <span className="lg:hidden px-1.5 py-0.5 text-xs rounded-md bg-blue-500/20 text-info">
            {item.badge}
          </span>
        )}
      </Link>
    );
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className={`lg:hidden fixed left-4 z-50 glass p-2 rounded-xl border border-border-default hover:border-border-hover transition-all ${showBannerOffset ? 'top-[56px]' : 'top-4'}`}
        aria-label="Toggle menu"
      >
        {isMobileOpen ? (
          <X className="w-6 h-6 text-text-primary" />
        ) : (
          <Menu className="w-6 h-6 text-text-primary" />
        )}
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed left-0 glass border-r border-border-default z-50
          transition-all duration-300 ease-in-out
          flex flex-col
          ${showBannerOffset ? 'top-[40px] h-[calc(100vh-40px)]' : 'top-0 h-screen'}
          ${isMobileOpen ? 'w-60' : 'w-16'}
          ${isCollapsed ? 'lg:w-16' : 'lg:w-60'}
        `}
      >
        {/* Logo / Header */}
        <div className="p-4 border-b border-border-default flex items-center justify-between min-h-[64px]">
          {/* Full logo */}
          <div className="flex items-center gap-2">
            <span className="text-xl font-semibold tracking-tight text-text-primary whitespace-nowrap">Rare Canvas</span>
            <span className="px-1.5 py-0.5 text-[10px] font-medium rounded bg-brand-primary/20 text-brand-primary border border-brand-primary/30">
              Admin
            </span>
          </div>

          {/* Collapse button */}
          {!isCollapsed && (
            <button
              onClick={toggleCollapse}
              className="hidden lg:flex p-1.5 rounded-lg hover:bg-overlay-subtle transition-colors text-text-secondary hover:text-text-primary"
              aria-label="Collapse sidebar"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Expand Button */}
        {isCollapsed && (
          <div className="hidden lg:flex justify-center py-3 border-b border-border-default">
            <button
              onClick={toggleCollapse}
              className="p-2 rounded-lg hover:bg-overlay-subtle transition-colors text-text-secondary hover:text-text-primary"
              aria-label="Expand sidebar"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
          {navigationItems.map(item => renderNavItem(item))}
        </nav>

        {/* Footer - Go to site & Logout */}
        <div className="p-3 border-t border-border-default space-y-1">
          {/* Go to Site */}
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className={`
              w-full flex items-center gap-3 px-3 py-2.5 rounded-xl 
              text-text-secondary hover:text-text-primary hover:bg-overlay-subtle transition-all
              ${isCollapsed ? 'lg:justify-center' : ''}
            `}
            title={(!isMobileOpen && isCollapsed) ? 'Go to Site' : undefined}
          >
            <ExternalLink className="w-5 h-5 flex-shrink-0" />
            
            {!isCollapsed && (
              <span className="hidden lg:block text-sm font-medium">
                Go to Site
              </span>
            )}
            
            {isMobileOpen && (
              <span className="lg:hidden text-sm font-medium">
                Go to Site
              </span>
            )}
          </a>

          {/* Logout */}
          <button
            onClick={() => {
              onLogout();
              setIsMobileOpen(false);
            }}
            className={`
              w-full flex items-center gap-3 px-3 py-2.5 rounded-xl 
              text-text-secondary hover:text-text-primary hover:bg-overlay-subtle transition-all
              ${isCollapsed ? 'lg:justify-center' : ''}
            `}
            title={(!isMobileOpen && isCollapsed) ? 'Sign Out' : undefined}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            
            {!isCollapsed && (
              <span className="hidden lg:block text-sm font-medium">
                Sign Out
              </span>
            )}
            
            {isMobileOpen && (
              <span className="lg:hidden text-sm font-medium">
                Sign Out
              </span>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
