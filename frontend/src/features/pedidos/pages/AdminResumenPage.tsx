import type { FC } from 'react';
import { ResumenCard } from '@/features/pedidos/components';
import { useResumenPedidos } from '@/features/pedidos/hooks';
import { EstadoErrorConsulta, Skeleton } from '@/shared/components';
import { formatPrecio } from '@/shared/utils';

export const AdminResumenPage: FC = () => {
  const resumen = useResumenPedidos();

  if (resumen.isPending) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
    );
  }
  if (resumen.isError) {
    return <EstadoErrorConsulta consulta={resumen} />;
  }

  const r = resumen.data;
  return (
    <section className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Resumen del negocio</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <ResumenCard titulo="Pendientes" valor={String(r.pendientes)} acento="border-amber-500" />
        <ResumenCard titulo="En preparación" valor={String(r.en_preparacion)} acento="border-blue-500" />
        <ResumenCard titulo="Entregados" valor={String(r.entregados)} acento="border-green-500" />
        <ResumenCard titulo="Cancelados" valor={String(r.cancelados)} acento="border-red-500" />
        <ResumenCard titulo="Pedidos de hoy" valor={String(r.pedidos_hoy)} acento="border-slate-500" />
        <ResumenCard
          titulo="Ingresos por pedidos entregados"
          valor={formatPrecio(r.ingresos_entregados)}
          acento="border-orange-500"
        />
      </div>
    </section>
  );
};
