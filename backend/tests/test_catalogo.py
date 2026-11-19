from fastapi.testclient import TestClient

from tests.conftest import API, producto_id


def test_categorias_crud_y_baja_logica(admin: TestClient, cliente: TestClient, anon: TestClient) -> None:
    assert len(anon.get(f"{API}/categorias").json()) == 5
    assert cliente.post(f"{API}/categorias", json={"nombre": "Sushi"}).status_code == 403
    r = admin.post(f"{API}/categorias", json={"nombre": "Sushi", "descripcion": "Rolls"})
    assert r.status_code == 201
    cid = r.json()["id"]
    assert admin.post(f"{API}/categorias", json={"nombre": "sushi"}).status_code == 409
    assert admin.put(f"{API}/categorias/{cid}", json={"nombre": "Pizzas"}).status_code == 409
    upd = admin.put(f"{API}/categorias/{cid}", json={"descripcion": "Nueva"}).json()
    assert upd["nombre"] == "Sushi" and upd["descripcion"] == "Nueva"  # PUT parcial
    assert admin.delete(f"{API}/categorias/{cid}").status_code == 204
    assert anon.get(f"{API}/categorias/{cid}").status_code == 404
    assert admin.put(f"{API}/categorias/{cid}", json={"descripcion": "x"}).status_code == 404
    assert admin.post(f"{API}/categorias", json={"nombre": "Sushi"}).status_code == 409  # no libera
    assert admin.post(f"{API}/categorias", json={"nombre": "X"}).status_code == 422


def test_productos_listado_paginado_y_filtros(anon: TestClient) -> None:
    r = anon.get(f"{API}/productos", params={"skip": 0, "limit": 3}).json()
    assert r["total"] == 10 and len(r["items"]) == 3
    assert "categoria" in r["items"][0]
    assert anon.get(f"{API}/productos", params={"search": "PIZZA"}).json()["total"] == 2
    cats = anon.get(f"{API}/categorias").json()
    bebidas = next(c["id"] for c in cats if c["nombre"] == "Bebidas")
    assert anon.get(f"{API}/productos", params={"categoria_id": bebidas}).json()["total"] == 2
    assert anon.get(f"{API}/productos", params={"limit": 101}).status_code == 422


def test_productos_escrituras(admin: TestClient, anon: TestClient) -> None:
    cats = anon.get(f"{API}/categorias").json()
    cat = cats[0]["id"]
    nuevo = {"nombre": "Lomito", "precio_base": 9000, "stock": 5, "categoria_id": cat}
    assert admin.post(f"{API}/productos", json={**nuevo, "precio_base": -1}).status_code == 422
    assert admin.post(f"{API}/productos", json={**nuevo, "categoria_id": 9999}).status_code == 404
    pid = admin.post(f"{API}/productos", json=nuevo).json()["id"]
    r = admin.patch(f"{API}/productos/{pid}/stock", json={"stock": 7, "disponible": False}).json()
    assert r["stock"] == 7 and r["disponible"] is False
    r = admin.put(f"{API}/productos/{pid}", json={"precio_base": 9500}).json()
    assert r["precio_base"] == 9500 and r["nombre"] == "Lomito"
    assert admin.delete(f"{API}/productos/{pid}").status_code == 204
    assert anon.get(f"{API}/productos/{pid}").status_code == 404
    assert admin.patch(f"{API}/productos/{pid}/stock", json={"stock": 1}).status_code == 404


def test_categoria_inactiva_impide_crear_producto(admin: TestClient, anon: TestClient) -> None:
    cid = admin.post(f"{API}/categorias", json={"nombre": "Temporal"}).json()["id"]
    admin.delete(f"{API}/categorias/{cid}")
    body = {"nombre": "Algo", "precio_base": 1, "categoria_id": cid}
    assert admin.post(f"{API}/productos", json=body).status_code == 404
    pid = producto_id(anon, "Muzzarella")
    assert admin.put(f"{API}/productos/{pid}", json={"categoria_id": cid}).status_code == 404
