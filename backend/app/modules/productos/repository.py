from sqlmodel import Session, col, func, select

from app.core.base_repository import BaseRepository
from app.modules.productos.models import Producto


class ProductoRepository(BaseRepository[Producto]):
    def __init__(self, session: Session) -> None:
        super().__init__(session, Producto)

    def get_activo(self, producto_id: int) -> Producto | None:
        producto = self.get_by_id(producto_id)
        return producto if producto is not None and producto.activo else None

    def get_for_update(self, producto_id: int) -> Producto | None:
        """Bloquea la fila en PostgreSQL (SELECT ... FOR UPDATE); en SQLite se ignora."""
        stmt = select(Producto).where(Producto.id == producto_id).with_for_update()
        return self.session.exec(stmt).first()

    def search(
        self,
        *,
        search: str | None,
        categoria_id: int | None,
        disponible: bool | None,
        skip: int,
        limit: int,
    ) -> tuple[int, list[Producto]]:
        filtros = [col(Producto.activo).is_(True)]
        if search:
            filtros.append(col(Producto.nombre).ilike(f"%{search.strip()}%"))
        if categoria_id is not None:
            filtros.append(col(Producto.categoria_id) == categoria_id)
        if disponible is not None:
            filtros.append(col(Producto.disponible).is_(disponible))
        total = self.session.exec(select(func.count()).select_from(Producto).where(*filtros)).one()
        stmt = select(Producto).where(*filtros).order_by(Producto.nombre, Producto.id).offset(skip).limit(limit)
        return total, list(self.session.exec(stmt).all())
