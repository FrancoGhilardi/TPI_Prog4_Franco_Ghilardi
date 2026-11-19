import type { FC } from 'react';
import { Card } from '@/shared/ui';

export interface ResumenCardProps {
  titulo: string;
  valor: string;
  acento: string;
}

export const ResumenCard: FC<ResumenCardProps> = ({ titulo, valor, acento }) => (
  <Card className={`border-l-4 ${acento}`}>
    <p className="text-sm text-slate-500">{titulo}</p>
    <p className="mt-1 text-3xl font-bold">{valor}</p>
  </Card>
);
