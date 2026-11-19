import { useState, type FC } from 'react';
import { Link } from 'react-router-dom';
import { BadgeEstado, PedidoDetalle } from '@/features/pedidos/components';
import { useCancelarPedido, usePedidoCreado, usePedidos } from '@/features/pedidos/hooks';
import type { Pedido } from '@/features/pedidos/types';
import { EstadoErrorConsulta, EstadoVacio, Paginacion, Skeleton } from '@/shared/components';
import { RUTAS, TAMANO_PAGINA } from '@/shared/constants';
import { useConfirmacion, useErrorMensaje, usePaginacion } from '@/shared/hooks';
import { Button, Card, ConfirmDialog, EnlaceAccion, MensajeError, Modal } from '@/shared/ui';
import { formatFecha, formatPrecio } from '@/shared/utils';
import { useAuthStore } from '@/store';

export const MisPedidosPage: FC = () => {
  const { pagina, setPagina, skip, limit, totalPaginas } = usePaginacion(TAMANO_PAGINA.misPedidos);
  const [seleccionado, setSeleccionado] = useState<Pedido | null>(null);
  const cancelacion = useConfirmacion<Pedido>();
  const pedidoCreado = usePedidoCreado();
  const { error, limpiarError, mostrarError } = useErrorMensaje();
  const pedidos = usePedidos({ skip, limit });
  const cancelar = useCancelarPedido();
  const usuario = useAuthStore((s) => s.usuario);

  const onCancelar = (id: number): void => {
    limpiarError();
    cancelar.mutate(id, {
      onSuccess: (actualizado) => {
        setSeleccionado((actual) => (actual?.id === id ? actualizado : actual));
        cancelacion.cerrar();
      },
      onError: (e) => {
        cancelacion.cerrar();
        mostrarError(e);
      },
    });
  };

  if (pedidos.isPending) return <Skeleton className="h-64" />;
  if (pedidos.isError) {
    return <EstadoErrorConsulta consulta={pedidos} />;
  }
  if (pedidos.data.items.length === 0) {
    return (
      <EstadoVacio
        titulo="Todavía no hiciste pedidos"
        mensaje="Cuando confirmes tu primer pedido, lo vas a ver acá."
        accion={<EnlaceAccion to={RUTAS.catalogo}>Ver el catálogo</EnlaceAccion>}
      />
    );
  }

  return (
    <section className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Mis pedidos</h1>
      {pedidoCreado !== null && (
        <p role="status" className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800">
          ¡Listo! Recibimos tu pedido #{pedidoCreado}. Podés seguir su estado desde esta página.
        </p>
      )}
      {usuario?.role === 'admin' && (
        <p className="rounded-lg bg-orange-50 p-3 text-sm text-slate-700">
          Como administrador ves los pedidos de todos los clientes. Gestioná los ajenos desde el{' '}
          <Link to={RUTAS.adminPedidos} className="font-medium text-orange-600 hover:underline">
            Administración → Pedidos
          </Link>
          .
        </p>
      )}
      <MensajeError mensaje={error} />
      <div className="flex flex-col gap-3">
        {pedidos.data.items.map((p) => (
          <Card key={p.id} className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-semibold">Pedido #{p.id}</p>
              <p className="text-sm text-slate-500">{formatFecha(p.created_at)}</p>
              {usuario?.role === 'admin' && <p className="text-sm text-slate-500">Cliente #{p.usuario_id}</p>}
            </div>
            <BadgeEstado estado={p.estado} />
            <span className="font-semibold">{formatPrecio(p.total)}</span>
            <div className="flex gap-2">
              <Button variante="secundario" onClick={() => setSeleccionado(p)}>
                Ver detalle
              </Button>
              {p.estado === 'PENDIENTE' && p.usuario_id === usuario?.id && (
                <Button variante="peligro" onClick={() => cancelacion.abrir(p)}>
                  Cancelar pedido
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>
      <Paginacion pagina={pagina} totalPaginas={totalPaginas(pedidos.data.total)} onCambiar={setPagina} />
      <Modal
        abierto={seleccionado !== null}
        titulo={`Pedido #${seleccionado?.id ?? ''}`}
        onCerrar={() => setSeleccionado(null)}
      >
        {seleccionado && <PedidoDetalle pedido={seleccionado} />}
      </Modal>
      <ConfirmDialog
        abierto={cancelacion.abierto}
        titulo={`¿Cancelar el pedido #${cancelacion.objetivo?.id ?? ''}?`}
        mensaje="Los productos vuelven al stock y el pedido no se puede reactivar."
        textoConfirmar="Cancelar pedido"
        cargando={cancelar.isPending}
        onCerrar={cancelacion.cerrar}
        onConfirmar={() => {
          if (cancelacion.objetivo) onCancelar(cancelacion.objetivo.id);
        }}
      />
    </section>
  );
};
