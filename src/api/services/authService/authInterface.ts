export const FIRESTORE_AUTH_COLLECTIONS = {
  USERS: 'users',
} as const;

export interface ClinicUser {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface ForgotPasswordPayload {
  email: string;
}
