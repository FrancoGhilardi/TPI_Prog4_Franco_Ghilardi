import type { FC } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { ETIQUETA_ROL, RUTAS } from '@/shared/constants';
import { Button } from '@/shared/ui';
import { useAuthStore, useCartStore } from '@/store';

const enlace = ({ isActive }: { isActive: boolean }): string =>
  `rounded-lg px-3 py-2 text-sm font-medium ${isActive ? 'bg-orange-100 text-orange-700' : 'text-slate-700 hover:bg-slate-100'}`;

export const Navbar: FC = () => {
  const usuario = useAuthStore((s) => s.usuario);
  const logout = useAuthStore((s) => s.logout);
  const cantidad = useCartStore((s) => s.items.reduce((acc, i) => acc + i.cantidad, 0));
  const navigate = useNavigate();

  const cerrarSesion = async (): Promise<void> => {
    await logout();
    navigate(RUTAS.login);
  };

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <Link to={RUTAS.catalogo} className="text-xl font-bold text-orange-600">
          🍔 Food Store
        </Link>
        <nav className="flex flex-wrap items-center gap-1">
          <NavLink to={RUTAS.catalogo} end className={enlace}>
            Catálogo
          </NavLink>
          <NavLink to={RUTAS.carrito} className={enlace}>
            Carrito ({cantidad})
          </NavLink>
          {usuario && (
            <NavLink to={RUTAS.misPedidos} className={enlace}>
              Mis pedidos
            </NavLink>
          )}
          {usuario?.role === 'admin' && (
            <NavLink to={RUTAS.adminResumen} className={enlace}>
              Administración
            </NavLink>
          )}
        </nav>
        <div className="flex items-center gap-2">
          {usuario ? (
            <>
              <span className="text-sm text-slate-600">
                {usuario.full_name} · {ETIQUETA_ROL[usuario.role]}
              </span>
              <Button variante="secundario" onClick={() => void cerrarSesion()}>
                Cerrar sesión
              </Button>
            </>
          ) : (
            <>
              <Link to={RUTAS.login} className="text-sm font-medium text-slate-700 hover:underline">
                Iniciar sesión
              </Link>
              <Link to={RUTAS.register} className="rounded-lg bg-orange-600 px-3 py-2 text-sm font-medium text-white">
                Crear cuenta
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
