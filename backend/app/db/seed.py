"""Carga inicial idempotente: python -m app.db.seed"""

from urllib.parse import quote

from sqlmodel import select

from app.core.database import create_all_tables
from app.core.security import hash_password
from app.core.unit_of_work import UnitOfWork
from app.db import models as _models  # noqa: F401
from app.modules.categorias.models import Categoria
from app.modules.productos.models import Producto
from app.modules.usuarios.models import Usuario

USUARIOS = [
    # username, full_name, email, password, role
    ("admin", "Admin Food Store", "admin@foodstore.com", "Admin1234!", "admin"),
    ("cliente", "Cliente Demo", "cliente@foodstore.com", "Cliente1234!", "user"),
]

CATEGORIAS = [
    ("Pizzas", "Pizzas al horno de barro"),
    ("Hamburguesas", "Hamburguesas de carne, pollo y veggie"),
    ("Empanadas", "Empanadas al horno y fritas"),
    ("Bebidas", "Gaseosas, aguas y cervezas"),
    ("Postres", "Postres caseros"),
]

PRODUCTOS = [
    # categoria, nombre, descripcion, precio_base, stock
    ("Pizzas", "Pizza Muzzarella", "Salsa de tomate, muzzarella y aceitunas", 8500.0, 20),
    ("Pizzas", "Pizza Napolitana", "Muzzarella, tomate en rodajas y ajo", 9500.0, 15),
    ("Hamburguesas", "Hamburguesa Clásica", "Carne 180 g, lechuga, tomate y cheddar", 7800.0, 25),
    ("Hamburguesas", "Hamburguesa Veggie", "Medallón de lentejas y vegetales grillados", 7200.0, 10),
    ("Empanadas", "Empanada de Carne", "Carne cortada a cuchillo", 1200.0, 60),
    ("Empanadas", "Empanada de Jamón y Queso", "Clásica de jamón y muzzarella", 1100.0, 60),
    ("Bebidas", "Gaseosa 500 ml", "Línea cola", 1800.0, 50),
    ("Bebidas", "Agua Mineral 500 ml", "Sin gas", 1200.0, 50),
    ("Postres", "Flan Casero", "Con dulce de leche", 3200.0, 12),
    ("Postres", "Brownie", "Con nueces", 2900.0, 0),  # sin stock: para probar el catálogo
]


def seed() -> None:
    create_all_tables()
    with UnitOfWork() as uow:
        session = uow.session

        for username, full_name, email, password, role in USUARIOS:
            existe = session.exec(select(Usuario).where(Usuario.username == username)).first()
            if existe is None:
                session.add(
                    Usuario(
                        username=username,
                        full_name=full_name,
                        email=email,
                        hashed_password=hash_password(password),
                        role=role,
                    )
                )

        categorias: dict[str, Categoria] = {}
        for nombre, descripcion in CATEGORIAS:
            categoria = session.exec(select(Categoria).where(Categoria.nombre == nombre)).first()
            if categoria is None:
                categoria = Categoria(nombre=nombre, descripcion=descripcion)
                session.add(categoria)
                session.flush()
            categorias[nombre] = categoria

        for cat, nombre, descripcion, precio, stock in PRODUCTOS:
            existe = session.exec(select(Producto).where(Producto.nombre == nombre)).first()
            if existe is None:
                session.add(
                    Producto(
                        categoria_id=categorias[cat].id or 0,
                        nombre=nombre,
                        descripcion=descripcion,
                        precio_base=precio,
                        imagen_url=f"https://placehold.co/400x300?text={quote(nombre)}",
                        stock=stock,
                    )
                )
    print("Seed completado: admin/Admin1234!, cliente/Cliente1234!, 5 categorías, 10 productos.")


if __name__ == "__main__":
    seed()
