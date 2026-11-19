from sqlmodel import Session

from app.core.unit_of_work import UnitOfWork
from app.modules.categorias.repository import CategoriaRepository
from app.modules.productos.repository import ProductoRepository


class ProductoUnitOfWork(UnitOfWork):
    productos: ProductoRepository
    categorias: CategoriaRepository

    def __enter__(self) -> "ProductoUnitOfWork":
        super().__enter__()
        return self

    def _init_repositories(self, session: Session) -> None:
        self.productos = ProductoRepository(session)
        self.categorias = CategoriaRepository(session)
