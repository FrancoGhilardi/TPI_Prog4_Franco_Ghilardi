import type { FC } from 'react';
import { useCategorias } from '@/features/categorias/hooks';
import { ProductoCard } from '@/features/productos/components';
import { useCatalogo } from '@/features/productos/hooks';
import { EstadoErrorConsulta, EstadoVacio, Paginacion, Skeleton } from '@/shared/components';
import { TAMANO_PAGINA } from '@/shared/constants';
import { Button } from '@/shared/ui';

export const CatalogoPage: FC = () => {
  const { productos, texto, setTexto, categoriaId, cambiarCategoria, buscar, hayFiltros, pagina, setPagina, totalPaginas } =
    useCatalogo();
  const categorias = useCategorias();

  return (
    <section className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Catálogo</h1>

      <form onSubmit={buscar} className="flex flex-wrap items-end gap-3">
        <input
          type="search"
          aria-label="Buscar productos"
          placeholder="Buscar por nombre, por ejemplo «pizza»"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          className="min-w-56 flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
        <select
          aria-label="Filtrar por categoría"
          value={categoriaId ?? ''}
          onChange={(e) => cambiarCategoria(e.target.value)}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
        >
          <option value="">Todas las categorías</option>
          {categorias.data?.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre}
            </option>
          ))}
        </select>
        <Button type="submit">Buscar</Button>
      </form>

      {productos.isPending ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: TAMANO_PAGINA.catalogo }, (_, i) => (
            <Skeleton key={i} className="h-80" />
          ))}
        </div>
      ) : productos.isError ? (
        <EstadoErrorConsulta consulta={productos} />
      ) : productos.data.items.length === 0 ? (
        hayFiltros ? (
          <EstadoVacio titulo="No encontramos productos" mensaje="Probá con otra búsqueda o elegí otra categoría." />
        ) : (
          <EstadoVacio titulo="Todavía no hay productos a la venta" mensaje="Volvé a visitarnos pronto." />
        )
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {productos.data.items.map((p) => (
            <ProductoCard key={p.id} producto={p} />
          ))}
        </div>
      )}

      <Paginacion pagina={pagina} totalPaginas={totalPaginas} onCambiar={setPagina} />
    </section>
  );
};
