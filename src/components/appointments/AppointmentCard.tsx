import React from 'react';
import { StyleSheet, TouchableOpacity, View, Animated } from 'react-native';
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons';
import { Text } from '@/components/UI';
import { useTheme } from '@/theme/ThemeProvider';
import { useScalePress } from '@/hooks/useAnimations';
import { formatDate } from '@/helper';
import { Appointment } from '@/api/services/appointmentService/appointmentInterface';
import AppointmentStatusBadge from './AppointmentStatusBadge';

interface AppointmentCardProps {
  appointment: Appointment;
  onPress: (appointmentId: string) => void;
}

function formatTime(isoString: string): string {
  const date = new Date(isoString);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

export default function AppointmentCard({ appointment, onPress }: AppointmentCardProps) {
  const { theme } = useTheme();
  const { onPressIn, onPressOut, animatedStyle } = useScalePress(0.97);

  return (
    <Animated.View style={[animatedStyle]}>
      <TouchableOpacity
        style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}
        onPress={() => onPress(appointment.id)}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        activeOpacity={1}>
        {/* Top row: time + status badge */}
        <View className="flex-row items-center justify-between mb-2">
          <View className="flex-row items-center gap-1.5">
            <MaterialDesignIcons name="clock-outline" size={15} color={theme.primary} />
            <Text className="text-sm font-ibm-medium" style={{ color: theme.primary }}>
              {formatTime(appointment.dateTime)}
            </Text>
          </View>

          <AppointmentStatusBadge status={appointment.status} />
        </View>

        {/* Patient name */}
        <Text
          className="text-base font-ibm-bold mb-0.5"
          style={{ color: theme.text }}
          numberOfLines={1}>
          {appointment.patientName}
        </Text>

        {/* Date */}
        <View className="flex-row items-center gap-1 mt-0.5">
          <MaterialDesignIcons name="calendar-outline" size={13} color={theme.textSecondary} />
          <Text className="text-xs font-ibm-regular" style={{ color: theme.textSecondary }}>
            {formatDate(appointment.dateTime)}
          </Text>
        </View>

        {/* Notes preview */}
        {appointment.notes ? (
          <Text
            className="text-xs font-ibm-regular mt-2"
            style={{ color: theme.muted }}
            numberOfLines={1}>
            {appointment.notes}
          </Text>
        ) : null}
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
});
