import React from 'react';
import { TextInputProps, View, TextInput } from 'react-native';
import { useField } from 'formik';
import { Text } from '@/components/UI';
import { useTheme } from '@/theme/ThemeProvider';
import { isRTL } from '@/helper';

interface FormTextAreaInputProps extends TextInputProps {
  name: string;
  label?: string;
}

export const FormTextAreaInput = ({ name, label, ...props }: FormTextAreaInputProps) => {
  const [field, meta, helpers] = useField(name);
  const hasError = meta.touched && meta.error;
  const { theme } = useTheme();

  return (
    <View className="mb-[10px] w-full">
      {label && (
        <Text style={{ color: theme.text }} className="mb-2 font-ibm-medium">
          {label}
        </Text>
      )}
      <TextInput
        className="rounded-xl min-h-[164px] px-4 py-4 text-base font-ibm-regular tracking-[-0.5] border"
        style={{
          backgroundColor: theme.card,
          color: theme.text,
          borderColor: hasError ? theme.error : theme.border,
          textAlign: isRTL ? 'right' : 'left',
          textAlignVertical: 'top',
        }}
        onChangeText={value => helpers.setValue(value)}
        onBlur={() => helpers.setTouched(true)}
        value={field.value}
        placeholderTextColor={theme.textSecondary}
        multiline
        {...props}
      />
      {hasError && <Text className="text-xs text-error mt-1 ml-1">{meta.error}</Text>}
    </View>
  );
};
