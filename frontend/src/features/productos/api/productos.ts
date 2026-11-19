import type {
  Producto,
  ProductoCreate,
  ProductoFiltros,
  ProductosPaginados,
  ProductoStockUpdate,
  ProductoUpdate,
} from '@/features/productos/types';
import { api } from '@/shared/api';

export const productosApi = {
  listar: async (filtros: ProductoFiltros): Promise<ProductosPaginados> => {
    const { data } = await api.get<ProductosPaginados>('/productos', { params: filtros });
    return data;
  },
  obtener: async (id: number): Promise<Producto> => {
    const { data } = await api.get<Producto>(`/productos/${id}`);
    return data;
  },
  crear: async (datos: ProductoCreate): Promise<Producto> => {
    const { data } = await api.post<Producto>('/productos', datos);
    return data;
  },
  actualizar: async (id: number, datos: ProductoUpdate): Promise<Producto> => {
    const { data } = await api.put<Producto>(`/productos/${id}`, datos);
    return data;
  },
  actualizarStock: async (id: number, datos: ProductoStockUpdate): Promise<Producto> => {
    const { data } = await api.patch<Producto>(`/productos/${id}/stock`, datos);
    return data;
  },
  eliminar: async (id: number): Promise<void> => {
    await api.delete(`/productos/${id}`);
  },
};
