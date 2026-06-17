import { STORAGE_KEYS } from '@/constants/storageKeys';
import { createMMKV } from 'react-native-mmkv';
import type { MMKV } from 'react-native-mmkv';

export const storage: MMKV = createMMKV({
  id: 'clinic-storage',
  encryptionKey: 'clinic-encrypt-key',
});

export const StorageUtil = {
  setString: (key: string, value: string): void => {
    storage.set(key, value);
  },

  getString: (key: string): string | undefined => {
    return storage.getString(key);
  },

  setNumber: (key: string, value: number): void => {
    storage.set(key, value);
  },

  getNumber: (key: string): number | undefined => {
    return storage.getNumber(key);
  },

  setBoolean: (key: string, value: boolean): void => {
    storage.set(key, value);
  },

  getBoolean: (key: string): boolean | undefined => {
    return storage.getBoolean(key);
  },

  setObject: <T>(key: string, value: T): void => {
    storage.set(key, JSON.stringify(value));
  },

  getObject: <T>(key: string): T | undefined => {
    const value = storage.getString(key);
    if (value) {
      try {
        return JSON.parse(value) as T;
      } catch {
        return undefined;
      }
    }
    return undefined;
  },

  delete: (key: string): void => {
    storage.remove(key);
  },

  contains: (key: string): boolean => {
    return storage.contains(key);
  },

  clearAll: (): void => {
    storage.clearAll();
  },
};

export const setLanguage = (language: string) => {
  storage.set(STORAGE_KEYS.LANGUAGE, language);
};

export const getLanguage = (): string | undefined => {
  return storage.getString(STORAGE_KEYS.LANGUAGE);
};
