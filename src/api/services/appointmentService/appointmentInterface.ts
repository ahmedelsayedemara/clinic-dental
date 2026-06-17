/**
 * Appointment Service Interface
 *
 * Storage decision: appointments are stored as a TOP-LEVEL `appointments` collection.
 *
 * Rationale:
 * - The global Appointments tab and the Dashboard "upcoming appointments" widget both need
 *   to query across ALL patients ordered by dateTime — impossible with a patient subcollection.
 * - `patientId` + denormalized `patientName` let us render list rows without joins.
 * - Composite indexes on (dateTime, status) and (patientId, dateTime) cover all query patterns.
 */

export const APPOINTMENT_COLLECTION = 'appointments';

export type AppointmentStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

export interface Appointment {
  id: string;

  // Patient reference (denormalized)
  patientId: string;
  patientName: string; // denormalized for list display without joins

  // Scheduling
  dateTime: string; // ISO-8601 — combined date + time
  status: AppointmentStatus;
  notes?: string;

  // Reminder (Notifee)
  reminderAt?: string; // ISO-8601 time at which the local notification fires
  reminderId?: string; // Notifee trigger notification ID for cancellation

  // Metadata
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface AddAppointmentPayload {
  patientId: string;
  patientName: string;
  dateTime: string;
  status: AppointmentStatus;
  notes?: string;
  reminderAt?: string;
}
