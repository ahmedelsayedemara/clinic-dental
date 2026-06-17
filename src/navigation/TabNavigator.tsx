import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ScreenName } from '@/constants/screenName';
import CustomTabBar from '@/navigation/CustomTabBar';
import { AppTabParamList } from '@/types/navigation';

// Placeholder screens — will be replaced by real screens in subsequent phases
import DashboardScreen from '@/screens/app/Dashboard/DashboardScreen';
import PatientsScreen from '@/screens/app/Patients/PatientsScreen';
import AppointmentsScreen from '@/screens/app/Appointments/AppointmentsScreen';
import MoreScreen from '@/screens/app/More/MoreScreen';

const Tab = createBottomTabNavigator<AppTabParamList>();

export default function TabNavigator() {
  return (
    <Tab.Navigator
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}>
      <Tab.Screen
        name={ScreenName.DASHBOARD_SCREEN}
        component={DashboardScreen as React.ComponentType}
      />
      <Tab.Screen
        name={ScreenName.PATIENTS_SCREEN}
        component={PatientsScreen as React.ComponentType}
      />
      <Tab.Screen
        name={ScreenName.APPOINTMENTS_SCREEN}
        component={AppointmentsScreen as React.ComponentType}
      />
      <Tab.Screen
        name={ScreenName.MORE_SCREEN}
        component={MoreScreen as React.ComponentType}
      />
    </Tab.Navigator>
  );
}
