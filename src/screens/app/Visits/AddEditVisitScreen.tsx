import React, { useCallback, useEffect, useState } from 'react';
import { View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Formik } from 'formik';
import * as Yup from 'yup';
import Toast from 'react-native-toast-message';
import ScreenContainer from '@/components/global/ScreenContainer';
import AppHeader from '@/components/global/AppHeader';
import SectionLoader from '@/components/global/SectionLoader';
import {
  FormDatePicker,
  FormTextAreaInput,
  FormInput,
  FormButton,
} from '@/components/form';
import { Text } from '@/components/UI';
import { useTheme } from '@/theme/ThemeProvider';
import { visitService } from '@/api/services/visitService/visitService';
import { Visit, AddVisitPayload } from '@/api/services/visitService/visitInterface';
import { RootStackParamList } from '@/types/navigation';
import { ScreenName } from '@/constants/screenName';

type Props = NativeStackScreenProps<RootStackParamList, ScreenName.ADD_EDIT_VISIT_SCREEN>;

const validationSchema = Yup.object().shape({
  visitDate: Yup.string().required($t('VALIDATORS.REQUIRED')),
  diagnosis: Yup.string(),
  treatmentPerformed: Yup.string(),
  notes: Yup.string(),
  amountTotal: Yup.number()
    .transform((value, originalValue) => (originalValue === '' ? undefined : value))
    .nullable()
    .min(0),
  amountPaid: Yup.number()
    .transform((value, originalValue) => (originalValue === '' ? undefined : value))
    .nullable()
    .min(0),
});

export default function AddEditVisitScreen({ navigation, route }: Props) {
  // State
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [prefetchedVisit, setPrefetchedVisit] = useState<Visit | null>(null);

  // Variables
  const { theme } = useTheme();
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

  const initialValues = {
    visitDate: prefetchedVisit?.visitDate ?? new Date().toISOString(),
    diagnosis: prefetchedVisit?.diagnosis ?? '',
    treatmentPerformed: prefetchedVisit?.treatmentPerformed ?? '',
    notes: prefetchedVisit?.notes ?? '',
    amountTotal: prefetchedVisit?.amountTotal?.toString() ?? '',
    amountPaid: prefetchedVisit?.amountPaid?.toString() ?? '',
  };

  const handleSubmit = async (values: typeof initialValues) => {
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
    <ScreenContainer
      safeAreaEdges={['top', 'bottom']}
      scrollable
      keyboardAvoiding
      padded={false}>
      <AppHeader
        title={isEdit ? $t('VISITS.EDIT_VISIT') : $t('VISITS.ADD_VISIT')}
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
          {({ handleSubmit: formikSubmit }) => (
            <View className="px-4 pb-8">
              {/* Section 1: Visit Info */}
              <Text
                className="text-base font-ibm-bold mt-4 mb-3"
                style={{ color: theme.text }}>
                {$t('VISITS.VISIT_INFO_SECTION')}
              </Text>

              <FormDatePicker
                name="visitDate"
                placeholder={$t('VISITS.VISIT_DATE')}
                maximumDate={new Date(2100, 11, 31)}
              />

              <FormTextAreaInput
                name="diagnosis"
                label={$t('VISITS.DIAGNOSIS')}
              />

              <FormTextAreaInput
                name="treatmentPerformed"
                label={$t('VISITS.TREATMENT')}
              />

              <FormTextAreaInput
                name="notes"
                label={$t('VISITS.NOTES')}
              />

              {/* Section 2: Payment */}
              <Text
                className="text-base font-ibm-bold mt-4 mb-3"
                style={{ color: theme.text }}>
                {$t('VISITS.PAYMENT_SECTION')}
              </Text>

              <FormInput
                name="amountTotal"
                label={$t('VISITS.AMOUNT_TOTAL')}
                keyboardType="numeric"
              />

              <FormInput
                name="amountPaid"
                label={$t('VISITS.AMOUNT_PAID')}
                keyboardType="numeric"
              />

              {/* Submit */}
              <FormButton
                title={isEdit ? $t('COMMON.UPDATE') : $t('COMMON.SAVE')}
                loading={isLoading}
                onPress={() => formikSubmit()}
              />
            </View>
          )}
        </Formik>
      )}
    </ScreenContainer>
  );
}
