import i18next from 'i18next';
import dayjs from 'dayjs';
import 'dayjs/locale/ar';
import { useLanguageStore } from '@/store/useLanguageStore';

const currentLang = useLanguageStore.getState().currentLanguage;

export const isRTL = i18next.language === 'ar' || i18next.language === undefined;

dayjs.locale(currentLang);

export const getDateFormat = (date: string, format = 'DD-MM-YYYY'): string => {
  if (!date) return '';
  const cleanDate = date?.replace('Z+', '+').replace('Z-', '-');
  return dayjs(cleanDate).format(format);
};

export const formatDate = (date: Date | string, format = 'DD/MM/YYYY'): string => {
  if (!date) return '';
  return dayjs(date).format(format);
};

export const avatarText = (value: string): string => {
  if (!value) return '';
  const nameArray = value.trim().split(/\s+/);
  const firstName = nameArray[0].charAt(0);
  const lastName = nameArray.length > 1 ? nameArray[nameArray.length - 1].charAt(0) : '';
  return (firstName + lastName).toUpperCase();
};

export const debounce = <T extends (...args: any[]) => any>(fn: T, wait: number) => {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), wait);
  };
};

export const truncateString = (str: string, length = 10): string => {
  if (str?.length > length) {
    return str.substring(0, length) + '...';
  }
  return str;
};
