import React, { useState } from 'react';
import { View } from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { FormDatePicker, FormTextAreaInput, FormSelect, FormButton } from '@/components/form';
import SectionHeader from '@/components/global/SectionHeader';
import { FormSchemaProvider } from '@/helper/useFieldRequired';
import { AppointmentStatus } from '@/api/services/appointmentService/appointmentInterface';
import { Patient } from '@/api/services/patientService/patientInterface';
import PatientSelectorField from './PatientSelectorField';
import PatientPickerSheet from './PatientPickerSheet';

export interface AppointmentFormValues {
  patientId: string;
  patientName: string;
  dateTime: string;
  status: string;
  notes: string;
  reminderAt: string;
}

interface AppointmentFormProps {
  initialValues: AppointmentFormValues;
  isEdit: boolean;
  isLoading: boolean;
  onSubmit: (values: AppointmentFormValues) => void;
}

const validationSchema = Yup.object().shape({
  patientId: Yup.string().required($t('VALIDATORS.REQUIRED')),
  dateTime: Yup.string().required($t('VALIDATORS.REQUIRED')),
  status: Yup.string().required($t('VALIDATORS.REQUIRED')),
  notes: Yup.string(),
  reminderAt: Yup.string(),
});

const statusOptions: Array<{ label: string; value: AppointmentStatus }> = [
  { label: $t('APPOINTMENTS.STATUS_PENDING'), value: 'pending' },
  { label: $t('APPOINTMENTS.STATUS_CONFIRMED'), value: 'confirmed' },
  { label: $t('APPOINTMENTS.STATUS_COMPLETED'), value: 'completed' },
  { label: $t('APPOINTMENTS.STATUS_CANCELLED'), value: 'cancelled' },
];

export default function AppointmentForm({
  initialValues,
  isEdit,
  isLoading,
  onSubmit,
}: AppointmentFormProps) {
  const [showPatientPicker, setShowPatientPicker] = useState(false);

  return (
    <FormSchemaProvider schema={validationSchema}>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={onSubmit}
        enableReinitialize>
        {({ handleSubmit, values, setFieldValue, errors, touched }) => (
          <View className="px-4 pb-8">
            {/* Section 1: Appointment Info */}
            <SectionHeader title={$t('APPOINTMENTS.APPOINTMENT_INFO_SECTION')} />

            <PatientSelectorField
              label={$t('APPOINTMENTS.PATIENT')}
              placeholder={$t('APPOINTMENTS.SELECT_PATIENT')}
              value={values.patientName}
              error={touched.patientId ? errors.patientId : undefined}
              onPress={() => setShowPatientPicker(true)}
            />

            <FormDatePicker
              name="dateTime"
              placeholder={$t('APPOINTMENTS.DATE')}
              maximumDate={new Date(2100, 11, 31)}
            />

            <FormSelect
              name="status"
              label={$t('APPOINTMENTS.STATUS')}
              options={statusOptions}
              placeholder={$t('COMMON.SELECT_OPTION')}
            />

            <FormTextAreaInput name="notes" label={$t('APPOINTMENTS.NOTES')} />

            {/* Section 2: Reminder */}
            <SectionHeader title={$t('APPOINTMENTS.REMINDER_SECTION')} />

            <FormDatePicker
              name="reminderAt"
              placeholder={$t('APPOINTMENTS.REMINDER_TIME')}
              maximumDate={new Date(2100, 11, 31)}
            />

            {/* Submit */}
            <FormButton
              title={isEdit ? $t('COMMON.UPDATE') : $t('COMMON.SAVE')}
              loading={isLoading}
              onPress={() => handleSubmit()}
            />

            <PatientPickerSheet
              visible={showPatientPicker}
              onClose={() => setShowPatientPicker(false)}
              onSelect={(patient: Patient) => {
                setFieldValue('patientId', patient.id);
                setFieldValue('patientName', patient.fullName);
                setShowPatientPicker(false);
              }}
            />
          </View>
        )}
      </Formik>
    </FormSchemaProvider>
  );
}
