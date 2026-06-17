import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  StatusBar,
  TouchableOpacity,
  Keyboard,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons';
import { useTheme } from '@/theme/ThemeProvider';
import { isRTL } from '@/helper';

const RTL_LTR_STYLE = isRTL ? { direction: 'ltr' as const } : undefined;
const RTL_RTL_STYLE = isRTL ? { direction: 'rtl' as const } : undefined;

interface ScreenContainerProps {
  children: React.ReactNode;
  scrollable?: boolean;
  keyboardAvoiding?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  onBack?: () => void;
  padded?: boolean;
  safeAreaEdges?: Array<'top' | 'bottom' | 'left' | 'right'>;
  statusBar?: boolean;
  statusBarBackgroundColor?: string;
  stickyHeader?: React.ReactNode;
  stickyFooter?: React.ReactNode;
  backgroundColor?: string;
}

export default function ScreenContainer({
  children,
  stickyHeader,
  stickyFooter,
  scrollable = false,
  keyboardAvoiding = false,
  refreshing = false,
  onRefresh,
  onBack,
  padded = true,
  safeAreaEdges = ['top', 'bottom'],
  statusBar = true,
  statusBarBackgroundColor,
  backgroundColor,
}: ScreenContainerProps) {
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    if (Platform.OS !== 'android' || !keyboardAvoiding) return;
    const showSub = Keyboard.addListener('keyboardDidShow', e => {
      setKeyboardHeight(e.endCoordinates.height);
    });
    const hideSub = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardHeight(0);
    });
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [keyboardAvoiding]);

  const renderContent = () => {
    if (scrollable) {
      const androidKeyboardPadding =
        Platform.OS === 'android' && keyboardAvoiding ? keyboardHeight : 0;
      return (
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            paddingBottom: (keyboardAvoiding ? insets.bottom + 24 : 0) + androidKeyboardPadding,
          }}
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
          <View className={padded ? 'px-4' : ''} style={[{ flexGrow: 1 }, RTL_RTL_STYLE]}>
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
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 25 : 0}>
          {renderContent()}
        </KeyboardAvoidingView>
      );
    }
    return renderContent();
  };

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: backgroundColor ?? theme.background }}
      edges={safeAreaEdges}>
      {statusBar && (
        <StatusBar
          barStyle={isDark ? 'light-content' : 'dark-content'}
          backgroundColor={statusBarBackgroundColor ?? theme.background}
        />
      )}
      {onBack && (
        <View className="px-6 pt-2">
          <TouchableOpacity
            onPress={onBack}
            activeOpacity={0.7}
            className="w-8 h-8 items-center justify-center">
            <MaterialDesignIcons
              name={isRTL ? 'chevron-right' : 'chevron-left'}
              size={24}
              color={theme.ink}
            />
          </TouchableOpacity>
        </View>
      )}
      {stickyHeader}
      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>{renderWithKeyboard()}</Animated.View>
      {stickyFooter && (
        <View
          className={`pt-3 pb-2${padded ? ' px-4' : ''}`}
          style={{
            backgroundColor: backgroundColor ?? theme.background,
            borderTopWidth: 1,
            borderTopColor: theme.cardBorder,
          }}>
          {stickyFooter}
        </View>
      )}
    </SafeAreaView>
  );
}
