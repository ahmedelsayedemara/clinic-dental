import React from 'react';
import { StyleSheet, TouchableOpacity, View, Animated } from 'react-native';
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons';
import { Text } from '@/components/UI';
import { useTheme } from '@/theme/ThemeProvider';
import { useScalePress } from '@/hooks/useAnimations';
import { formatDate } from '@/helper';
import { Visit, PaymentStatus } from '@/api/services/visitService/visitInterface';

interface VisitCardProps {
  visit: Visit;
  onPress: (visitId: string) => void;
}

interface PaymentChipProps {
  status: PaymentStatus;
  amountDue?: number;
  amountTotal?: number;
}

function PaymentChip({ status, amountDue, amountTotal }: PaymentChipProps) {
  const { theme } = useTheme();

  const chipColor =
    status === 'paid'
      ? theme.success
      : status === 'partial'
        ? '#F5A623'
        : theme.error;

  const chipLabel =
    status === 'paid'
      ? $t('VISITS.PAYMENT_PAID')
      : status === 'partial'
        ? $t('VISITS.PAYMENT_PARTIAL')
        : $t('VISITS.PAYMENT_UNPAID');

  return (
    <View
      className="px-2 py-0.5 rounded-full"
      style={{ backgroundColor: chipColor + '22' }}>
      <Text
        className="text-xs font-ibm-medium"
        style={{ color: chipColor }}>
        {chipLabel}
        {status === 'partial' && amountDue !== undefined
          ? ` (${amountDue})`
          : ''}
      </Text>
    </View>
  );
}

export default function VisitCard({ visit, onPress }: VisitCardProps) {
  const { theme } = useTheme();
  const { onPressIn, onPressOut, animatedStyle } = useScalePress(0.97);

  return (
    <Animated.View style={[animatedStyle]}>
      <TouchableOpacity
        style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}
        onPress={() => onPress(visit.id)}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        activeOpacity={1}>
        {/* Top row: date + payment chip */}
        <View className="flex-row items-center justify-between mb-2">
          <View className="flex-row items-center gap-1.5">
            <MaterialDesignIcons name="calendar-outline" size={15} color={theme.primary} />
            <Text className="text-sm font-ibm-medium" style={{ color: theme.primary }}>
              {formatDate(visit.visitDate)}
            </Text>
          </View>

          {visit.paymentStatus && (
            <PaymentChip
              status={visit.paymentStatus}
              amountDue={visit.amountDue}
              amountTotal={visit.amountTotal}
            />
          )}
        </View>

        {/* Treatment */}
        {visit.treatmentPerformed ? (
          <Text
            className="text-sm font-ibm-regular mb-1"
            style={{ color: theme.text }}
            numberOfLines={2}>
            {visit.treatmentPerformed}
          </Text>
        ) : null}

        {/* Diagnosis */}
        {visit.diagnosis ? (
          <Text
            className="text-xs font-ibm-regular"
            style={{ color: theme.textSecondary }}
            numberOfLines={1}>
            {$t('VISITS.DIAGNOSIS')}: {visit.diagnosis}
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
