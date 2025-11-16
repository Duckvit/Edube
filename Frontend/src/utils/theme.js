/**
 * Theme Configuration for Edube Platform
 * Centralized color system for consistent design
 */

export const theme = {
  // Primary Colors - Sky Blue (Main Brand Color)
  primary: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9',
    600: '#0284c7', // Main primary
    700: '#0369a1',
    800: '#075985',
    900: '#0c4a6e',
  },

  // Secondary Colors - Amber/Yellow (Accent Color)
  secondary: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b', // Main secondary
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },

  // Accent Colors - Purple (Optional accent for highlights)
  accent: {
    50: '#faf5ff',
    100: '#f3e8ff',
    200: '#e9d5ff',
    300: '#d8b4fe',
    400: '#c084fc',
    500: '#a855f7',
    600: '#9333ea', // Main accent
    700: '#7e22ce',
    800: '#6b21a8',
    900: '#581c87',
  },

  // Neutral Colors
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
  },

  // Semantic Colors
  success: {
    50: '#f0fdf4',
    500: '#10b981',
    600: '#059669',
    700: '#047857',
  },
  error: {
    50: '#fef2f2',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
  },
  warning: {
    50: '#fffbeb',
    500: '#f59e0b',
    600: '#d97706',
  },
  info: {
    50: '#eff6ff',
    500: '#3b82f6',
    600: '#2563eb',
  },
};

/**
 * Tailwind CSS class mappings for common use cases
 */
export const themeClasses = {
  // Gradients
  gradient: {
    primary: 'bg-gradient-to-r from-sky-600 to-sky-700',
    primaryToSecondary: 'bg-gradient-to-r from-sky-600 to-amber-500',
    primaryHover: 'hover:from-sky-700 hover:to-sky-800',
    primaryToSecondaryHover: 'hover:from-sky-700 hover:to-amber-600',
    hero: 'bg-gradient-to-br from-sky-900 via-sky-800 to-amber-900',
    heroReverse: 'bg-gradient-to-br from-amber-900 via-sky-800 to-sky-900',
    card: 'bg-gradient-to-br from-sky-50 to-amber-50',
    textPrimary: 'bg-gradient-to-r from-sky-600 to-amber-600 bg-clip-text text-transparent',
    textSecondary: 'bg-gradient-to-r from-sky-700 to-amber-700 bg-clip-text text-transparent',
  },

  // Buttons
  button: {
    primary: 'bg-gradient-to-r from-sky-600 to-sky-700 text-white hover:from-sky-700 hover:to-sky-800',
    secondary: 'bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700',
    accent: 'bg-gradient-to-r from-sky-600 to-amber-500 text-white hover:from-sky-700 hover:to-amber-600',
    outline: 'border-2 border-sky-600 text-sky-600 hover:bg-sky-50',
    ghost: 'text-sky-600 hover:bg-sky-50',
  },

  // Cards
  card: {
    default: 'bg-white rounded-xl shadow-md border border-gray-200',
    hover: 'hover:shadow-lg hover:border-sky-200 transition-all',
    gradient: 'bg-gradient-to-br from-sky-50 to-amber-50 rounded-xl border border-sky-100',
  },

  // Text
  text: {
    primary: 'text-gray-900',
    secondary: 'text-gray-600',
    muted: 'text-gray-500',
    accent: 'text-sky-600',
    gradient: 'bg-gradient-to-r from-sky-600 to-amber-600 bg-clip-text text-transparent',
  },

  // Backgrounds
  background: {
    primary: 'bg-white',
    secondary: 'bg-gray-50',
    tertiary: 'bg-gray-100',
    gradient: 'bg-gradient-to-br from-sky-50 to-amber-50',
  },
};

/**
 * Common component styles
 */
export const componentStyles = {
  input: 'px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent',
  inputError: 'border-red-500 focus:ring-red-500',
  badge: 'px-2 py-1 rounded-full text-xs font-medium',
  badgePrimary: 'bg-sky-100 text-sky-700',
  badgeSecondary: 'bg-amber-100 text-amber-700',
  badgeSuccess: 'bg-green-100 text-green-700',
  badgeError: 'bg-red-100 text-red-700',
};

export default theme;








