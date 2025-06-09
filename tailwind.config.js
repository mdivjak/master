/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          50: '#f0f9f4',
          100: '#dcf4e3',
          200: '#bce7cb',
          300: '#8dd5a7',
          400: '#57bc7d',
          500: '#0f5132',
          600: '#0d472c',
          700: '#0b3d26',
          800: '#093220',
          900: '#064e3b'
        },
        mountain: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#1e40af',
          600: '#1d4ed8',
          700: '#1e3a8a',
          800: '#1e3a8a',
          900: '#1e3a8a'
        },
        earth: {
          50: '#fdf2f8',
          100: '#fce7f3',
          200: '#fbcfe8',
          300: '#f9a8d4',
          400: '#f472b6',
          500: '#8b4513',
          600: '#a0522d',
          700: '#8b4513',
          800: '#7c2d12',
          900: '#6b1f0f'
        },
        sunset: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#ff6b35',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12'
        },
        stone: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827'
        }
      },
      fontFamily: {
        'heading': ['Inter', 'Poppins', 'sans-serif'],
        'body': ['Inter', 'sans-serif'],
        'accent': ['Montserrat', 'sans-serif']
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem'
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem'
      },
      boxShadow: {
        'nature': '0 4px 6px -1px rgba(15, 81, 50, 0.1), 0 2px 4px -1px rgba(15, 81, 50, 0.06)',
        'nature-lg': '0 10px 15px -3px rgba(15, 81, 50, 0.1), 0 4px 6px -2px rgba(15, 81, 50, 0.05)',
        'mountain': '0 4px 6px -1px rgba(30, 64, 175, 0.1), 0 2px 4px -1px rgba(30, 64, 175, 0.06)',
        'warm': '0 4px 6px -1px rgba(255, 107, 53, 0.1), 0 2px 4px -1px rgba(255, 107, 53, 0.06)'
      },
      backgroundImage: {
        'nature-gradient': 'linear-gradient(135deg, #0f5132 0%, #1e40af 100%)',
        'sunset-gradient': 'linear-gradient(135deg, #ff6b35 0%, #8b4513 100%)',
        'mountain-gradient': 'linear-gradient(135deg, #1e40af 0%, #0f5132 100%)'
      }
    },
  },
  plugins: [],
}

