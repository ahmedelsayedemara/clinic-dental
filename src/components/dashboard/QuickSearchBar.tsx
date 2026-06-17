import React, { useCallback } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons';
import { Text } from '@/components/UI';
import { useTheme } from '@/theme/ThemeProvider';

interface QuickSearchBarProps {
  onPress: () => void;
  placeholder?: string;
}

export default function QuickSearchBar({ onPress, placeholder }: QuickSearchBarProps) {
  const { theme } = useTheme();

  const handlePress = useCallback(() => {
    onPress();
  }, [onPress]);

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={handlePress}
      style={[styles.container, { backgroundColor: theme.surface, borderColor: theme.cardBorder }]}>
      <MaterialDesignIcons name="magnify" size={20} color={theme.textSecondary} />
      <Text className="text-sm font-ibm-regular flex-1 mx-2" style={{ color: theme.textSecondary }}>
        {placeholder ?? $t('DASHBOARD.QUICK_SEARCH')}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 20,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
});
