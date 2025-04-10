import { create } from 'zustand';

const useAuthStore = create(set => ({
  user: null,
  token: null,
  setUser: user => set({ user }),
  setToken: token => set({ token }),
  clearAuth: () => set({ user: null, token: null }),
}));

export default useAuthStore;
