import type { FC } from 'react';
import type { Categoria, CategoriaCreate } from '@/features/categorias/types';
import { useAppForm } from '@/shared/components';
import { LIMITES } from '@/shared/constants';
import { useErrorMensaje } from '@/shared/hooks';
import { Button, MensajeError } from '@/shared/ui';
import { alEnviarFormulario, validarLargo, validarMaximo } from '@/shared/utils';

export interface CategoriaFormProps {
  inicial?: Categoria;
  onGuardar: (datos: CategoriaCreate) => Promise<void>;
  onCancelar: () => void;
}

export const CategoriaForm: FC<CategoriaFormProps> = ({ inicial, onGuardar, onCancelar }) => {
  const { error, ejecutar } = useErrorMensaje();
  const form = useAppForm({
    defaultValues: { nombre: inicial?.nombre ?? '', descripcion: inicial?.descripcion ?? '' },
    onSubmit: ({ value }) =>
      ejecutar(() => onGuardar({ nombre: value.nombre.trim(), descripcion: value.descripcion.trim() || null })),
  });

  return (
    <form.AppForm>
      <form className="flex flex-col gap-4" onSubmit={alEnviarFormulario(form)}>
        <form.AppField
          name="nombre"
          validators={{
            onChange: validarLargo(
              LIMITES.nombreCategoria.min,
              LIMITES.nombreCategoria.max,
              'El nombre debe tener entre 2 y 100 caracteres.',
            ),
          }}
        >
          {(field) => <field.CampoTexto label="Nombre" />}
        </form.AppField>
        <form.AppField
          name="descripcion"
          validators={{
            onChange: validarMaximo(
              LIMITES.descripcionCategoria.max,
              'La descripción puede tener hasta 500 caracteres.',
            ),
          }}
        >
          {(field) => <field.CampoTexto label="Descripción (opcional)" />}
        </form.AppField>
        <MensajeError mensaje={error} />
        <div className="flex justify-end gap-2">
          <Button variante="secundario" onClick={onCancelar}>
            Cancelar
          </Button>
          <form.BotonEnviar textoCargando="Guardando…">Guardar categoría</form.BotonEnviar>
        </div>
      </form>
    </form.AppForm>
  );
};
