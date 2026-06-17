import React from 'react';
import { View } from 'react-native';
import { Text } from '@/components/UI';
import { useTheme } from '@/theme/ThemeProvider';
import { Visit } from '@/api/services/visitService/visitInterface';

interface PaymentStatusBadgeProps {
  status: Visit['paymentStatus'];
}

/** Colored pill for a visit's payment status (paid / partial / unpaid). */
export default function PaymentStatusBadge({ status }: PaymentStatusBadgeProps) {
  const { theme } = useTheme();
  if (!status) return null;

  const color =
    status === 'paid' ? theme.success : status === 'partial' ? '#F5A623' : theme.error;

  const label =
    status === 'paid'
      ? $t('VISITS.PAYMENT_PAID')
      : status === 'partial'
      ? $t('VISITS.PAYMENT_PARTIAL')
      : $t('VISITS.PAYMENT_UNPAID');

  return (
    <View className="self-start px-3 py-1 rounded-full mb-4" style={{ backgroundColor: color + '22' }}>
      <Text className="text-sm font-ibm-medium" style={{ color }}>
        {label}
      </Text>
    </View>
  );
}
