import { create } from 'zustand';
import { getLanguage } from '@/utility/storage';

interface LanguageStore {
  currentLanguage: string;
  setLanguage: (language: string) => void;
  initializeLanguage: () => void;
}

export const useLanguageStore = create<LanguageStore>(set => ({
  currentLanguage: getLanguage() || 'ar',

  setLanguage: (language: string) => {
    set({ currentLanguage: language });
  },

  initializeLanguage: () => {
    const storedLanguage = getLanguage();
    if (storedLanguage) {
      set({ currentLanguage: storedLanguage });
    }
  },
}));
