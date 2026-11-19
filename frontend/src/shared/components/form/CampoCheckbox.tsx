import type { FC } from 'react';
import { useFieldContext } from './contextos';

export interface CampoCheckboxProps {
  label: string;
}

/** Checkbox con etiqueta conectado a un campo booleano de TanStack Form. */
export const CampoCheckbox: FC<CampoCheckboxProps> = ({ label }) => {
  const field = useFieldContext<boolean>();
  return (
    <label className="flex items-center gap-2 text-sm">
      <input type="checkbox" checked={field.state.value} onChange={(e) => field.handleChange(e.target.checked)} />
      {label}
    </label>
  );
};
