import React from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons';
import { Text } from '@/components/UI';
import { useTheme } from '@/theme/ThemeProvider';

interface PatientSelectorFieldProps {
  label: string;
  placeholder: string;
  /** Selected patient's display name (empty shows the placeholder). */
  value: string;
  error?: string;
  onPress: () => void;
}

export default function PatientSelectorField({
  label,
  placeholder,
  value,
  error,
  onPress,
}: PatientSelectorFieldProps) {
  const { theme } = useTheme();
  return (
    <View className="mb-4">
      <Text className="text-sm font-ibm-medium mb-2" style={{ color: theme.text }}>
        {label}
      </Text>
      <TouchableOpacity
        onPress={onPress}
        style={[
          styles.selector,
          { backgroundColor: theme.card, borderColor: error ? theme.error : theme.border },
        ]}>
        <Text
          className="text-base font-ibm-regular flex-1"
          style={{ color: value ? theme.text : theme.textSecondary }}>
          {value || placeholder}
        </Text>
        <MaterialDesignIcons name="magnify" size={20} color={theme.textSecondary} />
      </TouchableOpacity>
      {error ? <Text className="text-xs text-error mt-1 ml-1">{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  selector: {
    height: 64,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
});
