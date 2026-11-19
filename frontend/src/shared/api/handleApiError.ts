import axios from 'axios';
import { CUENTA_DESACTIVADA } from './axiosInstance';

interface ErrorValidacion {
  loc: unknown[];
  msg: string;
  type?: string;
  ctx?: Record<string, unknown>;
}

const ETIQUETA_CAMPO: Record<string, string> = {
  username: 'nombre de usuario',
  full_name: 'nombre completo',
  email: 'email',
  password: 'contraseña',
  nombre: 'nombre',
  descripcion: 'descripción',
  precio_base: 'precio',
  stock: 'stock',
  imagen_url: 'URL de la imagen',
  categoria_id: 'categoría',
  direccion_entrega: 'dirección de entrega',
  forma_pago: 'forma de pago',
  notas: 'notas',
  items: 'productos',
  cantidad: 'cantidad',
  estado: 'estado',
};

const MENSAJE_GENERICO_VALIDACION = 'Revisá los datos ingresados e intentá de nuevo.';

const esErrorValidacion = (valor: unknown): valor is ErrorValidacion =>
  typeof valor === 'object' &&
  valor !== null &&
  'loc' in valor &&
  Array.isArray(valor.loc) &&
  'msg' in valor &&
  typeof valor.msg === 'string';

const ctxNumero = (ctx: Record<string, unknown> | undefined, clave: string): string | undefined => {
  const valor = ctx?.[clave];
  return typeof valor === 'number' || typeof valor === 'string' ? String(valor) : undefined;
};

const traducirError = (error: ErrorValidacion): string => {
  const clave = String(error.loc[error.loc.length - 1]);
  const campo = ETIQUETA_CAMPO[clave] ?? clave;
  const min = ctxNumero(error.ctx, 'min_length');
  const max = ctxNumero(error.ctx, 'max_length');
  const ge = ctxNumero(error.ctx, 'ge');
  switch (error.type) {
    case 'missing':
      return `Completá el campo «${campo}».`;
    case 'string_too_short':
      return min ? `«${campo}» debe tener al menos ${min} caracteres.` : `Revisá el campo «${campo}».`;
    case 'string_too_long':
      return max ? `«${campo}» puede tener hasta ${max} caracteres.` : `Revisá el campo «${campo}».`;
    case 'greater_than_equal':
      return ge ? `«${campo}» debe ser igual o mayor a ${ge}.` : `Revisá el campo «${campo}».`;
    case 'too_short':
      return 'Agregá al menos un producto.';
    case 'value_error':
      return clave === 'email' ? 'Ingresá un email válido, por ejemplo nombre@correo.com.' : `Revisá el campo «${campo}».`;
    case 'literal_error':
      return `Elegí una opción válida para «${campo}».`;
    default:
      return `Revisá el campo «${campo}».`;
  }
};

export const handleApiError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    if (!error.response) {
      return 'No pudimos conectarnos con el servidor. Revisá tu conexión e intentá de nuevo.';
    }
    if (error.response.status >= 500) {
      return 'Ocurrió un error inesperado. Intentá de nuevo en unos minutos.';
    }
    const detail = (error.response.data as { detail?: unknown } | undefined)?.detail;
    if (typeof detail === 'string') {
      return detail === CUENTA_DESACTIVADA
        ? 'Tu cuenta está desactivada. Contactá al negocio para reactivarla.'
        : detail;
    }
    if (Array.isArray(detail)) {
      const mensajes = [...new Set(detail.filter(esErrorValidacion).map(traducirError))];
      return mensajes.length > 0 ? mensajes.join(' ') : MENSAJE_GENERICO_VALIDACION;
    }
    return MENSAJE_GENERICO_VALIDACION;
  }
  return 'Ocurrió un error inesperado. Intentá de nuevo.';
};
