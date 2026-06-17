import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
} from '@react-native-firebase/auth';
import { LoginPayload, ForgotPasswordPayload } from './authInterface';

export const authService = {
  postLoginRequest: async (payload: LoginPayload): Promise<void> => {
    const auth = getAuth();
    await signInWithEmailAndPassword(auth, payload.email, payload.password);
  },

  postLogoutRequest: async (): Promise<void> => {
    const auth = getAuth();
    await signOut(auth);
  },

  postForgotPasswordRequest: async (payload: ForgotPasswordPayload): Promise<void> => {
    const auth = getAuth();
    await sendPasswordResetEmail(auth, payload.email);
  },
};
