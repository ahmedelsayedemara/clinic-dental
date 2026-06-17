import React, { useCallback, useEffect, useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Toast from 'react-native-toast-message';
import ScreenContainer from '@/components/global/ScreenContainer';
import AppHeader from '@/components/global/AppHeader';
import SectionLoader from '@/components/global/SectionLoader';
import PatientForm, { PatientFormValues } from '@/components/patients/PatientForm';
import { patientService } from '@/api/services/patientService/patientService';
import { Patient, AddPatientPayload } from '@/api/services/patientService/patientInterface';
import { RootStackParamList } from '@/types/navigation';
import { ScreenName } from '@/constants/screenName';

type Props = NativeStackScreenProps<RootStackParamList, ScreenName.ADD_EDIT_PATIENT_SCREEN>;

export default function AddEditPatientScreen({ navigation, route }: Props) {
  // State
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [prefetchedPatient, setPrefetchedPatient] = useState<Patient | null>(null);

  // Variables
  const isEdit = !!route.params?.patientId;
  const patientId = route.params?.patientId;

  // Handlers / Callbacks
  const fetchPatient = useCallback(async () => {
    if (!patientId) return;
    setIsFetching(true);
    try {
      const result = await patientService.getPatientByIdRequest(patientId);
      setPrefetchedPatient(result);
    } catch (_error) {
      Toast.show({ type: 'error', text1: $t('COMMON.SOMETHING_WENT_WRONG') });
    } finally {
      setIsFetching(false);
    }
  }, [patientId]);

  // Effects (useEffect)
  useEffect(() => {
    if (isEdit) {
      fetchPatient();
    }
  }, [isEdit, fetchPatient]);

  const initialValues: PatientFormValues = {
    fullName: prefetchedPatient?.fullName ?? '',
    mobile: prefetchedPatient?.mobile ?? '',
    address: prefetchedPatient?.address ?? '',
    dateOfBirth: prefetchedPatient?.dateOfBirth ?? '',
    gender: prefetchedPatient?.gender ?? '',
    notes: prefetchedPatient?.notes ?? '',
    fileNumber: prefetchedPatient?.fileNumber ?? '',
    archiveYear: prefetchedPatient?.archiveYear?.toString() ?? '',
    archiveMonth: prefetchedPatient?.archiveMonth?.toString() ?? '',
    medicalHistory: prefetchedPatient?.medicalHistory ?? '',
    diagnosis: prefetchedPatient?.diagnosis ?? '',
    treatmentPlan: prefetchedPatient?.treatmentPlan ?? '',
  };

  const handleSubmit = async (values: PatientFormValues) => {
    setIsLoading(true);
    try {
      const payload: Partial<AddPatientPayload> = {
        fullName: values.fullName,
        mobile: values.mobile,
        fileNumber: values.fileNumber,
        address: values.address || undefined,
        dateOfBirth: values.dateOfBirth || undefined,
        gender: (values.gender as AddPatientPayload['gender']) || undefined,
        notes: values.notes || undefined,
        archiveYear: values.archiveYear ? Number(values.archiveYear) : undefined,
        archiveMonth: values.archiveMonth ? Number(values.archiveMonth) : undefined,
        medicalHistory: values.medicalHistory || undefined,
        diagnosis: values.diagnosis || undefined,
        treatmentPlan: values.treatmentPlan || undefined,
      };

      if (isEdit && patientId) {
        await patientService.putUpdatePatientRequest(patientId, payload);
      } else {
        await patientService.postAddPatientRequest(payload as AddPatientPayload);
      }

      Toast.show({ type: 'success', text1: $t('PATIENTS.SAVED_SUCCESS') });
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
        title={isEdit ? $t('PATIENTS.EDIT_PATIENT') : $t('PATIENTS.ADD_PATIENT')}
        onBack={() => navigation.goBack()}
        showBack
      />

      {isFetching && <SectionLoader style="list" />}

      {!isFetching && (
        <PatientForm
          initialValues={initialValues}
          isEdit={isEdit}
          isLoading={isLoading}
          onSubmit={handleSubmit}
        />
      )}
    </ScreenContainer>
  );
}
