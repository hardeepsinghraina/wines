// Design System Utilities
// Provides easy access to design tokens and utility functions

export const colors = {
  // Primary palette
  burgundy: {
    DEFAULT: '#4B1E2F',
    light: '#6B2E3F',
    dark: '#3B1E2F',
  },
  champagne: {
    DEFAULT: '#D4AF37',
    light: '#E4BF47',
    dark: '#C49F27',
  },
  charcoal: {
    DEFAULT: '#1C1C1C',
    light: '#2C2C2C',
    dark: '#0C0C0C',
  },
  ivory: {
    DEFAULT: '#F8F4E3',
    light: '#FEFCF3',
    dark: '#E8E4D3',
  },
  sapphire: {
    DEFAULT: '#0F3D57',
    light: '#1F4D67',
    dark: '#0F2D47',
  },
  olive: {
    DEFAULT: '#6B705C',
    light: '#7B806C',
    dark: '#5B604C',
  },
  
  // Semantic colors
  primary: '#4B1E2F',
  secondary: '#D4AF37',
  accent: '#0F3D57',
  muted: '#6B705C',
  
  // State colors
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
} as const;

export const typography = {
  fonts: {
    display: 'var(--font-playfair)',
    body: 'var(--font-lato)',
    accent: 'var(--font-cormorant)',
  },
  sizes: {
    'display-xl': ['4.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
    'display-lg': ['3.75rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
    'display-md': ['3rem', { lineHeight: '1.2', letterSpacing: '-0.02em' }],
    'display-sm': ['2.25rem', { lineHeight: '1.3', letterSpacing: '-0.01em' }],
    'heading-xl': ['2rem', { lineHeight: '1.3', letterSpacing: '-0.01em' }],
    'heading-lg': ['1.75rem', { lineHeight: '1.4', letterSpacing: '-0.01em' }],
    'heading-md': ['1.5rem', { lineHeight: '1.4' }],
    'heading-sm': ['1.25rem', { lineHeight: '1.5' }],
    'body-lg': ['1.125rem', { lineHeight: '1.6' }],
    'body-md': ['1rem', { lineHeight: '1.6' }],
    'body-sm': ['0.875rem', { lineHeight: '1.5' }],
    'caption': ['0.75rem', { lineHeight: '1.4' }],
  },
} as const;

export const spacing = {
  xs: '0.25rem',
  sm: '0.5rem',
  md: '1rem',
  lg: '1.5rem',
  xl: '2rem',
  '2xl': '3rem',
  '3xl': '4rem',
  '4xl': '6rem',
  '5xl': '8rem',
} as const;

export const shadows = {
  luxury: '0 4px 20px rgba(75, 30, 47, 0.1)',
  'luxury-lg': '0 10px 40px rgba(75, 30, 47, 0.15)',
  gold: '0 4px 20px rgba(212, 175, 55, 0.2)',
  'gold-lg': '0 10px 40px rgba(212, 175, 55, 0.3)',
} as const;

export const animations = {
  'fade-in': 'fadeIn 0.5s ease-in-out',
  'slide-up': 'slideUp 0.3s ease-out',
  'slide-down': 'slideDown 0.3s ease-out',
  'scale-in': 'scaleIn 0.2s ease-out',
} as const;

// Utility functions
export const getColorValue = (colorPath: string): string => {
  const paths = colorPath.split('.');
  let current: Record<string, unknown> = colors;
  
  for (const path of paths) {
    current = current[path] as Record<string, unknown>;
    if (!current) return colorPath; // Return original if not found
  }
  
  return typeof current === 'string' ? current : (current.DEFAULT as string) || colorPath;
};

export const createGradient = (from: string, to: string, direction = '135deg'): string => {
  return `linear-gradient(${direction}, ${getColorValue(from)} 0%, ${getColorValue(to)} 100%)`;
};

export const createShadow = (color: string, opacity = 0.1, blur = 20, spread = 4): string => {
  const colorValue = getColorValue(color);
  // Convert hex to rgba
  const hex = colorValue.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  return `0 ${spread}px ${blur}px rgba(${r}, ${g}, ${b}, ${opacity})`;
};

// Responsive breakpoints
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

// Component variants
export const variants = {
  button: {
    primary: {
      background: colors.primary,
      color: colors.ivory.DEFAULT,
      hover: colors.burgundy.light,
    },
    secondary: {
      background: colors.secondary,
      color: colors.charcoal.DEFAULT,
      hover: colors.champagne.light,
    },
    outline: {
      background: 'transparent',
      color: colors.primary,
      border: colors.primary,
      hover: colors.primary,
    },
  },
  card: {
    default: {
      background: colors.ivory.DEFAULT,
      border: colors.olive.DEFAULT,
      shadow: shadows.luxury,
    },
    elevated: {
      background: colors.ivory.light,
      border: colors.champagne.DEFAULT,
      shadow: shadows['luxury-lg'],
    },
  },
} as const;

const designSystem = {
  colors,
  typography,
  spacing,
  shadows,
  animations,
  breakpoints,
  variants,
  getColorValue,
  createGradient,
  createShadow,
};

export default designSystem;