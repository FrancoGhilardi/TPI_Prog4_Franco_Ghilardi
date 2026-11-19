import type { FC } from 'react';
import { Button } from '@/shared/ui';

export interface PaginacionProps {
  pagina: number;
  totalPaginas: number;
  onCambiar: (pagina: number) => void;
}

export const Paginacion: FC<PaginacionProps> = ({ pagina, totalPaginas, onCambiar }) => {
  if (totalPaginas <= 1) return null;
  return (
    <nav className="flex items-center justify-center gap-3" aria-label="Paginación">
      <Button variante="secundario" disabled={pagina <= 1} onClick={() => onCambiar(pagina - 1)}>
        Anterior
      </Button>
      <span className="text-sm text-slate-600">
        Página {pagina} de {totalPaginas}
      </span>
      <Button variante="secundario" disabled={pagina >= totalPaginas} onClick={() => onCambiar(pagina + 1)}>
        Siguiente
      </Button>
    </nav>
  );
};
