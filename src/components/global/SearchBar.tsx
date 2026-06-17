import React from 'react';
import { View } from 'react-native';
import { TextInput } from '@/components/UI';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { useTheme } from '@/theme/ThemeProvider';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export default function SearchBar({ value, onChangeText, placeholder }: SearchBarProps) {
  const { theme, isDark } = useTheme();
  const iconColor = theme.ink;

  return (
    <View className="mx-4">
      <View
        className="mb-4 h-[48px] flex-row items-center rounded-xl px-3"
        style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.08)' }}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder ?? $t('COMMON.SEARCH')}
          placeholderTextColor={isDark ? 'rgba(255,255,255,0.5)' : 'rgba(30, 41, 59, 0.50)'}
          className="flex-1 text-sm"
          style={{ color: iconColor }}
          numberOfLines={1}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="web-search"
          returnKeyType="search"
        />
        <Ionicons name="search" size={20} color={iconColor} />
      </View>
    </View>
  );
}
