/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    // Dynamic color classes for course configurations
    'bg-blue-600', 'bg-blue-500', 'bg-blue-100', 'text-blue-600', 'text-blue-800',
    'bg-purple-600', 'bg-purple-500', 'bg-purple-100', 'text-purple-600', 'text-purple-800',
    'bg-green-600', 'bg-green-500', 'bg-green-100', 'text-green-600', 'text-green-800',
    'bg-red-600', 'bg-red-500', 'bg-red-100', 'text-red-600', 'text-red-800',
    'bg-orange-600', 'bg-orange-500', 'bg-orange-100', 'text-orange-600', 'text-orange-800',
    'bg-teal-600', 'bg-teal-500', 'bg-teal-100', 'text-teal-600', 'text-teal-800',
    'bg-indigo-600', 'bg-indigo-500', 'bg-indigo-100', 'text-indigo-600', 'text-indigo-800',
    // Border and ring colors
    'border-blue-500', 'border-purple-500', 'border-green-500', 'border-red-500', 'border-orange-500',
    'ring-blue-500', 'ring-purple-500', 'ring-green-500', 'ring-red-500', 'ring-orange-500',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        gray: {
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
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
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
      },
    },
  },
  plugins: [],
}
