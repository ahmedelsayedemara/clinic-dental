/**
 * Visit Service Interface
 *
 * Storage decision: visits are stored as a SUBCOLLECTION under `patients/{patientId}/visits`.
 *
 * Rationale:
 * - Visits are always accessed in the context of a specific patient (no global "all visits" view).
 * - Subcollection keeps patient + visit data co-located in the same Firestore shard, giving
 *   cheaper reads: fetching all visits for one patient costs exactly N reads (no cross-shard fan-out).
 * - Firestore security rules can scope access to `patients/{patientId}/visits` matching the
 *   parent patient document — no need for a patientId filter on a top-level collection.
 * - Contrast with `appointments`: those need a global "upcoming appointments" query across all
 *   patients, which is impossible from a subcollection → appointments stay top-level.
 */

export const VISIT_COLLECTION = 'visits'; // used as subcollection name under patients/{id}/visits

export type PaymentStatus = 'unpaid' | 'partial' | 'paid';

export interface Visit {
  id: string;
  patientId: string; // denormalized — mirrors the parent doc ID for convenience

  // Clinical
  visitDate: string; // ISO-8601
  diagnosis?: string;
  treatmentPerformed?: string;
  notes?: string;

  // Payment tracking — fulfils "Track treatments performed, Track payments"
  amountTotal?: number;   // total amount charged
  amountPaid?: number;    // amount collected so far
  amountDue?: number;     // computed on write: amountTotal - amountPaid
  paymentStatus?: PaymentStatus; // 'unpaid' | 'partial' | 'paid'

  // Metadata
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface AddVisitPayload {
  visitDate: string;
  diagnosis?: string;
  treatmentPerformed?: string;
  notes?: string;
  amountTotal?: number;
  amountPaid?: number;
}
