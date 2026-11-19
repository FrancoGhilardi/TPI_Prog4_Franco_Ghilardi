from sqlalchemy.exc import IntegrityError

from app.core.exceptions import DomainError
from app.modules.categorias.models import Categoria
from app.modules.categorias.schemas import CategoriaCreate, CategoriaRead, CategoriaUpdate
from app.modules.categorias.unit_of_work import CategoriaUnitOfWork


class CategoriaNoEncontrada(DomainError):
    detail = "No encontramos la categoría. Puede que se haya dado de baja."


class NombreDuplicado(DomainError):
    detail = "Ya existe una categoría con ese nombre. Elegí otro."


class CategoriaService:
    def __init__(self, uow: CategoriaUnitOfWork) -> None:
        self.uow = uow

    def listar(self) -> list[CategoriaRead]:
        with self.uow as uow:
            return [CategoriaRead.model_validate(c) for c in uow.categorias.list_activas()]

    def obtener(self, categoria_id: int) -> CategoriaRead:
        with self.uow as uow:
            categoria = uow.categorias.get_activa(categoria_id)
            if categoria is None:
                raise CategoriaNoEncontrada()
            return CategoriaRead.model_validate(categoria)

    def crear(self, data: CategoriaCreate) -> CategoriaRead:
        with self.uow as uow:
            if uow.categorias.get_by_nombre(data.nombre) is not None:
                raise NombreDuplicado()
            categoria = Categoria(nombre=data.nombre.strip(), descripcion=data.descripcion)
            try:
                uow.categorias.add(categoria)
            except IntegrityError:  # carrera: otro request creó el mismo nombre
                raise NombreDuplicado() from None
            return CategoriaRead.model_validate(categoria)

    def actualizar(self, categoria_id: int, data: CategoriaUpdate) -> CategoriaRead:
        with self.uow as uow:
            categoria = uow.categorias.get_activa(categoria_id)
            if categoria is None:
                raise CategoriaNoEncontrada()
            cambios = data.model_dump(exclude_unset=True)
            if cambios.get("nombre") is None:
                cambios.pop("nombre", None)  # nombre es NN: un null explícito se ignora
            else:
                cambios["nombre"] = cambios["nombre"].strip()
                existente = uow.categorias.get_by_nombre(cambios["nombre"])
                if existente is not None and existente.id != categoria.id:
                    raise NombreDuplicado()
            categoria.sqlmodel_update(cambios)
            try:
                uow.categorias.add(categoria)
            except IntegrityError:  # carrera: otro request tomó el nombre
                raise NombreDuplicado() from None
            return CategoriaRead.model_validate(categoria)

    def eliminar(self, categoria_id: int) -> None:
        with self.uow as uow:
            categoria = uow.categorias.get_activa(categoria_id)
            if categoria is None:
                raise CategoriaNoEncontrada()
            categoria.activo = False
            uow.categorias.add(categoria)


def get_categoria_service() -> CategoriaService:
    return CategoriaService(CategoriaUnitOfWork())
