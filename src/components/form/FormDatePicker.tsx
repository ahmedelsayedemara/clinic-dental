import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, Platform } from 'react-native';
import { useField } from 'formik';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme } from '@/theme/ThemeProvider';
import { colors } from '@/theme/colors';
import { Ionicons } from '@react-native-vector-icons/ionicons';

function formatDate(date: Date): string {
  const d = date.getDate().toString().padStart(2, '0');
  const m = (date.getMonth() + 1).toString().padStart(2, '0');
  return `${d}/${m}/${date.getFullYear()}`;
}

interface FormDatePickerProps {
  name: string;
  placeholder?: string;
  minimumDate?: Date;
  maximumDate?: Date;
}

export default function FormDatePicker({
  name,
  placeholder,
  minimumDate = new Date(1940, 0, 1),
  maximumDate = new Date(),
}: FormDatePickerProps) {
  const [field, meta, helpers] = useField(name);
  const [isVisible, setIsVisible] = useState(false);
  const [tempDate, setTempDate] = useState<Date | null>(null);
  const hasError = meta.touched && meta.error;
  const { theme } = useTheme();

  const currentDate = field.value ? new Date(field.value) : null;

  const handleChange = (_event: unknown, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setIsVisible(false);
      if (selectedDate) {
        helpers.setValue(selectedDate.toISOString());
      }
    } else {
      setTempDate(selectedDate || null);
    }
  };

  const handleConfirm = () => {
    if (tempDate) {
      helpers.setValue(tempDate.toISOString());
    }
    setIsVisible(false);
  };

  const handleCancel = () => {
    setTempDate(null);
    setIsVisible(false);
  };

  const showPicker = () => {
    setTempDate(currentDate || new Date(1985, 0, 1));
    setIsVisible(true);
  };

  return (
    <View className="mb-[10px]">
      <TouchableOpacity
        className="rounded-xl h-16 flex-row items-center justify-between px-4 border"
        style={{
          backgroundColor: theme.card,
          borderColor: hasError ? theme.error : theme.border,
        }}
        onPress={showPicker}
        activeOpacity={0.7}>
        <Text
          className="text-base font-ibm-regular tracking-[-0.5]"
          style={{ color: currentDate ? theme.text : theme.textSecondary }}>
          {currentDate ? formatDate(currentDate) : (placeholder ?? $t('PATIENTS.DATE_OF_BIRTH'))}
        </Text>
        <Ionicons name="calendar-outline" size={20} color={theme.textSecondary} />
      </TouchableOpacity>

      {hasError && <Text className="text-xs text-error mt-1 ml-1">{meta.error}</Text>}

      {Platform.OS === 'android' ? (
        isVisible && (
          <DateTimePicker
            value={currentDate || new Date(1985, 0, 1)}
            mode="date"
            display="default"
            minimumDate={minimumDate}
            maximumDate={maximumDate}
            onChange={handleChange}
          />
        )
      ) : (
        <Modal transparent visible={isVisible} animationType="slide">
          <View className="flex-1 justify-end">
            <View className="rounded-t-2xl" style={{ backgroundColor: theme.card }}>
              <View
                className="flex-row justify-between p-4 border-b"
                style={{ borderBottomColor: theme.border }}>
                <TouchableOpacity onPress={handleCancel}>
                  <Text className="text-base font-ibm-regular" style={{ color: theme.text }}>
                    {$t('COMMON.CANCEL')}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleConfirm}>
                  <Text className="text-base font-ibm-bold text-primary">
                    {$t('COMMON.CONFIRM')}
                  </Text>
                </TouchableOpacity>
              </View>
              <View className="h-[200px] justify-center items-center">
                <DateTimePicker
                  value={tempDate || new Date(1985, 0, 1)}
                  mode="date"
                  display="spinner"
                  minimumDate={minimumDate}
                  maximumDate={maximumDate}
                  onChange={handleChange}
                  textColor={colors.ink}
                />
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}
