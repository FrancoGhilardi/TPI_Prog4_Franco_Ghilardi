export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Límites de longitud que espejan las validaciones del backend. */
export const LIMITES = {
  username: { min: 3, max: 50 },
  fullName: { min: 2 },
  password: { min: 8 },
  nombreCategoria: { min: 2, max: 100 },
  descripcionCategoria: { max: 500 },
  nombreProducto: { min: 2, max: 150 },
  descripcionProducto: { max: 1000 },
  direccion: { min: 5, max: 200 },
  notas: { max: 500 },
} as const;
