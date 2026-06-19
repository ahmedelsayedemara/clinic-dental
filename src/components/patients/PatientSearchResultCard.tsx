import React from 'react';
import { StyleSheet, TouchableOpacity, View, Animated } from 'react-native';
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons';
import { Text } from '@/components/UI';
import { useTheme } from '@/theme/ThemeProvider';
import { useScalePress } from '@/hooks/useAnimations';
import { formatDate } from '@/helper';
import { Patient } from '@/api/services/patientService/patientInterface';

interface PatientSearchResultCardProps {
  patient: Patient;
  onPress: (patientId: string) => void;
}

export default function PatientSearchResultCard({
  patient,
  onPress,
}: PatientSearchResultCardProps) {
  const { theme } = useTheme();
  const { onPressIn, onPressOut, animatedStyle } = useScalePress(0.97);

  const hasArchiveLocation = patient.fileNumber || patient.entryDate;

  return (
    <Animated.View style={[animatedStyle]}>
      <TouchableOpacity
        style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}
        onPress={() => onPress(patient.id)}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        activeOpacity={1}>
        {/* Row 1: Patient name */}
        <Text
          className="text-lg font-ibm-bold mb-1"
          style={{ color: theme.text }}
          numberOfLines={1}>
          {patient.fullName}
        </Text>

        {/* Row 2: Mobile */}
        <View className="flex-row items-center mb-3">
          <MaterialDesignIcons name="phone-outline" size={14} color={theme.textSecondary} />
          <Text className="text-sm font-ibm-regular ml-1.5" style={{ color: theme.textSecondary }}>
            {patient.mobile}
          </Text>
        </View>

        {/* Archive location box */}
        {hasArchiveLocation && (
          <View
            style={[
              styles.archiveBox,
              { backgroundColor: theme.cardSubtle, borderColor: theme.primary + '33' },
            ]}>
            {/* Label */}
            <View className="flex-row items-center mb-2">
              <MaterialDesignIcons name="folder-outline" size={14} color={theme.primary} />
              <Text className="text-xs font-ibm-medium ml-1" style={{ color: theme.primary }}>
                {$t('PATIENTS.FILE_LOCATION')}
              </Text>
            </View>

            {/* File number — large and bold */}
            <Text className="text-2xl font-ibm-bold mb-2" style={{ color: theme.primary }}>
              #{patient.fileNumber}
            </Text>

            {/* Entry date row */}
            {patient.entryDate && (
              <View className="flex-row items-center mb-1">
                <MaterialDesignIcons name="calendar-outline" size={13} color={theme.muted} />
                <Text
                  className="text-sm font-ibm-regular ml-1.5"
                  style={{ color: theme.textSecondary }}>
                  {formatDate(patient.entryDate)}
                </Text>
              </View>
            )}
          </View>
        )}
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
    paddingVertical: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  archiveBox: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 12,
  },
});
