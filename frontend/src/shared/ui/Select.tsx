import { useId, type FC, type SelectHTMLAttributes } from 'react';

export interface OpcionSelect {
  valor: string;
  etiqueta: string;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  opciones: OpcionSelect[];
  error?: string;
}

export const Select: FC<SelectProps> = ({ label, opciones, error, id, className = '', ...rest }) => {
  const generado = useId();
  const selectId = id ?? generado;
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={selectId} className="text-sm font-medium text-slate-700">
        {label}
      </label>
      <select
        id={selectId}
        {...rest}
        className={`rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-500 ${className}`}
      >
        {opciones.map((o) => (
          <option key={o.valor} value={o.valor}>
            {o.etiqueta}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
};
