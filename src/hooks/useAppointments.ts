import { useState, useCallback, useEffect, useRef } from 'react';
import { Appointment } from '@/api/services/appointmentService/appointmentInterface';
import { appointmentService } from '@/api/services/appointmentService/appointmentService';

interface UseAppointmentsResult {
  appointments: Appointment[];
  isLoading: boolean;
  hasFetched: boolean;
  refresh: () => Promise<void>;
}

/**
 * Fetches all appointments (every status) ordered ascending.
 * Mirrors the shape of usePatients — loading, hasFetched, refresh.
 * Used by the global Appointments tab screen, which filters by status client-side.
 */
export function useAppointments(): UseAppointmentsResult {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);

  const isFetchingRef = useRef(false);

  const fetchAppointments = useCallback(async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    setIsLoading(true);

    try {
      const result = await appointmentService.getAllAppointmentsRequest();
      setAppointments(result);
      setHasFetched(true);
    } catch (_error) {
      // Silently handle — caller can show UI state via hasFetched
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
    }
  }, []);

  const refresh = useCallback(async () => {
    await fetchAppointments();
  }, [fetchAppointments]);

  // Initial fetch on mount
  useEffect(() => {
    fetchAppointments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    appointments,
    isLoading,
    hasFetched,
    refresh,
  };
}
