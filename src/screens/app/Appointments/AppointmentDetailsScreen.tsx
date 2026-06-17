import React, { useCallback, useEffect, useState } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons';
import Toast from 'react-native-toast-message';
import ScreenContainer from '@/components/global/ScreenContainer';
import AppHeader from '@/components/global/AppHeader';
import SectionLoader from '@/components/global/SectionLoader';
import ConfirmationDialog from '@/components/global/ConfirmationDialog';
import Button from '@/components/global/Button';
import { AppointmentStatusBadge } from '@/components/appointments';
import { Text } from '@/components/UI';
import { useTheme } from '@/theme/ThemeProvider';
import { appointmentService } from '@/api/services/appointmentService/appointmentService';
import { Appointment } from '@/api/services/appointmentService/appointmentInterface';
import { RootStackParamList } from '@/types/navigation';
import { ScreenName } from '@/constants/screenName';
import { formatDate } from '@/helper';
import { cancelAppointmentReminder } from '@/services/notifications/appointmentReminders';

type Props = NativeStackScreenProps<RootStackParamList, ScreenName.APPOINTMENT_DETAILS_SCREEN>;

type DialogMode = 'cancel' | 'delete' | null;

interface DetailRowProps {
  label: string;
  value: string;
}

function DetailRow({ label, value }: DetailRowProps) {
  const { theme } = useTheme();
  return (
    <View
      className="flex-row py-3"
      style={{ borderBottomWidth: 1, borderBottomColor: theme.border }}>
      <Text className="text-sm font-ibm-medium w-32" style={{ color: theme.textSecondary }}>
        {label}
      </Text>
      <Text className="text-sm font-ibm-regular flex-1" style={{ color: theme.text }}>
        {value}
      </Text>
    </View>
  );
}

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
  const [isActing, setIsActing] = useState(false);

  // Variables
  const { theme } = useTheme();
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

  const handleCancelPress = useCallback(() => {
    setDialogMode('cancel');
  }, []);

  const handleDeletePress = useCallback(() => {
    setDialogMode('delete');
  }, []);

  const handleDialogDismiss = useCallback(() => {
    setDialogMode(null);
  }, []);

  const handleConfirmAction = useCallback(async () => {
    if (!dialogMode) return;
    setIsActing(true);
    try {
      if (dialogMode === 'cancel') {
        // Cancel reminder before marking as cancelled
        await cancelAppointmentReminder(appointment?.reminderId);
        await appointmentService.cancelAppointmentRequest(appointmentId);
        Toast.show({ type: 'success', text1: $t('APPOINTMENTS.CANCELLED_SUCCESS') });
        // Refresh to show updated status
        setDialogMode(null);
        await fetchAppointment();
      } else {
        // Hard-delete: cancel reminder first
        await cancelAppointmentReminder(appointment?.reminderId);
        await appointmentService.deleteAppointmentRequest(appointmentId);
        Toast.show({ type: 'success', text1: $t('APPOINTMENTS.DELETED_SUCCESS') });
        navigation.goBack();
      }
    } catch (_error) {
      Toast.show({ type: 'error', text1: $t('COMMON.SOMETHING_WENT_WRONG') });
    } finally {
      setIsActing(false);
      if (dialogMode !== 'delete') setDialogMode(null);
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
          <View className="flex-row items-center gap-2">
            <TouchableOpacity onPress={handleEdit} className="p-2">
              <MaterialDesignIcons name="pencil-outline" size={22} color={theme.primary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDeletePress} className="p-2">
              <MaterialDesignIcons name="delete-outline" size={22} color={theme.error} />
            </TouchableOpacity>
          </View>
        }
      />

      {isLoading && <SectionLoader style="list" />}

      {!isLoading && appointment && (
        <View className="mx-4 mb-6">
          {/* Date/time + status */}
          <View className="flex-row items-center justify-between mt-4 mb-4">
            <Text
              className="text-base font-ibm-bold"
              style={{ color: theme.text }}>
              {formatDateTime(appointment.dateTime)}
            </Text>
            <AppointmentStatusBadge status={appointment.status} />
          </View>

          {/* Details card */}
          <View
            style={{
              backgroundColor: theme.card,
              borderRadius: 12,
              borderColor: theme.cardBorder,
              borderWidth: 1,
            }}
            className="px-4 mb-4">
            <DetailRow label={$t('APPOINTMENTS.PATIENT')} value={appointment.patientName} />
            {appointment.notes && (
              <View className="py-3">
                <Text
                  className="text-sm font-ibm-medium mb-1"
                  style={{ color: theme.textSecondary }}>
                  {$t('APPOINTMENTS.NOTES')}
                </Text>
                <Text className="text-sm font-ibm-regular" style={{ color: theme.text }}>
                  {appointment.notes}
                </Text>
              </View>
            )}
          </View>

          {/* Actions */}
          {isNotCancelled && (
            <Button
              title={$t('APPOINTMENTS.CANCEL_APPOINTMENT')}
              variant="outline"
              onPress={handleCancelPress}
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
        onCancel={handleDialogDismiss}
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
        onCancel={handleDialogDismiss}
      />
    </ScreenContainer>
  );
}
