import { createFormHook } from '@tanstack/react-form';
import { BotonEnviar } from './BotonEnviar';
import { CampoCheckbox } from './CampoCheckbox';
import { CampoNumero } from './CampoNumero';
import { CampoTexto } from './CampoTexto';
import { fieldContext, formContext } from './contextos';

/**
 * useForm de TanStack con los campos de la app ya conectados:
 * <form.AppField name="x">{(field) => <field.CampoTexto label="X" />}</form.AppField>
 * y <form.AppForm><form.BotonEnviar textoCargando="…">…</form.BotonEnviar></form.AppForm>.
 */
export const { useAppForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: { CampoTexto, CampoNumero, CampoCheckbox },
  formComponents: { BotonEnviar },
});
