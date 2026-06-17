import { create } from 'zustand';
import { StorageUtil } from '@/utility/storage';
import { STORAGE_KEYS } from '@/constants/storageKeys';
import { ClinicUser } from '@/api/services/authService/authInterface';

interface AuthState {
  user: ClinicUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  setUser: (user: ClinicUser) => void;
  setAuthenticated: (authenticated: boolean) => void;
  logout: () => void;
  setLoading: (isLoading: boolean) => void;
  hydrate: () => void;
  reset: () => void;
}

const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
};

export const useAuthStore = create<AuthState>(set => ({
  ...initialState,

  setUser: (user: ClinicUser) => {
    StorageUtil.setObject(STORAGE_KEYS.USER_DATA, user);
    set({ user, isAuthenticated: true, isLoading: false });
  },

  setAuthenticated: (authenticated: boolean) => {
    set({ isAuthenticated: authenticated, isLoading: false });
  },

  logout: () => {
    StorageUtil.delete(STORAGE_KEYS.USER_DATA);
    set({ ...initialState, isLoading: false });
  },

  setLoading: (isLoading: boolean) => set({ isLoading }),

  hydrate: () => {
    const user = StorageUtil.getObject<ClinicUser>(STORAGE_KEYS.USER_DATA);
    if (user) {
      set({ user, isAuthenticated: true, isLoading: false });
    } else {
      set({ ...initialState, isLoading: false });
    }
  },

  reset: () => {
    StorageUtil.delete(STORAGE_KEYS.USER_DATA);
    set({ ...initialState, isLoading: false });
  },
}));
