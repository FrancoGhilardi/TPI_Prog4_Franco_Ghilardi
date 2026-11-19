import { useLocation } from 'react-router-dom';

/** Número del pedido recién creado que CheckoutPage deja en el state de la navegación, o `null`. */
export const usePedidoCreado = (): number | null => {
  const estado: unknown = useLocation().state;
  return typeof estado === 'object' &&
    estado !== null &&
    'pedidoCreado' in estado &&
    typeof estado.pedidoCreado === 'number'
    ? estado.pedidoCreado
    : null;
};
