/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      /* ===== COLORS - All from CSS variables ===== */
      colors: {
        /* Semantic backgrounds */
        'bg-base': 'var(--color-bg-base)',
        'bg-surface': 'var(--color-bg-surface)',
        'bg-elevated': 'var(--color-bg-elevated)',
        'bg-hover': 'var(--color-bg-hover)',
        'bg-active': 'var(--color-bg-active)',
        'bg-inverse': 'var(--color-bg-inverse)',
        
        /* Legacy aliases - for backwards compatibility */
        surface: 'var(--color-bg-surface)',
        elevated: 'var(--color-bg-elevated)',
        
        /* Semantic text */
        'text-primary': 'var(--color-text-primary)',
        'text-secondary': 'var(--color-text-secondary)',
        'text-muted': 'var(--color-text-muted)',
        'text-disabled': 'var(--color-text-disabled)',
        'text-on-brand': 'var(--color-text-on-brand)',
        'text-inverse': 'var(--color-text-inverse)',
        
        /* Semantic borders */
        'border-default': 'var(--color-border-default)',
        'border-hover': 'var(--color-border-hover)',
        'border-active': 'var(--color-border-active)',
        'border-success': 'var(--color-border-success)',
        'border-error': 'var(--color-border-error)',
        'border-warning': 'var(--color-border-warning)',
        'border-info': 'var(--color-border-info)',
        'border-brand': 'var(--color-border-brand)',
        
        /* Overlays - for subtle backgrounds */
        'overlay-subtle': 'var(--color-overlay-subtle)',
        'overlay-default': 'var(--color-overlay-default)',
        'overlay-hover': 'var(--color-overlay-hover)',
        'overlay-active': 'var(--color-overlay-active)',
        'overlay-strong': 'var(--color-overlay-strong)',
        'overlay-heavy': 'var(--color-overlay-heavy)',
        
        /* Brand - using RGB format for opacity modifier support */
        brand: {
          primary: 'rgb(var(--color-brand-primary-rgb) / <alpha-value>)',
          'primary-hover': 'rgb(var(--color-brand-primary-hover-rgb) / <alpha-value>)',
          secondary: 'rgb(var(--color-brand-secondary-rgb) / <alpha-value>)',
        },

        /* Accent colors - for visual variety */
        accent: {
          cyan: 'rgb(var(--color-accent-cyan-rgb) / <alpha-value>)',
          pink: 'rgb(var(--color-accent-pink-rgb) / <alpha-value>)',
          amber: 'rgb(var(--color-accent-amber-rgb) / <alpha-value>)',
          emerald: 'rgb(var(--color-accent-emerald-rgb) / <alpha-value>)',
        },

        /* Semantic status - using RGB format for opacity modifier support */
        success: {
          DEFAULT: 'rgb(var(--color-success-rgb) / <alpha-value>)',
          muted: 'var(--color-success-muted)',
        },
        warning: {
          DEFAULT: 'rgb(var(--color-warning-rgb) / <alpha-value>)',
          muted: 'var(--color-warning-muted)',
        },
        error: {
          DEFAULT: 'rgb(var(--color-error-rgb) / <alpha-value>)',
          muted: 'var(--color-error-muted)',
        },
        info: {
          DEFAULT: 'rgb(var(--color-info-rgb) / <alpha-value>)',
          muted: 'var(--color-info-muted)',
        },
        neutral: {
          DEFAULT: 'rgb(var(--color-neutral-rgb) / <alpha-value>)',
          muted: 'var(--color-neutral-muted)',
        },
        
        /* Legacy rarecanvas namespace - for backwards compatibility */
        rarecanvas: {
          primary: 'rgb(var(--color-brand-primary-rgb) / <alpha-value>)',
          secondary: 'rgb(var(--color-brand-primary-hover-rgb) / <alpha-value>)',
          accent: 'rgb(var(--color-brand-primary-rgb) / <alpha-value>)',
          'accent-secondary': 'rgb(var(--color-brand-secondary-rgb) / <alpha-value>)',
          purple: {
            50: '#FAF5FF',
            100: '#F3E8FF',
            200: '#E9D5FF',
            300: '#D8B4FE',
            400: '#C084FC',
            500: '#A855F7',
            600: '#7B2CBF',
            700: '#6A24A6',
            800: '#581C87',
            900: '#3B0764',
          },
        },
                
        /* Klever legacy */
        klever: {
          purple: 'rgb(var(--color-brand-primary-rgb) / <alpha-value>)',
          dark: 'var(--color-bg-base)',
          gray: 'var(--color-bg-surface)',
        },
      },
      
      /* ===== TYPOGRAPHY ===== */
      fontFamily: {
        sans: ['var(--font-dm-sans)', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['var(--font-inter-mono)', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '1rem' }],    /* 10px */
        '3xs': ['0.5625rem', { lineHeight: '0.875rem' }], /* 9px */
      },
      letterSpacing: {
        'tighter': '-0.02em',
        'tight': '-0.011em',
      },
      
      /* ===== RADIUS - from CSS variables ===== */
      borderRadius: {
        'sm': 'var(--radius-sm)',
        'DEFAULT': 'var(--radius-md)',
        'md': 'var(--radius-md)',
        'lg': 'var(--radius-lg)',
        'xl': 'var(--radius-xl)',
        '2xl': '20px',
        '3xl': '24px',
        '4xl': '28px',
      },
      
      /* ===== SHADOWS - from CSS variables (theme-aware) ===== */
      boxShadow: {
        'sm': 'var(--shadow-sm)',
        'DEFAULT': 'var(--shadow-md)',
        'md': 'var(--shadow-md)',
        'lg': 'var(--shadow-lg)',
        'dropdown': 'var(--shadow-lg)',
      },
      
      /* ===== TRANSITIONS ===== */
      transitionDuration: {
        'fast': '100ms',
        'base': '150ms',
        'slow': '250ms',
      },
      
      /* ===== SPACING ===== */
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '104': '26rem',
        '128': '32rem',
      },
      
      /* ===== Z-INDEX ===== */
      zIndex: {
        'dropdown': 'var(--z-dropdown)',
        'modal': 'var(--z-modal)',
        'toast': 'var(--z-toast)',
      },
      
      /* ===== BACKGROUND ===== */
      backgroundColor: {
        backdrop: 'var(--color-backdrop)',
      },
      
      /* ===== LAYOUT ===== */
      maxWidth: {
        'container': 'var(--container-max-width)',
        'dashboard': 'var(--dashboard-max-width)',
      },
      minHeight: {
        'hero': 'var(--hero-min-height)',
      },
      spacing: {
        'bottom-nav': 'var(--bottom-nav-offset)',
      },
    },
  },
  plugins: [],
};
