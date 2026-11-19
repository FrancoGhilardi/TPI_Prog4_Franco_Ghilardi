from collections.abc import Callable
from typing import Annotated

from fastapi import Cookie, Depends, HTTPException, status

from app.core.database import session_factory
from app.core.security import decode_access_token
from app.modules.usuarios.models import Usuario

CUENTA_DESACTIVADA = "Cuenta de usuario desactivada"


def _no_autenticado() -> HTTPException:
    return HTTPException(status.HTTP_401_UNAUTHORIZED, "Tu sesión venció o no iniciaste sesión. Iniciá sesión para continuar.")


def get_current_user(access_token: Annotated[str | None, Cookie()] = None) -> Usuario:
    """Lee la cookie HttpOnly, valida firma y expiración y carga el usuario."""
    if not access_token:
        raise _no_autenticado()
    sub = decode_access_token(access_token)
    if sub is None or not sub.isdigit():
        raise _no_autenticado()
    with session_factory() as session:
        usuario = session.get(Usuario, int(sub))
    if usuario is None:
        raise _no_autenticado()
    return usuario


def get_current_active_user(usuario: Annotated[Usuario, Depends(get_current_user)]) -> Usuario:
    if usuario.disabled:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, CUENTA_DESACTIVADA)
    return usuario


def require_role(roles: list[str]) -> Callable[[Usuario], Usuario]:
    def checker(usuario: Annotated[Usuario, Depends(get_current_active_user)]) -> Usuario:
        if usuario.role not in roles:
            raise HTTPException(status.HTTP_403_FORBIDDEN, "No tenés permiso para realizar esta acción.")
        return usuario

    return checker
