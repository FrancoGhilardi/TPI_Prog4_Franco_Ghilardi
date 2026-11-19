import type { FC } from 'react';

export interface MensajeErrorProps {
  mensaje: string | null;
}

/** Mensaje de error en línea (formularios y acciones); no renderiza nada si no hay mensaje. */
export const MensajeError: FC<MensajeErrorProps> = ({ mensaje }) =>
  mensaje ? (
    <p role="alert" className="text-sm text-red-600">
      {mensaje}
    </p>
  ) : null;
