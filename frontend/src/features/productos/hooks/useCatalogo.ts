import { useState, type FormEvent } from 'react';
import { TAMANO_PAGINA } from '@/shared/constants';
import { usePaginacion } from '@/shared/hooks';
import { useProductos } from './useProductos';

/**
 * Estado del catálogo: texto del buscador, búsqueda aplicada, categoría elegida y página.
 * La búsqueda se aplica al enviar el formulario; cambiar la búsqueda o la categoría vuelve a la página 1.
 */
export const useCatalogo = () => {
  const { pagina, setPagina, reiniciar, skip, limit, totalPaginas } = usePaginacion(TAMANO_PAGINA.catalogo);
  const [texto, setTexto] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [categoriaId, setCategoriaId] = useState<number | undefined>(undefined);

  const productos = useProductos({ skip, limit, search: busqueda || undefined, categoria_id: categoriaId });

  const buscar = (e: FormEvent): void => {
    e.preventDefault();
    setBusqueda(texto.trim());
    reiniciar();
  };

  const cambiarCategoria = (valor: string): void => {
    setCategoriaId(valor ? Number(valor) : undefined);
    reiniciar();
  };

  return {
    productos,
    texto,
    setTexto,
    categoriaId,
    cambiarCategoria,
    buscar,
    hayFiltros: busqueda !== '' || categoriaId !== undefined,
    pagina,
    setPagina,
    totalPaginas: totalPaginas(productos.data?.total ?? 0),
  };
};
