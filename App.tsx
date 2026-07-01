import React from 'react';
import { Platform, StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import BootSplash from 'react-native-bootsplash';
import Toast from 'react-native-toast-message';

import '@/locale/i18n';
import { toastConfig } from '@/config/toastConfig';
import { ThemeProvider, useTheme } from '@/theme/ThemeProvider';
import { useThemeStore } from '@/store/useThemeStore';
import RootStack from '@/navigation/RootStack';
import FullScreenLoader from '@/components/global/FullScreenLoader';
import FirebaseProvider from '@/firebase/FirebaseProvider';

function AppContent() {
  const { isDark } = useTheme();

  return (
    <>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={isDark ? '#0F172A' : '#FFFFFF'}
      />
      <RootStack />
      <FullScreenLoader />
      <Toast
        config={toastConfig}
        visibilityTime={5000}
        topOffset={Platform.OS === 'android' ? 20 : 50}
      />
    </>
  );
}

function App() {
  const { isDark } = useThemeStore();

  return (
    <SafeAreaProvider>
      <FirebaseProvider>
        <NavigationContainer
          onReady={() => BootSplash.hide({ fade: true })}
          theme={{
            dark: isDark,
            colors: {
              primary: '#0E7490',
              background: isDark ? '#0F172A' : '#FFFFFF',
              card: isDark ? '#1E293B' : '#FFFFFF',
              text: isDark ? '#FFFFFF' : '#1E293B',
              border: isDark ? '#334155' : '#E2E8F0',
              notification: '#0E7490',
            },
            fonts: {
              regular: { fontFamily: 'IBMPlexSansArabic-Regular', fontWeight: '400' },
              medium: { fontFamily: 'IBMPlexSansArabic-Medium', fontWeight: '500' },
              bold: { fontFamily: 'IBMPlexSansArabic-Bold', fontWeight: '700' },
              heavy: { fontFamily: 'IBMPlexSansArabic-Bold', fontWeight: '900' },
            },
          }}>
          <ThemeProvider>
            <AppContent />
          </ThemeProvider>
        </NavigationContainer>
      </FirebaseProvider>
    </SafeAreaProvider>
  );
}

export default App;
