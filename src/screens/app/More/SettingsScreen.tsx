import React, { useCallback } from 'react';
import { View, Switch, TouchableOpacity } from 'react-native';
import RNRestart from 'react-native-restart';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons';
import { RootStackParamList } from '@/types/navigation';
import { ScreenName } from '@/constants/screenName';
import ScreenContainer from '@/components/global/ScreenContainer';
import AppHeader from '@/components/global/AppHeader';
import { Text } from '@/components/UI';
import { useTheme } from '@/theme/ThemeProvider';
import { useThemeStore } from '@/store/useThemeStore';
import { useLanguageStore } from '@/store/useLanguageStore';
import { changeLanguage } from '@/locale/i18n';

type Props = NativeStackScreenProps<RootStackParamList, ScreenName.SETTINGS_SCREEN>;

const LANGUAGES: Array<{ code: 'ar' | 'en'; label: string }> = [
  { code: 'ar', label: 'العربية' },
  { code: 'en', label: 'English' },
];

export default function SettingsScreen({ navigation }: Props) {
  // Variables
  const { theme } = useTheme();
  const { isDark, toggleTheme } = useThemeStore();
  const { currentLanguage, setLanguage } = useLanguageStore();

  // Handlers / Callbacks
  const handleSelectLanguage = useCallback(
    async (code: 'ar' | 'en') => {
      if (code === currentLanguage) return;
      await changeLanguage(code);
      setLanguage(code);
      setTimeout(() => RNRestart.restart(), 100);
    },
    [currentLanguage, setLanguage],
  );

  // Render helpers
  const renderSectionTitle = (title: string) => (
    <Text className="text-xs font-ibm-bold uppercase mb-2 mt-6" style={{ color: theme.muted }}>
      {title}
    </Text>
  );

  // Return UI
  return (
    <ScreenContainer scrollable safeAreaEdges={['top', 'bottom']}>
      <AppHeader title={$t('MORE.SETTINGS')} onBack={() => navigation.goBack()} />

      {/* Appearance */}
      {renderSectionTitle($t('MORE.APPEARANCE'))}
      <View
        className="flex-row items-center rounded-xl px-4 py-4"
        style={{ backgroundColor: theme.card, borderWidth: 1, borderColor: theme.cardBorder }}>
        <MaterialDesignIcons name="weather-night" size={22} color={theme.primary} />
        <Text className="flex-1 text-base font-ibm-medium mx-3" style={{ color: theme.text }}>
          {$t('MORE.DARK_MODE')}
        </Text>
        <Switch
          value={isDark}
          onValueChange={toggleTheme}
          trackColor={{ false: theme.border, true: theme.primary }}
          thumbColor="#FFFFFF"
        />
      </View>

      {/* Language */}
      {renderSectionTitle($t('MORE.LANGUAGE'))}
      <View
        className="rounded-xl overflow-hidden"
        style={{ backgroundColor: theme.card, borderWidth: 1, borderColor: theme.cardBorder }}>
        {LANGUAGES.map((lang, index) => {
          const selected = lang.code === currentLanguage;
          return (
            <TouchableOpacity
              key={lang.code}
              activeOpacity={0.7}
              onPress={() => handleSelectLanguage(lang.code)}
              className="flex-row items-center px-4 py-4"
              style={
                index > 0 ? { borderTopWidth: 1, borderTopColor: theme.cardBorder } : undefined
              }>
              <Text className="flex-1 text-base font-ibm-medium" style={{ color: theme.text }}>
                {lang.label}
              </Text>
              {selected && (
                <MaterialDesignIcons name="check-circle" size={22} color={theme.primary} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* App version */}
      <View className="items-center mt-10">
        <Text className="text-xs font-ibm-regular" style={{ color: theme.muted }}>
          {$t('MORE.APP_VERSION')} 1.0.0
        </Text>
      </View>
    </ScreenContainer>
  );
}
