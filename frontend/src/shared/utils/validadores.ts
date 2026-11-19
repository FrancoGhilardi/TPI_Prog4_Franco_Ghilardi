import { EMAIL_RE } from '@/shared/constants/validacion';

/** Validador de campo compatible con `validators.onChange` de TanStack Form. */
export type Validador<T> = (campo: { value: T }) => string | undefined;

/** Largo (sin espacios en los extremos) entre `min` y `max`. */
export const validarLargo =
  (min: number, max: number, mensaje: string): Validador<string> =>
  ({ value }) => {
    const largo = value.trim().length;
    return largo < min || largo > max ? mensaje : undefined;
  };

/** Largo mínimo; por defecto ignora los espacios en los extremos. */
export const validarMinimo =
  (min: number, mensaje: string, recortar = true): Validador<string> =>
  ({ value }) =>
    (recortar ? value.trim() : value).length < min ? mensaje : undefined;

/** Largo máximo del texto tal cual se ingresó. */
export const validarMaximo =
  (max: number, mensaje: string): Validador<string> =>
  ({ value }) =>
    value.length > max ? mensaje : undefined;

export const validarEmail =
  (mensaje: string): Validador<string> =>
  ({ value }) =>
    EMAIL_RE.test(value) ? undefined : mensaje;

export const validarNoNegativo =
  (mensaje: string): Validador<number> =>
  ({ value }) =>
    Number.isNaN(value) || value < 0 ? mensaje : undefined;

export const validarEnteroNoNegativo =
  (mensaje: string): Validador<number> =>
  ({ value }) =>
    Number.isInteger(value) && value >= 0 ? undefined : mensaje;

/** Devuelve el primer error de los validadores, en orden. */
export const combinarValidadores =
  <T,>(...validadores: Validador<T>[]): Validador<T> =>
  (campo) =>
    validadores.map((validar) => validar(campo)).find((mensaje) => mensaje !== undefined);
