from app.core.exceptions import DomainError
from app.modules.usuarios.schemas import UserPublic
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork


class UsuarioNoEncontrado(DomainError):
    detail = "No encontramos el usuario."


class AutoDesactivacion(DomainError):
    detail = "No podés desactivar tu propia cuenta."


class UsuarioService:
    def __init__(self, uow: UsuarioUnitOfWork) -> None:
        self.uow = uow

    def listar(self) -> list[UserPublic]:
        with self.uow as uow:
            return [UserPublic.model_validate(u) for u in uow.usuarios.list_ordenados()]

    def activar(self, usuario_id: int) -> UserPublic:
        return self._cambiar_disabled(usuario_id, disabled=False)

    def desactivar(self, usuario_id: int, actual_id: int) -> UserPublic:
        if usuario_id == actual_id:
            raise AutoDesactivacion()
        return self._cambiar_disabled(usuario_id, disabled=True)

    def _cambiar_disabled(self, usuario_id: int, disabled: bool) -> UserPublic:
        # Idempotente: responde 200 aunque el estado no cambie.
        with self.uow as uow:
            usuario = uow.usuarios.get_by_id(usuario_id)
            if usuario is None:
                raise UsuarioNoEncontrado()
            usuario.disabled = disabled
            uow.usuarios.add(usuario)
            return UserPublic.model_validate(usuario)


def get_usuario_service() -> UsuarioService:
    return UsuarioService(UsuarioUnitOfWork())
