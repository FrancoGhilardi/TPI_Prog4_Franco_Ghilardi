from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Response, status

from app.core.deps import require_role
from app.modules.categorias.schemas import CategoriaCreate, CategoriaRead, CategoriaUpdate
from app.modules.categorias.service import (
    CategoriaNoEncontrada,
    CategoriaService,
    NombreDuplicado,
    get_categoria_service,
)
from app.modules.usuarios.models import Usuario

router = APIRouter(prefix="/categorias", tags=["categorias"])

AdminDep = Annotated[Usuario, Depends(require_role(["admin"]))]
ServiceDep = Annotated[CategoriaService, Depends(get_categoria_service)]


@router.get("", response_model=list[CategoriaRead])
def listar_categorias(service: ServiceDep) -> list[CategoriaRead]:
    return service.listar()


@router.get("/{categoria_id}", response_model=CategoriaRead)
def obtener_categoria(categoria_id: int, service: ServiceDep) -> CategoriaRead:
    try:
        return service.obtener(categoria_id)
    except CategoriaNoEncontrada as e:
        raise HTTPException(status.HTTP_404_NOT_FOUND, e.detail) from None


@router.post("", response_model=CategoriaRead, status_code=status.HTTP_201_CREATED)
def crear_categoria(data: CategoriaCreate, _: AdminDep, service: ServiceDep) -> CategoriaRead:
    try:
        return service.crear(data)
    except NombreDuplicado as e:
        raise HTTPException(status.HTTP_409_CONFLICT, e.detail) from None


@router.put("/{categoria_id}", response_model=CategoriaRead)
def actualizar_categoria(
    categoria_id: int, data: CategoriaUpdate, _: AdminDep, service: ServiceDep
) -> CategoriaRead:
    try:
        return service.actualizar(categoria_id, data)
    except CategoriaNoEncontrada as e:
        raise HTTPException(status.HTTP_404_NOT_FOUND, e.detail) from None
    except NombreDuplicado as e:
        raise HTTPException(status.HTTP_409_CONFLICT, e.detail) from None


@router.delete("/{categoria_id}", status_code=status.HTTP_204_NO_CONTENT, response_class=Response)
def eliminar_categoria(categoria_id: int, _: AdminDep, service: ServiceDep) -> Response:
    try:
        service.eliminar(categoria_id)
    except CategoriaNoEncontrada as e:
        raise HTTPException(status.HTTP_404_NOT_FOUND, e.detail) from None
    return Response(status_code=status.HTTP_204_NO_CONTENT)
