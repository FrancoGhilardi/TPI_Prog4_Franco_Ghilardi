import type { FC } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { RUTAS } from '@/shared/constants';
import { Navbar } from './Navbar';

const SECCIONES_ADMIN = [
  { to: RUTAS.adminResumen, label: 'Resumen' },
  { to: RUTAS.adminPedidos, label: 'Pedidos' },
  { to: RUTAS.adminProductos, label: 'Productos' },
  { to: RUTAS.adminCategorias, label: 'Categorías' },
  { to: RUTAS.adminUsuarios, label: 'Usuarios' },
];

export const MainLayout: FC = () => {
  const { pathname } = useLocation();
  const esAdmin = pathname.startsWith(RUTAS.admin);
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />
      {esAdmin && (
        <div className="border-b border-slate-200 bg-white">
          <nav className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 py-2">
            {SECCIONES_ADMIN.map((s) => (
              <NavLink
                key={s.to}
                to={s.to}
                className={({ isActive }) =>
                  `whitespace-nowrap rounded-md px-3 py-1.5 text-sm ${isActive ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`
                }
              >
                {s.label}
              </NavLink>
            ))}
          </nav>
        </div>
      )}
      <main className="mx-auto max-w-6xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
};
