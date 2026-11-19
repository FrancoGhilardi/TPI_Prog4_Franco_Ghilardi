import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { pedidosApi } from '@/features/pedidos/api';
import type { EstadoPedido, PedidoCreate, PedidoFiltros } from '@/features/pedidos/types';
import { QUERY_KEYS } from '@/shared/constants';

export const usePedidos = (filtros: PedidoFiltros) =>
  useQuery({
    queryKey: [...QUERY_KEYS.pedidos, 'lista', filtros],
    queryFn: () => pedidosApi.listar(filtros),
    placeholderData: keepPreviousData,
  });

export const useResumenPedidos = () => useQuery({ queryKey: QUERY_KEYS.resumen, queryFn: pedidosApi.resumen });

/** Crear/cancelar/cambiar estado alteran pedidos, resumen y stock de productos. */
const useInvalidarPedidosYStock = () => {
  const qc = useQueryClient();
  return (): void => {
    void qc.invalidateQueries({ queryKey: QUERY_KEYS.pedidos });
    void qc.invalidateQueries({ queryKey: QUERY_KEYS.productos });
  };
};

export const useCrearPedido = () => {
  const invalidar = useInvalidarPedidosYStock();
  return useMutation({ mutationFn: (datos: PedidoCreate) => pedidosApi.crear(datos), onSuccess: invalidar });
};

export const useCambiarEstadoPedido = () => {
  const invalidar = useInvalidarPedidosYStock();
  return useMutation({
    mutationFn: ({ id, estado }: { id: number; estado: EstadoPedido }) => pedidosApi.cambiarEstado(id, { estado }),
    onSuccess: invalidar,
  });
};

export const useCancelarPedido = () => {
  const invalidar = useInvalidarPedidosYStock();
  return useMutation({ mutationFn: (id: number) => pedidosApi.cancelar(id), onSuccess: invalidar });
};
