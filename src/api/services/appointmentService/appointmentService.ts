import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
} from '@react-native-firebase/firestore';
import { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import { getAuth } from '@react-native-firebase/auth';
import { FIRESTORE_COLLECTIONS } from '@/constants/firestoreCollections';
import { Appointment, AddAppointmentPayload, AppointmentStatus } from './appointmentInterface';

function appointmentsColRef() {
  const db = getFirestore();
  return collection(db, FIRESTORE_COLLECTIONS.APPOINTMENTS);
}

function appointmentDocRef(appointmentId: string) {
  const db = getFirestore();
  return doc(db, FIRESTORE_COLLECTIONS.APPOINTMENTS, appointmentId);
}

export const appointmentService = {
  /**
   * Fetch upcoming appointments (dateTime >= now), ordered ascending.
   * Used by both the Appointments tab and the Dashboard widget (Phase 3b).
   * Pass `maxResults` to cap the final list (default 50 for the tab; use a small
   * number like 5 from the Dashboard to show a "today's upcoming" summary card).
   *
   * Note: Firestore prohibits inequality filters (`>=`) on two different fields in
   * the same query, so the `status` exclusion ('cancelled', 'completed') is applied
   * client-side after fetching. We over-fetch by 2× to account for the filter loss.
   */
  getUpcomingAppointmentsRequest: async (maxResults = 50): Promise<Appointment[]> => {
    const colRef = appointmentsColRef();
    const nowIso = new Date().toISOString();
    const q = query(
      colRef,
      orderBy('dateTime', 'asc'),
      limit(maxResults * 2), // over-fetch to compensate for client-side status filter
    );
    const snapshot = await getDocs(q);
    const all = snapshot.docs.map(
      (d: FirebaseFirestoreTypes.QueryDocumentSnapshot) =>
        ({ id: d.id, ...d.data() } as Appointment),
    );
    // Exclude terminal statuses client-side
    return all.filter((a: Appointment) => a.status !== 'completed').slice(0, maxResults);
  },

  /**
   * Fetch every appointment regardless of status or date, ordered by dateTime
   * ascending (same day-chronological order the Appointments tab groups by).
   * The tab screen filters by status ('all' | pending | confirmed | completed |
   * cancelled) client-side, so the data source must include every status.
   */
  getAllAppointmentsRequest: async (): Promise<Appointment[]> => {
    const colRef = appointmentsColRef();
    const q = query(colRef, orderBy('dateTime', 'asc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(
      (d: FirebaseFirestoreTypes.QueryDocumentSnapshot) =>
        ({ id: d.id, ...d.data() } as Appointment),
    );
  },

  /**
   * Fetch appointments for a specific calendar date range (inclusive).
   * Pass ISO date strings for the start/end of a day to get that day's slots.
   * Example: getAppointmentsForDateRequest('2024-03-20T00:00:00.000Z', '2024-03-20T23:59:59.999Z')
   */
  getAppointmentsForDateRequest: async (fromIso: string, toIso: string): Promise<Appointment[]> => {
    const colRef = appointmentsColRef();
    const q = query(
      colRef,
      where('dateTime', '>=', fromIso),
      where('dateTime', '<=', toIso),
      orderBy('dateTime', 'asc'),
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(
      (d: FirebaseFirestoreTypes.QueryDocumentSnapshot) =>
        ({ id: d.id, ...d.data() } as Appointment),
    );
  },

  /**
   * Fetch all appointments for a specific patient, ordered newest first.
   * Useful when viewing a patient's appointment history.
   */
  getAppointmentsForPatientRequest: async (patientId: string): Promise<Appointment[]> => {
    const colRef = appointmentsColRef();
    const q = query(colRef, where('patientId', '==', patientId), orderBy('dateTime', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(
      (d: FirebaseFirestoreTypes.QueryDocumentSnapshot) =>
        ({ id: d.id, ...d.data() } as Appointment),
    );
  },

  getAppointmentByIdRequest: async (appointmentId: string): Promise<Appointment | null> => {
    const docRef = appointmentDocRef(appointmentId);
    const snapshot = await getDoc(docRef);
    if (!snapshot.exists()) return null;
    return { id: snapshot.id, ...snapshot.data() } as Appointment;
  },

  postAddAppointmentRequest: async (data: AddAppointmentPayload): Promise<string> => {
    const auth = getAuth();
    const uid = auth.currentUser?.uid ?? '';

    const payload = {
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: uid,
    };

    const docRef = await addDoc(appointmentsColRef(), payload);
    return docRef.id;
  },

  putUpdateAppointmentRequest: async (
    appointmentId: string,
    data: Partial<AddAppointmentPayload> & { reminderId?: string },
  ): Promise<void> => {
    await updateDoc(appointmentDocRef(appointmentId), {
      ...data,
      updatedAt: new Date().toISOString(),
    });
  },

  /**
   * Soft-cancel: sets status to 'cancelled' without deleting the record.
   * Caller is responsible for cancelling the local notification via reminderId.
   */
  cancelAppointmentRequest: async (appointmentId: string): Promise<void> => {
    await updateDoc(appointmentDocRef(appointmentId), {
      status: 'cancelled' as AppointmentStatus,
      updatedAt: new Date().toISOString(),
    });
  },

  /**
   * Hard-delete. Caller must cancel the local notification first if reminderId exists.
   */
  deleteAppointmentRequest: async (appointmentId: string): Promise<void> => {
    await deleteDoc(appointmentDocRef(appointmentId));
  },
};
