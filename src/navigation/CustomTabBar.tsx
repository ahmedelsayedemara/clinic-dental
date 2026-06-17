import React, { useRef, useEffect } from 'react';
import { View, TouchableOpacity, Platform, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { ScreenName } from '@/constants/screenName';
import { colors } from '@/theme/colors';
import { useTheme } from '@/theme/ThemeProvider';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { Text } from '@/components/UI';

export default function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { theme, isDark } = useTheme();
  const scales = useRef(state.routes.map(() => new Animated.Value(1))).current;

  useEffect(() => {
    state.routes.forEach((_, index) => {
      Animated.spring(scales[index], {
        toValue: state.index === index ? 1.15 : 1,
        useNativeDriver: true,
        speed: 20,
        bounciness: 12,
      }).start();
    });
  }, [state.index]);

  const getIcon = (routeName: string, isFocused: boolean): string => {
    const color = isFocused ? colors.white : theme.textSecondary;
    switch (routeName) {
      case ScreenName.DASHBOARD_SCREEN:
        return isFocused ? 'home' : 'home-outline';
      case ScreenName.PATIENTS_SCREEN:
        return isFocused ? 'people' : 'people-outline';
      case ScreenName.APPOINTMENTS_SCREEN:
        return isFocused ? 'calendar' : 'calendar-outline';
      case ScreenName.MORE_SCREEN:
        return isFocused ? 'ellipsis-horizontal' : 'ellipsis-horizontal-outline';
      default:
        return 'home-outline';
    }
  };

  const getLabel = (routeName: string): string => {
    switch (routeName) {
      case ScreenName.DASHBOARD_SCREEN:
        return $t('TABS.DASHBOARD');
      case ScreenName.PATIENTS_SCREEN:
        return $t('TABS.PATIENTS');
      case ScreenName.APPOINTMENTS_SCREEN:
        return $t('TABS.APPOINTMENTS');
      case ScreenName.MORE_SCREEN:
        return $t('TABS.MORE');
      default:
        return '';
    }
  };

  return (
    <View
      className="absolute bottom-0 left-0 right-0 px-[15px]"
      style={{ paddingBottom: Math.max(insets.bottom, 8) }}>
      <View
        className="flex-row rounded-[20px] h-16 items-center justify-around"
        style={[
          { backgroundColor: theme.card },
          Platform.select({
            ios: {
              shadowColor: isDark ? colors.ink : colors.shadow,
              shadowOffset: { width: 0, height: -4 },
              shadowOpacity: isDark ? 0.3 : 0.06,
              shadowRadius: 12,
            },
            android: {
              elevation: 12,
            },
          }),
        ]}>
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const iconName = getIcon(route.name, isFocused);
          const iconColor = isFocused ? colors.white : theme.textSecondary;

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              activeOpacity={0.7}
              className="flex-1 items-center justify-center h-16">
              {isFocused && (
                <View
                  className="absolute w-[46px] h-[46px] rounded-full"
                  style={{ backgroundColor: colors.primary }}
                />
              )}
              <Animated.View style={{ transform: [{ scale: scales[index] }] }}>
                <Ionicons name={iconName as any} size={22} color={iconColor} />
              </Animated.View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
