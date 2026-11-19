from sqlalchemy.exc import IntegrityError

from app.core.exceptions import DomainError
from app.core.security import create_access_token, hash_password, verify_password
from app.modules.usuarios.models import Usuario
from app.modules.usuarios.schemas import UserCreate, UserPublic
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork


class UsuarioDuplicado(DomainError):
    detail = "Ese nombre de usuario o email ya está registrado. Iniciá sesión o usá otros datos."


class CredencialesInvalidas(DomainError):
    detail = "Usuario o contraseña incorrectos. Revisalos e intentá de nuevo."


class CuentaDesactivada(DomainError):
    detail = "Cuenta de usuario desactivada"


class AuthService:
    def __init__(self, uow: UsuarioUnitOfWork) -> None:
        self.uow = uow

    def registrar(self, data: UserCreate) -> UserPublic:
        with self.uow as uow:
            if uow.usuarios.get_by_username(data.username) or uow.usuarios.get_by_email(data.email):
                raise UsuarioDuplicado()
            usuario = Usuario(
                username=data.username,
                full_name=data.full_name,
                email=data.email,
                hashed_password=hash_password(data.password),
                role="user",  # el registro público siempre crea "user"
            )
            try:
                uow.usuarios.add(usuario)
            except IntegrityError:  # carrera: otro request registró el mismo username/email
                raise UsuarioDuplicado() from None
            return UserPublic.model_validate(usuario)

    def autenticar(self, username: str, password: str) -> str:
        """Devuelve el JWT. Primero valida credenciales (401), luego si está desactivada (400)."""
        with self.uow as uow:
            usuario = uow.usuarios.get_by_username(username)
            if usuario is None or not verify_password(password, usuario.hashed_password):
                raise CredencialesInvalidas()
            if usuario.disabled:
                raise CuentaDesactivada()
            return create_access_token(str(usuario.id))


def get_auth_service() -> AuthService:
    return AuthService(UsuarioUnitOfWork())
