import React from 'react';
import { View } from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { FormInput, FormButton } from '@/components/form';
import { FormSchemaProvider } from '@/helper/useFieldRequired';

export interface ForgotPasswordFormValues {
  email: string;
}

interface ForgotPasswordFormProps {
  isLoading: boolean;
  onSubmit: (values: ForgotPasswordFormValues) => void;
}

const validationSchema = Yup.object().shape({
  email: Yup.string().email($t('VALIDATORS.EMAIL')).required($t('VALIDATORS.REQUIRED')),
});

const INITIAL_VALUES: ForgotPasswordFormValues = { email: '' };

export default function ForgotPasswordForm({ isLoading, onSubmit }: ForgotPasswordFormProps) {
  return (
    <FormSchemaProvider schema={validationSchema}>
      <Formik initialValues={INITIAL_VALUES} validationSchema={validationSchema} onSubmit={onSubmit}>
        {({ handleSubmit }) => (
          <View>
            <FormInput
              name="email"
              label={$t('AUTH.EMAIL')}
              placeholder={$t('AUTH.EMAIL_PLACEHOLDER')}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
            <FormButton
              title={$t('AUTH.SEND_RESET_LINK')}
              onPress={() => handleSubmit()}
              loading={isLoading}
            />
          </View>
        )}
      </Formik>
    </FormSchemaProvider>
  );
}
