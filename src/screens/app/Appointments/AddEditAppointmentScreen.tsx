import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Toast from 'react-native-toast-message';
import ScreenContainer from '@/components/global/ScreenContainer';
import AppHeader from '@/components/global/AppHeader';
import SectionLoader from '@/components/global/SectionLoader';
import AppointmentForm, { AppointmentFormValues } from '@/components/appointments/AppointmentForm';
import { appointmentService } from '@/api/services/appointmentService/appointmentService';
import {
  Appointment,
  AddAppointmentPayload,
  AppointmentStatus,
} from '@/api/services/appointmentService/appointmentInterface';
import { RootStackParamList } from '@/types/navigation';
import { ScreenName } from '@/constants/screenName';
import {
  scheduleAppointmentReminder,
  cancelAppointmentReminder,
} from '@/services/notifications/appointmentReminders';

type Props = NativeStackScreenProps<RootStackParamList, ScreenName.ADD_EDIT_APPOINTMENT_SCREEN>;

export default function AddEditAppointmentScreen({ navigation, route }: Props) {
  // State
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [prefetchedAppointment, setPrefetchedAppointment] = useState<Appointment | null>(null);

  // Variables
  const appointmentId = route.params?.appointmentId;
  const prefilledPatientId = route.params?.patientId;
  const isEdit = !!appointmentId;

  // Handlers / Callbacks
  const fetchAppointment = useCallback(async () => {
    if (!appointmentId) return;
    setIsFetching(true);
    try {
      const result = await appointmentService.getAppointmentByIdRequest(appointmentId);
      setPrefetchedAppointment(result);
    } catch (_error) {
      Toast.show({ type: 'error', text1: $t('COMMON.SOMETHING_WENT_WRONG') });
    } finally {
      setIsFetching(false);
    }
  }, [appointmentId]);

  const handleSubmit = useCallback(
    async (values: AppointmentFormValues) => {
      setIsLoading(true);
      try {
        const payload: AddAppointmentPayload = {
          patientId: values.patientId,
          patientName: values.patientName,
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
              values.patientName,
              values.reminderAt,
            );
            if (reminderId) {
              await appointmentService.putUpdateAppointmentRequest(appointmentId, { reminderId });
            }
          }
        } else {
          const newId = await appointmentService.postAddAppointmentRequest(payload);

          // Schedule reminder for the new appointment
          if (values.reminderAt && newId) {
            const reminderId = await scheduleAppointmentReminder(
              newId,
              values.patientName,
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
    [appointmentId, isEdit, navigation, prefetchedAppointment],
  );

  // Effects (useEffect)
  useEffect(() => {
    if (isEdit) {
      fetchAppointment();
    }
  }, [isEdit, fetchAppointment]);

  // Compute the default "now" once so enableReinitialize doesn't reset the form each render.
  const defaultDateTime = useRef(new Date().toISOString()).current;
  const initialValues = useMemo<AppointmentFormValues>(
    () => ({
      patientId: prefetchedAppointment?.patientId ?? prefilledPatientId ?? '',
      patientName: prefetchedAppointment?.patientName ?? '',
      dateTime: prefetchedAppointment?.dateTime ?? defaultDateTime,
      status: prefetchedAppointment?.status ?? 'pending',
      notes: prefetchedAppointment?.notes ?? '',
      reminderAt: prefetchedAppointment?.reminderAt ?? '',
    }),
    [prefetchedAppointment, prefilledPatientId, defaultDateTime],
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
        <AppointmentForm
          initialValues={initialValues}
          isEdit={isEdit}
          isLoading={isLoading}
          onSubmit={handleSubmit}
        />
      )}
    </ScreenContainer>
  );
}
