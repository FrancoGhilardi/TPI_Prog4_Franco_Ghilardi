import type { FC, ReactNode } from 'react';
import { Button } from '@/shared/ui';
import { useFormContext } from './contextos';

export interface BotonEnviarProps {
  textoCargando: string;
  children: ReactNode;
}

/** Botón submit: se deshabilita si el formulario no es válido y muestra el estado de envío. */
export const BotonEnviar: FC<BotonEnviarProps> = ({ textoCargando, children }) => {
  const form = useFormContext();
  return (
    <form.Subscribe selector={(s) => [s.canSubmit, s.isSubmitting] as const}>
      {([canSubmit, isSubmitting]) => (
        <Button type="submit" disabled={!canSubmit} cargando={isSubmitting} textoCargando={textoCargando}>
          {children}
        </Button>
      )}
    </form.Subscribe>
  );
};
