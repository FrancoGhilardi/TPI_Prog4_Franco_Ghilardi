import type { Categoria, CategoriaCreate, CategoriaUpdate } from '@/features/categorias/types';
import { api } from '@/shared/api';

export const categoriasApi = {
  listar: async (): Promise<Categoria[]> => {
    const { data } = await api.get<Categoria[]>('/categorias');
    return data;
  },
  crear: async (datos: CategoriaCreate): Promise<Categoria> => {
    const { data } = await api.post<Categoria>('/categorias', datos);
    return data;
  },
  actualizar: async (id: number, datos: CategoriaUpdate): Promise<Categoria> => {
    const { data } = await api.put<Categoria>(`/categorias/${id}`, datos);
    return data;
  },
  eliminar: async (id: number): Promise<void> => {
    await api.delete(`/categorias/${id}`);
  },
};
