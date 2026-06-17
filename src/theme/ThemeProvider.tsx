import React, { createContext, useContext, useMemo } from 'react';
import { useThemeStore } from '@/store/useThemeStore';
import { colors } from './colors';

export interface ThemeColors {
  primary: string;
  background: string;
  card: string;
  cardSubtle: string;
  text: string;
  textSecondary: string;
  border: string;
  error: string;
  success: string;
  ink: string;
  muted: string;
  cardBorder: string;
  surface: string;
  inkDark: string;
}

interface ThemeContextType {
  theme: ThemeColors;
  isDark: boolean;
}

const lightColors: ThemeColors = {
  primary: colors.primary,
  background: colors.white,
  card: colors.white,
  cardSubtle: colors.cardSubtle,
  text: colors.inkLight,
  textSecondary: colors.graySubtle,
  border: colors.border,
  error: colors.error,
  success: colors.success,
  ink: colors.ink,
  muted: colors.muted,
  cardBorder: colors.borderLight,
  surface: colors.gray100,
  inkDark: colors.inkDark,
};

const darkColors: ThemeColors = {
  primary: colors.primary,
  background: colors.darkBackground,
  card: colors.darkCard,
  cardSubtle: colors.darkCardSubtle,
  text: colors.white,
  textSecondary: colors.darkTextSecondary,
  border: colors.darkBorder,
  error: colors.error,
  success: colors.success,
  ink: colors.white,
  muted: colors.darkTextSecondary,
  cardBorder: colors.darkCardBorder,
  surface: colors.darkSurface,
  inkDark: colors.inkDark,
};

const ThemeContext = createContext<ThemeContextType>({
  theme: lightColors,
  isDark: false,
});

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const { isDark } = useThemeStore();

  const value = useMemo(
    () => ({
      theme: isDark ? darkColors : lightColors,
      isDark,
    }),
    [isDark],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};
