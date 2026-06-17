import React from 'react';
import { View } from 'react-native';
import { Text } from '@/components/UI';
import { useTheme } from '@/theme/ThemeProvider';
import { formatDate } from '@/helper';
import { Patient } from '@/api/services/patientService/patientInterface';
import SectionHeader from '@/components/global/SectionHeader';
import InfoRow from '@/components/global/InfoRow';
import Card from '@/components/global/Card';

interface PatientInfoSectionProps {
  patient: Patient;
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
      <SectionHeader title={$t('PATIENTS.PERSONAL_INFO')} />

      <Card>
        <InfoRow label={$t('PATIENTS.FULL_NAME')} value={patient.fullName} />
        <InfoRow label={$t('PATIENTS.MOBILE')} value={patient.mobile} />

        {patient.dateOfBirth && (
          <InfoRow label={$t('PATIENTS.DATE_OF_BIRTH')} value={formatDate(patient.dateOfBirth)} />
        )}

        {genderLabel && <InfoRow label={$t('PATIENTS.GENDER')} value={genderLabel} />}

        {patient.address && <InfoRow label={$t('PATIENTS.ADDRESS')} value={patient.address} />}

        {patient.notes && (
          <View className="py-3">
            <Text className="text-sm font-ibm-medium mb-1" style={{ color: theme.textSecondary }}>
              {$t('PATIENTS.NOTES')}
            </Text>
            <Text className="text-sm font-ibm-regular" style={{ color: theme.text }}>
              {patient.notes}
            </Text>
          </View>
        )}
      </Card>
    </View>
  );
}
