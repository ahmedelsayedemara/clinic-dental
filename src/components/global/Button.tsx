import React from 'react';
import {
  Animated,
  TouchableWithoutFeedback,
  Text,
  ActivityIndicator,
  ViewStyle,
} from 'react-native';
import { colors } from '@/theme/colors';
import { useTheme } from '@/theme/ThemeProvider';
import { useScalePress } from '@/hooks/useAnimations';

type ButtonVariant = 'primary' | 'secondary' | 'dark' | 'outline' | 'danger' | 'ghost';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
}

const BASE_STYLE: ViewStyle = {
  borderRadius: 12,
  paddingVertical: 16,
  alignItems: 'center',
  justifyContent: 'center',
};

export default function Button({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  fullWidth = true,
  style,
}: ButtonProps) {
  const { theme, isDark } = useTheme();
  const isDisabled = disabled || loading;
  const { onPressIn, onPressOut, animatedStyle } = useScalePress(0.97);

  const getVariantStyle = (): ViewStyle => {
    switch (variant) {
      case 'primary':
        return { backgroundColor: theme.primary };
      case 'secondary':
        return { backgroundColor: isDark ? theme.surface : colors.border };
      case 'dark':
        return { backgroundColor: isDark ? theme.primary : theme.ink };
      case 'outline':
        return { backgroundColor: 'transparent', borderWidth: 1, borderColor: theme.primary };
      case 'danger':
        return { backgroundColor: theme.error };
      case 'ghost':
        return { backgroundColor: 'transparent' };
      default:
        return { backgroundColor: theme.primary };
    }
  };

  const getTextColor = (): string => {
    switch (variant) {
      case 'primary':
        return colors.white;
      case 'dark':
        return isDark ? colors.black : colors.white;
      case 'danger':
        return colors.white;
      case 'secondary':
        return theme.text;
      case 'outline':
      case 'ghost':
        return theme.primary;
      default:
        return theme.text;
    }
  };

  const textColor = getTextColor();

  return (
    <TouchableWithoutFeedback
      onPress={onPress}
      onPressIn={isDisabled ? undefined : onPressIn}
      onPressOut={isDisabled ? undefined : onPressOut}
      disabled={isDisabled}>
      <Animated.View
        style={[
          BASE_STYLE,
          fullWidth ? { width: '100%' } : {},
          getVariantStyle(),
          isDisabled ? { opacity: 0.5 } : {},
          style,
          animatedStyle,
        ]}>
        {loading ? (
          <ActivityIndicator color={textColor} />
        ) : (
          <Text className="text-base font-ibm-bold" style={{ color: textColor }}>
            {title}
          </Text>
        )}
      </Animated.View>
    </TouchableWithoutFeedback>
  );
}
