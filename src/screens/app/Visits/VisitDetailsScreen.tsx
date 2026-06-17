import React, { useCallback, useEffect, useState } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons';
import Toast from 'react-native-toast-message';
import ScreenContainer from '@/components/global/ScreenContainer';
import AppHeader from '@/components/global/AppHeader';
import SectionLoader from '@/components/global/SectionLoader';
import ConfirmationDialog from '@/components/global/ConfirmationDialog';
import { Text } from '@/components/UI';
import { useTheme } from '@/theme/ThemeProvider';
import { visitService } from '@/api/services/visitService/visitService';
import { Visit } from '@/api/services/visitService/visitInterface';
import { RootStackParamList } from '@/types/navigation';
import { ScreenName } from '@/constants/screenName';
import { formatDate } from '@/helper';

type Props = NativeStackScreenProps<RootStackParamList, ScreenName.VISIT_DETAILS_SCREEN>;

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

export default function VisitDetailsScreen({ navigation, route }: Props) {
  // State
  const [visit, setVisit] = useState<Visit | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Variables
  const { theme } = useTheme();
  const { visitId, patientId } = route.params;

  // Handlers / Callbacks
  const fetchVisit = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await visitService.getVisitByIdRequest(patientId, visitId);
      setVisit(result);
    } catch (_error) {
      Toast.show({ type: 'error', text1: $t('COMMON.SOMETHING_WENT_WRONG') });
    } finally {
      setIsLoading(false);
    }
  }, [patientId, visitId]);

  const handleEdit = useCallback(() => {
    navigation.navigate(ScreenName.ADD_EDIT_VISIT_SCREEN, { patientId, visitId });
  }, [navigation, patientId, visitId]);

  const handleDeletePress = useCallback(() => {
    setShowDeleteDialog(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    setIsDeleting(true);
    try {
      await visitService.deleteVisitRequest(patientId, visitId);
      Toast.show({ type: 'success', text1: $t('VISITS.DELETED_SUCCESS') });
      navigation.goBack();
    } catch (_error) {
      Toast.show({ type: 'error', text1: $t('COMMON.SOMETHING_WENT_WRONG') });
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  }, [patientId, visitId, navigation]);

  const handleDeleteCancel = useCallback(() => {
    setShowDeleteDialog(false);
  }, []);

  // Effects (useEffect)
  useEffect(() => {
    fetchVisit();
  }, [fetchVisit]);

  // Render helpers
  const renderPaymentStatus = () => {
    if (!visit?.paymentStatus) return null;

    const statusColor =
      visit.paymentStatus === 'paid'
        ? theme.success
        : visit.paymentStatus === 'partial'
          ? '#F5A623'
          : theme.error;

    const statusLabel =
      visit.paymentStatus === 'paid'
        ? $t('VISITS.PAYMENT_PAID')
        : visit.paymentStatus === 'partial'
          ? $t('VISITS.PAYMENT_PARTIAL')
          : $t('VISITS.PAYMENT_UNPAID');

    return (
      <View
        className="self-start px-3 py-1 rounded-full mb-4"
        style={{ backgroundColor: statusColor + '22' }}>
        <Text className="text-sm font-ibm-medium" style={{ color: statusColor }}>
          {statusLabel}
        </Text>
      </View>
    );
  };

  // Return UI
  return (
    <ScreenContainer safeAreaEdges={['top', 'bottom']} scrollable padded={false}>
      <AppHeader
        title={$t('VISITS.VISIT_DETAILS')}
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

      {!isLoading && visit && (
        <View className="mx-4 mb-6">
          {/* Visit Date header */}
          <Text
            className="text-base font-ibm-bold mt-4 mb-3"
            style={{ color: theme.text }}>
            {formatDate(visit.visitDate)}
          </Text>

          {renderPaymentStatus()}

          {/* Details card */}
          <View
            style={{
              backgroundColor: theme.card,
              borderRadius: 12,
              borderColor: theme.cardBorder,
              borderWidth: 1,
            }}
            className="px-4">
            {visit.diagnosis && (
              <DetailRow label={$t('VISITS.DIAGNOSIS')} value={visit.diagnosis} />
            )}
            {visit.treatmentPerformed && (
              <DetailRow label={$t('VISITS.TREATMENT')} value={visit.treatmentPerformed} />
            )}
            {visit.amountTotal !== undefined && (
              <DetailRow
                label={$t('VISITS.AMOUNT_TOTAL')}
                value={visit.amountTotal.toString()}
              />
            )}
            {visit.amountPaid !== undefined && (
              <DetailRow
                label={$t('VISITS.AMOUNT_PAID')}
                value={visit.amountPaid.toString()}
              />
            )}
            {visit.amountDue !== undefined && (
              <DetailRow
                label={$t('VISITS.AMOUNT_DUE')}
                value={visit.amountDue.toString()}
              />
            )}
            {visit.notes && (
              <View className="py-3">
                <Text
                  className="text-sm font-ibm-medium mb-1"
                  style={{ color: theme.textSecondary }}>
                  {$t('VISITS.NOTES')}
                </Text>
                <Text className="text-sm font-ibm-regular" style={{ color: theme.text }}>
                  {visit.notes}
                </Text>
              </View>
            )}
          </View>
        </View>
      )}

      <ConfirmationDialog
        visible={showDeleteDialog}
        type="danger"
        title={$t('GLOBAL.CONFIRM_DELETE')}
        message={$t('VISITS.DELETE_CONFIRM')}
        confirmText={$t('COMMON.DELETE')}
        cancelText={$t('COMMON.CANCEL')}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </ScreenContainer>
  );
}
