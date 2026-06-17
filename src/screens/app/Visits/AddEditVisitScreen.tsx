import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Toast from 'react-native-toast-message';
import ScreenContainer from '@/components/global/ScreenContainer';
import AppHeader from '@/components/global/AppHeader';
import SectionLoader from '@/components/global/SectionLoader';
import VisitForm, { VisitFormValues } from '@/components/visits/VisitForm';
import { visitService } from '@/api/services/visitService/visitService';
import { Visit, AddVisitPayload } from '@/api/services/visitService/visitInterface';
import { RootStackParamList } from '@/types/navigation';
import { ScreenName } from '@/constants/screenName';

type Props = NativeStackScreenProps<RootStackParamList, ScreenName.ADD_EDIT_VISIT_SCREEN>;

export default function AddEditVisitScreen({ navigation, route }: Props) {
  // State
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [prefetchedVisit, setPrefetchedVisit] = useState<Visit | null>(null);

  // Variables
  const patientId = route.params?.patientId ?? '';
  const visitId = route.params?.visitId;
  const isEdit = !!visitId;

  // Handlers / Callbacks
  const fetchVisit = useCallback(async () => {
    if (!visitId || !patientId) return;
    setIsFetching(true);
    try {
      const result = await visitService.getVisitByIdRequest(patientId, visitId);
      setPrefetchedVisit(result);
    } catch (_error) {
      Toast.show({ type: 'error', text1: $t('COMMON.SOMETHING_WENT_WRONG') });
    } finally {
      setIsFetching(false);
    }
  }, [patientId, visitId]);

  // Effects (useEffect)
  useEffect(() => {
    if (isEdit) {
      fetchVisit();
    }
  }, [isEdit, fetchVisit]);

  // Compute the default "now" once so enableReinitialize doesn't reset the form each render.
  const defaultVisitDate = useRef(new Date().toISOString()).current;
  const initialValues = useMemo<VisitFormValues>(
    () => ({
      visitDate: prefetchedVisit?.visitDate ?? defaultVisitDate,
      diagnosis: prefetchedVisit?.diagnosis ?? '',
      treatmentPerformed: prefetchedVisit?.treatmentPerformed ?? '',
      notes: prefetchedVisit?.notes ?? '',
      amountTotal: prefetchedVisit?.amountTotal?.toString() ?? '',
      amountPaid: prefetchedVisit?.amountPaid?.toString() ?? '',
    }),
    [prefetchedVisit, defaultVisitDate],
  );

  const handleSubmit = async (values: VisitFormValues) => {
    setIsLoading(true);
    try {
      const payload: AddVisitPayload = {
        visitDate: values.visitDate,
        diagnosis: values.diagnosis || undefined,
        treatmentPerformed: values.treatmentPerformed || undefined,
        notes: values.notes || undefined,
        amountTotal: values.amountTotal ? Number(values.amountTotal) : undefined,
        amountPaid: values.amountPaid ? Number(values.amountPaid) : undefined,
      };

      if (isEdit && visitId) {
        await visitService.putUpdateVisitRequest(patientId, visitId, payload);
      } else {
        await visitService.postAddVisitRequest(patientId, payload);
      }

      Toast.show({ type: 'success', text1: $t('VISITS.SAVED_SUCCESS') });
      navigation.goBack();
    } catch (_error) {
      Toast.show({ type: 'error', text1: $t('COMMON.SOMETHING_WENT_WRONG') });
    } finally {
      setIsLoading(false);
    }
  };

  // Return UI
  return (
    <ScreenContainer safeAreaEdges={['top', 'bottom']} scrollable keyboardAvoiding padded={false}>
      <AppHeader
        title={isEdit ? $t('VISITS.EDIT_VISIT') : $t('VISITS.ADD_VISIT')}
        onBack={() => navigation.goBack()}
        showBack
      />

      {isFetching && <SectionLoader style="list" />}

      {!isFetching && (
        <VisitForm
          initialValues={initialValues}
          isEdit={isEdit}
          isLoading={isLoading}
          onSubmit={handleSubmit}
        />
      )}
    </ScreenContainer>
  );
}
