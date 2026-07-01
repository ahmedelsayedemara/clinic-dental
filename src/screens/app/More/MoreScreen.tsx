import React, { useCallback, useState } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/types/navigation';
import { ScreenName } from '@/constants/screenName';
import ScreenContainer from '@/components/global/ScreenContainer';
import AppHeader from '@/components/global/AppHeader';
import ConfirmationDialog from '@/components/global/ConfirmationDialog';
import { Text } from '@/components/UI';
import { useTheme } from '@/theme/ThemeProvider';
import { useAuthStore } from '@/store/useAuthStore';
import { authService } from '@/api/services/authService/authService';
import Toast from 'react-native-toast-message';

type Props = NativeStackScreenProps<RootStackParamList, ScreenName.MORE_SCREEN>;

export default function MoreScreen({ navigation }: Props) {
  // State
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  // Variables
  const { theme } = useTheme();
  const { logout } = useAuthStore();

  // Handlers / Callbacks
  const handleLogoutConfirm = useCallback(async () => {
    setShowLogoutDialog(false);
    try {
      await authService.postLogoutRequest();
    } catch (error) {
      // Ignore Firebase signOut errors — still clear local state
    }
    logout();
  }, [logout]);

  // Render
  return (
    <ScreenContainer safeAreaEdges={['top', 'bottom']} padded={false}>
      <AppHeader title={$t('MORE.TITLE')} showBack={false} />

      <View className="px-4 mt-2">
        {/* Settings */}
        <TouchableOpacity
          className="flex-row items-center py-4 border-b"
          style={{ borderBottomColor: theme.border }}
          onPress={() => navigation.navigate(ScreenName.SETTINGS_SCREEN)}
          activeOpacity={0.7}>
          <Text className="flex-1 text-base font-ibm-medium" style={{ color: theme.text }}>
            {$t('MORE.SETTINGS')}
          </Text>
        </TouchableOpacity>

        {/* About */}
        {/* <TouchableOpacity
          className="flex-row items-center py-4 border-b"
          style={{ borderBottomColor: theme.border }}
          onPress={() => navigation.navigate(ScreenName.ABOUT_SCREEN)}
          activeOpacity={0.7}>
          <Text className="flex-1 text-base font-ibm-medium" style={{ color: theme.text }}>
            {$t('MORE.ABOUT')}
          </Text>
        </TouchableOpacity> */}

        {/* Logout */}
        <TouchableOpacity
          className="flex-row items-center py-4"
          onPress={() => setShowLogoutDialog(true)}
          activeOpacity={0.7}>
          <Text className="flex-1 text-base font-ibm-medium" style={{ color: theme.error }}>
            {$t('AUTH.LOGOUT')}
          </Text>
        </TouchableOpacity>
      </View>

      <ConfirmationDialog
        visible={showLogoutDialog}
        type="warning"
        title={$t('AUTH.LOGOUT_CONFIRM')}
        message={$t('AUTH.LOGOUT_HINT')}
        confirmText={$t('AUTH.LOGOUT')}
        cancelText={$t('COMMON.CANCEL')}
        onConfirm={handleLogoutConfirm}
        onCancel={() => setShowLogoutDialog(false)}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({});
