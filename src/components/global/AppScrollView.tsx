import React from 'react';
import { ScrollView, View, ScrollViewProps } from 'react-native';
import { isRTL } from '@/helper';

interface AppScrollViewProps extends ScrollViewProps {
  children: React.ReactNode;
  padded?: boolean;
}

export default function AppScrollView({
  children,
  padded = true,
  horizontal = false,
  contentContainerStyle,
  ...rest
}: AppScrollViewProps) {
  // Create new object references per mount so RN always re-applies
  // the direction style to the native view after back-navigation.
  const scrollStyle = isRTL ? { direction: 'ltr' as const } : undefined;
  const contentStyle = isRTL ? { direction: 'rtl' as const } : undefined;

  return (
    <ScrollView
      horizontal={horizontal}
      contentContainerStyle={
        horizontal ? contentContainerStyle : [{ flexGrow: 1 }, contentContainerStyle]
      }
      showsVerticalScrollIndicator={!horizontal}
      showsHorizontalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      style={scrollStyle}
      {...rest}>
      {horizontal ? (
        children
      ) : (
        <View className={`flex-1${padded ? ' px-4' : ''}`} style={contentStyle}>
          {children}
        </View>
      )}
    </ScrollView>
  );
}
