import React, { useState } from 'react';
import { TextInputProps, View, TextInput, Pressable } from 'react-native';
import { useField } from 'formik';
import { Text } from '@/components/UI';
import { useTheme } from '@/theme/ThemeProvider';
import Svg, { Path, Circle } from 'react-native-svg';
import { isRTL } from '@/helper';

function EyeIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path
        d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
        stroke="rgba(30,41,59,0.5)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx="12" cy="12" r="3" stroke="rgba(30,41,59,0.5)" strokeWidth="2" />
    </Svg>
  );
}

function EyeOffIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path
        d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"
        stroke="rgba(30,41,59,0.5)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M1 1l22 22"
        stroke="rgba(30,41,59,0.5)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

interface FormInputProps extends TextInputProps {
  name: string;
  label?: string;
  readOnly?: boolean;
}

export const FormInput = ({
  name,
  label,
  secureTextEntry,
  readOnly = false,
  ...props
}: FormInputProps) => {
  const [field, meta, helpers] = useField(name);
  const [showPassword, setShowPassword] = useState(false);
  const hasError = meta.touched && meta.error;
  const { theme } = useTheme();

  return (
    <View className="mb-[10px] w-full">
      {label && (
        <Text style={{ color: theme.text }} className="mb-2 font-ibm-medium">
          {label}
        </Text>
      )}
      <View className="relative">
        <TextInput
          className="rounded-xl h-16 px-4 pr-12 text-base font-ibm-regular tracking-[-0.5] border"
          style={{
            backgroundColor: readOnly ? theme.surface : theme.card,
            color: readOnly ? theme.textSecondary : theme.text,
            borderColor: hasError ? theme.error : theme.border,
            textAlign: isRTL ? 'right' : 'left',
          }}
          onChangeText={value => helpers.setValue(value)}
          onBlur={() => helpers.setTouched(true)}
          value={field.value}
          placeholderTextColor={theme.textSecondary}
          secureTextEntry={secureTextEntry && !showPassword}
          {...props}
          editable={readOnly ? false : props.editable}
        />
        {secureTextEntry && (
          <Pressable
            onPress={() => setShowPassword(prev => !prev)}
            className="absolute right-4 top-[22px]">
            {showPassword ? <EyeOffIcon /> : <EyeIcon />}
          </Pressable>
        )}
      </View>
      {hasError && <Text className="text-xs text-error mt-1 ml-1">{meta.error}</Text>}
    </View>
  );
};
