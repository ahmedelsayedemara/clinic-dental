import React from 'react';
import { View, Animated } from 'react-native';
import { Text } from '@/components/UI';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '@/theme/ThemeProvider';
import Button from '@/components/global/Button';
import { useFadeInUp } from '@/hooks/useAnimations';
import type { ReactNode } from 'react';

interface EmptyProps {
  icon: ReactNode;
  description?: string;
  title?: string;
  slot?: ReactNode;
  showBack?: boolean;
  onBack?: () => void;
}

export default function Empty({
  icon,
  description,
  title,
  slot,
  showBack = false,
  onBack,
}: EmptyProps) {
  const { theme } = useTheme();
  const navigation = useNavigation<any>();
  const { style: animStyle } = useFadeInUp(500, 100, 30);

  const handleBackPress = () => {
    if (onBack) {
      onBack();
      return;
    }
    navigation.goBack();
  };

  return (
    <Animated.View style={animStyle} className="items-center justify-center px-6 py-20">
      {icon}

      {title && (
        <Text
          className="mt-4 text-[20px] font-ibm-bold text-center"
          style={{ color: theme.text }}>
          {title}
        </Text>
      )}

      <Text
        className="mt-2 text-[14px] text-center"
        style={{ color: theme.textSecondary }}>
        {description}
      </Text>

      {showBack && (
        <View className="mt-6 w-full max-w-[250px]">
          <Button title={$t('GLOBAL.BACK')} variant="outline" onPress={handleBackPress} />
        </View>
      )}

      {slot && <View className="mt-6 w-full">{slot}</View>}
    </Animated.View>
  );
}
