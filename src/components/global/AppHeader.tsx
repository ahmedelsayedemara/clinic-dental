import React from 'react';
import { View, TouchableOpacity, Animated } from 'react-native';
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons';
import { Text } from '@/components/UI';
import { useTheme } from '@/theme/ThemeProvider';
import { useFadeIn } from '@/hooks/useAnimations';
import { isRTL } from '@/helper';

interface AppHeaderProps {
  title?: string;
  onBack?: () => void;
  showBack?: boolean;
  rightElement?: React.ReactNode;
}

export default function AppHeader({
  title,
  onBack,
  showBack = true,
  rightElement,
}: AppHeaderProps) {
  const { theme } = useTheme();
  const { style: fadeStyle } = useFadeIn(300);

  return (
    <Animated.View className="flex-row items-center h-14 px-4 pb-4" style={fadeStyle}>
      {showBack && onBack && (
        <View className="w-10 items-start justify-center">
          <TouchableOpacity
            onPress={onBack}
            className="w-8 h-8 items-center justify-center"
            activeOpacity={0.7}>
            <MaterialDesignIcons
              name={isRTL ? 'chevron-right' : 'chevron-left'}
              size={30}
              color={theme.ink}
            />
          </TouchableOpacity>
        </View>
      )}

      {title ? (
        <Text
          className="flex-1 text-center text-lg"
          style={{ fontFamily: 'IBMPlexSansArabic-SemiBold', color: theme.ink }}
          numberOfLines={1}>
          {title}
        </Text>
      ) : (
        <View className="flex-1" />
      )}

      <View className="items-end justify-center">{rightElement ?? null}</View>
    </Animated.View>
  );
}
