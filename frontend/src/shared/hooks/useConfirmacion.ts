import { useCallback, useState } from 'react';

export interface Confirmacion<T> {
  /** Elemento sobre el que se pide confirmación, o `null` si el diálogo está cerrado. */
  objetivo: T | null;
  abierto: boolean;
  abrir: (objetivo: T) => void;
  cerrar: () => void;
}

/** Estado de un `ConfirmDialog`: qué elemento se está confirmando y si el diálogo está abierto. */
export const useConfirmacion = <T = true>(): Confirmacion<T> => {
  const [objetivo, setObjetivo] = useState<T | null>(null);
  const abrir = useCallback((nuevo: T) => setObjetivo(() => nuevo), []);
  const cerrar = useCallback(() => setObjetivo(null), []);
  return { objetivo, abierto: objetivo !== null, abrir, cerrar };
};
