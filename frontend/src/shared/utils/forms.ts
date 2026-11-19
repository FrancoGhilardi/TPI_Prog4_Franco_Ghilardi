import type { FormEvent } from 'react';

/** Une los mensajes de error de un campo de TanStack Form. */
export const mensajeError = (errores: readonly unknown[]): string | undefined => {
  const textos = errores.filter((e): e is string => typeof e === 'string' && e.length > 0);
  return textos.length > 0 ? textos.join(', ') : undefined;
};

interface FormularioEnviable {
  handleSubmit: () => Promise<unknown>;
}

/** Handler de `onSubmit` para un `<form>` controlado por TanStack Form. */
export const alEnviarFormulario =
  (form: FormularioEnviable) =>
  (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    e.stopPropagation();
    void form.handleSubmit();
  };
