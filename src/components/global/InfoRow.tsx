import React from 'react';
import { View } from 'react-native';
import { Text } from '@/components/UI';
import { useTheme } from '@/theme/ThemeProvider';

interface InfoRowProps {
  label: string;
  value: string;
}

export default function InfoRow({ label, value }: InfoRowProps) {
  const { theme } = useTheme();
  return (
    <View className="flex-row py-3" style={{ borderBottomWidth: 1, borderBottomColor: theme.border }}>
      <Text className="text-sm font-ibm-medium w-32" style={{ color: theme.textSecondary }}>
        {label}
      </Text>
      <Text className="text-sm font-ibm-regular flex-1" style={{ color: theme.text }}>
        {value}
      </Text>
    </View>
  );
}
