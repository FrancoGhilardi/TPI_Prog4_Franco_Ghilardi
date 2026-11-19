import type { FC, ReactNode } from 'react';

export interface EstadoVacioProps {
  titulo: string;
  mensaje?: string;
  accion?: ReactNode;
}

export const EstadoVacio: FC<EstadoVacioProps> = ({ titulo, mensaje, accion }) => (
  <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-slate-300 p-10 text-center">
    <p className="text-lg font-semibold text-slate-700">{titulo}</p>
    {mensaje && <p className="text-sm text-slate-500">{mensaje}</p>}
    {accion}
  </div>
);
