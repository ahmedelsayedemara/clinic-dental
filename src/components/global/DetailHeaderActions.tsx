import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons';
import { useTheme } from '@/theme/ThemeProvider';

interface DetailHeaderActionsProps {
  onEdit: () => void;
  onDelete: () => void;
}

/** Edit + delete icon buttons for a detail screen's AppHeader `rightElement`. */
export default function DetailHeaderActions({ onEdit, onDelete }: DetailHeaderActionsProps) {
  const { theme } = useTheme();
  return (
    <View className="flex-row items-center gap-2">
      <TouchableOpacity onPress={onEdit} className="p-2">
        <MaterialDesignIcons name="pencil-outline" size={22} color={theme.primary} />
      </TouchableOpacity>
      <TouchableOpacity onPress={onDelete} className="p-2">
        <MaterialDesignIcons name="delete-outline" size={22} color={theme.error} />
      </TouchableOpacity>
    </View>
  );
}
