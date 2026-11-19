import type { FC } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAppForm } from '@/shared/components';
import { RUTAS } from '@/shared/constants';
import { useErrorMensaje } from '@/shared/hooks';
import { Card, MensajeError } from '@/shared/ui';
import { alEnviarFormulario, validarMinimo } from '@/shared/utils';
import { useAuthStore } from '@/store';

export const LoginPage: FC = () => {
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();
  const location = useLocation();
  const desde = (location.state as { from?: string } | null)?.from;
  const { error, ejecutar } = useErrorMensaje();

  const form = useAppForm({
    defaultValues: { username: '', password: '' },
    onSubmit: ({ value }) =>
      ejecutar(async () => {
        const usuario = await login(value);
        const destinoGuardado = desde?.startsWith(RUTAS.admin) && usuario.role !== 'admin' ? undefined : desde;
        navigate(destinoGuardado ?? (usuario.role === 'admin' ? RUTAS.adminResumen : RUTAS.catalogo), { replace: true });
      }),
  });

  return (
    <Card className="mx-auto mt-10 max-w-md">
      <h1 className="mb-4 text-2xl font-bold">Iniciar sesión</h1>
      <form.AppForm>
        <form className="flex flex-col gap-4" onSubmit={alEnviarFormulario(form)}>
          <form.AppField name="username" validators={{ onChange: validarMinimo(1, 'Ingresá tu nombre de usuario.') }}>
            {(field) => <field.CampoTexto label="Nombre de usuario" autoComplete="username" />}
          </form.AppField>
          <form.AppField name="password" validators={{ onChange: validarMinimo(1, 'Ingresá tu contraseña.', false) }}>
            {(field) => <field.CampoTexto label="Contraseña" type="password" autoComplete="current-password" />}
          </form.AppField>
          <MensajeError mensaje={error} />
          <form.BotonEnviar textoCargando="Iniciando sesión…">Iniciar sesión</form.BotonEnviar>
        </form>
      </form.AppForm>
      <p className="mt-4 text-sm text-slate-600">
        ¿No tenés cuenta?{' '}
        <Link to={RUTAS.register} className="font-medium text-orange-600 hover:underline">
          Creá una
        </Link>
      </p>
    </Card>
  );
};
