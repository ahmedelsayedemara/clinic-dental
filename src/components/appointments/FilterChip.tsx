import React from 'react';
import { TouchableOpacity } from 'react-native';
import { Text } from '@/components/UI';
import { useTheme } from '@/theme/ThemeProvider';

interface FilterChipProps {
  label: string;
  isActive: boolean;
  onPress: () => void;
}

export default function FilterChip({ label, isActive, onPress }: FilterChipProps) {
  const { theme } = useTheme();
  return (
    <TouchableOpacity
      onPress={onPress}
      className="px-3 py-1.5 rounded-full mr-2"
      style={{
        backgroundColor: isActive ? theme.primary : theme.surface,
      }}>
      <Text
        className="text-xs font-ibm-medium"
        style={{ color: isActive ? '#FFFFFF' : theme.textSecondary }}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}
