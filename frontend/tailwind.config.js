/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#6C63FF',
          light: '#8B83FF',
          dark: '#4F46E5',
        },
        secondary: {
          DEFAULT: '#FF6B6B',
          light: '#FF8E8E',
          dark: '#E55555',
        },
        success: '#10B981',
        warning: '#F59E0B',
        danger: '#EF4444',
        bg: {
          DEFAULT: '#0F0F23',
          card: '#1A1A2E',
          surface: '#252540',
        },
        text: {
          DEFAULT: '#E8E8F0',
          muted: '#94A3B8',
        },
        border: 'rgba(255,255,255,0.08)',
      },
      borderRadius: {
        xl: '16px',
        '2xl': '20px',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'fadeInUp': 'fadeInUp 0.5s ease-out',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
