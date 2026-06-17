import React from 'react';
import { StyleSheet, View } from 'react-native';
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons';
import { Text } from '@/components/UI';
import { useTheme } from '@/theme/ThemeProvider';
import { Patient } from '@/api/services/patientService/patientInterface';

interface MedicalInfoSectionProps {
  patient: Patient;
}

interface MedicalFieldProps {
  label: string;
  value: string;
  iconName: any;
}

function MedicalField({ label, value, iconName }: MedicalFieldProps) {
  const { theme } = useTheme();
  return (
    <View style={[styles.fieldBox, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
      <View className="flex-row items-center mb-2">
        <MaterialDesignIcons name={iconName} size={16} color={theme.primary} />
        <Text className="text-sm font-ibm-bold ml-2" style={{ color: theme.text }}>
          {label}
        </Text>
      </View>
      <Text className="text-sm font-ibm-regular leading-5" style={{ color: theme.textSecondary }}>
        {value}
      </Text>
    </View>
  );
}

export default function MedicalInfoSection({ patient }: MedicalInfoSectionProps) {
  const { theme } = useTheme();

  const hasAny = patient.medicalHistory || patient.diagnosis || patient.treatmentPlan;
  if (!hasAny) return null;

  return (
    <View className="mx-4 mb-4">
      {/* Section title */}
      <View className="flex-row items-center mb-3 mt-2">
        <MaterialDesignIcons name="medical-bag" size={18} color={theme.primary} />
        <Text className="text-base font-ibm-bold ml-2" style={{ color: theme.text }}>
          {$t('PATIENTS.MEDICAL_SECTION')}
        </Text>
      </View>

      {patient.medicalHistory && (
        <MedicalField
          label={$t('PATIENTS.MEDICAL_HISTORY')}
          value={patient.medicalHistory}
          iconName="clipboard-text-outline"
        />
      )}

      {patient.diagnosis && (
        <MedicalField
          label={$t('PATIENTS.DIAGNOSIS')}
          value={patient.diagnosis}
          iconName="magnify"
        />
      )}

      {patient.treatmentPlan && (
        <MedicalField
          label={$t('PATIENTS.TREATMENT_PLAN')}
          value={patient.treatmentPlan}
          iconName="medical-bag"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  fieldBox: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
});
