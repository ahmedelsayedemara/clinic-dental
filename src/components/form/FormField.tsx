import React from 'react';
import { View } from 'react-native';
import { Text } from '@/components/UI';
import { useField } from 'formik';
import { useTheme } from '@/theme/ThemeProvider';

interface ChildProps {
  name: string;
  'aria-describedby'?: string;
}

interface FormFieldProps {
  name: string;
  label?: string;
  children: React.ReactElement<ChildProps>;
  className?: string;
}

export const FormField = ({ name, label, children, className = '' }: FormFieldProps) => {
  const [, meta] = useField(name);
  const hasError = meta.touched && meta.error;
  const { theme } = useTheme();

  return (
    <View className={`mb-4 ${className}`}>
      {label && (
        <Text style={{ color: theme.text }} className="mb-2 font-ibm-medium">
          {label}
        </Text>
      )}
      {React.cloneElement(children, {
        name,
        'aria-describedby': hasError ? `${name}-error` : undefined,
      })}
      {hasError && <Text className="text-error text-sm mt-1">{meta.error}</Text>}
    </View>
  );
};
