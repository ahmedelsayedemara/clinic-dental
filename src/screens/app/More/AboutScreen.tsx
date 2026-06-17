import React from 'react';
import { View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/types/navigation';
import { ScreenName } from '@/constants/screenName';
import ScreenContainer from '@/components/global/ScreenContainer';
import AppHeader from '@/components/global/AppHeader';
import { Text } from '@/components/UI';
import { useTheme } from '@/theme/ThemeProvider';

type Props = NativeStackScreenProps<RootStackParamList, ScreenName.ABOUT_SCREEN>;

export default function AboutScreen({ navigation }: Props) {
  const { theme } = useTheme();
  return (
    <ScreenContainer safeAreaEdges={['top', 'bottom']}>
      <AppHeader title={$t('MORE.ABOUT')} onBack={() => navigation.goBack()} />
      <View className="flex-1 items-center justify-center">
        <Text className="text-xl font-ibm-bold mb-2" style={{ color: theme.text }}>
          {$t('GLOBAL.APP_NAME')}
        </Text>
        <Text className="text-sm font-ibm-regular" style={{ color: theme.textSecondary }}>
          {$t('MORE.APP_VERSION')}: 1.0.0
        </Text>
      </View>
    </ScreenContainer>
  );
}
