import React from 'react';
import { View } from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { Text } from '@/components/UI';
import { FormInput, FormButton } from '@/components/form';
import { FormSchemaProvider } from '@/helper/useFieldRequired';
import { useTheme } from '@/theme/ThemeProvider';

export interface LoginFormValues {
  email: string;
  password: string;
}

interface LoginFormProps {
  isLoading: boolean;
  onSubmit: (values: LoginFormValues) => void;
  onForgotPassword: () => void;
}

const validationSchema = Yup.object().shape({
  email: Yup.string().email($t('VALIDATORS.EMAIL')).required($t('VALIDATORS.REQUIRED')),
  password: Yup.string()
    .min(6, $t('VALIDATORS.MIN').replace('{min}', '6'))
    .required($t('VALIDATORS.REQUIRED')),
});

const INITIAL_VALUES: LoginFormValues = {
  email: '',
  password: '',
};

export default function LoginForm({ isLoading, onSubmit, onForgotPassword }: LoginFormProps) {
  const { theme } = useTheme();

  return (
    <FormSchemaProvider schema={validationSchema}>
      <Formik initialValues={INITIAL_VALUES} validationSchema={validationSchema} onSubmit={onSubmit}>
        {({ handleSubmit }) => (
          <View>
            <FormInput
              name="email"
              label={$t('AUTH.EMAIL')}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
            <FormInput name="password" label={$t('AUTH.PASSWORD')} secureTextEntry />

            {/* Forgot Password */}
            <View className="items-end mb-4">
              <Text
                className="text-sm font-ibm-medium"
                style={{ color: theme.primary }}
                onPress={onForgotPassword}>
                {$t('AUTH.FORGOT_PASSWORD')}
              </Text>
            </View>

            <FormButton
              title={$t('AUTH.LOGIN')}
              onPress={() => handleSubmit()}
              loading={isLoading}
            />
          </View>
        )}
      </Formik>
    </FormSchemaProvider>
  );
}
