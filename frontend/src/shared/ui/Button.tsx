import type { ButtonHTMLAttributes, FC } from 'react';

export type VarianteBoton = 'primario' | 'secundario' | 'peligro' | 'fantasma';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: VarianteBoton;
  cargando?: boolean;
  textoCargando?: string;
}

const ESTILOS: Record<VarianteBoton, string> = {
  primario: 'bg-orange-600 text-white hover:bg-orange-700',
  secundario: 'border border-slate-300 bg-white text-slate-800 hover:bg-slate-100',
  peligro: 'bg-red-600 text-white hover:bg-red-700',
  fantasma: 'text-slate-700 hover:bg-slate-100',
};

export const Button: FC<ButtonProps> = ({
  variante = 'primario',
  cargando = false,
  textoCargando = 'Procesando…',
  className = '',
  disabled,
  children,
  ...rest
}) => (
  <button
    type="button"
    {...rest}
    disabled={disabled || cargando}
    className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${ESTILOS[variante]} ${className}`}
  >
    {cargando ? textoCargando : children}
  </button>
);
