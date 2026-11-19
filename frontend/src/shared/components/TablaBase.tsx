import { flexRender, type Table } from '@tanstack/react-table';
import type { ReactElement } from 'react';
import { Paginacion } from './Paginacion';

export interface TablaBaseProps<T> {
  table: Table<T>;
}

// Componente genérico: FC no admite parámetros de tipo, por eso se tipa el retorno.
export const TablaBase = <T,>({ table }: TablaBaseProps<T>): ReactElement => {
  const { pageIndex } = table.getState().pagination;
  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-100">
            {table.getHeaderGroups().map((grupo) => (
              <tr key={grupo.id}>
                {grupo.headers.map((header) => (
                  <th key={header.id} className="px-4 py-3 text-left font-semibold text-slate-700">
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-slate-100">
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="hover:bg-slate-50">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-3 align-middle">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Paginacion
        pagina={pageIndex + 1}
        totalPaginas={table.getPageCount()}
        onCambiar={(p) => table.setPageIndex(p - 1)}
      />
    </div>
  );
};
