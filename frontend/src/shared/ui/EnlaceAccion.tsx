import type { FC, ReactNode } from 'react';
import { Link } from 'react-router-dom';

export interface EnlaceAccionProps {
  to: string;
  children: ReactNode;
}

/** Enlace destacado que acompaña a los estados vacíos (por ejemplo, volver al catálogo). */
export const EnlaceAccion: FC<EnlaceAccionProps> = ({ to, children }) => (
  <Link to={to} className="text-sm font-medium text-orange-600 hover:underline">
    {children}
  </Link>
);
