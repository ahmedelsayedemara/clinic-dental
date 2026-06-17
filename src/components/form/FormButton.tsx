import React from 'react';
import {
  Animated,
  Text,
  ActivityIndicator,
  TouchableWithoutFeedback,
  TouchableWithoutFeedbackProps,
  ViewStyle,
} from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { colors } from '@/theme/colors';
import { useScalePress } from '@/hooks/useAnimations';

interface FormButtonProps extends TouchableWithoutFeedbackProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline';
  loading?: boolean;
  className?: string;
}

// Core layout kept as inline styles (not className) so the button renders
// correctly regardless of how NativeWind handles className on Animated.View.
const BASE_STYLE: ViewStyle = {
  borderRadius: 12,
  paddingVertical: 14,
  paddingHorizontal: 16,
  width: '100%',
  alignItems: 'center',
  justifyContent: 'center',
};

export const FormButton = ({
  title,
  variant = 'primary',
  loading = false,
  className,
  ...props
}: FormButtonProps) => {
  const { theme, isDark } = useTheme();
  const { onPressIn, onPressOut, animatedStyle } = useScalePress(0.97);

  const getVariantStyle = (): ViewStyle => {
    switch (variant) {
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderWidth: 2,
          borderColor: theme.border,
        };
      default:
        return { backgroundColor: theme.primary };
    }
  };

  const getTextColor = (): string => {
    if (variant === 'outline') {
      return isDark ? colors.white : theme.text;
    }
    return colors.white;
  };

  return (
    <TouchableWithoutFeedback
      onPressIn={loading ? undefined : onPressIn}
      onPressOut={loading ? undefined : onPressOut}
      disabled={loading}
      {...props}>
      <Animated.View className={className} style={[BASE_STYLE, getVariantStyle(), animatedStyle]}>
        {loading ? (
          <ActivityIndicator color={getTextColor()} />
        ) : (
          <Text style={{ color: getTextColor() }} className="text-center font-ibm-bold text-[16px]">
            {title}
          </Text>
        )}
      </Animated.View>
    </TouchableWithoutFeedback>
  );
};
