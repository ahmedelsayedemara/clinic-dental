import React from 'react';
import { View } from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { FormDatePicker, FormTextAreaInput, FormInput, FormButton } from '@/components/form';
import SectionHeader from '@/components/global/SectionHeader';
import { FormSchemaProvider } from '@/helper/useFieldRequired';

export interface VisitFormValues {
  visitDate: string;
  diagnosis: string;
  treatmentPerformed: string;
  notes: string;
  amountTotal: string;
  amountPaid: string;
}

interface VisitFormProps {
  initialValues: VisitFormValues;
  isEdit: boolean;
  isLoading: boolean;
  onSubmit: (values: VisitFormValues) => void;
}

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

export default function VisitForm({ initialValues, isEdit, isLoading, onSubmit }: VisitFormProps) {
  return (
    <FormSchemaProvider schema={validationSchema}>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={onSubmit}
        enableReinitialize>
        {({ handleSubmit }) => (
          <View className="px-4 pb-8">
            {/* Section 1: Visit Info */}
            <SectionHeader title={$t('VISITS.VISIT_INFO_SECTION')} />

            <FormDatePicker
              name="visitDate"
              placeholder={$t('VISITS.VISIT_DATE')}
              maximumDate={new Date(2100, 11, 31)}
            />

            {/* <FormTextAreaInput name="diagnosis" label={$t('VISITS.DIAGNOSIS')} />
            <FormTextAreaInput name="treatmentPerformed" label={$t('VISITS.TREATMENT')} /> */}
            <FormTextAreaInput name="notes" label={$t('VISITS.NOTES')} />

            {/* Section 2: Payment */}
            <SectionHeader title={$t('VISITS.PAYMENT_SECTION')} />

            <FormInput
              name="amountTotal"
              label={$t('VISITS.AMOUNT_TOTAL')}
              keyboardType="numeric"
            />
            <View className='mb-4'>

              <FormInput name="amountPaid" label={$t('VISITS.AMOUNT_PAID')} keyboardType="numeric" />
            </View>

            {/* Submit */}
            <FormButton
              title={isEdit ? $t('COMMON.UPDATE') : $t('COMMON.SAVE')}
              loading={isLoading}
              onPress={() => handleSubmit()}
            />
          </View>
        )}
      </Formik>
    </FormSchemaProvider>
  );
}
