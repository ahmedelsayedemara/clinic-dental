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
  FormInput,
  FormTextAreaInput,
  FormSelect,
  FormDatePicker,
  FormButton,
} from '@/components/form';
import { Text } from '@/components/UI';
import { useTheme } from '@/theme/ThemeProvider';
import { patientService } from '@/api/services/patientService/patientService';
import { Patient, AddPatientPayload } from '@/api/services/patientService/patientInterface';
import { RootStackParamList } from '@/types/navigation';
import { ScreenName } from '@/constants/screenName';

type Props = NativeStackScreenProps<RootStackParamList, ScreenName.ADD_EDIT_PATIENT_SCREEN>;

const validationSchema = Yup.object().shape({
  fullName: Yup.string().required($t('VALIDATORS.REQUIRED')),
  mobile: Yup.string()
    .required($t('VALIDATORS.REQUIRED'))
    .matches(/^[0-9+\s()-]{7,20}$/, $t('VALIDATORS.MOBILE')),
  fileNumber: Yup.string().required($t('VALIDATORS.REQUIRED')),
  archiveYear: Yup.number()
    .transform((value, originalValue) => (originalValue === '' ? undefined : value))
    .nullable()
    .min(1900)
    .max(2100),
  archiveMonth: Yup.number()
    .transform((value, originalValue) => (originalValue === '' ? undefined : value))
    .nullable()
    .min(1)
    .max(12),
});

export default function AddEditPatientScreen({ navigation, route }: Props) {
  // State
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [prefetchedPatient, setPrefetchedPatient] = useState<Patient | null>(null);

  // Variables
  const { theme } = useTheme();
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

  const initialValues = {
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

  const handleSubmit = async (values: typeof initialValues) => {
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

  const genderOptions = [
    { label: $t('PATIENTS.GENDER_MALE'), value: 'male' },
    { label: $t('PATIENTS.GENDER_FEMALE'), value: 'female' },
  ];

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
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          enableReinitialize>
          {({ handleSubmit: formikSubmit }) => (
            <View className="px-4 pb-8">
              {/* Section 1: Personal Info */}
              <Text className="text-base font-ibm-bold mt-4 mb-3" style={{ color: theme.text }}>
                {$t('PATIENTS.PERSONAL_INFO')}
              </Text>

              <FormInput name="fullName" label={$t('PATIENTS.FULL_NAME')} />
              <FormInput name="mobile" label={$t('PATIENTS.MOBILE')} keyboardType="phone-pad" />
              <FormInput name="address" label={$t('PATIENTS.ADDRESS')} />
              <FormDatePicker name="dateOfBirth" placeholder={$t('PATIENTS.DATE_OF_BIRTH')} />
              <FormSelect
                name="gender"
                label={$t('PATIENTS.GENDER')}
                options={genderOptions}
                placeholder={$t('COMMON.SELECT_OPTION')}
              />
              <FormTextAreaInput name="notes" label={$t('PATIENTS.NOTES')} />

              {/* Section 2: Archive / Physical File */}
              <Text className="text-base font-ibm-bold mt-4 mb-3" style={{ color: theme.text }}>
                {$t('PATIENTS.ARCHIVE_SECTION')}
              </Text>

              <FormInput name="fileNumber" label={$t('PATIENTS.FILE_NUMBER')} />
              <FormInput
                name="archiveYear"
                label={$t('PATIENTS.ARCHIVE_YEAR')}
                keyboardType="numeric"
              />
              <FormInput
                name="archiveMonth"
                label={$t('PATIENTS.ARCHIVE_MONTH')}
                keyboardType="numeric"
              />

              {/* Section 3: Medical Info */}
              <Text className="text-base font-ibm-bold mt-4 mb-3" style={{ color: theme.text }}>
                {$t('PATIENTS.MEDICAL_SECTION')}
              </Text>

              <FormTextAreaInput name="medicalHistory" label={$t('PATIENTS.MEDICAL_HISTORY')} />
              <FormTextAreaInput name="diagnosis" label={$t('PATIENTS.DIAGNOSIS')} />
              <FormTextAreaInput name="treatmentPlan" label={$t('PATIENTS.TREATMENT_PLAN')} />

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
