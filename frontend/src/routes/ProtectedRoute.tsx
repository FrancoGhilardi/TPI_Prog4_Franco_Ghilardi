import type { FC } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import type { Rol } from '@/features/auth/types';
import { RUTAS } from '@/shared/constants';
import { useAuthStore } from '@/store';

export interface ProtectedRouteProps {
  roles?: Rol[];
}

export const ProtectedRoute: FC<ProtectedRouteProps> = ({ roles }) => {
  const usuario = useAuthStore((s) => s.usuario);
  const cargando = useAuthStore((s) => s.cargando);
  const location = useLocation();

  if (cargando) {
    return <p className="py-20 text-center text-slate-500">Verificando tu sesión…</p>;
  }
  if (!usuario) {
    return <Navigate to={RUTAS.login} replace state={{ from: location.pathname }} />;
  }
  if (roles && !roles.includes(usuario.role)) {
    return <Navigate to={RUTAS.unauthorized} replace />;
  }
  return <Outlet />;
};
