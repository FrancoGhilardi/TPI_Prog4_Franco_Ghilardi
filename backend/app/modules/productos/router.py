from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status

from app.core.deps import require_role
from app.modules.categorias.service import CategoriaNoEncontrada
from app.modules.productos.schemas import (
    ProductoCreate,
    ProductoRead,
    ProductosPaginados,
    ProductoStockUpdate,
    ProductoUpdate,
)
from app.modules.productos.service import ProductoNoEncontrado, ProductoService, get_producto_service
from app.modules.usuarios.models import Usuario

router = APIRouter(prefix="/productos", tags=["productos"])

AdminDep = Annotated[Usuario, Depends(require_role(["admin"]))]
ServiceDep = Annotated[ProductoService, Depends(get_producto_service)]


@router.get("", response_model=ProductosPaginados)
def listar_productos(
    service: ServiceDep,
    skip: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=100)] = 20,
    search: Annotated[str | None, Query(max_length=100)] = None,
    categoria_id: int | None = None,
    disponible: bool | None = None,
) -> ProductosPaginados:
    return service.listar(
        skip=skip, limit=limit, search=search, categoria_id=categoria_id, disponible=disponible
    )


@router.get("/{producto_id}", response_model=ProductoRead)
def obtener_producto(producto_id: int, service: ServiceDep) -> ProductoRead:
    try:
        return service.obtener(producto_id)
    except ProductoNoEncontrado as e:
        raise HTTPException(status.HTTP_404_NOT_FOUND, e.detail) from None


@router.post("", response_model=ProductoRead, status_code=status.HTTP_201_CREATED)
def crear_producto(data: ProductoCreate, _: AdminDep, service: ServiceDep) -> ProductoRead:
    try:
        return service.crear(data)
    except CategoriaNoEncontrada as e:
        raise HTTPException(status.HTTP_404_NOT_FOUND, e.detail) from None


@router.put("/{producto_id}", response_model=ProductoRead)
def actualizar_producto(
    producto_id: int, data: ProductoUpdate, _: AdminDep, service: ServiceDep
) -> ProductoRead:
    try:
        return service.actualizar(producto_id, data)
    except (ProductoNoEncontrado, CategoriaNoEncontrada) as e:
        raise HTTPException(status.HTTP_404_NOT_FOUND, e.detail) from None


@router.patch("/{producto_id}/stock", response_model=ProductoRead)
def actualizar_stock(
    producto_id: int, data: ProductoStockUpdate, _: AdminDep, service: ServiceDep
) -> ProductoRead:
    try:
        return service.actualizar_stock(producto_id, data)
    except ProductoNoEncontrado as e:
        raise HTTPException(status.HTTP_404_NOT_FOUND, e.detail) from None


@router.delete("/{producto_id}", status_code=status.HTTP_204_NO_CONTENT, response_class=Response)
def eliminar_producto(producto_id: int, _: AdminDep, service: ServiceDep) -> Response:
    try:
        service.eliminar(producto_id)
    except ProductoNoEncontrado as e:
        raise HTTPException(status.HTTP_404_NOT_FOUND, e.detail) from None
    return Response(status_code=status.HTTP_204_NO_CONTENT)
