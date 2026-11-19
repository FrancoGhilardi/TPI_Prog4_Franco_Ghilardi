import type { FC } from 'react';
import type { Categoria } from '@/features/categorias/types';
import type { Producto, ProductoFormDatos } from '@/features/productos/types';
import { useAppForm } from '@/shared/components';
import { LIMITES } from '@/shared/constants';
import { useErrorMensaje } from '@/shared/hooks';
import { Button, MensajeError, Select } from '@/shared/ui';
import { alEnviarFormulario, mensajeError, validarEnteroNoNegativo, validarLargo, validarNoNegativo } from '@/shared/utils';

export interface ProductoFormProps {
  inicial?: Producto;
  categorias: Categoria[];
  onGuardar: (datos: ProductoFormDatos) => Promise<void>;
  onCancelar: () => void;
}

export const ProductoForm: FC<ProductoFormProps> = ({ inicial, categorias, onGuardar, onCancelar }) => {
  const editando = inicial !== undefined;
  const categoriaInicial =
    inicial && categorias.some((c) => c.id === inicial.categoria_id) ? inicial.categoria_id : (categorias[0]?.id ?? 0);
  const { error, ejecutar } = useErrorMensaje();
  const form = useAppForm({
    defaultValues: {
      nombre: inicial?.nombre ?? '',
      descripcion: inicial?.descripcion ?? '',
      precio_base: inicial?.precio_base ?? 0,
      imagen_url: inicial?.imagen_url ?? '',
      stock: inicial?.stock ?? 0,
      disponible: inicial?.disponible ?? true,
      categoria_id: categoriaInicial,
    },
    onSubmit: ({ value }) =>
      ejecutar(() => {
        const { stock, ...resto } = value;
        return onGuardar({
          ...resto,
          ...(editando ? {} : { stock }),
          nombre: value.nombre.trim(),
          descripcion: value.descripcion.trim() || null,
          imagen_url: value.imagen_url.trim() || null,
        });
      }),
  });

  const opcionesCategorias = categorias.map((c) => ({ valor: String(c.id), etiqueta: c.nombre }));

  return (
    <form.AppForm>
      <form className="flex flex-col gap-4" onSubmit={alEnviarFormulario(form)}>
        <form.AppField
          name="nombre"
          validators={{
            onChange: validarLargo(
              LIMITES.nombreProducto.min,
              LIMITES.nombreProducto.max,
              'El nombre debe tener entre 2 y 150 caracteres.',
            ),
          }}
        >
          {(field) => <field.CampoTexto label="Nombre" />}
        </form.AppField>
        <form.AppField name="descripcion">{(field) => <field.CampoTexto label="Descripción (opcional)" />}</form.AppField>
        <div className="grid grid-cols-2 gap-4">
          <form.AppField
            name="precio_base"
            validators={{ onChange: validarNoNegativo('Ingresá un precio igual o mayor a 0.') }}
          >
            {(field) => <field.CampoNumero label="Precio" min={0} step="0.01" />}
          </form.AppField>
          {!editando && (
            <form.AppField
              name="stock"
              validators={{ onChange: validarEnteroNoNegativo('Ingresá un número entero igual o mayor a 0.') }}
            >
              {(field) => <field.CampoNumero label="Stock inicial" min={0} step={1} />}
            </form.AppField>
          )}
        </div>
        <form.AppField name="imagen_url">
          {(field) => (
            <field.CampoTexto
              label="URL de la imagen (opcional)"
              ayuda="Si no cargás una, se muestra una imagen genérica."
              type="url"
            />
          )}
        </form.AppField>
        <form.AppField
          name="categoria_id"
          validators={{ onChange: ({ value }) => (value > 0 ? undefined : 'Elegí una categoría.') }}
        >
          {(field) => (
            <Select
              label="Categoría"
              opciones={opcionesCategorias}
              value={String(field.state.value)}
              onChange={(e) => field.handleChange(Number(e.target.value))}
              error={mensajeError(field.state.meta.errors)}
            />
          )}
        </form.AppField>
        <form.AppField name="disponible">
          {(field) => <field.CampoCheckbox label="Disponible para la venta" />}
        </form.AppField>
        <MensajeError mensaje={error} />
        <div className="flex justify-end gap-2">
          <Button variante="secundario" onClick={onCancelar}>
            Cancelar
          </Button>
          <form.BotonEnviar textoCargando="Guardando…">Guardar producto</form.BotonEnviar>
        </div>
      </form>
    </form.AppForm>
  );
};
