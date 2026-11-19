import axios from 'axios';
// Import directo (no el barrel '@/store'): este módulo forma parte del ciclo
// axiosInstance → authStore → authApi → axiosInstance, seguro porque las referencias se usan dentro de funciones.
import { useAuthStore } from '@/store/authStore';

export const CUENTA_DESACTIVADA = 'Cuenta de usuario desactivada';
const RUTAS_SIN_LIMPIEZA = ['/auth/token', '/auth/me'];

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error) && error.response) {
      const { status, data } = error.response;
      const url = error.config?.url ?? '';
      const detail = (data as { detail?: unknown } | undefined)?.detail;
      const sesionInvalida = status === 401 && !RUTAS_SIN_LIMPIEZA.some((ruta) => url.includes(ruta));
      const desactivada = status === 400 && detail === CUENTA_DESACTIVADA;
      if (sesionInvalida || desactivada) {
        // ProtectedRoute redirige a /login al quedar sin usuario.
        useAuthStore.getState().limpiar();
      }
    }
    return Promise.reject(error);
  },
);
