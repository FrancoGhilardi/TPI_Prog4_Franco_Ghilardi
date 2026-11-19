import type { FC } from 'react';
import { Input, type InputProps } from '@/shared/ui';
import { mensajeError } from '@/shared/utils';
import { useFieldContext } from './contextos';

export type CampoTextoProps = Omit<InputProps, 'value' | 'onChange' | 'onBlur' | 'error'>;

/** Input conectado a un campo de texto de TanStack Form (dentro de form.AppField). */
export const CampoTexto: FC<CampoTextoProps> = (props) => {
  const field = useFieldContext<string>();
  return (
    <Input
      {...props}
      value={field.state.value}
      onBlur={field.handleBlur}
      onChange={(e) => field.handleChange(e.target.value)}
      error={mensajeError(field.state.meta.errors)}
    />
  );
};
