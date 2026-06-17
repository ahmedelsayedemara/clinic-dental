import React from 'react';
import { View } from 'react-native';
import { Text } from '@/components/UI';
import { useTheme } from '@/theme/ThemeProvider';

interface InfoBlockProps {
  label: string;
  value: string;
}

/** Stacked label + multi-line value — used for free-text fields like notes. */
export default function InfoBlock({ label, value }: InfoBlockProps) {
  const { theme } = useTheme();
  return (
    <View className="py-3">
      <Text className="text-sm font-ibm-medium mb-1" style={{ color: theme.textSecondary }}>
        {label}
      </Text>
      <Text className="text-sm font-ibm-regular" style={{ color: theme.text }}>
        {value}
      </Text>
    </View>
  );
}
