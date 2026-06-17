import { ScreenName } from '@/constants/screenName';

export type RootStackParamList = {
  // Auth
  [ScreenName.SPLASH_SCREEN]: undefined;
  [ScreenName.LOGIN_SCREEN]: undefined;
  [ScreenName.FORGOT_PASSWORD_SCREEN]: undefined;

  // Navigators
  [ScreenName.TAB_NAVIGATOR]: undefined;

  // App - Tabs
  [ScreenName.DASHBOARD_SCREEN]: undefined;
  [ScreenName.PATIENTS_SCREEN]: undefined;
  [ScreenName.APPOINTMENTS_SCREEN]: undefined;
  [ScreenName.MORE_SCREEN]: undefined;

  // App - Patients
  [ScreenName.PATIENT_DETAILS_SCREEN]: { patientId: string };
  [ScreenName.ADD_EDIT_PATIENT_SCREEN]: { patientId?: string } | undefined;

  // App - Search
  [ScreenName.SEARCH_SCREEN]: undefined;

  // App - Visits
  [ScreenName.VISIT_DETAILS_SCREEN]: { visitId: string; patientId: string };
  [ScreenName.ADD_EDIT_VISIT_SCREEN]: { patientId: string; visitId?: string } | undefined;

  // App - Appointments
  [ScreenName.APPOINTMENT_DETAILS_SCREEN]: { appointmentId: string };
  [ScreenName.ADD_EDIT_APPOINTMENT_SCREEN]: { appointmentId?: string; patientId?: string } | undefined;

  // App - More
  [ScreenName.SETTINGS_SCREEN]: undefined;
  [ScreenName.ABOUT_SCREEN]: undefined;
};

export type AppTabParamList = {
  [ScreenName.DASHBOARD_SCREEN]: undefined;
  [ScreenName.PATIENTS_SCREEN]: undefined;
  [ScreenName.APPOINTMENTS_SCREEN]: undefined;
  [ScreenName.MORE_SCREEN]: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
