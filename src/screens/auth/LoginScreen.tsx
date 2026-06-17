import React, { useState, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Formik } from 'formik';
import * as Yup from 'yup';
import Toast from 'react-native-toast-message';

import { RootStackParamList } from '@/types/navigation';
import { ScreenName } from '@/constants/screenName';
import { authService } from '@/api/services/authService/authService';
import { Text } from '@/components/UI';
import { FormInput, FormButton } from '@/components/form';
import ScreenContainer from '@/components/global/ScreenContainer';
import { useTheme } from '@/theme/ThemeProvider';

type Props = NativeStackScreenProps<RootStackParamList, ScreenName.LOGIN_SCREEN>;

const loginSchema = Yup.object().shape({
  email: Yup.string()
    .email($t('VALIDATORS.EMAIL'))
    .required($t('VALIDATORS.REQUIRED')),
  password: Yup.string()
    .min(6, $t('VALIDATORS.MIN').replace('{min}', '6'))
    .required($t('VALIDATORS.REQUIRED')),
});

const INITIAL_VALUES = {
  email: '',
  password: '',
};

export default function LoginScreen({ navigation }: Props) {
  // State
  const [isLoading, setIsLoading] = useState(false);

  // Variables
  const { theme } = useTheme();

  // Handlers / Callbacks
  const handleLogin = useCallback(
    async (values: typeof INITIAL_VALUES) => {
      setIsLoading(true);
      try {
        await authService.postLoginRequest({
          email: values.email.trim(),
          password: values.password,
        });
        // Auth state listener in FirebaseProvider will update the store
      } catch (error) {
        Toast.show({
          type: 'error',
          text2: $t('AUTH.LOGIN_ERROR'),
        });
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const handleForgotPassword = useCallback(() => {
    navigation.navigate(ScreenName.FORGOT_PASSWORD_SCREEN);
  }, [navigation]);

  // Render
  return (
    <ScreenContainer scrollable keyboardAvoiding safeAreaEdges={['top', 'bottom']}>
      {/* Header */}
      <View className="mt-16 mb-10 items-center">
        <Text
          className="text-3xl font-ibm-bold text-center mb-2"
          style={{ color: theme.primary }}>
          {$t('GLOBAL.APP_NAME')}
        </Text>
        <Text
          className="text-base font-ibm-regular text-center"
          style={{ color: theme.textSecondary }}>
          {$t('AUTH.WELCOME_SUBTITLE')}
        </Text>
      </View>

      {/* Form */}
      <Formik
        initialValues={INITIAL_VALUES}
        validationSchema={loginSchema}
        onSubmit={handleLogin}>
        {({ handleSubmit }) => (
          <View className="gap-2">
            <FormInput
              name="email"
              label={$t('AUTH.EMAIL')}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
            <FormInput
              name="password"
              label={$t('AUTH.PASSWORD')}
              secureTextEntry
            />

            {/* Forgot Password */}
            <View className="items-end mb-4">
              <Text
                className="text-sm font-ibm-medium"
                style={{ color: theme.primary }}
                onPress={handleForgotPassword}>
                {$t('AUTH.FORGOT_PASSWORD')}
              </Text>
            </View>
            <View>

              <FormButton
                title={$t('AUTH.LOGIN')}
                onPress={() => handleSubmit()}
                loading={isLoading}

              />
            </View>

          </View>
        )}
      </Formik>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({});
