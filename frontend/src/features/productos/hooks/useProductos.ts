import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { productosApi } from '@/features/productos/api';
import type { ProductoCreate, ProductoFiltros, ProductoStockUpdate, ProductoUpdate } from '@/features/productos/types';
import { QUERY_KEYS } from '@/shared/constants';

export const useProductos = (filtros: ProductoFiltros) =>
  useQuery({
    queryKey: [...QUERY_KEYS.productos, filtros],
    queryFn: () => productosApi.listar(filtros),
    placeholderData: keepPreviousData,
  });

const useInvalidarProductos = () => {
  const qc = useQueryClient();
  return (): void => void qc.invalidateQueries({ queryKey: QUERY_KEYS.productos });
};

export const useCrearProducto = () => {
  const invalidar = useInvalidarProductos();
  return useMutation({ mutationFn: (datos: ProductoCreate) => productosApi.crear(datos), onSuccess: invalidar });
};

export const useActualizarProducto = () => {
  const invalidar = useInvalidarProductos();
  return useMutation({
    mutationFn: ({ id, datos }: { id: number; datos: ProductoUpdate }) => productosApi.actualizar(id, datos),
    onSuccess: invalidar,
  });
};

export const useActualizarStock = () => {
  const invalidar = useInvalidarProductos();
  return useMutation({
    mutationFn: ({ id, datos }: { id: number; datos: ProductoStockUpdate }) =>
      productosApi.actualizarStock(id, datos),
    onSuccess: invalidar,
  });
};

export const useEliminarProducto = () => {
  const invalidar = useInvalidarProductos();
  return useMutation({ mutationFn: (id: number) => productosApi.eliminar(id), onSuccess: invalidar });
};
