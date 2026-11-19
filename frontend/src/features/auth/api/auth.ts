// Import directo de axiosInstance (no el barrel '@/shared/api'): este módulo es parte del ciclo
// axiosInstance → authStore → authApi → axiosInstance, seguro porque `api` solo se usa dentro de funciones.
import { api } from '@/shared/api/axiosInstance';
import type { LoginCredentials, MensajeResponse, UserCreate, UserPublic } from '@/features/auth/types';

export const authApi = {
  login: async ({ username, password }: LoginCredentials): Promise<MensajeResponse> => {
    const form = new URLSearchParams({ username, password });
    const { data } = await api.post<MensajeResponse>('/auth/token', form);
    return data;
  },
  register: async (datos: UserCreate): Promise<UserPublic> => {
    const { data } = await api.post<UserPublic>('/auth/register', datos);
    return data;
  },
  me: async (): Promise<UserPublic> => {
    const { data } = await api.get<UserPublic>('/auth/me');
    return data;
  },
  logout: async (): Promise<MensajeResponse> => {
    const { data } = await api.post<MensajeResponse>('/auth/logout');
    return data;
  },
};
