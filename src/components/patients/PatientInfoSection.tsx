import React from 'react';
import { View } from 'react-native';
import { Text } from '@/components/UI';
import { useTheme } from '@/theme/ThemeProvider';
import { formatDate } from '@/helper';
import { Patient } from '@/api/services/patientService/patientInterface';

interface PatientInfoSectionProps {
  patient: Patient;
}

interface InfoRowProps {
  label: string;
  value: string;
}

function InfoRow({ label, value }: InfoRowProps) {
  const { theme } = useTheme();
  return (
    <View className="flex-row py-3" style={{ borderBottomWidth: 1, borderBottomColor: theme.border }}>
      <Text
        className="text-sm font-ibm-medium w-32"
        style={{ color: theme.textSecondary }}>
        {label}
      </Text>
      <Text
        className="text-sm font-ibm-regular flex-1"
        style={{ color: theme.text }}>
        {value}
      </Text>
    </View>
  );
}

export default function PatientInfoSection({ patient }: PatientInfoSectionProps) {
  const { theme } = useTheme();

  const genderLabel =
    patient.gender === 'male'
      ? $t('PATIENTS.GENDER_MALE')
      : patient.gender === 'female'
        ? $t('PATIENTS.GENDER_FEMALE')
        : undefined;

  return (
    <View className="mx-4 mb-4">
      {/* Section title */}
      <Text
        className="text-base font-ibm-bold mb-3 mt-4"
        style={{ color: theme.text }}>
        {$t('PATIENTS.PERSONAL_INFO')}
      </Text>

      <View
        style={{ backgroundColor: theme.card, borderRadius: 12, borderColor: theme.cardBorder, borderWidth: 1 }}
        className="px-4">
        <InfoRow label={$t('PATIENTS.FULL_NAME')} value={patient.fullName} />
        <InfoRow label={$t('PATIENTS.MOBILE')} value={patient.mobile} />

        {patient.dateOfBirth && (
          <InfoRow
            label={$t('PATIENTS.DATE_OF_BIRTH')}
            value={formatDate(patient.dateOfBirth)}
          />
        )}

        {genderLabel && (
          <InfoRow label={$t('PATIENTS.GENDER')} value={genderLabel} />
        )}

        {patient.address && (
          <InfoRow label={$t('PATIENTS.ADDRESS')} value={patient.address} />
        )}

        {patient.notes && (
          <View className="py-3">
            <Text
              className="text-sm font-ibm-medium mb-1"
              style={{ color: theme.textSecondary }}>
              {$t('PATIENTS.NOTES')}
            </Text>
            <Text
              className="text-sm font-ibm-regular"
              style={{ color: theme.text }}>
              {patient.notes}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}
