import React from 'react';
import { BaseToast, ErrorToast, SuccessToast, ToastProps } from 'react-native-toast-message';
import { StyleSheet, ViewStyle } from 'react-native';
import { isRTL } from '@/helper';

const toastTextAlign = isRTL ? ('right' as const) : ('left' as const);

const toastBase: ViewStyle = {
  minHeight: 60,
  left: 0,
  right: 0,
  top: 10,
  width: '90%',
  zIndex: 10000,
  elevation: 10000,
};

const toastStyle = (color: string): ViewStyle => ({
  ...toastBase,
  borderLeftColor: color,
  borderRightColor: color,
  backgroundColor: color,
});

const styles = StyleSheet.create({
  contentContainer: {
    paddingHorizontal: 15,
    direction: 'ltr',
  },
  text1: {
    fontFamily: 'IBMPlexSansArabic-SemiBold',
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    textAlign: toastTextAlign,
    writingDirection: isRTL ? 'rtl' : 'ltr',
  },
  text2: {
    fontFamily: 'IBMPlexSansArabic-Regular',
    fontSize: 14,
    color: 'white',
    textAlign: toastTextAlign,
    writingDirection: isRTL ? 'rtl' : 'ltr',
  },
});

const sharedProps = {
  contentContainerStyle: styles.contentContainer,
  text1Style: styles.text1,
  text2Style: styles.text2,
  text2NumberOfLines: 0,
};

export const toastConfig = {
  success: (props: ToastProps) => (
    <BaseToast {...props} style={toastStyle('#27982b')} {...sharedProps} />
  ),
  error: (props: ToastProps) => (
    <ErrorToast {...props} style={toastStyle('#D50000')} {...sharedProps} />
  ),
  info: (props: ToastProps) => (
    <BaseToast {...props} style={toastStyle('#0E7490')} {...sharedProps} />
  ),
};
