'use client';

import { useState, useRef, useEffect, ReactNode, useCallback } from 'react';
import Link from 'next/link';

export interface DropdownProps {
  /** The trigger element (button, link, etc.) */
  trigger: ReactNode;
  /** Dropdown content */
  children: ReactNode;
  /** Horizontal alignment relative to trigger */
  align?: 'left' | 'right';
  /** Width of dropdown - 'auto' uses content width, 'trigger' matches trigger width */
  width?: 'auto' | 'trigger' | number;
  /** Additional class for the dropdown container */
  className?: string;
  /** Additional class for the dropdown panel */
  panelClassName?: string;
  /** Close on click inside dropdown */
  closeOnClick?: boolean;
  /** Controlled open state (optional) */
  open?: boolean;
  /** Callback when open state changes */
  onOpenChange?: (open: boolean) => void;
  /** Disable the dropdown */
  disabled?: boolean;
}

/**
 * Dropdown Component
 * 
 * A flexible dropdown menu with consistent styling and behavior.
 * Handles click-outside, escape key, and optional controlled state.
 * 
 * @example
 * // Basic usage
 * <Dropdown
 *   trigger={<button>Open Menu</button>}
 * >
 *   <DropdownItem href="/page">Link Item</DropdownItem>
 *   <DropdownItem onClick={handleClick}>Button Item</DropdownItem>
 * </Dropdown>
 * 
 * @example
 * // Right-aligned with custom width
 * <Dropdown
 *   trigger={<IconButton />}
 *   align="right"
 *   width={200}
 * >
 *   <DropdownItem>Item 1</DropdownItem>
 * </Dropdown>
 */
export function Dropdown({
  trigger,
  children,
  align = 'left',
  width = 'auto',
  className = '',
  panelClassName = '',
  closeOnClick = true,
  open: controlledOpen,
  onOpenChange,
  disabled = false,
}: DropdownProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  // Support both controlled and uncontrolled modes
  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : internalOpen;

  const setIsOpen = useCallback((value: boolean) => {
    if (!isControlled) {
      setInternalOpen(value);
    }
    onOpenChange?.(value);
  }, [isControlled, onOpenChange]);

  const handleTriggerClick = () => {
    if (disabled) return;
    setIsOpen(!isOpen);
  };

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, setIsOpen]);

  // Close on escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, setIsOpen]);

  // Handle panel click (for closeOnClick)
  const handlePanelClick = () => {
    if (closeOnClick) {
      setIsOpen(false);
    }
  };

  // Calculate width style
  const getWidthStyle = (): string | undefined => {
    if (width === 'auto') return undefined;
    if (width === 'trigger') return '100%';
    return `${width}px`;
  };

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      {/* Trigger */}
      <div
        ref={triggerRef}
        onClick={handleTriggerClick}
        className={disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      >
        {trigger}
      </div>

      {/* Panel */}
      {isOpen && (
        <div
          onClick={handlePanelClick}
          className={`
            absolute z-50 mt-2
            bg-bg-surface rounded-xl
            border border-border-default
            shadow-dropdown
            overflow-hidden
            animate-fade-in
            ${align === 'right' ? 'right-0' : 'left-0'}
            ${panelClassName}
          `}
          style={{ width: getWidthStyle() }}
        >
          {children}
        </div>
      )}
    </div>
  );
}

// =============================================================================
// Dropdown Sub-components
// =============================================================================

export interface DropdownItemProps {
  children: ReactNode;
  /** If provided, renders as a Link */
  href?: string;
  /** Click handler (for button items) */
  onClick?: () => void;
  /** Active/selected state */
  active?: boolean;
  /** Icon to show before label */
  icon?: ReactNode;
  /** Description text below label */
  description?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Additional classes */
  className?: string;
}

/**
 * DropdownItem - Individual menu item
 * 
 * Renders as Link if href is provided, otherwise as button.
 */
export function DropdownItem({
  children,
  href,
  onClick,
  active = false,
  icon,
  description,
  disabled = false,
  className = '',
}: DropdownItemProps) {
  const baseClasses = `
    flex items-center gap-3 px-3 py-2.5 w-full text-left
    text-sm rounded-lg transition-all duration-150
    ${active 
      ? 'bg-brand-primary/15 text-text-primary' 
      : 'text-text-secondary hover:text-text-primary hover:bg-overlay-default'
    }
    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
    ${className}
  `;

  const content = (
    <>
      {icon && (
        <span className={active ? 'text-text-primary' : ''}>
          {icon}
        </span>
      )}
      <div className="flex-1 min-w-0">
        <div className={`${active ? 'text-text-primary' : 'text-text-primary'} ${description ? 'font-medium' : ''}`}>
          {children}
        </div>
        {description && (
          <div className="text-xs text-text-muted truncate">{description}</div>
        )}
      </div>
      {active && (
        <div className="w-1.5 h-1.5 rounded-full bg-brand-primary flex-shrink-0" />
      )}
    </>
  );

  if (href && !disabled) {
    return (
      <Link href={href} className={baseClasses}>
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={baseClasses}
    >
      {content}
    </button>
  );
}

export interface DropdownSectionProps {
  children: ReactNode;
  /** Optional title for the section */
  title?: string;
  /** Add padding to the section */
  padded?: boolean;
}

/**
 * DropdownSection - Groups items with optional title
 */
export function DropdownSection({ 
  children, 
  title,
  padded = true 
}: DropdownSectionProps) {
  return (
    <div className={padded ? 'p-1.5' : ''}>
      {title && (
        <div className="px-3 py-1.5 text-xs font-medium text-text-muted uppercase tracking-wider">
          {title}
        </div>
      )}
      {children}
    </div>
  );
}

export interface DropdownFooterProps {
  children: ReactNode;
  className?: string;
}

/**
 * DropdownFooter - Footer section with border
 */
export function DropdownFooter({ children, className = '' }: DropdownFooterProps) {
  return (
    <div className={`px-3 py-2.5 border-t border-border-default bg-overlay-subtle ${className}`}>
      {children}
    </div>
  );
}

export interface DropdownDividerProps {
  className?: string;
}

/**
 * DropdownDivider - Visual separator between items
 */
export function DropdownDivider({ className = '' }: DropdownDividerProps) {
  return <div className={`my-1 border-t border-border-default ${className}`} />;
}
