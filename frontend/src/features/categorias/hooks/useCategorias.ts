import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { categoriasApi } from '@/features/categorias/api';
import type { CategoriaCreate, CategoriaUpdate } from '@/features/categorias/types';
import { QUERY_KEYS } from '@/shared/constants';

export const useCategorias = () => useQuery({ queryKey: QUERY_KEYS.categorias, queryFn: categoriasApi.listar });

const useInvalidarCatalogo = () => {
  const qc = useQueryClient();
  return (): void => {
    void qc.invalidateQueries({ queryKey: QUERY_KEYS.categorias });
    void qc.invalidateQueries({ queryKey: QUERY_KEYS.productos }); // ProductoRead incluye la categoría
  };
};

export const useCrearCategoria = () => {
  const invalidar = useInvalidarCatalogo();
  return useMutation({ mutationFn: (datos: CategoriaCreate) => categoriasApi.crear(datos), onSuccess: invalidar });
};

export const useActualizarCategoria = () => {
  const invalidar = useInvalidarCatalogo();
  return useMutation({
    mutationFn: ({ id, datos }: { id: number; datos: CategoriaUpdate }) => categoriasApi.actualizar(id, datos),
    onSuccess: invalidar,
  });
};

export const useEliminarCategoria = () => {
  const invalidar = useInvalidarCatalogo();
  return useMutation({ mutationFn: (id: number) => categoriasApi.eliminar(id), onSuccess: invalidar });
};
