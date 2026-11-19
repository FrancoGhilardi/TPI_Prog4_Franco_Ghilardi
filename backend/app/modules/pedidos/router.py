from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.core.deps import get_current_active_user, require_role
from app.modules.pedidos.schemas import (
    CambioEstado,
    EstadoPedido,
    PedidoCreate,
    PedidoRead,
    PedidosPaginados,
    ResumenPedidos,
)
from app.modules.pedidos.service import (
    PedidoAjeno,
    PedidoNoCancelable,
    PedidoNoEncontrado,
    PedidoService,
    ProductoNoDisponible,
    ProductoRepetido,
    StockInsuficiente,
    TransicionInvalida,
    get_pedido_service,
)
from app.modules.productos.service import ProductoNoEncontrado
from app.modules.usuarios.models import Usuario

router = APIRouter(prefix="/pedidos", tags=["pedidos"])

SesionDep = Annotated[Usuario, Depends(get_current_active_user)]
AdminDep = Annotated[Usuario, Depends(require_role(["admin"]))]
ServiceDep = Annotated[PedidoService, Depends(get_pedido_service)]


@router.post("", response_model=PedidoRead, status_code=status.HTTP_201_CREATED)
def crear_pedido(data: PedidoCreate, usuario: SesionDep, service: ServiceDep) -> PedidoRead:
    try:
        return service.crear(usuario.id or 0, data)
    except ProductoNoEncontrado as e:
        raise HTTPException(status.HTTP_404_NOT_FOUND, e.detail) from None
    except (StockInsuficiente, ProductoNoDisponible, ProductoRepetido) as e:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, e.detail) from None


@router.get("", response_model=PedidosPaginados)
def listar_pedidos(
    usuario: SesionDep,
    service: ServiceDep,
    skip: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=100)] = 20,
    estado: EstadoPedido | None = None,
) -> PedidosPaginados:
    return service.listar(
        usuario_id=usuario.id or 0, es_admin=usuario.role == "admin", estado=estado, skip=skip, limit=limit
    )


@router.get("/resumen", response_model=ResumenPedidos)
def resumen_pedidos(_: AdminDep, service: ServiceDep) -> ResumenPedidos:
    return service.resumen()


@router.get("/{pedido_id}", response_model=PedidoRead)
def obtener_pedido(pedido_id: int, usuario: SesionDep, service: ServiceDep) -> PedidoRead:
    try:
        return service.obtener(pedido_id, usuario_id=usuario.id or 0, es_admin=usuario.role == "admin")
    except PedidoNoEncontrado as e:
        raise HTTPException(status.HTTP_404_NOT_FOUND, e.detail) from None
    except PedidoAjeno as e:
        raise HTTPException(status.HTTP_403_FORBIDDEN, e.detail) from None


@router.patch("/{pedido_id}/estado", response_model=PedidoRead)
def cambiar_estado(pedido_id: int, data: CambioEstado, _: AdminDep, service: ServiceDep) -> PedidoRead:
    try:
        return service.cambiar_estado(pedido_id, data.estado)
    except PedidoNoEncontrado as e:
        raise HTTPException(status.HTTP_404_NOT_FOUND, e.detail) from None
    except TransicionInvalida as e:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, e.detail) from None


@router.patch("/{pedido_id}/cancelar", response_model=PedidoRead)
def cancelar_pedido(pedido_id: int, usuario: SesionDep, service: ServiceDep) -> PedidoRead:
    try:
        return service.cancelar(pedido_id, usuario_id=usuario.id or 0)
    except PedidoNoEncontrado as e:
        raise HTTPException(status.HTTP_404_NOT_FOUND, e.detail) from None
    except PedidoAjeno as e:
        raise HTTPException(status.HTTP_403_FORBIDDEN, e.detail) from None
    except PedidoNoCancelable as e:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, e.detail) from None
