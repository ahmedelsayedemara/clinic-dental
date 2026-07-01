import React from 'react';
import { View, ActivityIndicator, StatusBar } from 'react-native';
import { Text } from '@/components/UI';
import Logo from '@/components/global/Logo';
import { useTheme } from '@/theme/ThemeProvider';

export default function SplashScreen() {
  const { theme } = useTheme();

  return (
    <View className="flex-1 items-center justify-center" style={{ backgroundColor: theme.primary }}>
      <StatusBar barStyle="light-content" backgroundColor={theme.primary} />
      <Logo variant="light" layout="stacked" size={96} className="mb-2" />
      <Text
        className="text-base font-ibm-regular text-center mb-12"
        style={{ color: 'rgba(255,255,255,0.8)' }}>
        {$t('AUTH.WELCOME_SUBTITLE')}
      </Text>
      <ActivityIndicator size="large" color="#FFFFFF" />
    </View>
  );
}
