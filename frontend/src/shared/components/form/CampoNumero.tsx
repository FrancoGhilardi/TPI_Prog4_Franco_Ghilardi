import type { FC } from 'react';
import { Input, type InputProps } from '@/shared/ui';
import { mensajeError } from '@/shared/utils';
import { useFieldContext } from './contextos';

export type CampoNumeroProps = Omit<InputProps, 'type' | 'value' | 'onChange' | 'onBlur' | 'error'>;

/** Input numérico conectado a un campo de TanStack Form; un valor vacío se guarda como NaN. */
export const CampoNumero: FC<CampoNumeroProps> = (props) => {
  const field = useFieldContext<number>();
  return (
    <Input
      {...props}
      type="number"
      value={Number.isNaN(field.state.value) ? '' : field.state.value}
      onBlur={field.handleBlur}
      onChange={(e) => field.handleChange(e.target.valueAsNumber)}
      error={mensajeError(field.state.meta.errors)}
    />
  );
};
