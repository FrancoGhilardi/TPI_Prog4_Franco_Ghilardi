import type { FC } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { LoginPage, RegisterPage, UnauthorizedPage } from '@/features/auth';
import { AdminCategoriasPage } from '@/features/categorias';
import { AdminPedidosPage, AdminResumenPage, CarritoPage, CheckoutPage, MisPedidosPage } from '@/features/pedidos';
import { AdminProductosPage, CatalogoPage } from '@/features/productos';
import { AdminUsuariosPage } from '@/features/usuarios';
import { RUTAS } from '@/shared/constants';
import { MainLayout } from '@/shared/layout';
import { ProtectedRoute } from './ProtectedRoute';

export const AppRouter: FC = () => (
  <BrowserRouter>
    <Routes>
      <Route element={<MainLayout />}>
        <Route path={RUTAS.catalogo} element={<CatalogoPage />} />
        <Route path={RUTAS.login} element={<LoginPage />} />
        <Route path={RUTAS.register} element={<RegisterPage />} />
        <Route path={RUTAS.carrito} element={<CarritoPage />} />
        <Route path={RUTAS.unauthorized} element={<UnauthorizedPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path={RUTAS.checkout} element={<CheckoutPage />} />
          <Route path={RUTAS.misPedidos} element={<MisPedidosPage />} />
        </Route>

        <Route element={<ProtectedRoute roles={['admin']} />}>
          <Route path={RUTAS.admin} element={<Navigate to={RUTAS.adminResumen} replace />} />
          <Route path={RUTAS.adminResumen} element={<AdminResumenPage />} />
          <Route path={RUTAS.adminCategorias} element={<AdminCategoriasPage />} />
          <Route path={RUTAS.adminProductos} element={<AdminProductosPage />} />
          <Route path={RUTAS.adminPedidos} element={<AdminPedidosPage />} />
          <Route path={RUTAS.adminUsuarios} element={<AdminUsuariosPage />} />
        </Route>

        <Route path="*" element={<Navigate to={RUTAS.catalogo} replace />} />
      </Route>
    </Routes>
  </BrowserRouter>
);
