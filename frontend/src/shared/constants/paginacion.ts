/** Tamaños de página de cada listado. */
export const TAMANO_PAGINA = {
  catalogo: 8,
  misPedidos: 10,
  tablaAdmin: 10,
} as const;

/** Cantidad de registros que piden las tablas de administración (se paginan en el cliente). */
export const LIMITE_ADMIN = 100;
