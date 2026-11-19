export const calcularTotalPaginas = (total: number, porPagina: number): number => Math.ceil(total / porPagina);

/** Offset para el backend a partir de una página que empieza en 1. */
export const calcularSkip = (pagina: number, porPagina: number): number => (pagina - 1) * porPagina;
