/**
 * Civics Connect Enterprise - Design System Tokens
 */

export const colors = {
  light: {
    primary: '#0056b3',
    primaryHover: '#004085',
    secondary: '#16a34a',
    secondaryHover: '#15803d',
    accent: '#facc15',
    danger: '#ef4444',
    dangerHover: '#dc2626',
    warning: '#f59e0b',
    info: '#0284c7',
    background: '#f8fafc',
    surface: '#ffffff',
    surfaceSecondary: '#f1f5f9',
    textPrimary: '#0f172a',
    textSecondary: '#64748b',
    textMuted: '#94a3b8',
    border: '#cbd5e1',
    borderLight: '#e2e8f0',
  },
  dark: {
    primary: '#3b82f6',
    primaryHover: '#2563eb',
    secondary: '#22c55e',
    secondaryHover: '#16a34a',
    accent: '#fde047',
    danger: '#f87171',
    dangerHover: '#ef4444',
    warning: '#fbbf24',
    info: '#38bdf8',
    background: '#0f172a',
    surface: '#1e293b',
    surfaceSecondary: '#334155',
    textPrimary: '#f8fafc',
    textSecondary: '#cbd5e1',
    textMuted: '#94a3b8',
    border: '#475569',
    borderLight: '#334155',
  },
};

export const typography = {
  fontFamily: {
    sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    serif: '"Times New Roman", Times, serif',
    mono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
  },
  fontSize: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
  },
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },
};

export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  '2xl': '48px',
};

export const borderRadius = {
  none: '0px',
  sm: '4px',
  md: '8px',
  lg: '12px',
  full: '9999px',
};

export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
};

export const zIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  toast: 1090,
};

export const transitions = {
  fast: 'all 0.15s ease-in-out',
  default: 'all 0.25s ease-in-out',
};
