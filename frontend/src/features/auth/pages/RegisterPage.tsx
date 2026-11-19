import type { FC } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useRegister } from '@/features/auth/hooks';
import { useAppForm } from '@/shared/components';
import { LIMITES, RUTAS } from '@/shared/constants';
import { useErrorMensaje } from '@/shared/hooks';
import { Card, MensajeError } from '@/shared/ui';
import { alEnviarFormulario, combinarValidadores, validarEmail, validarMaximo, validarMinimo } from '@/shared/utils';
import { useAuthStore } from '@/store';

const MENSAJE_USERNAME = 'El nombre de usuario debe tener entre 3 y 50 caracteres.';

// El mínimo ignora espacios en los extremos y el máximo cuenta el texto tal cual se ingresó.
const validarUsername = combinarValidadores(
  validarMinimo(LIMITES.username.min, MENSAJE_USERNAME),
  validarMaximo(LIMITES.username.max, MENSAJE_USERNAME),
);

export const RegisterPage: FC = () => {
  const registro = useRegister();
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();
  const { error, ejecutar } = useErrorMensaje();

  const form = useAppForm({
    defaultValues: { username: '', full_name: '', email: '', password: '' },
    onSubmit: ({ value }) =>
      ejecutar(async () => {
        await registro.mutateAsync(value);
        await login({ username: value.username, password: value.password });
        navigate(RUTAS.catalogo, { replace: true });
      }),
  });

  return (
    <Card className="mx-auto mt-10 max-w-md">
      <h1 className="mb-4 text-2xl font-bold">Crear cuenta</h1>
      <form.AppForm>
        <form className="flex flex-col gap-4" onSubmit={alEnviarFormulario(form)}>
          <form.AppField name="username" validators={{ onChange: validarUsername }}>
            {(field) => (
              <field.CampoTexto
                label="Nombre de usuario"
                ayuda="Entre 3 y 50 caracteres. Lo vas a usar para iniciar sesión."
                autoComplete="username"
              />
            )}
          </form.AppField>
          <form.AppField
            name="full_name"
            validators={{ onChange: validarMinimo(LIMITES.fullName.min, 'Ingresá tu nombre completo.') }}
          >
            {(field) => <field.CampoTexto label="Nombre completo" autoComplete="name" />}
          </form.AppField>
          <form.AppField
            name="email"
            validators={{ onChange: validarEmail('Ingresá un email válido, por ejemplo nombre@correo.com.') }}
          >
            {(field) => <field.CampoTexto label="Email" type="email" autoComplete="email" />}
          </form.AppField>
          <form.AppField
            name="password"
            validators={{
              onChange: validarMinimo(LIMITES.password.min, 'La contraseña debe tener al menos 8 caracteres.', false),
            }}
          >
            {(field) => (
              <field.CampoTexto
                label="Contraseña"
                ayuda="Al menos 8 caracteres."
                type="password"
                autoComplete="new-password"
              />
            )}
          </form.AppField>
          <MensajeError mensaje={error} />
          <form.BotonEnviar textoCargando="Creando cuenta…">Crear cuenta</form.BotonEnviar>
        </form>
      </form.AppForm>
      <p className="mt-4 text-sm text-slate-600">
        ¿Ya tenés cuenta?{' '}
        <Link to={RUTAS.login} className="font-medium text-orange-600 hover:underline">
          Iniciá sesión
        </Link>
      </p>
    </Card>
  );
};
