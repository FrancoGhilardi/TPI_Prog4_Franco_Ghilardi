from app.core.clock import utcnow
from app.core.exceptions import DomainError
from app.modules.pedidos.models import DetallePedido, Pedido
from app.modules.pedidos.schemas import PedidoCreate, PedidoRead, PedidosPaginados, ResumenPedidos
from app.modules.pedidos.unit_of_work import PedidoUnitOfWork
from app.modules.productos.service import ProductoNoEncontrado

PENDIENTE = "PENDIENTE"
EN_PREPARACION = "EN_PREPARACION"
ENTREGADO = "ENTREGADO"
CANCELADO = "CANCELADO"

ETIQUETA_ESTADO: dict[str, str] = {
    PENDIENTE: "Pendiente",
    EN_PREPARACION: "En preparación",
    ENTREGADO: "Entregado",
    CANCELADO: "Cancelado",
}

# RN-02: mapa de transiciones válidas. Los estados terminales no admiten cambios.
TRANSICIONES: dict[str, set[str]] = {
    PENDIENTE: {EN_PREPARACION, CANCELADO},
    EN_PREPARACION: {ENTREGADO, CANCELADO},
    ENTREGADO: set(),
    CANCELADO: set(),
}


class PedidoNoEncontrado(DomainError):
    detail = "No encontramos el pedido."


class PedidoAjeno(DomainError):
    detail = "No podés ver ni modificar pedidos de otra persona."


class ProductoRepetido(DomainError):
    detail = "Hay productos repetidos en el pedido. Indicá cada producto una sola vez con la cantidad total."


class ProductoNoDisponible(DomainError):
    detail = "Producto no disponible"


class StockInsuficiente(DomainError):
    detail = "Stock insuficiente"


class TransicionInvalida(DomainError):
    detail = "Transición de estado inválida"


class PedidoNoCancelable(DomainError):
    detail = "Solo podés cancelar pedidos pendientes."


class PedidoService:
    def __init__(self, uow: PedidoUnitOfWork) -> None:
        self.uow = uow

    # RN-01 ----------------------------------------------------------------
    def crear(self, usuario_id: int, data: PedidoCreate) -> PedidoRead:
        with self.uow as uow:
            ids = [item.producto_id for item in data.items]
            if len(ids) != len(set(ids)):
                raise ProductoRepetido()

            pedido = Pedido(
                usuario_id=usuario_id,
                estado=PENDIENTE,
                forma_pago=data.forma_pago,
                direccion_entrega=data.direccion_entrega.strip(),
                notas=data.notas,
                total=0,
            )
            uow.pedidos.add(pedido)

            total = 0.0
            for item in sorted(data.items, key=lambda i: i.producto_id):  # orden fijo: evita deadlocks
                producto = uow.productos.get_for_update(item.producto_id)
                if producto is None or not producto.activo:
                    raise ProductoNoEncontrado(
                        "Uno de los productos del pedido ya no está a la venta. Quitalo del carrito para continuar."
                    )
                if not producto.disponible:
                    raise ProductoNoDisponible(f"«{producto.nombre}» no está disponible en este momento. Quitalo del carrito para continuar.")
                if producto.stock < item.cantidad:
                    if producto.stock == 0:
                        raise StockInsuficiente(
                            f"«{producto.nombre}» se quedó sin stock. Quitalo del carrito para continuar."
                        )
                    raise StockInsuficiente(
                        f"Solo quedan {producto.stock} unidades de «{producto.nombre}». "
                        "Ajustá la cantidad en el carrito."
                    )
                producto.stock -= item.cantidad
                uow.productos.add(producto)
                subtotal = round(producto.precio_base * item.cantidad, 2)
                uow.detalles.add(
                    DetallePedido(
                        pedido_id=pedido.id,
                        producto_id=producto.id,
                        cantidad=item.cantidad,
                        nombre_producto=producto.nombre,
                        precio_unitario=producto.precio_base,
                        subtotal=subtotal,
                    )
                )
                total += subtotal

            pedido.total = round(total, 2)
            uow.pedidos.add(pedido)  # refresh: recarga pedido.items
            return PedidoRead.model_validate(pedido)

    # Lecturas (RN-04) -------------------------------------------------------
    def listar(
        self, *, usuario_id: int, es_admin: bool, estado: str | None, skip: int, limit: int
    ) -> PedidosPaginados:
        with self.uow as uow:
            total, pedidos = uow.pedidos.list_by_usuario(
                usuario_id=None if es_admin else usuario_id, estado=estado, skip=skip, limit=limit
            )
            return PedidosPaginados(total=total, items=[PedidoRead.model_validate(p) for p in pedidos])

    def obtener(self, pedido_id: int, *, usuario_id: int, es_admin: bool) -> PedidoRead:
        with self.uow as uow:
            pedido = uow.pedidos.get_by_id(pedido_id)
            if pedido is None:
                raise PedidoNoEncontrado()
            if not es_admin and pedido.usuario_id != usuario_id:
                raise PedidoAjeno()
            return PedidoRead.model_validate(pedido)

    # RN-02 / RN-03 (admin) --------------------------------------------------
    def cambiar_estado(self, pedido_id: int, nuevo_estado: str) -> PedidoRead:
        with self.uow as uow:
            pedido = uow.pedidos.get_for_update(pedido_id)
            if pedido is None:
                raise PedidoNoEncontrado()
            if nuevo_estado not in TRANSICIONES[pedido.estado]:
                raise TransicionInvalida(f"No se puede pasar un pedido de «{ETIQUETA_ESTADO[pedido.estado]}» a «{ETIQUETA_ESTADO[nuevo_estado]}».")
            if nuevo_estado == CANCELADO:
                self._restituir_stock(uow, pedido)
            pedido.estado = nuevo_estado
            pedido.updated_at = utcnow()
            uow.pedidos.add(pedido)
            return PedidoRead.model_validate(pedido)

    # RN-03 / RN-04 (dueño) --------------------------------------------------
    def cancelar(self, pedido_id: int, *, usuario_id: int) -> PedidoRead:
        with self.uow as uow:
            pedido = uow.pedidos.get_for_update(pedido_id)
            if pedido is None:
                raise PedidoNoEncontrado()
            if pedido.usuario_id != usuario_id:
                raise PedidoAjeno()
            if pedido.estado != PENDIENTE:
                raise PedidoNoCancelable(
                    f"Solo podés cancelar pedidos pendientes. Este pedido está «{ETIQUETA_ESTADO[pedido.estado]}»."
                )
            self._restituir_stock(uow, pedido)
            pedido.estado = CANCELADO
            pedido.updated_at = utcnow()
            uow.pedidos.add(pedido)
            return PedidoRead.model_validate(pedido)

    # RN-07 ------------------------------------------------------------------
    def resumen(self) -> ResumenPedidos:
        with self.uow as uow:
            conteos = uow.pedidos.count_by_estado()
            inicio_hoy = utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
            return ResumenPedidos(
                pendientes=conteos.get(PENDIENTE, 0),
                en_preparacion=conteos.get(EN_PREPARACION, 0),
                entregados=conteos.get(ENTREGADO, 0),
                cancelados=conteos.get(CANCELADO, 0),
                pedidos_hoy=uow.pedidos.count_creados_desde(inicio_hoy),
                ingresos_entregados=uow.pedidos.sum_total_por_estado(ENTREGADO),
            )

    @staticmethod
    def _restituir_stock(uow: PedidoUnitOfWork, pedido: Pedido) -> None:
        """Misma transacción que el cambio de estado: si algo falla, rollback de todo."""
        for detalle in sorted(pedido.items, key=lambda d: d.producto_id):  # orden fijo: evita deadlocks
            producto = uow.productos.get_for_update(detalle.producto_id)
            if producto is not None:
                producto.stock += detalle.cantidad
                uow.productos.add(producto)


def get_pedido_service() -> PedidoService:
    return PedidoService(PedidoUnitOfWork())
