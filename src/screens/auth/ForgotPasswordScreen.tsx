import React, { useState, useCallback } from 'react';
import { View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Toast from 'react-native-toast-message';

import { RootStackParamList } from '@/types/navigation';
import { ScreenName } from '@/constants/screenName';
import { authService } from '@/api/services/authService/authService';
import { Text } from '@/components/UI';
import { FormButton } from '@/components/form';
import ForgotPasswordForm, { ForgotPasswordFormValues } from '@/components/auth/ForgotPasswordForm';
import ScreenContainer from '@/components/global/ScreenContainer';
import AppHeader from '@/components/global/AppHeader';
import { useTheme } from '@/theme/ThemeProvider';

type Props = NativeStackScreenProps<RootStackParamList, ScreenName.FORGOT_PASSWORD_SCREEN>;

export default function ForgotPasswordScreen({ navigation }: Props) {
  // State
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);

  // Variables
  const { theme } = useTheme();

  // Handlers / Callbacks
  const handleSendReset = useCallback(async (values: ForgotPasswordFormValues) => {
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
      <AppHeader title={$t('AUTH.RESET_PASSWORD')} onBack={handleBack} showBack />

      <View className="mt-8 mb-10">
        <Text
          className="text-base font-ibm-regular text-center"
          style={{ color: theme.textSecondary }}>
          {isEmailSent ? $t('AUTH.RESET_LINK_HINT') : $t('AUTH.RESET_PASSWORD_HINT')}
        </Text>
      </View>

      {!isEmailSent && <ForgotPasswordForm isLoading={isLoading} onSubmit={handleSendReset} />}

      {isEmailSent && (
        <FormButton title={$t('GLOBAL.BACK')} variant="outline" onPress={handleBack} />
      )}
    </ScreenContainer>
  );
}
