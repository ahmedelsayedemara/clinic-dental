import React, { useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/types/navigation';
import { ScreenName } from '@/constants/screenName';
import { useAuthStore } from '@/store/useAuthStore';

// Auth screens
import SplashScreen from '@/screens/auth/SplashScreen';
import LoginScreen from '@/screens/auth/LoginScreen';
import ForgotPasswordScreen from '@/screens/auth/ForgotPasswordScreen';

// App navigator
import TabNavigator from '@/navigation/TabNavigator';

// App screens
import PatientDetailsScreen from '@/screens/app/Patients/PatientDetailsScreen';
import AddEditPatientScreen from '@/screens/app/Patients/AddEditPatientScreen';
import SearchScreen from '@/screens/app/Search/SearchScreen';
import SettingsScreen from '@/screens/app/More/SettingsScreen';
import AboutScreen from '@/screens/app/More/AboutScreen';

// Visit screens
import VisitDetailsScreen from '@/screens/app/Visits/VisitDetailsScreen';
import AddEditVisitScreen from '@/screens/app/Visits/AddEditVisitScreen';

// Appointment screens
import AppointmentDetailsScreen from '@/screens/app/Appointments/AppointmentDetailsScreen';
import AddEditAppointmentScreen from '@/screens/app/Appointments/AddEditAppointmentScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootStack() {
  const { isAuthenticated, isLoading, hydrate } = useAuthStore();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  if (isLoading) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name={ScreenName.SPLASH_SCREEN} component={SplashScreen} />
      </Stack.Navigator>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <>
          <Stack.Screen name={ScreenName.TAB_NAVIGATOR} component={TabNavigator} />
          <Stack.Screen name={ScreenName.PATIENT_DETAILS_SCREEN} component={PatientDetailsScreen} />
          <Stack.Screen
            name={ScreenName.ADD_EDIT_PATIENT_SCREEN}
            component={AddEditPatientScreen}
          />
          <Stack.Screen
            name={ScreenName.SEARCH_SCREEN}
            component={SearchScreen}
            options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
          />
          <Stack.Screen name={ScreenName.SETTINGS_SCREEN} component={SettingsScreen} />
          <Stack.Screen name={ScreenName.ABOUT_SCREEN} component={AboutScreen} />

          {/* Visit screens */}
          <Stack.Screen name={ScreenName.VISIT_DETAILS_SCREEN} component={VisitDetailsScreen} />
          <Stack.Screen name={ScreenName.ADD_EDIT_VISIT_SCREEN} component={AddEditVisitScreen} />

          {/* Appointment detail/edit screens */}
          <Stack.Screen
            name={ScreenName.APPOINTMENT_DETAILS_SCREEN}
            component={AppointmentDetailsScreen}
          />
          <Stack.Screen
            name={ScreenName.ADD_EDIT_APPOINTMENT_SCREEN}
            component={AddEditAppointmentScreen}
          />
        </>
      ) : (
        <>
          <Stack.Screen name={ScreenName.LOGIN_SCREEN} component={LoginScreen} />
          <Stack.Screen name={ScreenName.FORGOT_PASSWORD_SCREEN} component={ForgotPasswordScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}
