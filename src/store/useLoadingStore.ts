import { create } from 'zustand';

interface LoadingState {
  isLoading: boolean;
  setLoading: (isLoading: boolean) => void;
  reset: () => void;
}

export const useLoadingStore = create<LoadingState>(set => ({
  isLoading: false,
  setLoading: isLoading => set({ isLoading }),
  reset: () => set({ isLoading: false }),
}));
