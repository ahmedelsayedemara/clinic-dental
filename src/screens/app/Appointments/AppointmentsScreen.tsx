import React, { useCallback, useRef, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons';
import ScreenContainer from '@/components/global/ScreenContainer';
import AppHeader from '@/components/global/AppHeader';
import SectionLoader from '@/components/global/SectionLoader';
import Empty from '@/components/global/Empty';
import AnimatedListItem from '@/components/global/AnimatedListItem';
import { AppointmentCard, FilterChip } from '@/components/appointments';
import { Text } from '@/components/UI';
import { useTheme } from '@/theme/ThemeProvider';
import { useAppointments } from '@/hooks/useAppointments';
import { useTabBarSpace } from '@/hooks/useTabBarSpace';
import {
  Appointment,
  AppointmentStatus,
} from '@/api/services/appointmentService/appointmentInterface';
import { RootStackParamList } from '@/types/navigation';
import { ScreenName } from '@/constants/screenName';
import { formatDate } from '@/helper';

type NavProp = NativeStackNavigationProp<RootStackParamList>;

type FilterStatus = 'all' | AppointmentStatus;

function groupByDay(
  appointments: Appointment[],
): Array<{ dateLabel: string; items: Appointment[] }> {
  const map = new Map<string, Appointment[]>();
  for (const appt of appointments) {
    const key = formatDate(appt.dateTime);
    const existing = map.get(key) ?? [];
    existing.push(appt);
    map.set(key, existing);
  }
  return Array.from(map.entries()).map(([dateLabel, items]) => ({ dateLabel, items }));
}

export default function AppointmentsScreen() {
  const navigation = useNavigation<NavProp>();

  // State
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterStatus>('all');
  const isFirstFocus = useRef(true);

  // Variables
  const { theme } = useTheme();
  const { appointments, isLoading, hasFetched, refresh } = useAppointments();
  const bottomSpace = useTabBarSpace();

  const filteredAppointments =
    activeFilter === 'all' ? appointments : appointments.filter(a => a.status === activeFilter);

  const groupedData = groupByDay(filteredAppointments);

  // Handlers / Callbacks
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }, [refresh]);

  const handleAppointmentPress = useCallback(
    (appointmentId: string) => {
      navigation.navigate(ScreenName.APPOINTMENT_DETAILS_SCREEN, { appointmentId });
    },
    [navigation],
  );

  const handleAddAppointment = useCallback(() => {
    navigation.navigate(ScreenName.ADD_EDIT_APPOINTMENT_SCREEN, undefined);
  }, [navigation]);

  // Effects — refresh the list whenever the screen regains focus (e.g. returning
  // from Add/Edit Appointment). Skip the first focus since useAppointments loads on mount.
  useFocusEffect(
    useCallback(() => {
      if (isFirstFocus.current) {
        isFirstFocus.current = false;
        return;
      }
      refresh();
    }, [refresh]),
  );

  // Render helpers
  const renderGroup = useCallback(
    ({ item, index }: { item: { dateLabel: string; items: Appointment[] }; index: number }) => (
      <AnimatedListItem index={index} itemKey={item.dateLabel}>
        {/* Day header */}
        <View className="mx-4 mt-4 mb-1 flex-row items-center " style={{ gap: 10 }}>
          <View className="w-2 h-2 rounded-full" style={{ backgroundColor: theme.primary }} />
          <Text className="text-sm font-ibm-medium" style={{ color: theme.textSecondary }}>
            {item.dateLabel}
          </Text>
        </View>

        {item.items.map(appt => (
          <AppointmentCard key={appt.id} appointment={appt} onPress={handleAppointmentPress} />
        ))}
      </AnimatedListItem>
    ),
    [theme, handleAppointmentPress],
  );

  const filterChips: Array<{ label: string; value: FilterStatus }> = [
    { label: $t('APPOINTMENTS.FILTER_ALL'), value: 'all' },
    { label: $t('APPOINTMENTS.STATUS_PENDING'), value: 'pending' },
    { label: $t('APPOINTMENTS.STATUS_CONFIRMED'), value: 'confirmed' },
  ];

  // Return UI
  return (
    <ScreenContainer safeAreaEdges={['top', 'bottom']} padded={false}>
      <AppHeader
        title={$t('APPOINTMENTS.TITLE')}
        showBack={false}
        rightElement={
          <TouchableOpacity onPress={handleAddAppointment} className="p-2" activeOpacity={0.7}>
            <MaterialDesignIcons name="plus" size={26} color={theme.primary} />
          </TouchableOpacity>
        }
      />

      {/* Filter chips */}
      <View className="px-4 pb-2">
        <FlatList
          data={filterChips}
          keyExtractor={item => item.value}
          renderItem={({ item }) => (
            <FilterChip
              label={item.label}
              isActive={activeFilter === item.value}
              onPress={() => setActiveFilter(item.value)}
            />
          )}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterList}
        />
      </View>

      {isLoading && !hasFetched && <SectionLoader style="list" />}

      {hasFetched && groupedData.length === 0 && (
        <FlatList
          data={[]}
          renderItem={null}
          keyExtractor={() => 'empty'}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={theme.primary}
              colors={[theme.primary]}
            />
          }
          ListEmptyComponent={
            <Empty
              icon={
                <MaterialDesignIcons name="calendar-blank-outline" size={64} color={theme.border} />
              }
              title={$t('APPOINTMENTS.NO_APPOINTMENTS')}
              description={$t('APPOINTMENTS.NO_APPOINTMENTS_DESC')}
              slot={
                <TouchableOpacity
                  onPress={handleAddAppointment}
                  className="flex-row items-center justify-center gap-2 py-3 px-6 rounded-xl"
                  style={{ backgroundColor: theme.primary }}>
                  <MaterialDesignIcons name="plus" size={18} color="#FFFFFF" />
                  <Text className="text-sm font-ibm-bold" style={{ color: '#FFFFFF' }}>
                    {$t('APPOINTMENTS.ADD_APPOINTMENT')}
                  </Text>
                </TouchableOpacity>
              }
            />
          }
          contentContainerStyle={{ paddingBottom: bottomSpace }}
        />
      )}

      {hasFetched && groupedData.length > 0 && (
        <FlatList
          data={groupedData}
          keyExtractor={item => item.dateLabel}
          renderItem={renderGroup}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={theme.primary}
              colors={[theme.primary]}
            />
          }
          contentContainerStyle={{ paddingBottom: bottomSpace }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  filterList: {
    paddingVertical: 4,
  },
});
