const { colors } = require('./src/theme/colors.js');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './App.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
    './index.{js,jsx,ts,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Brand / Primary
        primary: colors.primary,
        'primary-light': colors.primaryLight,
        'primary-dark': colors.primaryDark,
        secondary: colors.secondary,

        // Status
        error: colors.error,
        success: colors.success,
        warning: colors.warning,
        info: colors.info,

        // Brand design tokens
        'brand-text': colors.brandText,
        'brand-subtext': colors.brandSubtext,
        'brand-bg': colors.brandBg,
        'brand-stroke': colors.brandStroke,
        'brand-dark': colors.brandDark,

        // Neutrals
        ink: colors.ink,
        'ink-dark': colors.inkDark,
        'ink-light': colors.inkLight,
        muted: colors.muted,

        // Grays
        'gray-100': colors.gray100,
        'gray-400': colors.gray400,
        'gray-500': colors.gray500,
        'gray-600': colors.gray600,
        'gray-700': colors.gray700,
        'gray-subtle': colors.graySubtle,
        'gray-strong': colors.grayStrong,
        'gray-900': colors.gray900,

        // Borders & Surfaces
        border: colors.border,
        'border-light': colors.borderLight,
        'card-subtle': colors.cardSubtle,
        shadow: colors.shadow,
      },
      fontFamily: {
        'ibm-thin': ['IBMPlexSansArabic-Thin'],
        'ibm-extralight': ['IBMPlexSansArabic-ExtraLight'],
        'ibm-light': ['IBMPlexSansArabic-Light'],
        'ibm-regular': ['IBMPlexSansArabic-Regular'],
        'ibm-medium': ['IBMPlexSansArabic-Medium'],
        'ibm-semibold': ['IBMPlexSansArabic-SemiBold'],
        'ibm-bold': ['IBMPlexSansArabic-Bold'],
      },
    },
  },
  plugins: [],
};
