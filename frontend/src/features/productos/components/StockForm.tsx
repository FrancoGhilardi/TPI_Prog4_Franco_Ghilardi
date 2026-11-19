import type { FC } from 'react';
import type { Producto, ProductoStockUpdate } from '@/features/productos/types';
import { useAppForm } from '@/shared/components';
import { useErrorMensaje } from '@/shared/hooks';
import { Button, MensajeError } from '@/shared/ui';
import { alEnviarFormulario, validarEnteroNoNegativo } from '@/shared/utils';

export interface StockFormProps {
  producto: Producto;
  onGuardar: (datos: ProductoStockUpdate) => Promise<void>;
  onCancelar: () => void;
}

export const StockForm: FC<StockFormProps> = ({ producto, onGuardar, onCancelar }) => {
  const { error, ejecutar } = useErrorMensaje();
  const form = useAppForm({
    defaultValues: { stock: producto.stock, disponible: producto.disponible },
    onSubmit: ({ value }) => ejecutar(() => onGuardar(value)),
  });

  return (
    <form.AppForm>
      <form className="flex flex-col gap-4" onSubmit={alEnviarFormulario(form)}>
        <form.AppField
          name="stock"
          validators={{ onChange: validarEnteroNoNegativo('Ingresá un número entero igual o mayor a 0.') }}
        >
          {(field) => <field.CampoNumero label="Stock disponible" min={0} step={1} />}
        </form.AppField>
        <form.AppField name="disponible">
          {(field) => <field.CampoCheckbox label="Disponible para la venta" />}
        </form.AppField>
        <MensajeError mensaje={error} />
        <div className="flex justify-end gap-2">
          <Button variante="secundario" onClick={onCancelar}>
            Cancelar
          </Button>
          <form.BotonEnviar textoCargando="Guardando…">Guardar cambios</form.BotonEnviar>
        </div>
      </form>
    </form.AppForm>
  );
};
