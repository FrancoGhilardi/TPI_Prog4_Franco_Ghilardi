import type { FC } from 'react';
import { handleApiError } from '@/shared/api';
import { EstadoError } from './EstadoError';

/** Lo mínimo de un resultado de `useQuery` para mostrar su error y reintentar. */
export interface ConsultaReintentable {
  error: unknown;
  refetch: () => Promise<unknown>;
}

export interface EstadoErrorConsultaProps {
  consulta: ConsultaReintentable;
}

/** `EstadoError` para una consulta fallida de TanStack Query, con botón para reintentar. */
export const EstadoErrorConsulta: FC<EstadoErrorConsultaProps> = ({ consulta }) => (
  <EstadoError mensaje={handleApiError(consulta.error)} onReintentar={() => void consulta.refetch()} />
);
