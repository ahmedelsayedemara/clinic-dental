import React from 'react';
import { View } from 'react-native';
import { Text } from '@/components/UI';
import { useTheme } from '@/theme/ThemeProvider';
import { AppointmentStatus } from '@/api/services/appointmentService/appointmentInterface';

interface AppointmentStatusBadgeProps {
  status: AppointmentStatus;
}

function getStatusColors(status: AppointmentStatus, theme: ReturnType<typeof useTheme>['theme']) {
  switch (status) {
    case 'confirmed':
      return { bg: theme.success + '22', text: theme.success };
    case 'cancelled':
      return { bg: theme.error + '22', text: theme.error };
    case 'completed':
      return { bg: theme.primary + '22', text: theme.primary };
    case 'pending':
    default:
      return { bg: '#F5A623' + '22', text: '#F5A623' };
  }
}

function getStatusLabel(status: AppointmentStatus): string {
  switch (status) {
    case 'confirmed':
      return $t('APPOINTMENTS.STATUS_CONFIRMED');
    case 'cancelled':
      return $t('APPOINTMENTS.STATUS_CANCELLED');
    case 'completed':
      return $t('APPOINTMENTS.STATUS_COMPLETED');
    case 'pending':
    default:
      return $t('APPOINTMENTS.STATUS_PENDING');
  }
}

export default function AppointmentStatusBadge({ status }: AppointmentStatusBadgeProps) {
  const { theme } = useTheme();
  const colors = getStatusColors(status, theme);

  return (
    <View
      className="px-2.5 py-1 rounded-full"
      style={{ backgroundColor: colors.bg }}>
      <Text className="text-xs font-ibm-medium" style={{ color: colors.text }}>
        {getStatusLabel(status)}
      </Text>
    </View>
  );
}
