from sqlmodel import Session, col, func, select

from app.core.base_repository import BaseRepository
from app.modules.categorias.models import Categoria


class CategoriaRepository(BaseRepository[Categoria]):
    def __init__(self, session: Session) -> None:
        super().__init__(session, Categoria)

    def get_by_nombre(self, nombre: str) -> Categoria | None:
        """Busca sin distinguir mayúsculas, incluidas las dadas de baja (el nombre no se libera)."""
        stmt = select(Categoria).where(func.lower(Categoria.nombre) == nombre.strip().lower())
        return self.session.exec(stmt).first()

    def get_activa(self, categoria_id: int) -> Categoria | None:
        categoria = self.get_by_id(categoria_id)
        return categoria if categoria is not None and categoria.activo else None

    def list_activas(self) -> list[Categoria]:
        stmt = select(Categoria).where(col(Categoria.activo).is_(True)).order_by(Categoria.nombre, Categoria.id)
        return list(self.session.exec(stmt).all())
