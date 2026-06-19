import React from 'react';
import { StyleSheet, TouchableOpacity, View, Animated } from 'react-native';
import { Text } from '@/components/UI';
import { useTheme } from '@/theme/ThemeProvider';
import { useScalePress } from '@/hooks/useAnimations';
import { avatarText, formatDate } from '@/helper';
import { Patient } from '@/api/services/patientService/patientInterface';

interface PatientCardProps {
  patient: Patient;
  onPress: (patientId: string) => void;
}

export default function PatientCard({ patient, onPress }: PatientCardProps) {
  const { theme } = useTheme();
  const { onPressIn, onPressOut, animatedStyle } = useScalePress(0.97);

  return (
    <Animated.View style={[animatedStyle]}>
      <TouchableOpacity
        style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}
        onPress={() => onPress(patient.id)}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        activeOpacity={1}>
        {/* Avatar + main info */}
        <View className="flex-row items-center flex-1">
          {/* Avatar circle */}
          <View
            className="rounded-full items-center justify-center mr-3 shrink-0"
            style={{ backgroundColor: theme.primary, width: 48, height: 48 }}>
            <Text className="text-base font-ibm-bold" style={{ color: '#FFFFFF' }}>
              {avatarText(patient.fullName)}
            </Text>
          </View>

          {/* Name + mobile */}
          <View className="flex-1">
            <Text
              className="text-base font-ibm-bold"
              style={{ color: theme.text }}
              numberOfLines={1}>
              {patient.fullName}
            </Text>
            {patient.mobile ? (
              <Text
                className="text-sm font-ibm-regular mt-0.5"
                style={{ color: theme.textSecondary }}>
                {patient.mobile}
              </Text>
            ) : null}
          </View>

          {/* Right chips */}
          <View className="items-end gap-1">
            {/* File number chip */}
            {patient.fileNumber ? (
              <View
                className="px-2 py-0.5 rounded-full"
                style={{ backgroundColor: theme.cardSubtle }}>
                <Text className="text-xs font-ibm-medium" style={{ color: theme.primary }}>
                  #{patient.fileNumber}
                </Text>
              </View>
            ) : null}

            {/* Entry date chip */}
            {patient.entryDate ? (
              <View className="px-2 py-0.5 rounded-full" style={{ backgroundColor: theme.surface }}>
                <Text className="text-xs font-ibm-regular" style={{ color: theme.muted }}>
                  {formatDate(patient.entryDate)}
                </Text>
              </View>
            ) : null}
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 72,
    justifyContent: 'center',
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
