/**
 * Single source of truth for all color values.
 * Used by colors.ts (TypeScript) and tailwind.config.js (CommonJS)
 */
const colors = {
  // Brand / Primary — Clinical Teal
  primary: '#0E7490',
  primaryLight: '#CFFAFE',
  primaryDark: '#0C4A6E',
  secondary: '#E0F2FE',

  // Status
  error: '#D50000',
  success: '#27982b',
  warning: '#FF9800',
  info: '#2196F3',

  // Brand design tokens
  brandText: '#0C4A6E',
  brandSubtext: '#64748B',
  brandBg: '#F0F9FF',
  brandStroke: '#BAE6FD',
  brandDark: '#1E293B',

  // Neutrals
  white: '#FFFFFF',
  black: '#000000',
  ink: '#1E293B',
  inkDark: '#0F172A',
  inkLight: '#1E293B',
  muted: '#64748B',

  // Grays
  gray100: '#F1F5F9',
  gray400: '#94A3B8',
  gray500: '#64748B',
  gray600: '#475569',
  gray700: '#334155',
  graySubtle: '#64748B',
  grayStrong: '#334155',
  gray900: '#0F172A',

  // Borders
  border: '#E2E8F0',
  borderLight: '#F1F5F9',

  // Surfaces / Cards
  cardSubtle: '#F8FAFC',

  // Dark mode surfaces
  darkBackground: '#0F172A',
  darkCard: '#1E293B',
  darkCardSubtle: '#263348',
  darkSurface: '#1A2336',
  darkCardBorder: '#2D3748',
  darkBorder: '#334155',
  darkTextSecondary: '#94A3B8',

  // Misc
  shadow: '#0C4A6E',
};

module.exports = { colors };
