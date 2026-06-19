import React from 'react';
import { StyleSheet, View } from 'react-native';
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons';
import { Text } from '@/components/UI';
import { useTheme } from '@/theme/ThemeProvider';
import { formatDate } from '@/helper';
import { Patient } from '@/api/services/patientService/patientInterface';

interface ArchiveInfoCardProps {
  patient: Patient;
}

interface ArchiveRowProps {
  label: string;
  value: string;
}

function ArchiveRow({ label, value }: ArchiveRowProps) {
  const { theme } = useTheme();
  return (
    <View className="flex-1 items-center py-2">
      <Text className="text-xs font-ibm-medium mb-1" style={{ color: theme.muted }}>
        {label}
      </Text>
      <Text className="text-sm font-ibm-bold" style={{ color: theme.text }}>
        {value}
      </Text>
    </View>
  );
}

export default function ArchiveInfoCard({ patient }: ArchiveInfoCardProps) {
  const { theme } = useTheme();

  return (
    <View className="mx-4 mb-4">
      {/* Section title */}
      <View className="flex-row items-center mb-3 mt-2">
        <MaterialDesignIcons name="archive-outline" size={18} color={theme.primary} />
        <Text className="text-base font-ibm-bold ml-2" style={{ color: theme.text }}>
          {$t('PATIENTS.FILE_LOCATION')}
        </Text>
      </View>

      <View
        style={[
          styles.card,
          { backgroundColor: theme.primary + '12', borderColor: theme.primary + '30' },
        ]}>
        {/* File number — hero display */}
        <View className="items-center mb-4">
          <Text className="text-xs font-ibm-medium mb-1" style={{ color: theme.primary }}>
            {$t('PATIENTS.FILE_NUMBER')}
          </Text>
          <Text className="text-4xl font-ibm-bold" style={{ color: theme.primary }}>
            #{patient.fileNumber}
          </Text>
        </View>

        {/* Entry date */}
        {patient.entryDate ? (
          <View
            style={{ borderTopWidth: 1, borderTopColor: theme.primary + '20' }}
            className="pt-3">
            <View className="flex-row">
              <ArchiveRow label={$t('PATIENTS.ENTRY_DATE')} value={formatDate(patient.entryDate)} />
            </View>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    borderWidth: 1.5,
    paddingHorizontal: 16,
    paddingVertical: 18,
    shadowColor: '#0E7490',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
});
