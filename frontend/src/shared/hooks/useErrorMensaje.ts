import { useCallback, useState } from 'react';
import { handleApiError } from '@/shared/api/handleApiError';

export interface ErrorMensaje {
  /** Mensaje listo para mostrar, o `null` si no hay error. */
  error: string | null;
  limpiarError: () => void;
  /** Traduce un error de la API con `handleApiError` y lo muestra. */
  mostrarError: (error: unknown) => void;
  /** Limpia el error, ejecuta la acción y muestra el error si falla. */
  ejecutar: (accion: () => Promise<unknown>) => Promise<void>;
}

export const useErrorMensaje = (): ErrorMensaje => {
  const [error, setError] = useState<string | null>(null);
  const limpiarError = useCallback(() => setError(null), []);
  const mostrarError = useCallback((e: unknown) => setError(handleApiError(e)), []);
  const ejecutar = useCallback(async (accion: () => Promise<unknown>) => {
    setError(null);
    try {
      await accion();
    } catch (e) {
      setError(handleApiError(e));
    }
  }, []);
  return { error, limpiarError, mostrarError, ejecutar };
};
