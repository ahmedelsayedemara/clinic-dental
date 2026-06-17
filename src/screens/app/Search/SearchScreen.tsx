import React, { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons';
import ScreenContainer from '@/components/global/ScreenContainer';
import AppHeader from '@/components/global/AppHeader';
import SearchBar from '@/components/global/SearchBar';
import Empty from '@/components/global/Empty';
import { PatientSearchResultCard } from '@/components/patients';
import { Text } from '@/components/UI';
import { useTheme } from '@/theme/ThemeProvider';
import { patientService } from '@/api/services/patientService/patientService';
import { Patient } from '@/api/services/patientService/patientInterface';
import { debounce } from '@/helper';
import { RootStackParamList } from '@/types/navigation';
import { ScreenName } from '@/constants/screenName';

type Props = NativeStackScreenProps<RootStackParamList, ScreenName.SEARCH_SCREEN>;

export default function SearchScreen({ navigation }: Props) {
  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<Patient[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Variables
  const { theme } = useTheme();

  // Handlers / Callbacks
  const performSearch = useCallback(
    debounce(async (query: string) => {
      if (!query.trim()) {
        setResults([]);
        setIsSearching(false);
        return;
      }
      setIsSearching(true);
      try {
        const patients = await patientService.searchPatientsRequest(query);
        setResults(patients);
      } catch (_error) {
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300),
    [],
  );

  const handleSearchChange = useCallback(
    (text: string) => {
      setSearchQuery(text);
      if (text.trim()) {
        setIsSearching(true);
      }
      performSearch(text);
    },
    [performSearch],
  );

  const handlePatientPress = useCallback(
    (patientId: string) => {
      navigation.navigate(ScreenName.PATIENT_DETAILS_SCREEN, { patientId });
    },
    [navigation],
  );

  // Render helpers
  const renderItem = useCallback(
    ({ item }: { item: Patient }) => (
      <PatientSearchResultCard patient={item} onPress={handlePatientPress} />
    ),
    [handlePatientPress],
  );

  const renderSeparator = useCallback(() => <View className="h-2" />, []);

  // Return UI
  return (
    <ScreenContainer padded={false} safeAreaEdges={['top', 'bottom']}>
      <AppHeader title={$t('SEARCH.TITLE')} onBack={() => navigation.goBack()} showBack />

      <SearchBar
        value={searchQuery}
        onChangeText={handleSearchChange}
        placeholder={$t('SEARCH.PLACEHOLDER')}
      />

      {isSearching && (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      )}

      {!isSearching && results.length > 0 && (
        <>
          <Text className="text-xs font-ibm-medium mx-4 mb-2 mt-1" style={{ color: theme.muted }}>
            {$t('SEARCH.RESULTS_COUNT', { count: results.length })}
          </Text>
          <FlatList
            data={results}
            keyExtractor={item => item.id}
            renderItem={renderItem}
            ItemSeparatorComponent={renderSeparator}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 24, paddingTop: 4 }}
          />
        </>
      )}

      {!isSearching && searchQuery.trim().length > 0 && results.length === 0 && (
        <Empty
          icon={<MaterialDesignIcons name="magnify" size={56} color={theme.border} />}
          title={$t('SEARCH.NO_RESULTS')}
          description={$t('SEARCH.NO_RESULTS_DESC')}
        />
      )}
    </ScreenContainer>
  );
}
