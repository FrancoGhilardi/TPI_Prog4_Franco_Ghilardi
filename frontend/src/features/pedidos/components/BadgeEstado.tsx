import type { FC } from 'react';
import { COLOR_ESTADO, ETIQUETA_ESTADO } from '@/features/pedidos/constants';
import type { EstadoPedido } from '@/features/pedidos/types';

export interface BadgeEstadoProps {
  estado: EstadoPedido;
}

export const BadgeEstado: FC<BadgeEstadoProps> = ({ estado }) => (
  <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${COLOR_ESTADO[estado]}`}>
    {ETIQUETA_ESTADO[estado]}
  </span>
);
