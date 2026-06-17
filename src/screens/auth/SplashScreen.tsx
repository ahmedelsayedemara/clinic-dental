import React, { useEffect } from 'react';
import { View, ActivityIndicator, StatusBar } from 'react-native';
import { Text } from '@/components/UI';
import { useTheme } from '@/theme/ThemeProvider';

export default function SplashScreen() {
  const { theme } = useTheme();

  return (
    <View className="flex-1 items-center justify-center" style={{ backgroundColor: theme.primary }}>
      <StatusBar barStyle="light-content" backgroundColor={theme.primary} />
      <Text className="text-3xl font-ibm-bold text-center mb-2" style={{ color: '#FFFFFF' }}>
        {$t('GLOBAL.APP_NAME')}
      </Text>
      <Text className="text-base font-ibm-regular text-center mb-12" style={{ color: 'rgba(255,255,255,0.8)' }}>
        {$t('AUTH.WELCOME_SUBTITLE')}
      </Text>
      <ActivityIndicator size="large" color="#FFFFFF" />
    </View>
  );
}
