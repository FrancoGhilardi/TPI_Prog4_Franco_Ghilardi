import type { OpcionSelect } from '@/shared/ui';
import type { EstadoDestino, EstadoPedido, FormaPago } from './types';

export const ESTADOS_PEDIDO: EstadoPedido[] = ['PENDIENTE', 'EN_PREPARACION', 'ENTREGADO', 'CANCELADO'];

export const ETIQUETA_ESTADO: Record<EstadoPedido, string> = {
  PENDIENTE: 'Pendiente',
  EN_PREPARACION: 'En preparación',
  ENTREGADO: 'Entregado',
  CANCELADO: 'Cancelado',
};

export const COLOR_ESTADO: Record<EstadoPedido, string> = {
  PENDIENTE: 'bg-amber-100 text-amber-800',
  EN_PREPARACION: 'bg-blue-100 text-blue-800',
  ENTREGADO: 'bg-green-100 text-green-800',
  CANCELADO: 'bg-red-100 text-red-800',
};

/** Espejo del mapa del backend (RN-02). Solo para mostrar botones; la validación real es del servidor. */
export const TRANSICIONES: Record<EstadoPedido, readonly EstadoDestino[]> = {
  PENDIENTE: ['EN_PREPARACION', 'CANCELADO'],
  EN_PREPARACION: ['ENTREGADO', 'CANCELADO'],
  ENTREGADO: [],
  CANCELADO: [],
};

/** Texto del botón que lleva un pedido a cada estado destino. */
export const TEXTO_TRANSICION: Record<EstadoDestino, string> = {
  EN_PREPARACION: 'Pasar a preparación',
  ENTREGADO: 'Marcar como entregado',
  CANCELADO: 'Cancelar pedido',
};

export const ETIQUETA_FORMA_PAGO: Record<FormaPago, string> = {
  EFECTIVO: 'Efectivo',
  TRANSFERENCIA: 'Transferencia',
};

export const OPCIONES_FORMA_PAGO: OpcionSelect[] = [
  { valor: 'EFECTIVO', etiqueta: ETIQUETA_FORMA_PAGO.EFECTIVO },
  { valor: 'TRANSFERENCIA', etiqueta: ETIQUETA_FORMA_PAGO.TRANSFERENCIA },
];

export const esEstadoPedido = (valor: string): valor is EstadoPedido =>
  (ESTADOS_PEDIDO as string[]).includes(valor);
