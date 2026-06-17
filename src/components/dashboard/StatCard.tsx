import React from 'react';
import { StyleSheet, View } from 'react-native';
import type { ReactNode } from 'react';
import { Text } from '@/components/UI';
import { useTheme } from '@/theme/ThemeProvider';

interface StatCardProps {
  icon: ReactNode;
  label: string;
  value: string | number;
  accentColor?: string;
}

export default function StatCard({ icon, label, value, accentColor }: StatCardProps) {
  const { theme } = useTheme();
  const accent = accentColor ?? theme.primary;

  return (
    <View
      style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
      <View
        className="w-10 h-10 rounded-full items-center justify-center mb-3"
        style={{ backgroundColor: accent + '1A' }}>
        {icon}
      </View>

      <Text className="text-2xl font-ibm-bold" style={{ color: theme.text }}>
        {value}
      </Text>

      <Text className="text-xs font-ibm-regular mt-1" style={{ color: theme.textSecondary }}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
});
