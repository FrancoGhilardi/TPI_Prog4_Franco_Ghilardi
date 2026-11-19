import { createColumnHelper } from '@tanstack/react-table';
import { useMemo, useState, type FC } from 'react';
import { CategoriaForm } from '@/features/categorias/components';
import {
  useActualizarCategoria,
  useCategorias,
  useCrearCategoria,
  useEliminarCategoria,
} from '@/features/categorias/hooks';
import type { Categoria, CategoriaCreate } from '@/features/categorias/types';
import { EstadoErrorConsulta, EstadoVacio, Skeleton, TablaBase } from '@/shared/components';
import { useConfirmacion, useErrorMensaje, useTablaAdmin } from '@/shared/hooks';
import { Button, ConfirmDialog, MensajeError, Modal } from '@/shared/ui';

type EstadoModal = { modo: 'crear' } | { modo: 'editar'; categoria: Categoria } | null;

const columnHelper = createColumnHelper<Categoria>();

export const AdminCategoriasPage: FC = () => {
  const categorias = useCategorias();
  const crear = useCrearCategoria();
  const actualizar = useActualizarCategoria();
  const { mutate: eliminarCategoria, isPending: dandoDeBaja } = useEliminarCategoria();
  const baja = useConfirmacion<Categoria>();
  const { abrir: abrirBaja } = baja;
  const [modal, setModal] = useState<EstadoModal>(null);
  const { error, limpiarError, mostrarError } = useErrorMensaje();

  const columnas = useMemo(
    () => [
      columnHelper.accessor('id', { header: 'ID' }),
      columnHelper.accessor('nombre', { header: 'Nombre' }),
      columnHelper.accessor('descripcion', { header: 'Descripción', cell: (c) => c.getValue() ?? '—' }),
      columnHelper.display({
        id: 'acciones',
        header: 'Acciones',
        cell: ({ row }) => (
          <div className="flex gap-2">
            <Button variante="secundario" onClick={() => setModal({ modo: 'editar', categoria: row.original })}>
              Editar
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

  const tabla = useTablaAdmin(categorias.data ?? [], columnas);

  const guardar = async (datos: CategoriaCreate): Promise<void> => {
    if (modal?.modo === 'editar') {
      await actualizar.mutateAsync({ id: modal.categoria.id, datos });
    } else {
      await crear.mutateAsync(datos);
    }
    setModal(null);
  };

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Categorías</h1>
        <Button onClick={() => setModal({ modo: 'crear' })}>Nueva categoría</Button>
      </div>
      <MensajeError mensaje={error} />
      {categorias.isPending ? (
        <Skeleton className="h-64" />
      ) : categorias.isError ? (
        <EstadoErrorConsulta consulta={categorias} />
      ) : categorias.data.length === 0 ? (
        <EstadoVacio titulo="Todavía no hay categorías" mensaje="Creá la primera para organizar el catálogo." />
      ) : (
        <TablaBase table={tabla} />
      )}
      <Modal
        abierto={modal !== null}
        titulo={modal?.modo === 'editar' ? 'Editar categoría' : 'Nueva categoría'}
        onCerrar={() => setModal(null)}
      >
        {modal && (
          <CategoriaForm
            key={modal.modo === 'editar' ? modal.categoria.id : 'nueva'}
            inicial={modal.modo === 'editar' ? modal.categoria : undefined}
            onGuardar={guardar}
            onCancelar={() => setModal(null)}
          />
        )}
      </Modal>
      <ConfirmDialog
        abierto={baja.abierto}
        titulo={`¿Dar de baja «${baja.objetivo?.nombre ?? ''}»?`}
        mensaje="La categoría deja de aparecer en el catálogo. Sus productos siguen a la venta hasta que los des de baja."
        textoConfirmar="Dar de baja"
        cargando={dandoDeBaja}
        onCerrar={baja.cerrar}
        onConfirmar={() => {
          if (!baja.objetivo) return;
          eliminarCategoria(baja.objetivo.id, {
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
