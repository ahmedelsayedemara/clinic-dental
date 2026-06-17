import { create } from 'zustand';
import { StorageUtil } from '@/utility/storage';
import { STORAGE_KEYS } from '@/constants/storageKeys';

type ThemeMode = 'light' | 'dark';

interface ThemeState {
  mode: ThemeMode;
  isDark: boolean;
  setMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
  reset: () => void;
}

const savedTheme = (StorageUtil.getString(STORAGE_KEYS.THEME) as ThemeMode) || 'light';

export const useThemeStore = create<ThemeState>(set => ({
  mode: savedTheme,
  isDark: savedTheme === 'dark',
  setMode: mode => {
    StorageUtil.setString(STORAGE_KEYS.THEME, mode);
    set({ mode, isDark: mode === 'dark' });
  },
  toggleTheme: () =>
    set(state => {
      const newMode = state.isDark ? 'light' : 'dark';
      StorageUtil.setString(STORAGE_KEYS.THEME, newMode);
      return { mode: newMode, isDark: !state.isDark };
    }),
  reset: () => set({ mode: 'light', isDark: false }),
}));
