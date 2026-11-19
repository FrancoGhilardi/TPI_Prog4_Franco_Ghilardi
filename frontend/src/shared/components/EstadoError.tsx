import type { FC } from 'react';
import { Button } from '@/shared/ui';

export interface EstadoErrorProps {
  mensaje: string;
  onReintentar?: () => void;
}

export const EstadoError: FC<EstadoErrorProps> = ({ mensaje, onReintentar }) => (
  <div role="alert" className="flex flex-col items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-6 text-center">
    <p className="text-sm text-red-700">{mensaje}</p>
    {onReintentar && (
      <Button variante="secundario" onClick={onReintentar}>
        Reintentar
      </Button>
    )}
  </div>
);
