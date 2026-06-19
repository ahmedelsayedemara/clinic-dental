import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import ScreenContainer from '@/components/global/ScreenContainer';
import AppHeader from '@/components/global/AppHeader';
import SectionLoader from '@/components/global/SectionLoader';
import ConfirmationDialog from '@/components/global/ConfirmationDialog';
import DetailHeaderActions from '@/components/global/DetailHeaderActions';
import SectionHeader from '@/components/global/SectionHeader';
import InfoRow from '@/components/global/InfoRow';
import InfoBlock from '@/components/global/InfoBlock';
import Card from '@/components/global/Card';
import { PaymentStatusBadge } from '@/components/visits';
import { visitService } from '@/api/services/visitService/visitService';
import { Visit } from '@/api/services/visitService/visitInterface';
import { RootStackParamList } from '@/types/navigation';
import { ScreenName } from '@/constants/screenName';
import { formatDate } from '@/helper';

type Props = NativeStackScreenProps<RootStackParamList, ScreenName.VISIT_DETAILS_SCREEN>;

export default function VisitDetailsScreen({ navigation, route }: Props) {
  // State
  const [visit, setVisit] = useState<Visit | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Variables
  const { visitId, patientId } = route.params;
  const isFirstFocus = useRef(true);

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

  const handleDeleteConfirm = useCallback(async () => {
    try {
      await visitService.deleteVisitRequest(patientId, visitId);
      Toast.show({ type: 'success', text1: $t('VISITS.DELETED_SUCCESS') });
      navigation.goBack();
    } catch (_error) {
      Toast.show({ type: 'error', text1: $t('COMMON.SOMETHING_WENT_WRONG') });
    } finally {
      setShowDeleteDialog(false);
    }
  }, [patientId, visitId, navigation]);

  // Effects (useEffect)
  useEffect(() => {
    fetchVisit();
  }, [fetchVisit]);

  // Re-fetch the visit whenever the screen regains focus (e.g. returning from
  // Edit Visit). Skip the first focus since the mount effect already loads it.
  useFocusEffect(
    useCallback(() => {
      if (isFirstFocus.current) {
        isFirstFocus.current = false;
        return;
      }
      fetchVisit();
    }, [fetchVisit]),
  );

  // Return UI
  return (
    <ScreenContainer safeAreaEdges={['top', 'bottom']} scrollable padded={false}>
      <AppHeader
        title={$t('VISITS.VISIT_DETAILS')}
        onBack={() => navigation.goBack()}
        showBack
        rightElement={
          <DetailHeaderActions onEdit={handleEdit} onDelete={() => setShowDeleteDialog(true)} />
        }
      />

      {isLoading && <SectionLoader style="list" />}

      {!isLoading && visit && (
        <View className="mx-4 mb-6">
          {/* Visit Date header */}
          <SectionHeader title={formatDate(visit.visitDate)} />

          <PaymentStatusBadge status={visit.paymentStatus} />

          {/* Details card */}
          <Card>
            {visit.diagnosis && <InfoRow label={$t('VISITS.DIAGNOSIS')} value={visit.diagnosis} />}
            {visit.treatmentPerformed && (
              <InfoRow label={$t('VISITS.TREATMENT')} value={visit.treatmentPerformed} />
            )}
            {visit.amountTotal !== undefined && (
              <InfoRow label={$t('VISITS.AMOUNT_TOTAL')} value={visit.amountTotal.toString()} />
            )}
            {visit.amountPaid !== undefined && (
              <InfoRow label={$t('VISITS.AMOUNT_PAID')} value={visit.amountPaid.toString()} />
            )}
            {visit.amountDue !== undefined && (
              <InfoRow label={$t('VISITS.AMOUNT_DUE')} value={visit.amountDue.toString()} />
            )}
            {visit.notes && <InfoBlock label={$t('VISITS.NOTES')} value={visit.notes} />}
          </Card>
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
        onCancel={() => setShowDeleteDialog(false)}
      />
    </ScreenContainer>
  );
}
