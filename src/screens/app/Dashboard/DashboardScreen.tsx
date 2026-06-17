import React, { useCallback, useState } from 'react';
import { View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons';
import ScreenContainer from '@/components/global/ScreenContainer';
import SectionLoader from '@/components/global/SectionLoader';
import Empty from '@/components/global/Empty';
import { PatientCard } from '@/components/patients';
import { AppointmentCard } from '@/components/appointments';
import { StatCard, DashboardSection, QuickSearchBar } from '@/components/dashboard';
import { Text } from '@/components/UI';
import { useTheme } from '@/theme/ThemeProvider';
import { useDashboard } from '@/hooks/useDashboard';
import { ScreenName } from '@/constants/screenName';

export default function DashboardScreen() {
  // State
  const [refreshing, setRefreshing] = useState(false);

  // Variables
  const { theme } = useTheme();
  const navigation = useNavigation<any>();

  // Hooks
  const { stats, recentPatients, upcomingAppointments, isLoading, refresh } = useDashboard();

  // Handlers / Callbacks
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }, [refresh]);

  const handleSearchPress = useCallback(() => {
    navigation.navigate(ScreenName.SEARCH_SCREEN);
  }, [navigation]);

  const handlePatientPress = useCallback(
    (patientId: string) => {
      navigation.navigate(ScreenName.PATIENT_DETAILS_SCREEN, { patientId });
    },
    [navigation],
  );

  const handleAppointmentPress = useCallback(
    (appointmentId: string) => {
      navigation.navigate(ScreenName.APPOINTMENT_DETAILS_SCREEN, { appointmentId });
    },
    [navigation],
  );

  const handleViewAllPatients = useCallback(() => {
    navigation.navigate(ScreenName.PATIENTS_SCREEN);
  }, [navigation]);

  // Render helpers
  const renderStats = () => (
    <View className="flex-row mx-4 mb-4 gap-3">
      <StatCard
        icon={
          <MaterialDesignIcons name="account-group-outline" size={22} color={theme.primary} />
        }
        label={$t('DASHBOARD.TOTAL_PATIENTS')}
        value={stats.totalPatients}
        accentColor={theme.primary}
      />
      <StatCard
        icon={
          <MaterialDesignIcons name="calendar-clock-outline" size={22} color={theme.success} />
        }
        label={$t('DASHBOARD.UPCOMING_APPOINTMENTS')}
        value={stats.upcomingAppointmentsCount}
        accentColor={theme.success}
      />
    </View>
  );

  // Return UI
  return (
    <ScreenContainer
      safeAreaEdges={['top', 'bottom']}
      scrollable
      padded={false}
      refreshing={refreshing}
      onRefresh={handleRefresh}>
      {/* Header */}
      <View className="mx-4 mt-4 mb-5">
        <Text className="text-2xl font-ibm-bold" style={{ color: theme.text }}>
          {$t('DASHBOARD.TITLE')}
        </Text>
      </View>

      {/* Quick search */}
      <QuickSearchBar onPress={handleSearchPress} />

      {/* Loading state */}
      {isLoading && (
        <>
          <SectionLoader style="card" />
          <SectionLoader style="list" />
        </>
      )}

      {/* Content */}
      {!isLoading && (
        <>
          {/* Stats row */}
          {renderStats()}

          {/* Recent Patients */}
          <DashboardSection
            title={$t('DASHBOARD.RECENT_PATIENTS')}
            viewAllLabel={$t('DASHBOARD.VIEW_ALL')}
            onViewAll={handleViewAllPatients}>
            {recentPatients.length === 0 ? (
              <Empty
                icon={
                  <MaterialDesignIcons
                    name="account-outline"
                    size={40}
                    color={theme.border}
                  />
                }
                title={$t('PATIENTS.NO_PATIENTS')}
              />
            ) : (
              recentPatients.map(patient => (
                <PatientCard key={patient.id} patient={patient} onPress={handlePatientPress} />
              ))
            )}
          </DashboardSection>

          {/* Upcoming Appointments */}
          <DashboardSection title={$t('DASHBOARD.UPCOMING_APPOINTMENTS')}>
            {upcomingAppointments.length === 0 ? (
              <Empty
                icon={
                  <MaterialDesignIcons
                    name="calendar-blank-outline"
                    size={40}
                    color={theme.border}
                  />
                }
                title={$t('APPOINTMENTS.NO_APPOINTMENTS')}
              />
            ) : (
              upcomingAppointments.map(appointment => (
                <AppointmentCard
                  key={appointment.id}
                  appointment={appointment}
                  onPress={handleAppointmentPress}
                />
              ))
            )}
          </DashboardSection>
        </>
      )}
    </ScreenContainer>
  );
}
