import { createColumnHelper } from '@tanstack/react-table';
import { useMemo, useState, type FC } from 'react';
import { BadgeEstado, PedidoDetalle } from '@/features/pedidos/components';
import {
  ESTADOS_PEDIDO,
  ETIQUETA_ESTADO,
  ETIQUETA_FORMA_PAGO,
  TEXTO_TRANSICION,
  TRANSICIONES,
  esEstadoPedido,
} from '@/features/pedidos/constants';
import { useCambiarEstadoPedido, usePedidos } from '@/features/pedidos/hooks';
import type { EstadoPedido, Pedido } from '@/features/pedidos/types';
import { EstadoErrorConsulta, EstadoVacio, Skeleton, TablaBase } from '@/shared/components';
import { LIMITE_ADMIN } from '@/shared/constants';
import { useConfirmacion, useErrorMensaje, useTablaAdmin } from '@/shared/hooks';
import { Button, ConfirmDialog, MensajeError, Modal } from '@/shared/ui';
import { formatFecha, formatPrecio } from '@/shared/utils';

const columnHelper = createColumnHelper<Pedido>();

export const AdminPedidosPage: FC = () => {
  const [filtro, setFiltro] = useState<EstadoPedido | undefined>(undefined);
  const [seleccionado, setSeleccionado] = useState<Pedido | null>(null);
  const cancelacion = useConfirmacion<Pedido>();
  const { abrir: abrirCancelacion } = cancelacion;
  const { error, limpiarError, mostrarError } = useErrorMensaje();
  const pedidos = usePedidos({ skip: 0, limit: LIMITE_ADMIN, estado: filtro });
  const { mutate: cambiar, isPending: cambiando } = useCambiarEstadoPedido();

  const columnas = useMemo(
    () => [
      columnHelper.accessor('id', { header: '#' }),
      columnHelper.accessor('usuario_id', { header: 'Cliente', cell: (c) => `#${c.getValue()}` }),
      columnHelper.accessor('created_at', { header: 'Fecha', cell: (c) => formatFecha(c.getValue()) }),
      columnHelper.accessor('forma_pago', { header: 'Pago', cell: (c) => ETIQUETA_FORMA_PAGO[c.getValue()] }),
      columnHelper.accessor('total', { header: 'Total', cell: (c) => formatPrecio(c.getValue()) }),
      columnHelper.accessor('estado', { header: 'Estado', cell: (c) => <BadgeEstado estado={c.getValue()} /> }),
      columnHelper.display({
        id: 'acciones',
        header: 'Acciones',
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-2">
            <Button variante="fantasma" onClick={() => setSeleccionado(row.original)}>
              Ver detalle
            </Button>
            {TRANSICIONES[row.original.estado].map((destino) => (
              <Button
                key={destino}
                variante={destino === 'CANCELADO' ? 'peligro' : 'primario'}
                disabled={cambiando}
                onClick={() => {
                  limpiarError();
                  if (destino === 'CANCELADO') {
                    abrirCancelacion(row.original);
                    return;
                  }
                  cambiar({ id: row.original.id, estado: destino }, { onError: mostrarError });
                }}
              >
                {TEXTO_TRANSICION[destino]}
              </Button>
            ))}
          </div>
        ),
      }),
    ],
    [cambiar, cambiando, limpiarError, mostrarError, abrirCancelacion],
  );

  const tabla = useTablaAdmin(pedidos.data?.items ?? [], columnas);

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Pedidos</h1>
        <select
          aria-label="Filtrar por estado"
          value={filtro ?? ''}
          onChange={(e) => setFiltro(esEstadoPedido(e.target.value) ? e.target.value : undefined)}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
        >
          <option value="">Todos los estados</option>
          {ESTADOS_PEDIDO.map((estado) => (
            <option key={estado} value={estado}>
              {ETIQUETA_ESTADO[estado]}
            </option>
          ))}
        </select>
      </div>
      <MensajeError mensaje={error} />
      {pedidos.isPending ? (
        <Skeleton className="h-64" />
      ) : pedidos.isError ? (
        <EstadoErrorConsulta consulta={pedidos} />
      ) : pedidos.data.items.length === 0 ? (
        filtro ? (
          <EstadoVacio titulo={`No hay pedidos «${ETIQUETA_ESTADO[filtro]}»`} mensaje="Probá con otro estado." />
        ) : (
          <EstadoVacio titulo="Todavía no hay pedidos" mensaje="Los pedidos de los clientes van a aparecer acá." />
        )
      ) : (
        <TablaBase table={tabla} />
      )}
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
        mensaje="Los productos vuelven al stock. Esta acción no se puede deshacer."
        textoConfirmar="Cancelar pedido"
        cargando={cambiando}
        onCerrar={cancelacion.cerrar}
        onConfirmar={() => {
          if (!cancelacion.objetivo) return;
          cambiar(
            { id: cancelacion.objetivo.id, estado: 'CANCELADO' },
            {
              onSuccess: cancelacion.cerrar,
              onError: (e) => {
                cancelacion.cerrar();
                mostrarError(e);
              },
            },
          );
        }}
      />
    </section>
  );
};
