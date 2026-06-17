import React, { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, TouchableOpacity, View } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons';
import ScreenContainer from '@/components/global/ScreenContainer';
import AppHeader from '@/components/global/AppHeader';
import SearchBar from '@/components/global/SearchBar';
import SectionLoader from '@/components/global/SectionLoader';
import Empty from '@/components/global/Empty';
import AnimatedListItem from '@/components/global/AnimatedListItem';
import { PatientCard } from '@/components/patients';
import { Text } from '@/components/UI';
import { useTheme } from '@/theme/ThemeProvider';
import { usePatients } from '@/hooks/usePatients';
import { useTabBarSpace } from '@/hooks/useTabBarSpace';
import { Patient } from '@/api/services/patientService/patientInterface';
import { RootStackParamList } from '@/types/navigation';
import { ScreenName } from '@/constants/screenName';
import { isRTL } from '@/helper';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function PatientsScreen() {
  // State
  const [refreshing, setRefreshing] = useState(false);
  const isFirstFocus = useRef(true);

  // Variables
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const { patients, isLoading, isLoadingMore, hasFetched, refresh, loadMore } = usePatients(20);
  const bottomSpace = useTabBarSpace();

  // Handlers / Callbacks
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }, [refresh]);

  const handleLoadMore = useCallback(() => {
    loadMore();
  }, [loadMore]);

  const handlePatientPress = useCallback(
    (patientId: string) => {
      navigation.navigate(ScreenName.PATIENT_DETAILS_SCREEN, { patientId });
    },
    [navigation],
  );

  const handleAddPress = useCallback(() => {
    navigation.navigate(ScreenName.ADD_EDIT_PATIENT_SCREEN, undefined);
  }, [navigation]);

  const handleSearchPress = useCallback(() => {
    navigation.navigate(ScreenName.SEARCH_SCREEN);
  }, [navigation]);

  // Effects — refresh the list whenever the screen regains focus (e.g. returning
  // from Add/Edit Patient). Skip the first focus since usePatients loads on mount.
  useFocusEffect(
    useCallback(() => {
      if (isFirstFocus.current) {
        isFirstFocus.current = false;
        return;
      }
      refresh();
    }, [refresh]),
  );

  // Render helpers
  const renderItem = useCallback(
    ({ item, index }: { item: Patient; index: number }) => (
      <AnimatedListItem index={index}>
        <PatientCard patient={item} onPress={handlePatientPress} />
      </AnimatedListItem>
    ),
    [handlePatientPress],
  );

  const renderFooter = useCallback(() => {
    if (!isLoadingMore) return null;
    return (
      <View className="py-4 items-center">
        <ActivityIndicator size="small" color={theme.primary} />
      </View>
    );
  }, [isLoadingMore, theme.primary]);

  const renderEmpty = useCallback(() => {
    if (!hasFetched) return null;
    return (
      <Empty
        icon={
          <MaterialDesignIcons name="account-multiple-outline" size={56} color={theme.border} />
        }
        title={$t('PATIENTS.NO_PATIENTS')}
        description={$t('PATIENTS.NO_PATIENTS_DESC')}
      />
    );
  }, [hasFetched, theme.border]);

  // Return UI
  return (
    <ScreenContainer
      safeAreaEdges={['top']}
      padded={false}
      onRefresh={handleRefresh}
      refreshing={refreshing}>
      {/* Sticky header zone */}
      <View>
        <AppHeader
          title={$t('PATIENTS.TITLE')}
          showBack={false}
          rightElement={
            <TouchableOpacity onPress={handleAddPress} className="p-2" activeOpacity={0.7}>
              <MaterialDesignIcons name="plus" size={26} color={theme.primary} />
            </TouchableOpacity>
          }
        />

        {/* Search bar as a pressable button that navigates to SearchScreen */}
        <Pressable onPress={handleSearchPress} className="mx-4 mb-2">
          <View pointerEvents="none">
            <SearchBar
              value=""
              onChangeText={() => {}}
              placeholder={$t('PATIENTS.SEARCH_PLACEHOLDER')}
            />
          </View>
        </Pressable>
      </View>

      {/* Loading skeleton */}
      {isLoading && !hasFetched && <SectionLoader style="list" />}

      {/* Patient list */}
      {(!isLoading || hasFetched) && (
        <View className="flex-1">
          <FlatList
            data={patients}
            renderItem={renderItem}
            keyExtractor={item => item.id}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.3}
            ListEmptyComponent={renderEmpty}
            ListFooterComponent={renderFooter}
            showsVerticalScrollIndicator={false}
            refreshing={refreshing}
            onRefresh={handleRefresh}
            contentContainerStyle={{ paddingBottom: bottomSpace, flexGrow: 1 }}
          />
        </View>
      )}
    </ScreenContainer>
  );
}
