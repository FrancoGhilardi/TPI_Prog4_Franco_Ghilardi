from sqlmodel import Session

from app.core.unit_of_work import UnitOfWork
from app.modules.pedidos.repository import DetallePedidoRepository, PedidoRepository
from app.modules.productos.repository import ProductoRepository


class PedidoUnitOfWork(UnitOfWork):
    """Repositorios de pedidos y de productos sobre la MISMA sesión (una sola transacción)."""

    pedidos: PedidoRepository
    detalles: DetallePedidoRepository
    productos: ProductoRepository

    def __enter__(self) -> "PedidoUnitOfWork":
        super().__enter__()
        return self

    def _init_repositories(self, session: Session) -> None:
        self.pedidos = PedidoRepository(session)
        self.detalles = DetallePedidoRepository(session)
        self.productos = ProductoRepository(session)
