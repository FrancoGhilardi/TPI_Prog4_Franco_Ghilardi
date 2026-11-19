import type { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCarrito } from '@/features/pedidos/hooks';
import { EstadoVacio } from '@/shared/components';
import { RUTAS } from '@/shared/constants';
import { useConfirmacion } from '@/shared/hooks';
import { Button, Card, ConfirmDialog, EnlaceAccion } from '@/shared/ui';
import { formatPrecio } from '@/shared/utils';

export const CarritoPage: FC = () => {
  const { items, total, vacio, cambiarCantidad, quitar, vaciar } = useCarrito();
  const navigate = useNavigate();
  const confirmacionVaciar = useConfirmacion();

  if (vacio) {
    return (
      <EstadoVacio
        titulo="Tu carrito está vacío"
        mensaje="Agregá productos del catálogo para armar tu pedido."
        accion={<EnlaceAccion to={RUTAS.catalogo}>Ver el catálogo</EnlaceAccion>}
      />
    );
  }

  return (
    <section className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Carrito</h1>
      <Card className="divide-y divide-slate-100 p-0">
        {items.map((item) => (
          <div key={item.producto_id} className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div>
              <p className="font-medium">{item.nombre}</p>
              <p className="text-sm text-slate-500">{formatPrecio(item.precio_unitario)} c/u</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variante="secundario"
                aria-label={`Quitar una unidad de ${item.nombre}`}
                onClick={() => cambiarCantidad(item.producto_id, item.cantidad - 1)}
              >
                −
              </Button>
              <span className="w-8 text-center">{item.cantidad}</span>
              <Button
                variante="secundario"
                aria-label={`Agregar una unidad de ${item.nombre}`}
                onClick={() => cambiarCantidad(item.producto_id, item.cantidad + 1)}
              >
                +
              </Button>
            </div>
            <span className="w-28 text-right font-semibold">
              {formatPrecio(item.precio_unitario * item.cantidad)}
            </span>
            <Button variante="fantasma" onClick={() => quitar(item.producto_id)}>
              Quitar
            </Button>
          </div>
        ))}
      </Card>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button variante="secundario" onClick={() => confirmacionVaciar.abrir(true)}>
          Vaciar carrito
        </Button>
        <div className="flex items-center gap-4">
          <span className="text-xl font-bold">Total: {formatPrecio(total)}</span>
          <Button onClick={() => navigate(RUTAS.checkout)}>Continuar con el pedido</Button>
        </div>
      </div>
      <p className="text-xs text-slate-500">
        Vamos a verificar el stock y los precios cuando confirmes el pedido.
      </p>
      <ConfirmDialog
        abierto={confirmacionVaciar.abierto}
        titulo="¿Vaciar el carrito?"
        mensaje="Se van a quitar todos los productos."
        textoConfirmar="Vaciar carrito"
        onCerrar={confirmacionVaciar.cerrar}
        onConfirmar={() => {
          vaciar();
          confirmacionVaciar.cerrar();
        }}
      />
    </section>
  );
};
