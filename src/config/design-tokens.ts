/**
 * Design Tokens - JavaScript/TypeScript access to design system values
 * 
 * USE CASES:
 * - Chart libraries (Recharts, Chart.js)
 * - Dynamic styles in JS
 * - Canvas/SVG rendering
 * 
 * IMPORTANT: These values MUST match the CSS variables in globals.css
 * The CSS variables are the source of truth for the design system.
 * 
 * For Tailwind classes, use the semantic classes directly:
 * - text-text-primary (not colors.text.primary)
 * - bg-bg-surface (not colors.bg.surface)
 * - border-border-default (not colors.border.default)
 * 
 * For theme-aware colors in JS, use getThemeColors() function.
 */

// Dark theme colors (default)
export const darkColors = {
  /* Backgrounds - Vercel-inspired with clear elevation steps */
  bg: {
    base: '#000000',
    surface: '#0a0a0a',
    elevated: '#141414',
    hover: '#1a1a1a',
    active: '#262626',
    inverse: '#fafafa',
  },

  /* Dark palette (numeric keys) - for backward compatibility */
  dark: {
    50: '#262626',
    100: '#1a1a1a',
    200: '#141414',
    300: '#0a0a0a',
    400: '#050505',
    surface: '#0a0a0a',
    elevated: '#141414',
  },

  /* Text - improved contrast ratios */
  text: {
    primary: '#ededed',
    secondary: '#a1a1a1',
    muted: '#737373',
    disabled: '#525252',
    onBrand: '#FFFFFF',
    inverse: '#000000',
  },

  /* Borders - subtle but VISIBLE (Vercel-style) */
  border: {
    default: 'rgba(255, 255, 255, 0.08)',
    hover: 'rgba(255, 255, 255, 0.12)',
    active: 'rgba(255, 255, 255, 0.16)',
    success: 'rgba(0, 200, 83, 0.2)',
    error: 'rgba(255, 59, 48, 0.2)',
    warning: 'rgba(245, 166, 35, 0.2)',
    info: 'rgba(0, 112, 243, 0.2)',
    brand: 'rgba(0, 112, 243, 0.2)',
  },
};

// Light theme colors
export const lightColors = {
  /* Backgrounds - Light Vercel-inspired */
  bg: {
    base: '#ffffff',
    surface: '#fafafa',
    elevated: '#f5f5f5',
    hover: '#ebebeb',
    active: '#e0e0e0',
    inverse: '#171717',
  },

  /* Dark palette mapped to light equivalents */
  dark: {
    50: '#e0e0e0',
    100: '#ebebeb',
    200: '#f5f5f5',
    300: '#fafafa',
    400: '#ffffff',
    surface: '#fafafa',
    elevated: '#f5f5f5',
  },

  /* Text - dark on light */
  text: {
    primary: '#171717',
    secondary: '#525252',
    muted: '#737373',
    disabled: '#a1a1a1',
    onBrand: '#FFFFFF',
    inverse: '#fafafa',
  },

  /* Borders - subtle but visible on light */
  border: {
    default: 'rgba(0, 0, 0, 0.08)',
    hover: 'rgba(0, 0, 0, 0.12)',
    active: 'rgba(0, 0, 0, 0.16)',
    success: 'rgba(0, 180, 73, 0.25)',
    error: 'rgba(220, 38, 38, 0.25)',
    warning: 'rgba(217, 119, 6, 0.25)',
    info: 'rgba(0, 112, 243, 0.25)',
    brand: 'rgba(0, 112, 243, 0.25)',
  },
};

// Get colors based on current theme (for use in components that need JS colors)
export function getThemeColors(theme: 'light' | 'dark' = 'dark') {
  return theme === 'light' ? lightColors : darkColors;
}

// Default export uses dark theme for backwards compatibility
export const colors = {
  ...darkColors,

  /* Brand */
  brand: {
    primary: '#0070F3',
    primaryHover: '#005FCC',
    secondary: '#7928CA',
  },

  /* Glow colors - for animations and effects */
  glow: {
    primary: 'rgba(0, 112, 243, 0.4)',
    primaryStrong: 'rgba(0, 112, 243, 0.6)',
    success: 'rgba(0, 200, 83, 0.4)',
    successStrong: 'rgba(0, 200, 83, 0.6)',
    error: 'rgba(255, 59, 48, 0.4)',
    errorStrong: 'rgba(255, 59, 48, 0.6)',
  },

  /* Blue palette - for charts and data visualization */
  blue: {
    50: '#EFF6FF',
    100: '#DBEAFE',
    200: '#BFDBFE',
    300: '#93C5FD',
    400: '#60A5FA',
    500: '#3B82F6',
    600: '#0070F3',
    700: '#005FCC',
    800: '#004999',
    900: '#003366',
  },

  /* Semantic status */
  success: '#00C853',
  successMuted: 'rgba(0, 200, 83, 0.1)',
  warning: '#F5A623',
  warningMuted: 'rgba(245, 166, 35, 0.1)',
  error: '#FF3B30',
  errorMuted: 'rgba(255, 59, 48, 0.1)',

  /* Chart colors - consistent palette for data visualization */
  chart: {
    primary: '#0070F3',
    secondary: '#7928CA',
    tertiary: '#00C853',
    quaternary: '#F5A623',
    quinary: '#FF3B30',
    /* Named colors for specific use */
    blue: '#0070F3',
    purple: '#7928CA',
    green: '#00C853',
    orange: '#F5A623',
    red: '#FF3B30',
    cyan: '#06B6D4',
    pink: '#EC4899',
    violet: '#8B5CF6',
    /* Extended palette for multi-series charts */
    series: [
      '#0070F3', /* Blue */
      '#7928CA', /* Purple */
      '#00C853', /* Green */
      '#F5A623', /* Orange */
      '#FF3B30', /* Red */
      '#06B6D4', /* Cyan */
      '#EC4899', /* Pink */
      '#8B5CF6', /* Violet */
    ],
  },
} as const;

/* Spacing - matches Tailwind defaults */
export const spacing = {
  px: '1px',
  0: '0',
  0.5: '0.125rem',
  1: '0.25rem',
  2: '0.5rem',
  3: '0.75rem',
  4: '1rem',
  5: '1.25rem',
  6: '1.5rem',
  8: '2rem',
  10: '2.5rem',
  12: '3rem',
  16: '4rem',
  20: '5rem',
  24: '6rem',
} as const;

/* Border radius */
export const radius = {
  sm: '4px',
  md: '6px',
  lg: '8px',
  xl: '12px',
} as const;

/* Transitions */
export const transitions = {
  fast: '100ms ease',
  base: '150ms ease',
  slow: '250ms ease',
} as const;

/* Shadows - Default values (dark theme)
 * NOTE: For theme-aware shadows, use CSS variables via Tailwind classes (shadow-sm, shadow-md, shadow-lg)
 * These JS values are for canvas/chart rendering where CSS vars aren't available
 */
export const shadows = {
  sm: '0 2px 8px rgba(0, 0, 0, 0.15)',
  md: '0 4px 20px rgba(0, 0, 0, 0.2)',
  lg: '0 8px 40px rgba(0, 0, 0, 0.25)',
} as const;

/* Z-index */
export const zIndex = {
  dropdown: 50,
  modal: 100,
  toast: 150,
} as const;

/* ========================================
   LEGACY EXPORTS - for backwards compatibility
   These will be deprecated in future versions
   ======================================== */

/** @deprecated Use colors.chart instead */
export const chartColors = colors.chart;

/** @deprecated Use colors.brand.primary instead */
export const primaryColor = colors.brand.primary;

/** @deprecated Glow effects are disabled in Linear style */
export const glowColors = {
  none: 'none',
};

/** @deprecated Use shadows instead */
export const shadowClasses = {
  none: '',
  sm: 'shadow-sm',
  md: 'shadow-md',
  dropdown: 'shadow-dropdown',
};

/** @deprecated Glow effects are disabled */
export const sliderVariants = {
  blue: { glow: '', thumb: 'bg-brand-primary', thumbHover: 'bg-brand-primary-hover' },
  red: { glow: '', thumb: 'bg-error', thumbHover: 'bg-error' },
  green: { glow: '', thumb: 'bg-success', thumbHover: 'bg-success' },
  gray: { glow: '', thumb: 'bg-bg-active', thumbHover: 'bg-bg-active' },
};

/** @deprecated Use colors.bg.hover instead */
export const fallbackColor = colors.bg.active;
export const fallbackColorSecondary = colors.bg.hover;

/** @deprecated Use colors.chart.series instead */
export const celebrationColors = colors.chart.series.slice(0, 5);
