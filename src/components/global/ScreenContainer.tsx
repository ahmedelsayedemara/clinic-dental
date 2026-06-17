import React from 'react';
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/ThemeProvider';
import { isRTL } from '@/helper';

const RTL_LTR_STYLE = isRTL ? { direction: 'ltr' as const } : undefined;
const RTL_RTL_STYLE = isRTL ? { direction: 'rtl' as const } : undefined;
const SCROLL_CONTENT_STYLE = { flexGrow: 1 };

interface ScreenContainerProps {
  children: React.ReactNode;
  stickyHeader?: React.ReactNode;
  scrollable?: boolean;
  keyboardAvoiding?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  padded?: boolean;
  safeAreaEdges?: Array<'top' | 'bottom' | 'left' | 'right'>;
  statusBar?: boolean;
  statusBarBackgroundColor?: string;
}

export default function ScreenContainer({
  children,
  stickyHeader,
  scrollable = false,
  keyboardAvoiding = false,
  refreshing = false,
  onRefresh,
  padded = true,
  safeAreaEdges = ['top', 'bottom'],
  statusBar = true,
  statusBarBackgroundColor,
}: ScreenContainerProps) {
  // Variables
  const { theme, isDark } = useTheme();

  // Render helpers
  const renderContent = () => {
    if (scrollable) {
      return (
        <ScrollView
          contentContainerStyle={SCROLL_CONTENT_STYLE}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          style={RTL_LTR_STYLE}
          refreshControl={
            onRefresh ? (
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={theme.primary}
                colors={[theme.primary]}
              />
            ) : undefined
          }>
          <View className={padded ? 'px-4' : undefined} style={RTL_RTL_STYLE}>
            {children}
          </View>
        </ScrollView>
      );
    }

    return <View className={`flex-1${padded ? ' px-4' : ''}`}>{children}</View>;
  };

  const renderWithKeyboard = () => {
    if (keyboardAvoiding) {
      return (
        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
          {renderContent()}
        </KeyboardAvoidingView>
      );
    }

    return renderContent();
  };

  // Render
  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: theme.background }}
      edges={safeAreaEdges}>
      {statusBar && (
        <StatusBar
          barStyle={isDark ? 'light-content' : 'dark-content'}
          backgroundColor={statusBarBackgroundColor ?? theme.background}
        />
      )}
      {stickyHeader}
      {renderWithKeyboard()}
    </SafeAreaView>
  );
}
