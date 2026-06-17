import { useState, useCallback, useEffect } from 'react';
import { Patient } from '@/api/services/patientService/patientInterface';
import { Appointment } from '@/api/services/appointmentService/appointmentInterface';
import { patientService } from '@/api/services/patientService/patientService';
import { appointmentService } from '@/api/services/appointmentService/appointmentService';

interface DashboardStats {
  totalPatients: number;
  upcomingAppointmentsCount: number;
}

interface UseDashboardResult {
  stats: DashboardStats;
  recentPatients: Patient[];
  upcomingAppointments: Appointment[];
  isLoading: boolean;
  refresh: () => Promise<void>;
}

/**
 * Loads all dashboard data in parallel:
 * - Total patient count (via Firestore count aggregation)
 * - 5 most recently added patients
 * - 5 upcoming appointments (ordered by dateTime asc)
 *
 * Defensive try/catch per query so one failure doesn't blank the whole screen.
 */
export function useDashboard(): UseDashboardResult {
  const [stats, setStats] = useState<DashboardStats>({
    totalPatients: 0,
    upcomingAppointmentsCount: 0,
  });
  const [recentPatients, setRecentPatients] = useState<Patient[]>([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    setIsLoading(true);

    const [countResult, patientsResult, appointmentsResult] = await Promise.allSettled([
      patientService.getPatientsCountRequest(),
      patientService.getAllPatientsRequest({ limit: 5 }),
      appointmentService.getUpcomingAppointmentsRequest(5),
    ]);

    const totalPatients =
      countResult.status === 'fulfilled' ? countResult.value : 0;
    const recentPatientsList =
      patientsResult.status === 'fulfilled' ? patientsResult.value.patients : [];
    const appointments =
      appointmentsResult.status === 'fulfilled' ? appointmentsResult.value : [];

    setStats({
      totalPatients,
      upcomingAppointmentsCount: appointments.length,
    });
    setRecentPatients(recentPatientsList);
    setUpcomingAppointments(appointments);
    setIsLoading(false);
  }, []);

  const refresh = useCallback(async () => {
    await fetchAll();
  }, [fetchAll]);

  // Initial fetch on mount
  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    stats,
    recentPatients,
    upcomingAppointments,
    isLoading,
    refresh,
  };
}
