import React from 'react';
import { Text } from '@/components/UI';
import { useTheme } from '@/theme/ThemeProvider';

interface SectionHeaderProps {
  title: string;
  className?: string;
}

export default function SectionHeader({ title, className }: SectionHeaderProps) {
  const { theme } = useTheme();
  return (
    <Text
      className={className ?? 'text-base font-ibm-bold mt-4 mb-3'}
      style={{ color: theme.text }}>
      {title}
    </Text>
  );
}
