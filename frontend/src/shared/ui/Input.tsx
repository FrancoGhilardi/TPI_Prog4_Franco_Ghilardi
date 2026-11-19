import { useId, type FC, type InputHTMLAttributes } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  ayuda?: string;
}

export const Input: FC<InputProps> = ({ label, error, ayuda, className = '', id, ...rest }) => {
  const generado = useId();
  const inputId = id ?? generado;
  const ayudaId = `${inputId}-ayuda`;
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={inputId} className="text-sm font-medium text-slate-700">
        {label}
      </label>
      <input
        id={inputId}
        {...rest}
        aria-invalid={error !== undefined}
        aria-describedby={ayuda && !error ? ayudaId : undefined}
        className={`rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-500 ${
          error ? 'border-red-500' : 'border-slate-300'
        } ${className}`}
      />
      {error ? (
        <p className="text-xs text-red-600">{error}</p>
      ) : (
        ayuda && (
          <p id={ayudaId} className="text-xs text-slate-500">
            {ayuda}
          </p>
        )
      )}
    </div>
  );
};
