import React, { useCallback, useRef, useState } from 'react';
import { FlatList, TouchableOpacity, View } from 'react-native';
import BottomSheetModal from '@/components/global/BottomSheetModal';
import SearchBar from '@/components/global/SearchBar';
import SectionLoader from '@/components/global/SectionLoader';
import AnimatedListItem from '@/components/global/AnimatedListItem';
import { Text } from '@/components/UI';
import { useTheme } from '@/theme/ThemeProvider';
import { patientService } from '@/api/services/patientService/patientService';
import { Patient } from '@/api/services/patientService/patientInterface';
import { debounce } from '@/helper';

interface PatientPickerSheetProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (patient: Patient) => void;
}

/**
 * Self-contained patient search/picker bottom sheet. Owns its own search query,
 * debounced lookup and result list — the parent only needs visible/onClose/onSelect.
 */
export default function PatientPickerSheet({ visible, onClose, onSelect }: PatientPickerSheetProps) {
  const { theme } = useTheme();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Patient[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const debouncedSearchRef = useRef(
    debounce(async (q: string) => {
      if (!q.trim()) {
        setResults([]);
        return;
      }
      setIsSearching(true);
      try {
        const res = await patientService.searchPatientsRequest(q);
        setResults(res);
      } catch (_error) {
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 400),
  );

  const handleSearch = useCallback((text: string) => {
    setQuery(text);
    debouncedSearchRef.current(text);
  }, []);

  const reset = useCallback(() => {
    setQuery('');
    setResults([]);
  }, []);

  const handleClose = useCallback(() => {
    reset();
    onClose();
  }, [reset, onClose]);

  const handleSelect = useCallback(
    (patient: Patient) => {
      reset();
      onSelect(patient);
    },
    [reset, onSelect],
  );

  const renderItem = useCallback(
    ({ item, index }: { item: Patient; index: number }) => (
      <AnimatedListItem index={index}>
        <TouchableOpacity
          onPress={() => handleSelect(item)}
          className="px-4 py-3"
          style={{ borderBottomWidth: 1, borderBottomColor: theme.border }}>
          <Text className="text-sm font-ibm-medium" style={{ color: theme.text }}>
            {item.fullName}
          </Text>
          <Text className="text-xs font-ibm-regular mt-0.5" style={{ color: theme.textSecondary }}>
            {item.mobile} · #{item.fileNumber}
          </Text>
        </TouchableOpacity>
      </AnimatedListItem>
    ),
    [handleSelect, theme],
  );

  return (
    <BottomSheetModal
      visible={visible}
      onClose={handleClose}
      title={$t('APPOINTMENTS.SELECT_PATIENT')}
      maxHeightRatio={0.75}>
      <View className="px-4 pb-2">
        <SearchBar
          value={query}
          onChangeText={handleSearch}
          placeholder={$t('PATIENTS.SEARCH_PLACEHOLDER')}
        />
      </View>
      {isSearching ? (
        <SectionLoader style="list" />
      ) : (
        <FlatList
          data={results}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
        />
      )}
    </BottomSheetModal>
  );
}
