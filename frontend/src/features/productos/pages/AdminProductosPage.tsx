import { createColumnHelper } from '@tanstack/react-table';
import { useMemo, useState, type FC } from 'react';
import { useCategorias } from '@/features/categorias/hooks';
import { ProductoForm, StockForm } from '@/features/productos/components';
import {
  useActualizarProducto,
  useActualizarStock,
  useCrearProducto,
  useEliminarProducto,
  useProductos,
} from '@/features/productos/hooks';
import type { Producto, ProductoFormDatos, ProductoStockUpdate, ProductoUpdate } from '@/features/productos/types';
import { EstadoErrorConsulta, EstadoVacio, Skeleton, TablaBase } from '@/shared/components';
import { LIMITE_ADMIN } from '@/shared/constants';
import { useConfirmacion, useErrorMensaje, useTablaAdmin } from '@/shared/hooks';
import { Button, ConfirmDialog, MensajeError, Modal } from '@/shared/ui';
import { formatPrecio } from '@/shared/utils';

type EstadoModal =
  | { modo: 'crear' }
  | { modo: 'editar'; producto: Producto }
  | { modo: 'stock'; producto: Producto }
  | null;

type ModoModal = NonNullable<EstadoModal>['modo'];

const TITULOS: Record<ModoModal, string> = {
  crear: 'Nuevo producto',
  editar: 'Editar producto',
  stock: 'Cambiar stock y disponibilidad',
};

const columnHelper = createColumnHelper<Producto>();

export const AdminProductosPage: FC = () => {
  const productos = useProductos({ skip: 0, limit: LIMITE_ADMIN });
  const categorias = useCategorias();
  const crear = useCrearProducto();
  const actualizar = useActualizarProducto();
  const actualizarStock = useActualizarStock();
  const { mutate: eliminarProducto, isPending: dandoDeBaja } = useEliminarProducto();
  const baja = useConfirmacion<Producto>();
  const { abrir: abrirBaja } = baja;
  const [modal, setModal] = useState<EstadoModal>(null);
  const { error, limpiarError, mostrarError } = useErrorMensaje();

  const columnas = useMemo(
    () => [
      columnHelper.accessor('id', { header: 'ID' }),
      columnHelper.accessor('nombre', { header: 'Nombre' }),
      columnHelper.accessor((p) => p.categoria.nombre, { id: 'categoria', header: 'Categoría' }),
      columnHelper.accessor('precio_base', { header: 'Precio', cell: (c) => formatPrecio(c.getValue()) }),
      columnHelper.accessor('stock', { header: 'Stock' }),
      columnHelper.accessor('disponible', {
        header: 'Disponible',
        cell: (c) => (c.getValue() ? 'Sí' : 'No'),
      }),
      columnHelper.display({
        id: 'acciones',
        header: 'Acciones',
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-2">
            <Button variante="secundario" onClick={() => setModal({ modo: 'editar', producto: row.original })}>
              Editar
            </Button>
            <Button variante="secundario" onClick={() => setModal({ modo: 'stock', producto: row.original })}>
              Cambiar stock
            </Button>
            <Button
              variante="peligro"
              onClick={() => {
                limpiarError();
                abrirBaja(row.original);
              }}
            >
              Dar de baja
            </Button>
          </div>
        ),
      }),
    ],
    [limpiarError, abrirBaja],
  );

  const tabla = useTablaAdmin(productos.data?.items ?? [], columnas);

  const guardarProducto = async (datos: ProductoFormDatos): Promise<void> => {
    if (modal?.modo === 'editar') {
      // El stock se edita solo desde StockForm: no se envía en la edición.
      const cambios: ProductoUpdate = {
        nombre: datos.nombre,
        descripcion: datos.descripcion,
        precio_base: datos.precio_base,
        imagen_url: datos.imagen_url,
        disponible: datos.disponible,
        categoria_id: datos.categoria_id,
      };
      await actualizar.mutateAsync({ id: modal.producto.id, datos: cambios });
    } else {
      await crear.mutateAsync({ ...datos, stock: datos.stock ?? 0 });
    }
    setModal(null);
  };

  const guardarStock = async (datos: ProductoStockUpdate): Promise<void> => {
    if (modal?.modo !== 'stock') return;
    await actualizarStock.mutateAsync({ id: modal.producto.id, datos });
    setModal(null);
  };

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Productos</h1>
        <Button disabled={!categorias.data?.length} onClick={() => setModal({ modo: 'crear' })}>
          Nuevo producto
        </Button>
      </div>
      <MensajeError mensaje={error} />
      {productos.isPending ? (
        <Skeleton className="h-64" />
      ) : productos.isError ? (
        <EstadoErrorConsulta consulta={productos} />
      ) : productos.data.items.length === 0 ? (
        <EstadoVacio titulo="Todavía no hay productos" mensaje="Creá el primero para empezar a vender." />
      ) : (
        <TablaBase table={tabla} />
      )}
      <Modal abierto={modal !== null} titulo={modal ? TITULOS[modal.modo] : ''} onCerrar={() => setModal(null)}>
        {modal?.modo === 'stock' && (
          <StockForm
            key={modal.producto.id}
            producto={modal.producto}
            onGuardar={guardarStock}
            onCancelar={() => setModal(null)}
          />
        )}
        {(modal?.modo === 'crear' || modal?.modo === 'editar') && (
          <ProductoForm
            key={modal.modo === 'editar' ? modal.producto.id : 'nuevo'}
            inicial={modal.modo === 'editar' ? modal.producto : undefined}
            categorias={categorias.data ?? []}
            onGuardar={guardarProducto}
            onCancelar={() => setModal(null)}
          />
        )}
      </Modal>
      <ConfirmDialog
        abierto={baja.abierto}
        titulo={`¿Dar de baja «${baja.objetivo?.nombre ?? ''}»?`}
        mensaje="El producto deja de aparecer en el catálogo y no se puede pedir. Los pedidos anteriores no cambian."
        textoConfirmar="Dar de baja"
        cargando={dandoDeBaja}
        onCerrar={baja.cerrar}
        onConfirmar={() => {
          if (!baja.objetivo) return;
          eliminarProducto(baja.objetivo.id, {
            onSuccess: baja.cerrar,
            onError: (e) => {
              baja.cerrar();
              mostrarError(e);
            },
          });
        }}
      />
    </section>
  );
};
