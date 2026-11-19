import type { FC } from 'react';
import { ETIQUETA_FORMA_PAGO } from '@/features/pedidos/constants';
import type { Pedido } from '@/features/pedidos/types';
import { formatFecha, formatPrecio } from '@/shared/utils';
import { BadgeEstado } from './BadgeEstado';

export interface PedidoDetalleProps {
  pedido: Pedido;
}

export const PedidoDetalle: FC<PedidoDetalleProps> = ({ pedido }) => (
  <div className="flex flex-col gap-3 text-sm">
    <div className="flex items-center justify-between">
      <span className="text-slate-500">Creado: {formatFecha(pedido.created_at)}</span>
      <BadgeEstado estado={pedido.estado} />
    </div>
    <p>
      <span className="font-medium">Dirección:</span> {pedido.direccion_entrega}
    </p>
    <p>
      <span className="font-medium">Forma de pago:</span> {ETIQUETA_FORMA_PAGO[pedido.forma_pago]}
    </p>
    {pedido.notas && (
      <p>
        <span className="font-medium">Notas:</span> {pedido.notas}
      </p>
    )}
    <table className="w-full">
      <thead className="text-left text-slate-500">
        <tr>
          <th className="py-1">Producto</th>
          <th className="py-1 text-right">Cantidad</th>
          <th className="py-1 text-right">Precio unitario</th>
          <th className="py-1 text-right">Subtotal</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {pedido.items.map((d) => (
          <tr key={d.producto_id}>
            <td className="py-1">{d.nombre_producto}</td>
            <td className="py-1 text-right">{d.cantidad}</td>
            <td className="py-1 text-right">{formatPrecio(d.precio_unitario)}</td>
            <td className="py-1 text-right">{formatPrecio(d.subtotal)}</td>
          </tr>
        ))}
      </tbody>
    </table>
    <p className="text-right text-base font-bold">Total: {formatPrecio(pedido.total)}</p>
  </div>
);
