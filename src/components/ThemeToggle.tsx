'use client';

import { useTheme } from '@/context/ThemeContext';
import { Sun, Moon, Monitor } from 'lucide-react';

interface ThemeToggleProps {
  variant?: 'inline' | 'buttons';
  showLabel?: boolean;
}

export function ThemeToggle({ variant = 'inline', showLabel = true }: ThemeToggleProps) {
  const { theme, setTheme, resolvedTheme } = useTheme();

  if (variant === 'buttons') {
    return (
      <div className="flex items-center gap-1 p-1 bg-overlay-subtle rounded-lg">
        <button
          onClick={() => setTheme('light')}
          className={`p-2 rounded-md transition-colors ${
            theme === 'light'
              ? 'bg-bg-elevated text-text-primary'
              : 'text-text-muted hover:text-text-secondary'
          }`}
          title="Light mode"
        >
          <Sun className="w-4 h-4" />
        </button>
        <button
          onClick={() => setTheme('dark')}
          className={`p-2 rounded-md transition-colors ${
            theme === 'dark'
              ? 'bg-bg-elevated text-text-primary'
              : 'text-text-muted hover:text-text-secondary'
          }`}
          title="Dark mode"
        >
          <Moon className="w-4 h-4" />
        </button>
        <button
          onClick={() => setTheme('system')}
          className={`p-2 rounded-md transition-colors ${
            theme === 'system'
              ? 'bg-bg-elevated text-text-primary'
              : 'text-text-muted hover:text-text-secondary'
          }`}
          title="System preference"
        >
          <Monitor className="w-4 h-4" />
        </button>
      </div>
    );
  }

  // Inline variant - cycles through themes
  const cycleTheme = () => {
    if (theme === 'system') {
      setTheme('light');
    } else if (theme === 'light') {
      setTheme('dark');
    } else {
      setTheme('system');
    }
  };

  const getIcon = () => {
    if (theme === 'system') {
      return <Monitor className="w-5 h-5" />;
    }
    return resolvedTheme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />;
  };

  const getLabel = () => {
    if (theme === 'system') return 'System';
    return theme === 'dark' ? 'Dark' : 'Light';
  };

  return (
    <button
      onClick={cycleTheme}
      className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium rounded-xl text-text-secondary hover:text-text-primary hover:bg-overlay-default transition-colors"
    >
      {getIcon()}
      {showLabel && (
        <span className="flex-1 text-left">
          Theme: {getLabel()}
        </span>
      )}
    </button>
  );
}

// Compact toggle for header/nav
export function ThemeToggleCompact() {
  const { theme, setTheme, resolvedTheme } = useTheme();

  const cycleTheme = () => {
    if (theme === 'system') {
      setTheme('light');
    } else if (theme === 'light') {
      setTheme('dark');
    } else {
      setTheme('system');
    }
  };

  const getIcon = () => {
    if (theme === 'system') {
      return <Monitor className="w-5 h-5" />;
    }
    return resolvedTheme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />;
  };

  return (
    <button
      onClick={cycleTheme}
      className="p-2 text-text-secondary hover:text-text-primary transition-colors rounded-lg hover:bg-overlay-default"
      title={`Theme: ${theme === 'system' ? 'System' : theme}`}
    >
      {getIcon()}
    </button>
  );
}
