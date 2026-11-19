import type { FC } from 'react';
import { OPCIONES_FORMA_PAGO } from '@/features/pedidos/constants';
import type { DatosCheckout, FormaPago } from '@/features/pedidos/types';
import { useAppForm } from '@/shared/components';
import { LIMITES } from '@/shared/constants';
import { useErrorMensaje } from '@/shared/hooks';
import { MensajeError, Select } from '@/shared/ui';
import { alEnviarFormulario, validarLargo, validarMaximo } from '@/shared/utils';

export interface CheckoutFormProps {
  onConfirmar: (datos: DatosCheckout) => Promise<void>;
}

export const CheckoutForm: FC<CheckoutFormProps> = ({ onConfirmar }) => {
  const { error, ejecutar } = useErrorMensaje();
  const form = useAppForm({
    defaultValues: { direccion_entrega: '', forma_pago: 'EFECTIVO' as FormaPago, notas: '' },
    onSubmit: ({ value }) =>
      ejecutar(() =>
        onConfirmar({
          direccion_entrega: value.direccion_entrega.trim(),
          forma_pago: value.forma_pago,
          notas: value.notas.trim() || null,
        }),
      ),
  });

  return (
    <form.AppForm>
      <form className="flex flex-col gap-4" onSubmit={alEnviarFormulario(form)}>
        <form.AppField
          name="direccion_entrega"
          validators={{
            onChange: validarLargo(
              LIMITES.direccion.min,
              LIMITES.direccion.max,
              'La dirección debe tener entre 5 y 200 caracteres.',
            ),
          }}
        >
          {(field) => <field.CampoTexto label="Dirección de entrega" placeholder="Calle, número, piso y depto." />}
        </form.AppField>
        <form.AppField name="forma_pago">
          {(field) => (
            <Select
              label="Forma de pago"
              opciones={OPCIONES_FORMA_PAGO}
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value === 'TRANSFERENCIA' ? 'TRANSFERENCIA' : 'EFECTIVO')}
            />
          )}
        </form.AppField>
        <form.AppField
          name="notas"
          validators={{ onChange: validarMaximo(LIMITES.notas.max, 'Las notas pueden tener hasta 500 caracteres.') }}
        >
          {(field) => <field.CampoTexto label="Notas para el pedido (opcional)" placeholder="Por ejemplo: tocar el timbre 2B" />}
        </form.AppField>
        <MensajeError mensaje={error} />
        <form.BotonEnviar textoCargando="Enviando pedido…">Confirmar pedido</form.BotonEnviar>
      </form>
    </form.AppForm>
  );
};
