import { createFormHookContexts } from '@tanstack/react-form';

/** Contextos de TanStack Form que comparten useAppForm y los componentes de campo. */
export const { fieldContext, formContext, useFieldContext, useFormContext } = createFormHookContexts();
