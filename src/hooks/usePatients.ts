import { useState, useCallback, useEffect, useRef } from 'react';
import { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import { Patient } from '@/api/services/patientService/patientInterface';
import { patientService } from '@/api/services/patientService/patientService';

interface UsePatientsResult {
  patients: Patient[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  hasFetched: boolean;
  refresh: () => Promise<void>;
  loadMore: () => void;
}

export function usePatients(limit?: number): UsePatientsResult {
  const pageLimit = limit ?? 20;

  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [hasFetched, setHasFetched] = useState(false);

  const lastDocRef = useRef<FirebaseFirestoreTypes.QueryDocumentSnapshot<FirebaseFirestoreTypes.DocumentData> | null>(null);
  const isFetchingRef = useRef(false);

  const fetchPage = useCallback(
    async (
      cursor: FirebaseFirestoreTypes.QueryDocumentSnapshot<FirebaseFirestoreTypes.DocumentData> | null,
      append: boolean,
    ) => {
      if (isFetchingRef.current) return;
      isFetchingRef.current = true;

      if (append) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }

      try {
        const result = await patientService.getAllPatientsRequest({
          limit: pageLimit,
          lastDoc: cursor,
        });

        lastDocRef.current = result.lastDoc;
        setHasMore(result.patients.length === pageLimit);

        if (append) {
          setPatients(prev => [...prev, ...result.patients]);
        } else {
          setPatients(result.patients);
        }
        setHasFetched(true);
      } catch (_error) {
        // Silently handle errors — caller can show UI state via hasFetched
      } finally {
        if (append) {
          setIsLoadingMore(false);
        } else {
          setIsLoading(false);
        }
        isFetchingRef.current = false;
      }
    },
    [pageLimit],
  );

  const refresh = useCallback(async () => {
    lastDocRef.current = null;
    setHasMore(true);
    await fetchPage(null, false);
  }, [fetchPage]);

  const loadMore = useCallback(() => {
    if (!hasMore || isLoadingMore || isFetchingRef.current) return;
    fetchPage(lastDocRef.current, true);
  }, [hasMore, isLoadingMore, fetchPage]);

  // Initial fetch on mount
  useEffect(() => {
    fetchPage(null, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    patients,
    isLoading,
    isLoadingMore,
    hasMore,
    hasFetched,
    refresh,
    loadMore,
  };
}
