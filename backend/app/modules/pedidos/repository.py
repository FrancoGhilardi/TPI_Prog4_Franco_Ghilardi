from datetime import datetime
from typing import Any

from sqlmodel import Session, col, func, select

from app.core.base_repository import BaseRepository
from app.modules.pedidos.models import DetallePedido, Pedido


class PedidoRepository(BaseRepository[Pedido]):
    def __init__(self, session: Session) -> None:
        super().__init__(session, Pedido)

    def get_for_update(self, pedido_id: int) -> Pedido | None:
        """SELECT ... FOR UPDATE: serializa cambios de estado concurrentes sobre el mismo pedido."""
        stmt = select(Pedido).where(Pedido.id == pedido_id).with_for_update()
        return self.session.exec(stmt).first()

    def list_by_usuario(
        self, *, usuario_id: int | None, estado: str | None, skip: int, limit: int
    ) -> tuple[int, list[Pedido]]:
        """usuario_id=None lista los de todos los usuarios (uso del admin)."""
        filtros: list[Any] = []
        if usuario_id is not None:
            filtros.append(col(Pedido.usuario_id) == usuario_id)
        if estado is not None:
            filtros.append(col(Pedido.estado) == estado)
        total = self.session.exec(select(func.count()).select_from(Pedido).where(*filtros)).one()
        stmt = (
            select(Pedido)
            .where(*filtros)
            .order_by(col(Pedido.created_at).desc(), col(Pedido.id).desc())
            .offset(skip)
            .limit(limit)
        )
        return total, list(self.session.exec(stmt).all())

    def count_by_estado(self) -> dict[str, int]:
        stmt = select(Pedido.estado, func.count()).group_by(Pedido.estado)
        return {estado: cantidad for estado, cantidad in self.session.exec(stmt).all()}

    def count_creados_desde(self, desde: datetime) -> int:
        stmt = select(func.count()).select_from(Pedido).where(col(Pedido.created_at) >= desde)
        return self.session.exec(stmt).one()

    def sum_total_por_estado(self, estado: str) -> float:
        stmt = select(func.coalesce(func.sum(Pedido.total), 0)).where(col(Pedido.estado) == estado)
        return float(self.session.exec(stmt).one())


class DetallePedidoRepository(BaseRepository[DetallePedido]):
    def __init__(self, session: Session) -> None:
        super().__init__(session, DetallePedido)
