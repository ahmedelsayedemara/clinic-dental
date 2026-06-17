import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Formik } from 'formik';
import * as Yup from 'yup';
import Toast from 'react-native-toast-message';
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons';
import ScreenContainer from '@/components/global/ScreenContainer';
import AppHeader from '@/components/global/AppHeader';
import SectionLoader from '@/components/global/SectionLoader';
import BottomSheetModal from '@/components/global/BottomSheetModal';
import SearchBar from '@/components/global/SearchBar';
import { FormDatePicker, FormTextAreaInput, FormSelect, FormButton } from '@/components/form';
import { Text } from '@/components/UI';
import { useTheme } from '@/theme/ThemeProvider';
import { appointmentService } from '@/api/services/appointmentService/appointmentService';
import {
  Appointment,
  AddAppointmentPayload,
  AppointmentStatus,
} from '@/api/services/appointmentService/appointmentInterface';
import { patientService } from '@/api/services/patientService/patientService';
import { Patient } from '@/api/services/patientService/patientInterface';
import { RootStackParamList } from '@/types/navigation';
import { ScreenName } from '@/constants/screenName';
import {
  scheduleAppointmentReminder,
  cancelAppointmentReminder,
} from '@/services/notifications/appointmentReminders';
import { debounce } from '@/helper';

type Props = NativeStackScreenProps<RootStackParamList, ScreenName.ADD_EDIT_APPOINTMENT_SCREEN>;

const validationSchema = Yup.object().shape({
  patientId: Yup.string().required($t('VALIDATORS.REQUIRED')),
  dateTime: Yup.string().required($t('VALIDATORS.REQUIRED')),
  status: Yup.string().required($t('VALIDATORS.REQUIRED')),
  notes: Yup.string(),
  reminderAt: Yup.string(),
});

export default function AddEditAppointmentScreen({ navigation, route }: Props) {
  // State
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [prefetchedAppointment, setPrefetchedAppointment] = useState<Appointment | null>(null);
  const [showPatientPicker, setShowPatientPicker] = useState(false);
  const [patientSearchQuery, setPatientSearchQuery] = useState('');
  const [patientSearchResults, setPatientSearchResults] = useState<Patient[]>([]);
  const [isSearchingPatients, setIsSearchingPatients] = useState(false);
  const [selectedPatientName, setSelectedPatientName] = useState('');

  // Variables
  const { theme } = useTheme();
  const appointmentId = route.params?.appointmentId;
  const prefilledPatientId = route.params?.patientId;
  const isEdit = !!appointmentId;

  // Refs
  const debouncedSearchRef = useRef(
    debounce(async (q: string) => {
      if (!q.trim()) {
        setPatientSearchResults([]);
        return;
      }
      setIsSearchingPatients(true);
      try {
        const results = await patientService.searchPatientsRequest(q);
        setPatientSearchResults(results);
      } catch (_error) {
        setPatientSearchResults([]);
      } finally {
        setIsSearchingPatients(false);
      }
    }, 400),
  );

  // Handlers / Callbacks
  const fetchAppointment = useCallback(async () => {
    if (!appointmentId) return;
    setIsFetching(true);
    try {
      const result = await appointmentService.getAppointmentByIdRequest(appointmentId);
      setPrefetchedAppointment(result);
      if (result) {
        setSelectedPatientName(result.patientName);
      }
    } catch (_error) {
      Toast.show({ type: 'error', text1: $t('COMMON.SOMETHING_WENT_WRONG') });
    } finally {
      setIsFetching(false);
    }
  }, [appointmentId]);

  const handlePatientSearch = useCallback((query: string) => {
    setPatientSearchQuery(query);
    debouncedSearchRef.current(query);
  }, []);

  const handlePatientSelect = useCallback(
    (patient: Patient, setFieldValue: (field: string, value: string) => void) => {
      setFieldValue('patientId', patient.id);
      setSelectedPatientName(patient.fullName);
      setShowPatientPicker(false);
      setPatientSearchQuery('');
      setPatientSearchResults([]);
    },
    [],
  );

  const handleSubmit = useCallback(
    async (values: {
      patientId: string;
      dateTime: string;
      status: string;
      notes: string;
      reminderAt: string;
    }) => {
      setIsLoading(true);
      try {
        const payload: AddAppointmentPayload = {
          patientId: values.patientId,
          patientName: selectedPatientName,
          dateTime: values.dateTime,
          status: values.status as AppointmentStatus,
          notes: values.notes || undefined,
          reminderAt: values.reminderAt || undefined,
        };

        if (isEdit && appointmentId) {
          // Cancel old reminder before rescheduling
          if (prefetchedAppointment?.reminderId) {
            await cancelAppointmentReminder(prefetchedAppointment.reminderId);
          }

          await appointmentService.putUpdateAppointmentRequest(appointmentId, payload);

          // Schedule new reminder if provided
          if (values.reminderAt) {
            const reminderId = await scheduleAppointmentReminder(
              appointmentId,
              selectedPatientName,
              values.reminderAt,
            );
            if (reminderId) {
              await appointmentService.putUpdateAppointmentRequest(appointmentId, {
                reminderId,
              });
            }
          }
        } else {
          const newId = await appointmentService.postAddAppointmentRequest(payload);

          // Schedule reminder for the new appointment
          if (values.reminderAt && newId) {
            const reminderId = await scheduleAppointmentReminder(
              newId,
              selectedPatientName,
              values.reminderAt,
            );
            if (reminderId) {
              await appointmentService.putUpdateAppointmentRequest(newId, { reminderId });
            }
          }
        }

        Toast.show({ type: 'success', text1: $t('APPOINTMENTS.SAVED_SUCCESS') });
        navigation.goBack();
      } catch (_error) {
        Toast.show({ type: 'error', text1: $t('COMMON.SOMETHING_WENT_WRONG') });
      } finally {
        setIsLoading(false);
      }
    },
    [appointmentId, isEdit, navigation, prefetchedAppointment, selectedPatientName],
  );

  // Effects (useEffect)
  useEffect(() => {
    if (isEdit) {
      fetchAppointment();
    }
  }, [isEdit, fetchAppointment]);

  const statusOptions: Array<{ label: string; value: AppointmentStatus }> = [
    { label: $t('APPOINTMENTS.STATUS_PENDING'), value: 'pending' },
    { label: $t('APPOINTMENTS.STATUS_CONFIRMED'), value: 'confirmed' },
    { label: $t('APPOINTMENTS.STATUS_COMPLETED'), value: 'completed' },
    { label: $t('APPOINTMENTS.STATUS_CANCELLED'), value: 'cancelled' },
  ];

  // Compute the default "now" once — recomputing new Date() every render would make
  // `initialValues` look different each render and, with enableReinitialize, reset the
  // form (wiping the selected patient) on every render.
  const defaultDateTime = useRef(new Date().toISOString()).current;
  const initialValues = useMemo(
    () => ({
      patientId: prefetchedAppointment?.patientId ?? prefilledPatientId ?? '',
      dateTime: prefetchedAppointment?.dateTime ?? defaultDateTime,
      status: prefetchedAppointment?.status ?? 'pending',
      notes: prefetchedAppointment?.notes ?? '',
      reminderAt: prefetchedAppointment?.reminderAt ?? '',
    }),
    [prefetchedAppointment, prefilledPatientId, defaultDateTime],
  );

  // Render helpers
  const renderPatientItem = useCallback(
    ({ item }: { item: Patient }, setFieldValue: (field: string, value: string) => void) => (
      <TouchableOpacity
        onPress={() => handlePatientSelect(item, setFieldValue)}
        className="px-4 py-3"
        style={{ borderBottomWidth: 1, borderBottomColor: theme.border }}>
        <Text className="text-sm font-ibm-medium" style={{ color: theme.text }}>
          {item.fullName}
        </Text>
        <Text className="text-xs font-ibm-regular mt-0.5" style={{ color: theme.textSecondary }}>
          {item.mobile} · #{item.fileNumber}
        </Text>
      </TouchableOpacity>
    ),
    [handlePatientSelect, theme],
  );

  // Return UI
  return (
    <ScreenContainer safeAreaEdges={['top', 'bottom']} scrollable keyboardAvoiding padded={false}>
      <AppHeader
        title={isEdit ? $t('APPOINTMENTS.EDIT_APPOINTMENT') : $t('APPOINTMENTS.ADD_APPOINTMENT')}
        onBack={() => navigation.goBack()}
        showBack
      />

      {isFetching && <SectionLoader style="list" />}

      {!isFetching && (
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          enableReinitialize>
          {({ handleSubmit: formikSubmit, values, setFieldValue, errors, touched }) => (
            <View className="px-4 pb-8">
              {/* Section 1: Appointment Info */}
              <Text className="text-base font-ibm-bold mt-4 mb-3" style={{ color: theme.text }}>
                {$t('APPOINTMENTS.APPOINTMENT_INFO_SECTION')}
              </Text>

              {/* Patient selector */}
              <View className="mb-4">
                <Text className="text-sm font-ibm-medium mb-2" style={{ color: theme.text }}>
                  {$t('APPOINTMENTS.PATIENT')}
                </Text>
                <TouchableOpacity
                  onPress={() => setShowPatientPicker(true)}
                  style={[
                    styles.patientSelector,
                    {
                      backgroundColor: theme.card,
                      borderColor:
                        touched.patientId && errors.patientId ? theme.error : theme.border,
                    },
                  ]}>
                  <Text
                    className="text-base font-ibm-regular flex-1"
                    style={{
                      color: selectedPatientName ? theme.text : theme.textSecondary,
                    }}>
                    {selectedPatientName || $t('APPOINTMENTS.SELECT_PATIENT')}
                  </Text>
                  <MaterialDesignIcons name="magnify" size={20} color={theme.textSecondary} />
                </TouchableOpacity>
                {touched.patientId && errors.patientId ? (
                  <Text className="text-xs text-error mt-1 ml-1">{errors.patientId}</Text>
                ) : null}
              </View>

              <FormDatePicker
                name="dateTime"
                placeholder={$t('APPOINTMENTS.DATE')}
                maximumDate={new Date(2100, 11, 31)}
              />

              <FormSelect
                name="status"
                label={$t('APPOINTMENTS.STATUS')}
                options={statusOptions}
                placeholder={$t('COMMON.SELECT_OPTION')}
              />

              <FormTextAreaInput name="notes" label={$t('APPOINTMENTS.NOTES')} />

              {/* Section 2: Reminder */}
              <Text className="text-base font-ibm-bold mt-4 mb-3" style={{ color: theme.text }}>
                {$t('APPOINTMENTS.REMINDER_SECTION')}
              </Text>

              <FormDatePicker
                name="reminderAt"
                placeholder={$t('APPOINTMENTS.REMINDER_TIME')}
                maximumDate={new Date(2100, 11, 31)}
              />

              {/* Submit */}
              <FormButton
                title={isEdit ? $t('COMMON.UPDATE') : $t('COMMON.SAVE')}
                loading={isLoading}
                onPress={() => formikSubmit()}
              />

              {/* Patient picker bottom sheet */}
              <BottomSheetModal
                visible={showPatientPicker}
                onClose={() => {
                  setShowPatientPicker(false);
                  setPatientSearchQuery('');
                  setPatientSearchResults([]);
                }}
                title={$t('APPOINTMENTS.SELECT_PATIENT')}
                maxHeightRatio={0.75}>
                <View className="px-4 pb-2">
                  <SearchBar
                    value={patientSearchQuery}
                    onChangeText={handlePatientSearch}
                    placeholder={$t('PATIENTS.SEARCH_PLACEHOLDER')}
                  />
                </View>
                {isSearchingPatients ? (
                  <SectionLoader style="list" />
                ) : (
                  <FlatList
                    data={patientSearchResults}
                    keyExtractor={item => item.id}
                    renderItem={({ item }) => renderPatientItem({ item }, setFieldValue)}
                    contentContainerStyle={styles.patientListContent}
                    keyboardShouldPersistTaps="handled"
                  />
                )}
              </BottomSheetModal>
            </View>
          )}
        </Formik>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  patientSelector: {
    height: 64,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  patientListContent: {
    paddingBottom: 40,
  },
});
