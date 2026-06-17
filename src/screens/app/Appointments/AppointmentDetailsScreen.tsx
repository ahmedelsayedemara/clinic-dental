import React, { useCallback, useEffect, useState } from 'react';
import { View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Toast from 'react-native-toast-message';
import ScreenContainer from '@/components/global/ScreenContainer';
import AppHeader from '@/components/global/AppHeader';
import SectionLoader from '@/components/global/SectionLoader';
import ConfirmationDialog from '@/components/global/ConfirmationDialog';
import Button from '@/components/global/Button';
import DetailHeaderActions from '@/components/global/DetailHeaderActions';
import SectionHeader from '@/components/global/SectionHeader';
import InfoRow from '@/components/global/InfoRow';
import InfoBlock from '@/components/global/InfoBlock';
import Card from '@/components/global/Card';
import { AppointmentStatusBadge } from '@/components/appointments';
import { appointmentService } from '@/api/services/appointmentService/appointmentService';
import { Appointment } from '@/api/services/appointmentService/appointmentInterface';
import { RootStackParamList } from '@/types/navigation';
import { ScreenName } from '@/constants/screenName';
import { formatDate } from '@/helper';
import { cancelAppointmentReminder } from '@/services/notifications/appointmentReminders';

type Props = NativeStackScreenProps<RootStackParamList, ScreenName.APPOINTMENT_DETAILS_SCREEN>;

type DialogMode = 'cancel' | 'delete' | null;

function formatDateTime(isoString: string): string {
  const date = new Date(isoString);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${formatDate(isoString)} · ${hours}:${minutes}`;
}

export default function AppointmentDetailsScreen({ navigation, route }: Props) {
  // State
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogMode, setDialogMode] = useState<DialogMode>(null);

  // Variables
  const { appointmentId } = route.params;

  // Handlers / Callbacks
  const fetchAppointment = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await appointmentService.getAppointmentByIdRequest(appointmentId);
      setAppointment(result);
    } catch (_error) {
      Toast.show({ type: 'error', text1: $t('COMMON.SOMETHING_WENT_WRONG') });
    } finally {
      setIsLoading(false);
    }
  }, [appointmentId]);

  const handleEdit = useCallback(() => {
    navigation.navigate(ScreenName.ADD_EDIT_APPOINTMENT_SCREEN, { appointmentId });
  }, [navigation, appointmentId]);

  const handleConfirmAction = useCallback(async () => {
    if (!dialogMode) return;
    try {
      // Cancel the reminder before either action
      await cancelAppointmentReminder(appointment?.reminderId);
      if (dialogMode === 'cancel') {
        await appointmentService.cancelAppointmentRequest(appointmentId);
        Toast.show({ type: 'success', text1: $t('APPOINTMENTS.CANCELLED_SUCCESS') });
        setDialogMode(null);
        await fetchAppointment();
      } else {
        await appointmentService.deleteAppointmentRequest(appointmentId);
        Toast.show({ type: 'success', text1: $t('APPOINTMENTS.DELETED_SUCCESS') });
        navigation.goBack();
      }
    } catch (_error) {
      Toast.show({ type: 'error', text1: $t('COMMON.SOMETHING_WENT_WRONG') });
      setDialogMode(null);
    }
  }, [dialogMode, appointment, appointmentId, navigation, fetchAppointment]);

  // Effects (useEffect)
  useEffect(() => {
    fetchAppointment();
  }, [fetchAppointment]);

  const isNotCancelled = appointment?.status !== 'cancelled';

  // Return UI
  return (
    <ScreenContainer safeAreaEdges={['top', 'bottom']} scrollable padded={false}>
      <AppHeader
        title={$t('APPOINTMENTS.APPOINTMENT_DETAILS')}
        onBack={() => navigation.goBack()}
        showBack
        rightElement={
          <DetailHeaderActions onEdit={handleEdit} onDelete={() => setDialogMode('delete')} />
        }
      />

      {isLoading && <SectionLoader style="list" />}

      {!isLoading && appointment && (
        <View className="mx-4 mb-6">
          {/* Date/time + status */}
          <View className="flex-row items-center justify-between mt-4 mb-4">
            <SectionHeader
              title={formatDateTime(appointment.dateTime)}
              className="text-base font-ibm-bold"
            />
            <AppointmentStatusBadge status={appointment.status} />
          </View>

          {/* Details card */}
          <Card className="px-4 mb-4">
            <InfoRow label={$t('APPOINTMENTS.PATIENT')} value={appointment.patientName} />
            {appointment.notes && (
              <InfoBlock label={$t('APPOINTMENTS.NOTES')} value={appointment.notes} />
            )}
          </Card>

          {/* Actions */}
          {isNotCancelled && (
            <Button
              title={$t('APPOINTMENTS.CANCEL_APPOINTMENT')}
              variant="outline"
              onPress={() => setDialogMode('cancel')}
            />
          )}
        </View>
      )}

      {/* Cancel confirmation */}
      <ConfirmationDialog
        visible={dialogMode === 'cancel'}
        type="warning"
        title={$t('APPOINTMENTS.CANCEL_APPOINTMENT')}
        message={$t('APPOINTMENTS.CANCEL_CONFIRM')}
        confirmText={$t('APPOINTMENTS.CANCEL_APPOINTMENT')}
        cancelText={$t('COMMON.CANCEL')}
        onConfirm={handleConfirmAction}
        onCancel={() => setDialogMode(null)}
      />

      {/* Delete confirmation */}
      <ConfirmationDialog
        visible={dialogMode === 'delete'}
        type="danger"
        title={$t('GLOBAL.CONFIRM_DELETE')}
        message={$t('APPOINTMENTS.DELETE_CONFIRM')}
        confirmText={$t('COMMON.DELETE')}
        cancelText={$t('COMMON.CANCEL')}
        onConfirm={handleConfirmAction}
        onCancel={() => setDialogMode(null)}
      />
    </ScreenContainer>
  );
}
