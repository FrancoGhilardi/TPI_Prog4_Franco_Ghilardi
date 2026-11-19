/** Claves base de TanStack Query; las consultas concretas agregan sus filtros. */
export const QUERY_KEYS = {
  productos: ['productos'],
  categorias: ['categorias'],
  pedidos: ['pedidos'],
  resumen: ['pedidos', 'resumen'],
  usuarios: ['usuarios'],
} as const;
