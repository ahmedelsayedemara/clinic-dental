import React from 'react';
import { Text } from '@/components/UI';
import { useTheme } from '@/theme/ThemeProvider';

interface FormLabelProps {
  label: string;
  required?: boolean;
}

export const FormLabel = ({ label, required }: FormLabelProps) => {
  const { theme } = useTheme();

  return (
    <Text style={{ color: theme.text }} className="mb-2 font-ibm-medium">
      {label}
      {required && <Text style={{ color: theme.error }}> *</Text>}
    </Text>
  );
};
