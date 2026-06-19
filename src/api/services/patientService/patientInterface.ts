import { ApiListResponse, ApiItemResponse } from '@/api/types/apiResponse';

export const PATIENT_COLLECTION = 'patients';

export type Gender = 'male' | 'female';

export interface Patient {
  id: string;
  // Personal Info
  fullName: string;
  nameLower: string; // lowercased for search
  mobile: string;
  address?: string;
  dateOfBirth?: string;
  gender?: Gender;
  notes?: string;

  // Archive / Physical File Location
  fileNumber: string; // indexed for search
  entryDate?: string; // ISO date the patient entered the clinic

  // Medical
  medicalHistory?: string;
  diagnosis?: string;
  treatmentPlan?: string;

  // Search fields
  searchKeywords: string[]; // prefix tokens for fast search

  // Metadata
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface PatientResponse extends ApiItemResponse<Patient> {}
export interface PatientsListResponse extends ApiListResponse<Patient> {}

export interface GetPatientsParams {
  searchQuery?: string;
  gender?: Gender;
  limit?: number;
  lastDocId?: string;
}

export interface AddPatientPayload {
  fullName: string;
  mobile: string;
  address?: string;
  dateOfBirth?: string;
  gender?: Gender;
  notes?: string;
  fileNumber: string;
  entryDate?: string;
  medicalHistory?: string;
  diagnosis?: string;
  treatmentPlan?: string;
}
