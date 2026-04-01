import { Platform } from 'react-native';

export const colors = {
  bg: '#0a0f1a',
  bgCard: '#0f1629',
  bgCardBorder: '#1a2340',
  bgMuted: '#131b2e',
  bgSection: '#0d1422',
  text: '#e2e8f0',
  textMuted: '#64748b',
  textDim: '#475569',
  primary: '#3b82f6',
  primaryDim: '#1d4ed8',
  green: '#22c55e',
  greenDim: '#15803d',
  red: '#ef4444',
  redDim: '#b91c1c',
  amber: '#f59e0b',
  amberDim: '#d97706',
  border: '#1e293b',
  borderLight: '#2d3748',
  overlay: 'rgba(0,0,0,0.6)',
};

export const fonts = {
  mono: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  body: Platform.OS === 'ios' ? 'System' : 'Roboto',
  size: {
    xs: 10,
    sm: 12,
    base: 14,
    md: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 28,
  },
  weight: {
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
};

export const radius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 18,
  full: 9999,
};

export const shadow = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
};
