const moneda = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' });
const fecha = new Intl.DateTimeFormat('es-AR', { dateStyle: 'short', timeStyle: 'short' });

export const formatPrecio = (valor: number): string => moneda.format(valor);

/** El backend envía UTC sin zona: se agrega 'Z' para interpretarlo como UTC. */
export const formatFecha = (iso: string): string => {
  const conZona = /[zZ]|[+-]\d{2}:\d{2}$/.test(iso) ? iso : `${iso}Z`;
  return fecha.format(new Date(conZona));
};
