import type { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckoutForm } from '@/features/pedidos/components';
import { useCarrito, useCrearPedido } from '@/features/pedidos/hooks';
import type { DatosCheckout } from '@/features/pedidos/types';
import { EstadoVacio } from '@/shared/components';
import { RUTAS } from '@/shared/constants';
import { Card, EnlaceAccion } from '@/shared/ui';
import { formatPrecio } from '@/shared/utils';

export const CheckoutPage: FC = () => {
  const { items, total, vacio, vaciar } = useCarrito();
  const crearPedido = useCrearPedido();
  const navigate = useNavigate();

  if (vacio) {
    return (
      <EstadoVacio
        titulo="No hay productos para confirmar"
        mensaje="Agregá productos al carrito para hacer un pedido."
        accion={<EnlaceAccion to={RUTAS.catalogo}>Ver el catálogo</EnlaceAccion>}
      />
    );
  }

  const confirmar = async (datos: DatosCheckout): Promise<void> => {
    const pedido = await crearPedido.mutateAsync({
      ...datos,
      items: items.map(({ producto_id, cantidad }) => ({ producto_id, cantidad })),
    });
    vaciar();
    navigate(RUTAS.misPedidos, { replace: true, state: { pedidoCreado: pedido.id } });
  };

  return (
    <section className="grid gap-6 md:grid-cols-2">
      <Card>
        <h1 className="mb-4 text-2xl font-bold">Confirmar pedido</h1>
        <CheckoutForm onConfirmar={confirmar} />
      </Card>
      <Card>
        <h2 className="mb-3 text-lg font-semibold">Resumen</h2>
        <ul className="divide-y divide-slate-100 text-sm">
          {items.map((i) => (
            <li key={i.producto_id} className="flex justify-between py-2">
              <span>
                {i.cantidad} × {i.nombre}
              </span>
              <span>{formatPrecio(i.precio_unitario * i.cantidad)}</span>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-right text-lg font-bold">Total: {formatPrecio(total)}</p>
      </Card>
    </section>
  );
};
