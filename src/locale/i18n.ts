import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { I18nManager } from 'react-native';

import ar from './ar.json';
import en from './en.json';
import { StorageUtil } from '@/utility/storage';
import { STORAGE_KEYS } from '@/constants/storageKeys';

const savedLanguage = StorageUtil.getString(STORAGE_KEYS.LANGUAGE) || 'ar';

i18n.use(initReactI18next).init({
  resources: {
    ar: { translation: ar },
    en: { translation: en },
  },
  lng: savedLanguage,
  fallbackLng: 'ar',
  interpolation: {
    escapeValue: false,
  },
  react: {
    useSuspense: false,
  },
  compatibilityJSON: 'v4',
});

// Set RTL based on language
I18nManager.forceRTL(savedLanguage === 'ar');
I18nManager.allowRTL(savedLanguage === 'ar');

// Global $t function
(globalThis as Record<string, unknown>).$t = (
  key: string,
  options?: Record<string, unknown>,
): string => {
  return i18n.t(key, options);
};

export const changeLanguage = async (lng: 'ar' | 'en'): Promise<void> => {
  await i18n.changeLanguage(lng);
  StorageUtil.setString(STORAGE_KEYS.LANGUAGE, lng);
  I18nManager.forceRTL(lng === 'ar');
  I18nManager.allowRTL(lng === 'ar');
};

export default i18n;
