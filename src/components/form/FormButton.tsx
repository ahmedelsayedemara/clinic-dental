import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, TouchableOpacityProps } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { colors } from '@/theme/colors';

interface FormButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline';
  loading?: boolean;
  className?: string;
}

export const FormButton = ({
  title,
  variant = 'primary',
  loading = false,
  className = 'rounded-[12px] py-3.5 px-4 w-full items-center justify-center',
  ...props
}: FormButtonProps) => {
  const { theme, isDark } = useTheme();

  const getVariantStyle = () => {
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

  const getTextColor = () => {
    if (variant === 'outline') {
      return isDark ? colors.white : theme.text;
    }
    return colors.white;
  };

  return (
    <TouchableOpacity
      style={getVariantStyle()}
      className={className}
      disabled={loading}
      {...props}>
      {loading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <Text
          style={{ color: getTextColor() }}
          className="text-center font-ibm-bold text-[16px]">
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};
