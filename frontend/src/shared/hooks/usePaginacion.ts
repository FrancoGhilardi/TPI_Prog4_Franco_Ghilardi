import { useState } from 'react';
import { calcularSkip, calcularTotalPaginas } from '@/shared/utils/paginacion';

/** Página actual (empieza en 1) y el `skip`/`limit` que espera el backend. */
export const usePaginacion = (porPagina: number) => {
  const [pagina, setPagina] = useState(1);
  return {
    pagina,
    setPagina,
    reiniciar: () => setPagina(1),
    skip: calcularSkip(pagina, porPagina),
    limit: porPagina,
    totalPaginas: (total: number): number => calcularTotalPaginas(total, porPagina),
  };
};
