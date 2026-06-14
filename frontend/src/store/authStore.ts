import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { authApi, UserInfo, LoginParams, RegisterParams, AuthResult } from '@/api/auth';

interface AuthState {
  token: string | null;
  user: UserInfo | null;
  loading: boolean;
  initialized: boolean;

  setToken: (token: string) => void;
  setUser: (user: UserInfo) => void;
  setLoading: (loading: boolean) => void;
  setInitialized: (v: boolean) => void;

  login: (params: LoginParams) => Promise<AuthResult>;
  register: (params: RegisterParams) => Promise<AuthResult>;
  fetchProfile: () => Promise<UserInfo | null>;
  logout: () => Promise<void>;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      loading: false,
      initialized: false,

      setToken: (token) => set({ token }),
      setUser: (user) => set({ user }),
      setLoading: (loading) => set({ loading }),
      setInitialized: (v) => set({ initialized: v }),

      login: async (params) => {
        set({ loading: true });
        try {
          const res = await authApi.login(params);
          set({ token: res.access_token, user: res.user });
          return res;
        } finally {
          set({ loading: false });
        }
      },

      register: async (params) => {
        set({ loading: true });
        try {
          const res = await authApi.register(params);
          set({ token: res.access_token, user: res.user });
          return res;
        } finally {
          set({ loading: false });
        }
      },

      fetchProfile: async () => {
        try {
          const user = await authApi.profile();
          set({ user });
          return user;
        } catch {
          set({ token: null, user: null });
          return null;
        }
      },

      logout: async () => {
        try {
          await authApi.logout();
        } catch {
          // ignore
        }
        set({ token: null, user: null });
      },

      clearAuth: () => set({ token: null, user: null }),
    }),
    {
      name: 'spiritlink-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ token: state.token, user: state.user }),
    },
  ),
);

export default useAuthStore;
