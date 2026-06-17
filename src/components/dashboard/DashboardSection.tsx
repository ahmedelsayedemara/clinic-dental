import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import type { ReactNode } from 'react';
import { Text } from '@/components/UI';
import { useTheme } from '@/theme/ThemeProvider';

interface DashboardSectionProps {
  title: string;
  children: ReactNode;
  viewAllLabel?: string;
  onViewAll?: () => void;
}

export default function DashboardSection({
  title,
  children,
  viewAllLabel,
  onViewAll,
}: DashboardSectionProps) {
  const { theme } = useTheme();

  return (
    <View className="mb-4">
      <View className="mx-4 flex-row items-center justify-between mb-3 mt-2">
        <Text className="text-base font-ibm-bold" style={{ color: theme.text }}>
          {title}
        </Text>

        {viewAllLabel && onViewAll && (
          <TouchableOpacity onPress={onViewAll} activeOpacity={0.7}>
            <Text className="text-sm font-ibm-medium" style={{ color: theme.primary }}>
              {viewAllLabel}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {children}
    </View>
  );
}
