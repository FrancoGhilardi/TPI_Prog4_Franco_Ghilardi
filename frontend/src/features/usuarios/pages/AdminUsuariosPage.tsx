import { createColumnHelper } from '@tanstack/react-table';
import { useMemo, type FC } from 'react';
import { useActivarUsuario, useDesactivarUsuario, useUsuarios } from '@/features/usuarios/hooks';
import type { UserPublic } from '@/features/usuarios/types';
import { EstadoErrorConsulta, Skeleton, TablaBase } from '@/shared/components';
import { ETIQUETA_ROL } from '@/shared/constants';
import { useConfirmacion, useErrorMensaje, useTablaAdmin } from '@/shared/hooks';
import { Button, ConfirmDialog, MensajeError } from '@/shared/ui';
import { useAuthStore } from '@/store';

const columnHelper = createColumnHelper<UserPublic>();

export const AdminUsuariosPage: FC = () => {
  const usuarios = useUsuarios();
  const { mutate: activar } = useActivarUsuario();
  const { mutate: desactivar, isPending: desactivando } = useDesactivarUsuario();
  const actualId = useAuthStore((s) => s.usuario?.id);
  const desactivacion = useConfirmacion<UserPublic>();
  const { abrir: abrirDesactivacion } = desactivacion;
  const { error, limpiarError, mostrarError } = useErrorMensaje();

  const columnas = useMemo(
    () => [
      columnHelper.accessor('username', { header: 'Usuario' }),
      columnHelper.accessor('full_name', { header: 'Nombre' }),
      columnHelper.accessor('email', { header: 'Email' }),
      columnHelper.accessor('role', { header: 'Rol', cell: (c) => ETIQUETA_ROL[c.getValue()] }),
      columnHelper.accessor('disabled', {
        header: 'Estado',
        cell: (c) =>
          c.getValue() ? (
            <span className="text-red-600">Desactivado</span>
          ) : (
            <span className="text-green-700">Activo</span>
          ),
      }),
      columnHelper.display({
        id: 'acciones',
        header: 'Acciones',
        cell: ({ row }) => {
          const u = row.original;
          if (u.disabled) {
            return (
              <Button variante="secundario" onClick={() => activar(u.id, { onError: mostrarError })}>
                Activar
              </Button>
            );
          }
          // El botón Desactivar no se muestra en la fila del usuario de la sesión.
          return u.id === actualId ? null : (
            <Button
              variante="peligro"
              onClick={() => {
                limpiarError();
                abrirDesactivacion(u);
              }}
            >
              Desactivar
            </Button>
          );
        },
      }),
    ],
    [activar, actualId, limpiarError, mostrarError, abrirDesactivacion],
  );

  const tabla = useTablaAdmin(usuarios.data ?? [], columnas);

  return (
    <section className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Usuarios</h1>
      <MensajeError mensaje={error} />
      {usuarios.isPending ? (
        <Skeleton className="h-64" />
      ) : usuarios.isError ? (
        <EstadoErrorConsulta consulta={usuarios} />
      ) : (
        <TablaBase table={tabla} />
      )}
      <ConfirmDialog
        abierto={desactivacion.abierto}
        titulo={`¿Desactivar a «${desactivacion.objetivo?.username ?? ''}»?`}
        mensaje="No va a poder iniciar sesión hasta que lo vuelvas a activar."
        textoConfirmar="Desactivar"
        cargando={desactivando}
        onCerrar={desactivacion.cerrar}
        onConfirmar={() => {
          if (!desactivacion.objetivo) return;
          desactivar(desactivacion.objetivo.id, {
            onSuccess: desactivacion.cerrar,
            onError: (e) => {
              desactivacion.cerrar();
              mostrarError(e);
            },
          });
        }}
      />
    </section>
  );
};
