import type {
  CambioEstado,
  Pedido,
  PedidoCreate,
  PedidoFiltros,
  PedidosPaginados,
  ResumenPedidos,
} from '@/features/pedidos/types';
import { api } from '@/shared/api';

export const pedidosApi = {
  crear: async (datos: PedidoCreate): Promise<Pedido> => {
    const { data } = await api.post<Pedido>('/pedidos', datos);
    return data;
  },
  listar: async (filtros: PedidoFiltros): Promise<PedidosPaginados> => {
    const { data } = await api.get<PedidosPaginados>('/pedidos', { params: filtros });
    return data;
  },
  obtener: async (id: number): Promise<Pedido> => {
    const { data } = await api.get<Pedido>(`/pedidos/${id}`);
    return data;
  },
  cambiarEstado: async (id: number, cambio: CambioEstado): Promise<Pedido> => {
    const { data } = await api.patch<Pedido>(`/pedidos/${id}/estado`, cambio);
    return data;
  },
  cancelar: async (id: number): Promise<Pedido> => {
    const { data } = await api.patch<Pedido>(`/pedidos/${id}/cancelar`);
    return data;
  },
  resumen: async (): Promise<ResumenPedidos> => {
    const { data } = await api.get<ResumenPedidos>('/pedidos/resumen');
    return data;
  },
};
