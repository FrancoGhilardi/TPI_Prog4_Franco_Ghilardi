from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status

from app.core.deps import require_role
from app.modules.usuarios.models import Usuario
from app.modules.usuarios.schemas import UserPublic
from app.modules.usuarios.service import (
    AutoDesactivacion,
    UsuarioNoEncontrado,
    UsuarioService,
    get_usuario_service,
)

router = APIRouter(prefix="/admin/usuarios", tags=["usuarios (admin)"])

AdminDep = Annotated[Usuario, Depends(require_role(["admin"]))]
ServiceDep = Annotated[UsuarioService, Depends(get_usuario_service)]


@router.get("", response_model=list[UserPublic])
def listar_usuarios(_: AdminDep, service: ServiceDep) -> list[UserPublic]:
    return service.listar()


@router.post("/{usuario_id}/activar", response_model=UserPublic)
def activar_usuario(usuario_id: int, _: AdminDep, service: ServiceDep) -> UserPublic:
    try:
        return service.activar(usuario_id)
    except UsuarioNoEncontrado as e:
        raise HTTPException(status.HTTP_404_NOT_FOUND, e.detail) from None


@router.post("/{usuario_id}/desactivar", response_model=UserPublic)
def desactivar_usuario(usuario_id: int, admin: AdminDep, service: ServiceDep) -> UserPublic:
    try:
        return service.desactivar(usuario_id, actual_id=admin.id or 0)
    except UsuarioNoEncontrado as e:
        raise HTTPException(status.HTTP_404_NOT_FOUND, e.detail) from None
    except AutoDesactivacion as e:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, e.detail) from None
