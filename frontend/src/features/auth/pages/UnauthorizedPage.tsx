import type { FC } from 'react';
import { EstadoVacio } from '@/shared/components';
import { RUTAS } from '@/shared/constants';
import { EnlaceAccion } from '@/shared/ui';

export const UnauthorizedPage: FC = () => (
  <EstadoVacio
    titulo="No tenés acceso a esta sección"
    mensaje="Esta sección es solo para administradores. Si creés que es un error, contactá al negocio."
    accion={<EnlaceAccion to={RUTAS.catalogo}>Volver al catálogo</EnlaceAccion>}
  />
);
