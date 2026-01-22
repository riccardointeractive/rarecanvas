'use client';

import { usePathname } from 'next/navigation';
import { APP_CONFIG } from '@/config/app';
import { NetworkToggleInline } from './NetworkToggle';
import { Dropdown, DropdownItem, DropdownSection, DropdownFooter } from '@/components/ui';
import { ThemeToggle } from './ThemeToggle';

export function DesktopMoreMenu() {
  const pathname = usePathname();

  // No menu items needed - keeping just settings
  const menuItems: Array<{ href: string; label: string; icon: React.ReactNode }> = [];

  const isActive = (href: string) => pathname === href;
  const isAnyActive = menuItems.some(item => isActive(item.href));

  const trigger = (
    <button
      className={`p-2 rounded-lg transition-all duration-150 ${
        isAnyActive 
          ? 'bg-overlay-active text-text-primary' 
          : 'text-text-secondary hover:text-text-primary hover:bg-overlay-default'
      }`}
      aria-label="More options"
    >
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    </button>
  );

  return (
    <Dropdown trigger={trigger} align="right" width={192}>
      <DropdownSection>
        {menuItems.map((item) => (
          <DropdownItem
            key={item.href}
            href={item.href}
            active={isActive(item.href)}
            icon={item.icon}
          >
            {item.label}
          </DropdownItem>
        ))}
      </DropdownSection>
      
      {/* Theme Toggle */}
      <DropdownSection>
        <div className="px-1">
          <ThemeToggle variant="buttons" showLabel={false} />
        </div>
      </DropdownSection>
      
      <DropdownFooter>
        <div className="flex items-center justify-between">
          <span className="text-xs text-text-muted font-mono">{APP_CONFIG.versionDisplay}</span>
          <NetworkToggleInline />
        </div>
      </DropdownFooter>
    </Dropdown>
  );
}
