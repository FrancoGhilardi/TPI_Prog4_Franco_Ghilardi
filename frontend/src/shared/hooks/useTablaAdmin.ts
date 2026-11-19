import { getCoreRowModel, getPaginationRowModel, useReactTable, type TableOptions } from '@tanstack/react-table';
import { TAMANO_PAGINA } from '@/shared/constants/paginacion';

/** Tipo de columnas que acepta TanStack Table (permite mezclar columnas de distinto tipo de valor). */
export type ColumnasTabla<T> = TableOptions<T>['columns'];

/** Tabla paginada en el cliente para las páginas de administración. */
export const useTablaAdmin = <T,>(data: T[], columns: ColumnasTabla<T>) =>
  useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    autoResetPageIndex: false,
    initialState: { pagination: { pageSize: TAMANO_PAGINA.tablaAdmin } },
  });
