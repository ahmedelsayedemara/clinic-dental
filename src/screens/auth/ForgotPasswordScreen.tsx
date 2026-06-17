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
import AppHeader from '@/components/global/AppHeader';
import { useTheme } from '@/theme/ThemeProvider';

type Props = NativeStackScreenProps<RootStackParamList, ScreenName.FORGOT_PASSWORD_SCREEN>;

const forgotPasswordSchema = Yup.object().shape({
  email: Yup.string()
    .email($t('VALIDATORS.EMAIL'))
    .required($t('VALIDATORS.REQUIRED')),
});

const INITIAL_VALUES = { email: '' };

export default function ForgotPasswordScreen({ navigation }: Props) {
  // State
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);

  // Variables
  const { theme } = useTheme();

  // Handlers / Callbacks
  const handleSendReset = useCallback(async (values: typeof INITIAL_VALUES) => {
    setIsLoading(true);
    try {
      await authService.postForgotPasswordRequest({ email: values.email.trim() });
      setIsEmailSent(true);
      Toast.show({
        type: 'success',
        text2: $t('AUTH.RESET_LINK_SENT'),
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text2: $t('COMMON.ERROR_OCCURRED'),
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  // Render
  return (
    <ScreenContainer scrollable keyboardAvoiding safeAreaEdges={['top', 'bottom']}>
      <AppHeader
        title={$t('AUTH.RESET_PASSWORD')}
        onBack={handleBack}
        showBack
      />

      <View className="mt-8 mb-10">
        <Text
          className="text-base font-ibm-regular text-center"
          style={{ color: theme.textSecondary }}>
          {isEmailSent ? $t('AUTH.RESET_LINK_HINT') : $t('AUTH.RESET_PASSWORD_HINT')}
        </Text>
      </View>

      {!isEmailSent && (
        <Formik
          initialValues={INITIAL_VALUES}
          validationSchema={forgotPasswordSchema}
          onSubmit={handleSendReset}>
          {({ handleSubmit }) => (
            <View className="gap-2">
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
      )}

      {isEmailSent && (
        <FormButton
          title={$t('GLOBAL.BACK')}
          variant="outline"
          onPress={handleBack}
        />
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({});
