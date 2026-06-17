import React from 'react';
import { View, ViewStyle } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  style?: ViewStyle;
}

export default function Card({ children, className, style }: CardProps) {
  const { theme } = useTheme();
  return (
    <View
      style={[
        {
          backgroundColor: theme.card,
          borderRadius: 12,
          borderColor: theme.cardBorder,
          borderWidth: 1,
        },
        style,
      ]}
      className={className ?? 'px-4'}>
      {children}
    </View>
  );
}
