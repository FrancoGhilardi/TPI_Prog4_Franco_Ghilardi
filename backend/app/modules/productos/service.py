from app.core.exceptions import DomainError
from app.modules.categorias.service import CategoriaNoEncontrada
from app.modules.productos.models import Producto
from app.modules.productos.schemas import (
    ProductoCreate,
    ProductoRead,
    ProductosPaginados,
    ProductoStockUpdate,
    ProductoUpdate,
)
from app.modules.productos.unit_of_work import ProductoUnitOfWork

CAMPOS_NULLABLES = {"descripcion", "imagen_url"}


class ProductoNoEncontrado(DomainError):
    detail = "No encontramos el producto. Puede que se haya dado de baja."


class ProductoService:
    def __init__(self, uow: ProductoUnitOfWork) -> None:
        self.uow = uow

    def listar(
        self,
        *,
        skip: int,
        limit: int,
        search: str | None,
        categoria_id: int | None,
        disponible: bool | None,
    ) -> ProductosPaginados:
        with self.uow as uow:
            total, items = uow.productos.search(
                search=search, categoria_id=categoria_id, disponible=disponible, skip=skip, limit=limit
            )
            return ProductosPaginados(total=total, items=[ProductoRead.model_validate(p) for p in items])

    def obtener(self, producto_id: int) -> ProductoRead:
        with self.uow as uow:
            producto = uow.productos.get_activo(producto_id)
            if producto is None:
                raise ProductoNoEncontrado()
            return ProductoRead.model_validate(producto)

    def crear(self, data: ProductoCreate) -> ProductoRead:
        with self.uow as uow:
            if uow.categorias.get_activa(data.categoria_id) is None:
                raise CategoriaNoEncontrada()
            producto = Producto.model_validate(data)
            uow.productos.add(producto)
            return ProductoRead.model_validate(producto)

    def actualizar(self, producto_id: int, data: ProductoUpdate) -> ProductoRead:
        with self.uow as uow:
            producto = uow.productos.get_activo(producto_id)
            if producto is None:
                raise ProductoNoEncontrado()
            cambios = {
                k: v
                for k, v in data.model_dump(exclude_unset=True).items()
                if v is not None or k in CAMPOS_NULLABLES
            }
            if "categoria_id" in cambios and uow.categorias.get_activa(cambios["categoria_id"]) is None:
                raise CategoriaNoEncontrada()
            producto.sqlmodel_update(cambios)
            uow.productos.add(producto)  # flush + refresh: recarga la relación categoria
            return ProductoRead.model_validate(producto)

    def actualizar_stock(self, producto_id: int, data: ProductoStockUpdate) -> ProductoRead:
        with self.uow as uow:
            producto = uow.productos.get_activo(producto_id)
            if producto is None:
                raise ProductoNoEncontrado()
            if data.stock is not None:
                producto.stock = data.stock
            if data.disponible is not None:
                producto.disponible = data.disponible
            uow.productos.add(producto)
            return ProductoRead.model_validate(producto)

    def eliminar(self, producto_id: int) -> None:
        with self.uow as uow:
            producto = uow.productos.get_activo(producto_id)
            if producto is None:
                raise ProductoNoEncontrado()
            producto.activo = False
            uow.productos.add(producto)


def get_producto_service() -> ProductoService:
    return ProductoService(ProductoUnitOfWork())
