import os

os.environ["DATABASE_URL"] = "sqlite:///./test_foodstore.db"
os.environ["SECRET_KEY"] = "clave-de-pruebas-de-al-menos-32-caracteres-ok"

from collections.abc import Iterator  # noqa: E402

import pytest  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402
from sqlmodel import SQLModel  # noqa: E402

from app.core.database import engine  # noqa: E402
from app.db.seed import seed  # noqa: E402
from app.main import app  # noqa: E402

API = "/api/v1"


@pytest.fixture(autouse=True)
def base_limpia() -> Iterator[None]:
    SQLModel.metadata.drop_all(engine)
    seed()
    yield


def login(username: str, password: str) -> TestClient:
    client = TestClient(app)
    r = client.post(f"{API}/auth/token", data={"username": username, "password": password})
    assert r.status_code == 200, r.text
    return client


@pytest.fixture
def anon() -> TestClient:
    return TestClient(app)


@pytest.fixture
def admin() -> TestClient:
    return login("admin", "Admin1234!")


@pytest.fixture
def cliente() -> TestClient:
    return login("cliente", "Cliente1234!")


@pytest.fixture
def otro_cliente(anon: TestClient) -> TestClient:
    r = anon.post(
        f"{API}/auth/register",
        json={"username": "otro", "full_name": "Otro", "email": "otro@x.com", "password": "Password123"},
    )
    assert r.status_code == 201
    return login("otro", "Password123")


def producto_id(client: TestClient, nombre: str) -> int:
    r = client.get(f"{API}/productos", params={"search": nombre})
    return int(r.json()["items"][0]["id"])
