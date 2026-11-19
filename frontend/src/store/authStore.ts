import axios from 'axios';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
// Imports directos (no barrels): authApi participa del ciclo axiosInstance → authStore → authApi → axiosInstance.
import { authApi } from '@/features/auth/api/auth';
import type { LoginCredentials, UserPublic } from '@/features/auth/types';
import { queryClient } from '@/shared/api/queryClient';
import { CLAVES_STORAGE } from '@/shared/constants/storage';

interface AuthState {
  usuario: UserPublic | null;
  cargando: boolean;
  login: (credenciales: LoginCredentials) => Promise<UserPublic>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
  limpiar: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      usuario: null,
      cargando: true,
      login: async (credenciales) => {
        await authApi.login(credenciales);
        const usuario = await authApi.me();
        queryClient.clear();
        set({ usuario });
        return usuario;
      },
      logout: async () => {
        try {
          await authApi.logout();
        } finally {
          set({ usuario: null });
          queryClient.clear();
        }
      },
      checkSession: async () => {
        set({ cargando: true });
        try {
          const usuario = await authApi.me();
          set({ usuario });
        } catch (e) {
          // Solo se invalida la sesión ante 400/401; errores de red o 5xx conservan el usuario persistido.
          if (axios.isAxiosError(e) && (e.response?.status === 401 || e.response?.status === 400)) {
            set({ usuario: null });
          }
        } finally {
          set({ cargando: false });
        }
      },
      limpiar: () => {
        set({ usuario: null });
        queryClient.clear();
      },
    }),
    {
      name: CLAVES_STORAGE.auth,
      // Solo el usuario; el token vive en la cookie HttpOnly y nunca se guarda aquí.
      partialize: (state) => ({ usuario: state.usuario }),
    },
  ),
);
