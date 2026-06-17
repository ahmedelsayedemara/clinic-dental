import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';

interface InputProps extends Omit<TextInputProps, 'className'> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
  containerClassName?: string;
  inputClassName?: string;
}

export default function Input({
  label,
  error,
  leftIcon,
  rightIcon,
  onRightIconPress,
  containerClassName = '',
  inputClassName = '',
  ...textInputProps
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const { theme } = useTheme();

  const borderClass = error
    ? 'border-red-500'
    : isFocused
      ? 'border-primary'
      : 'border-neutral-300 dark:border-neutral-600';

  return (
    <View className={`mb-4 ${containerClassName}`}>
      {label && (
        <Text className="font-ibm-medium text-sm text-neutral-700 dark:text-neutral-300 mb-2">
          {label}
        </Text>
      )}

      <View
        className={`flex-row items-center border rounded-xl px-4 bg-white dark:bg-neutral-800 ${borderClass}`}>
        {leftIcon && <View className="mr-3">{leftIcon}</View>}

        <TextInput
          className={`flex-1 py-3.5 font-ibm-regular text-base text-neutral-900 dark:text-white ${inputClassName}`}
          placeholderTextColor={theme.textSecondary}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...textInputProps}
        />

        {rightIcon && (
          <TouchableOpacity
            onPress={onRightIconPress}
            disabled={!onRightIconPress}
            activeOpacity={0.7}
            className="ml-3">
            {rightIcon}
          </TouchableOpacity>
        )}
      </View>

      {error && (
        <Text className="font-ibm-regular text-xs text-red-500 mt-1">{error}</Text>
      )}
    </View>
  );
}
