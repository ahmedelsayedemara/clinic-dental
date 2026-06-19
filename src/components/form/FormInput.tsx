import React, { useState, useContext } from 'react';
import { TextInputProps, View, TextInput, Pressable } from 'react-native';
import { useField, FormikContext } from 'formik';
import { Text } from '@/components/UI';
import { useTheme } from '@/theme/ThemeProvider';
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons';
import { isRTL } from '@/helper';
import { useFieldRequired } from '@/helper/useFieldRequired';
import { FormLabel } from './FormLabel';

interface FormInputProps extends TextInputProps {
  name: string;
  label?: string;
  required?: boolean;
  error?: string;
  // Optional pre-store transform — every keystroke / paste passes through this
  // before the value is committed to Formik. Use for normalisers like
  // `sanitizeIban` or `text => text.toUpperCase()`.
  transform?: (text: string) => string;
}

export const FormInput = ({
  name,
  label,
  required,
  secureTextEntry,
  error,
  transform,
  ...props
}: FormInputProps) => {
  const formik = useContext(FormikContext);
  const formikField = formik ? useField(name) : null;
  const autoRequired = useFieldRequired(name);
  const isRequired = required ?? autoRequired;

  const [showPassword, setShowPassword] = useState(false);
  const { theme } = useTheme();

  const fieldValue = formikField ? formikField[0].value : props.value;
  const fieldError = formikField ? formikField[1].touched && formikField[1].error : error;
  const handleChangeText = formikField
    ? (value: string) => formikField[2].setValue(transform ? transform(value) : value)
    : (text: string) => props.onChangeText?.(transform ? transform(text) : text);
  const handleBlur = formikField ? () => formikField[2].setTouched(true) : props.onBlur;

  return (
    <View className="mb-[10px] w-full">
      {label && <FormLabel label={label} required={isRequired} />}
      <View className="relative">
        <TextInput
          className="rounded-xl h-16 px-4 pr-12 text-base font-ibm-regular  border"
          style={{
            backgroundColor: theme.card,
            color: theme.text,
            borderColor: fieldError ? theme.error : theme.border,
            textAlign: isRTL ? 'right' : 'left',
          }}
          onChangeText={handleChangeText}
          onBlur={handleBlur}
          value={fieldValue}
          placeholderTextColor={theme.textSecondary}
          secureTextEntry={secureTextEntry && !showPassword}
          {...props}
        />
        {secureTextEntry && (
          <Pressable
            onPress={() => setShowPassword(prev => !prev)}
            className="absolute right-4 top-[22px]">
            <MaterialDesignIcons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={theme.text}
            />
          </Pressable>
        )}
      </View>
      {fieldError && <Text className="text-xs text-error mt-1 ml-1">{fieldError}</Text>}
    </View>
  );
};
