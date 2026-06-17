import { useState, useCallback, useEffect, useRef } from 'react';
import { Visit } from '@/api/services/visitService/visitInterface';
import { visitService } from '@/api/services/visitService/visitService';

interface UseVisitsResult {
  visits: Visit[];
  isLoading: boolean;
  hasFetched: boolean;
  refresh: () => Promise<void>;
}

/**
 * Fetches visits for a single patient (subcollection).
 * Mirrors the shape of usePatients — loading, hasFetched, refresh.
 */
export function useVisits(patientId: string): UseVisitsResult {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);

  const isFetchingRef = useRef(false);

  const fetchVisits = useCallback(async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    setIsLoading(true);

    try {
      const result = await visitService.getVisitsForPatientRequest(patientId);
      setVisits(result);
      setHasFetched(true);
    } catch (_error) {
      // Silently handle — UI uses hasFetched to determine empty vs loading state
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
    }
  }, [patientId]);

  const refresh = useCallback(async () => {
    await fetchVisits();
  }, [fetchVisits]);

  // Initial fetch on mount
  useEffect(() => {
    fetchVisits();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    visits,
    isLoading,
    hasFetched,
    refresh,
  };
}
