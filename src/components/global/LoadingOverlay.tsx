import React from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { useLoadingStore } from '@/store/useLoadingStore';
import { useTheme } from '@/theme/ThemeProvider';

interface LoadingOverlayProps {
  message?: string;
}

export default function LoadingOverlay({ message }: LoadingOverlayProps) {
  const { isLoading } = useLoadingStore();
  const { theme } = useTheme();

  if (!isLoading) {
    return null;
  }

  return (
    <View className="absolute inset-0 z-50 items-center justify-center bg-black/40">
      <View
        className="rounded-2xl p-6 items-center min-w-[120px]"
        style={{
          backgroundColor: theme.card,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.15,
          shadowRadius: 8,
          elevation: 5,
        }}>
        <ActivityIndicator size="large" color={theme.primary} />
        {message && (
          <Text className="text-sm mt-3" style={{ color: theme.textSecondary }}>
            {message}
          </Text>
        )}
      </View>
    </View>
  );
}
