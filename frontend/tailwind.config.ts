import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Luxury color palette with proper naming
        'burgundy': '#4B1E2F',
        'champagne-gold': '#D4AF37',
        'charcoal-black': '#1C1C1C',
        'ivory': '#F8F4E3',
        'sapphire-blue': '#0F3D57',
        'muted-olive': '#6B705C',
        
        // Extended color palette
        'burgundy-light': '#6B2E3F',
        'burgundy-dark': '#3B1E2F',
        'champagne-gold-light': '#E4BF47',
        'champagne-gold-dark': '#C49F27',
        'charcoal-light': '#2C2C2C',
        'charcoal-dark': '#0C0C0C',
        'ivory-light': '#FEFCF3',
        'ivory-dark': '#E8E4D3',
        'sapphire-blue-light': '#1F4D67',
        'sapphire-blue-dark': '#0F2D47',
        'muted-olive-light': '#7B806C',
        'muted-olive-dark': '#5B604C',
        
        // Detailed color scales
        'burgundy-scale': {
          50: '#fdf2f4',
          100: '#fce7ea',
          200: '#f9d0d9',
          300: '#f4a8ba',
          400: '#ec7896',
          500: '#e04876',
          600: '#cd2c5c',
          700: '#b01e4a',
          800: '#4B1E2F', // Primary burgundy
          900: '#881337',
          950: '#4c0519',
        },
        'champagne-scale': {
          50: '#fefce8',
          100: '#fef9c3',
          200: '#fef08a',
          300: '#fde047',
          400: '#D4AF37', // Primary champagne gold
          500: '#eab308',
          600: '#ca8a04',
          700: '#a16207',
          800: '#854d0e',
          900: '#713f12',
          950: '#422006',
        },
        'charcoal-scale': {
          50: '#f6f6f6',
          100: '#e7e7e7',
          200: '#d1d1d1',
          300: '#b0b0b0',
          400: '#888888',
          500: '#6d6d6d',
          600: '#5d5d5d',
          700: '#4f4f4f',
          800: '#454545',
          900: '#1C1C1C', // Primary charcoal black
          950: '#0a0a0a',
        },
        'ivory-scale': {
          50: '#F8F4E3', // Primary ivory
          100: '#fefce8',
          200: '#fef9c3',
          300: '#fef08a',
          400: '#fde047',
          500: '#facc15',
          600: '#eab308',
          700: '#ca8a04',
          800: '#a16207',
          900: '#854d0e',
          950: '#713f12',
        },
        'sapphire-scale': {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#0F3D57', // Primary sapphire blue
          900: '#1e3a8a',
          950: '#172554',
        },
        'olive-scale': {
          50: '#f7f7f6',
          100: '#e4e4e1',
          200: '#c9c9c4',
          300: '#a8a89f',
          400: '#87877c',
          500: '#6B705C', // Primary muted olive
          600: '#5a5e4f',
          700: '#4a4d42',
          800: '#3e4038',
          900: '#35362f',
          950: '#1c1d19',
        },
      },
      fontFamily: {
        'heading': ['Playfair Display', 'serif'],
        'body': ['Lato', 'sans-serif'],
        'accent': ['Cormorant Garamond', 'serif'],
        'playfair': ['Playfair Display', 'serif'],
        'lato': ['Lato', 'sans-serif'],
        'cormorant': ['Cormorant Garamond', 'serif'],
      },
      fontSize: {
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
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      boxShadow: {
        'luxury': '0 4px 20px rgba(75, 30, 47, 0.1)',
        'luxury-lg': '0 10px 40px rgba(75, 30, 47, 0.15)',
        'gold': '0 4px 20px rgba(212, 175, 55, 0.2)',
        'gold-lg': '0 10px 40px rgba(212, 175, 55, 0.3)',
      },
      backdropBlur: {
        'xs': '2px',
      },
    },
  },
  plugins: [],
}

export default config