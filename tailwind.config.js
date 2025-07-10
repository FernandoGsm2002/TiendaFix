/** @type {import('tailwindcss').Config} */
const { heroui } = require("@heroui/react");

module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      // Breakpoints modernos para ultra-wide screens
      screens: {
        'xs': '475px',
        '3xl': '1920px',
        '4xl': '2560px',
      },
      
      // Tipografía fluida moderna - se adapta automáticamente
      fontSize: {
        // Tamaños base fluidos usando clamp()
        'fluid-xs': ['clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem)', { 
          lineHeight: '1.5',
          letterSpacing: '0.025em'
        }],
        'fluid-sm': ['clamp(0.875rem, 0.8rem + 0.375vw, 1rem)', { 
          lineHeight: '1.5',
          letterSpacing: '0.02em'
        }],
        'fluid-base': ['clamp(1rem, 0.9rem + 0.5vw, 1.125rem)', { 
          lineHeight: '1.6',
          letterSpacing: '0.01em'
        }],
        'fluid-lg': ['clamp(1.125rem, 1rem + 0.625vw, 1.25rem)', { 
          lineHeight: '1.6',
          letterSpacing: '0.005em'
        }],
        'fluid-xl': ['clamp(1.25rem, 1.1rem + 0.75vw, 1.5rem)', { 
          lineHeight: '1.4',
          letterSpacing: '0em'
        }],
        'fluid-2xl': ['clamp(1.5rem, 1.3rem + 1vw, 2rem)', { 
          lineHeight: '1.3',
          letterSpacing: '-0.01em'
        }],
        'fluid-3xl': ['clamp(1.875rem, 1.6rem + 1.375vw, 2.5rem)', { 
          lineHeight: '1.2',
          letterSpacing: '-0.02em'
        }],
        'fluid-4xl': ['clamp(2.25rem, 1.9rem + 1.75vw, 3rem)', { 
          lineHeight: '1.1',
          letterSpacing: '-0.025em'
        }],
        'fluid-5xl': ['clamp(3rem, 2.5rem + 2.5vw, 4rem)', { 
          lineHeight: '1',
          letterSpacing: '-0.03em'
        }],
        
        // Tamaños específicos para UI
        'ui-xs': ['0.75rem', '1rem'],
        'ui-sm': ['0.875rem', '1.25rem'],
        'ui-base': ['1rem', '1.5rem'],
        'ui-lg': ['1.125rem', '1.75rem'],
      },

      // Espaciado fluido que se adapta a la pantalla
      spacing: {
        // Espaciado fluido usando clamp()
        'fluid-xs': 'clamp(0.25rem, 0.2rem + 0.25vw, 0.5rem)',
        'fluid-sm': 'clamp(0.5rem, 0.4rem + 0.5vw, 1rem)', 
        'fluid-md': 'clamp(1rem, 0.8rem + 1vw, 2rem)',
        'fluid-lg': 'clamp(1.5rem, 1.2rem + 1.5vw, 3rem)',
        'fluid-xl': 'clamp(2rem, 1.6rem + 2vw, 4rem)',
        'fluid-2xl': 'clamp(2.5rem, 2rem + 2.5vw, 5rem)',
        'fluid-3xl': 'clamp(3rem, 2.4rem + 3vw, 6rem)',
        
        // Espaciado específico para componentes
        'touch': '44px',           // Área táctil mínima
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
        
        // Container padding responsivo
        'container-xs': 'clamp(1rem, 4vw, 1.5rem)',
        'container-sm': 'clamp(1.5rem, 5vw, 2rem)', 
        'container-md': 'clamp(2rem, 6vw, 3rem)',
        'container-lg': 'clamp(2.5rem, 8vw, 4rem)',
      },

      // Colores modernos con variables CSS
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        
        // Sistema de colores fluido
        primary: {
          50: '#f0fdf9',
          100: '#eafae7', 
          200: '#c0e6ba',
          300: '#4ca771',
          400: '#22c55e',
          500: '#16a34a',
          600: '#15803d',
          700: '#166534',
          800: '#014737',
          900: '#013237',
        },
        
        // Grises modernos para UI
        gray: {
          25: '#fcfcfd',
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb', 
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
          925: '#0c1219',
          950: '#030712',
        }
      },

      // Sombras modernas con múltiples capas
      boxShadow: {
        'xs': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        'sm': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        'md': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        'lg': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        'xl': '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
        '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
        'inner': 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
        
        // Sombras especiales para componentes
        'glow': '0 0 20px rgb(34 197 94 / 0.3)',
        'glow-lg': '0 0 40px rgb(34 197 94 / 0.4)',
        'card': '0 4px 6px -1px rgb(0 0 0 / 0.07), 0 2px 4px -1px rgb(0 0 0 / 0.06)',
        'card-hover': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -2px rgb(0 0 0 / 0.05)',
        'float': '0 8px 32px rgb(0 0 0 / 0.12)',
      },

      // Animaciones modernas y suaves
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'fade-out': 'fadeOut 0.3s ease-in',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'slide-left': 'slideLeft 0.3s ease-out',
        'slide-right': 'slideRight 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'scale-out': 'scaleOut 0.2s ease-in',
        'bounce-soft': 'bounceSoft 0.6s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'wiggle': 'wiggle 1s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
      },

      // Keyframes para animaciones
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideLeft: {
          '0%': { transform: 'translateX(10px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideRight: {
          '0%': { transform: 'translateX(-10px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        scaleOut: {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '100%': { transform: 'scale(0.95)', opacity: '0' },
        },
        bounceSoft: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-4px)' },
        },
      },

      // Transiciones suaves optimizadas
      transitionTimingFunction: {
        'bounce-soft': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'ease-spring': 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        'ease-smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },

      // Blur backdrop moderno
      backdropBlur: {
        'xs': '2px',
        '4xl': '72px',
      },
    },
  },
  
  // Configuraciones adicionales
  darkMode: "class",
  plugins: [
    heroui(),
    
    // Plugin custom para utilidades adicionales
    function({ addUtilities, theme }) {
      const newUtilities = {
        // Utilidades de contenedor responsivo
        '.container-fluid': {
          width: '100%',
          paddingLeft: theme('spacing.container-xs'),
          paddingRight: theme('spacing.container-xs'),
          marginLeft: 'auto',
          marginRight: 'auto',
          maxWidth: '100%',
        },
        
        // Utilidades de scroll optimizado
        '.scroll-smooth': {
          scrollBehavior: 'smooth',
          '-webkit-overflow-scrolling': 'touch',
        },
        
        // Utilidades para touch
        '.touch-pan-x': {
          touchAction: 'pan-x',
        },
        '.touch-pan-y': {
          touchAction: 'pan-y',
        },
        '.touch-none': {
          touchAction: 'none',
        },
        
        // Utilidades de aspect ratio modernos
        '.aspect-card': {
          aspectRatio: '3 / 4',
        },
        '.aspect-hero': {
          aspectRatio: '16 / 9',
        },
        '.aspect-square': {
          aspectRatio: '1 / 1',
        },
        
        // Safe area utilities
        '.safe-area-top': {
          paddingTop: 'env(safe-area-inset-top)',
        },
        '.safe-area-bottom': {
          paddingBottom: 'env(safe-area-inset-bottom)',
        },
        '.safe-area-left': {
          paddingLeft: 'env(safe-area-inset-left)',
        },
        '.safe-area-right': {
          paddingRight: 'env(safe-area-inset-right)',
        },
        '.safe-area-all': {
          padding: 'env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)',
        },
      }
      
      addUtilities(newUtilities)
    }
  ],
} 