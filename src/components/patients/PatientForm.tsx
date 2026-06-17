import React from 'react';
import { View } from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import {
  FormInput,
  FormTextAreaInput,
  FormSelect,
  FormDatePicker,
  FormButton,
} from '@/components/form';
import SectionHeader from '@/components/global/SectionHeader';

export interface PatientFormValues {
  fullName: string;
  mobile: string;
  address: string;
  dateOfBirth: string;
  gender: string;
  notes: string;
  fileNumber: string;
  archiveYear: string;
  archiveMonth: string;
  medicalHistory: string;
  diagnosis: string;
  treatmentPlan: string;
}

interface PatientFormProps {
  initialValues: PatientFormValues;
  isEdit: boolean;
  isLoading: boolean;
  onSubmit: (values: PatientFormValues) => void;
}

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

const genderOptions = [
  { label: $t('PATIENTS.GENDER_MALE'), value: 'male' },
  { label: $t('PATIENTS.GENDER_FEMALE'), value: 'female' },
];

export default function PatientForm({
  initialValues,
  isEdit,
  isLoading,
  onSubmit,
}: PatientFormProps) {
  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={onSubmit}
      enableReinitialize>
      {({ handleSubmit }) => (
        <View className="px-4 pb-8">
          {/* Section 1: Personal Info */}
          <SectionHeader title={$t('PATIENTS.PERSONAL_INFO')} />

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
          <SectionHeader title={$t('PATIENTS.ARCHIVE_SECTION')} />

          <FormInput name="fileNumber" label={$t('PATIENTS.FILE_NUMBER')} />
          <FormInput name="archiveYear" label={$t('PATIENTS.ARCHIVE_YEAR')} keyboardType="numeric" />
          <FormInput
            name="archiveMonth"
            label={$t('PATIENTS.ARCHIVE_MONTH')}
            keyboardType="numeric"
          />

          {/* Section 3: Medical Info */}
          <SectionHeader title={$t('PATIENTS.MEDICAL_SECTION')} />

          <FormTextAreaInput name="medicalHistory" label={$t('PATIENTS.MEDICAL_HISTORY')} />
          <FormTextAreaInput name="diagnosis" label={$t('PATIENTS.DIAGNOSIS')} />
          <FormTextAreaInput name="treatmentPlan" label={$t('PATIENTS.TREATMENT_PLAN')} />

          {/* Submit */}
          <FormButton
            title={isEdit ? $t('COMMON.UPDATE') : $t('COMMON.SAVE')}
            loading={isLoading}
            onPress={() => handleSubmit()}
          />
        </View>
      )}
    </Formik>
  );
}
