import React, { useState, useCallback } from 'react';
import { View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Toast from 'react-native-toast-message';

import { RootStackParamList } from '@/types/navigation';
import { ScreenName } from '@/constants/screenName';
import { authService } from '@/api/services/authService/authService';
import { Text } from '@/components/UI';
import LoginForm, { LoginFormValues } from '@/components/auth/LoginForm';
import ScreenContainer from '@/components/global/ScreenContainer';
import { useTheme } from '@/theme/ThemeProvider';

type Props = NativeStackScreenProps<RootStackParamList, ScreenName.LOGIN_SCREEN>;

export default function LoginScreen({ navigation }: Props) {
  // State
  const [isLoading, setIsLoading] = useState(false);

  // Variables
  const { theme } = useTheme();

  // Handlers / Callbacks
  const handleLogin = useCallback(async (values: LoginFormValues) => {
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
  }, []);

  const handleForgotPassword = useCallback(() => {
    navigation.navigate(ScreenName.FORGOT_PASSWORD_SCREEN);
  }, [navigation]);

  // Render
  return (
    <ScreenContainer scrollable keyboardAvoiding safeAreaEdges={['top', 'bottom']}>
      {/* Header */}
      <View className="mt-16 mb-10 items-center">
        <Text className="text-3xl font-ibm-bold text-center mb-2" style={{ color: theme.primary }}>
          {$t('GLOBAL.APP_NAME')}
        </Text>
        <Text
          className="text-base font-ibm-regular text-center"
          style={{ color: theme.textSecondary }}>
          {$t('AUTH.WELCOME_SUBTITLE')}
        </Text>
      </View>

      {/* Form */}
      <LoginForm
        isLoading={isLoading}
        onSubmit={handleLogin}
        onForgotPassword={handleForgotPassword}
      />
    </ScreenContainer>
  );
}
