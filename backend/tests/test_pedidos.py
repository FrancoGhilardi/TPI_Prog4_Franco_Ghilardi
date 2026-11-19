from fastapi.testclient import TestClient

from tests.conftest import API, producto_id


def _stock(client: TestClient, pid: int) -> int:
    return int(client.get(f"{API}/productos/{pid}").json()["stock"])


def _pedido(items: list[dict[str, int]], forma_pago: str = "EFECTIVO") -> dict[str, object]:
    return {"items": items, "forma_pago": forma_pago, "direccion_entrega": "Calle Falsa 123"}


def test_crear_pedido_descuenta_stock_y_copia_precio(cliente: TestClient, admin: TestClient) -> None:
    muzza, gaseosa = producto_id(cliente, "Muzzarella"), producto_id(cliente, "Gaseosa")
    r = cliente.post(
        f"{API}/pedidos",
        json=_pedido([{"producto_id": muzza, "cantidad": 2}, {"producto_id": gaseosa, "cantidad": 1}]),
    )
    assert r.status_code == 201
    pedido = r.json()
    assert pedido["estado"] == "PENDIENTE"
    assert pedido["total"] == 8500 * 2 + 1800
    assert pedido["items"][0]["nombre_producto"] == "Pizza Muzzarella"
    assert _stock(cliente, muzza) == 18
    admin.put(f"{API}/productos/{muzza}", json={"precio_base": 99999})
    detalle = cliente.get(f"{API}/pedidos/{pedido['id']}").json()
    assert detalle["items"][0]["precio_unitario"] == 8500  # RN-05 inmutable


def test_reglas_rn01_y_atomicidad(cliente: TestClient) -> None:
    muzza, brownie = producto_id(cliente, "Muzzarella"), producto_id(cliente, "Brownie")
    rep = _pedido([{"producto_id": muzza, "cantidad": 1}, {"producto_id": muzza, "cantidad": 1}])
    assert cliente.post(f"{API}/pedidos", json=rep).status_code == 400
    # el primer ítem es válido, el segundo sin stock -> nada se persiste
    sin_stock = _pedido([{"producto_id": muzza, "cantidad": 1}, {"producto_id": brownie, "cantidad": 1}])
    assert cliente.post(f"{API}/pedidos", json=sin_stock).status_code == 400
    assert _stock(cliente, muzza) == 20
    assert cliente.get(f"{API}/pedidos").json()["total"] == 0
    assert cliente.post(f"{API}/pedidos", json=_pedido([{"producto_id": 9999, "cantidad": 1}])).status_code == 404
    assert cliente.post(f"{API}/pedidos", json=_pedido([])).status_code == 422
    assert cliente.post(f"{API}/pedidos", json=_pedido([{"producto_id": muzza, "cantidad": 0}])).status_code == 422
    assert cliente.post(f"{API}/pedidos", json=_pedido([{"producto_id": muzza, "cantidad": 1}], "CHEQUE")).status_code == 422
    corta = {**_pedido([{"producto_id": muzza, "cantidad": 1}]), "direccion_entrega": "abc"}
    assert cliente.post(f"{API}/pedidos", json=corta).status_code == 422


def test_producto_no_disponible_400(cliente: TestClient, admin: TestClient) -> None:
    muzza = producto_id(cliente, "Muzzarella")
    admin.patch(f"{API}/productos/{muzza}/stock", json={"disponible": False})
    assert cliente.post(f"{API}/pedidos", json=_pedido([{"producto_id": muzza, "cantidad": 1}])).status_code == 400


def test_cancelar_dueno_restituye_stock(cliente: TestClient, otro_cliente: TestClient) -> None:
    muzza = producto_id(cliente, "Muzzarella")
    pid = cliente.post(f"{API}/pedidos", json=_pedido([{"producto_id": muzza, "cantidad": 3}])).json()["id"]
    assert _stock(cliente, muzza) == 17
    assert otro_cliente.get(f"{API}/pedidos/{pid}").status_code == 403
    assert otro_cliente.patch(f"{API}/pedidos/{pid}/cancelar").status_code == 403
    r = cliente.patch(f"{API}/pedidos/{pid}/cancelar")
    assert r.status_code == 200 and r.json()["estado"] == "CANCELADO"
    assert _stock(cliente, muzza) == 20
    assert cliente.patch(f"{API}/pedidos/{pid}/cancelar").status_code == 400
    assert cliente.patch(f"{API}/pedidos/9999/cancelar").status_code == 404


def test_maquina_de_estados_admin(cliente: TestClient, admin: TestClient) -> None:
    muzza = producto_id(cliente, "Muzzarella")
    pid = cliente.post(f"{API}/pedidos", json=_pedido([{"producto_id": muzza, "cantidad": 2}])).json()["id"]
    url = f"{API}/pedidos/{pid}/estado"
    assert cliente.patch(url, json={"estado": "EN_PREPARACION"}).status_code == 403
    assert admin.patch(url, json={"estado": "ENTREGADO"}).status_code == 400
    assert admin.patch(url, json={"estado": "EN_PREPARACION"}).status_code == 200
    assert cliente.patch(f"{API}/pedidos/{pid}/cancelar").status_code == 400  # ya no PENDIENTE
    assert admin.patch(url, json={"estado": "CANCELADO"}).json()["estado"] == "CANCELADO"
    assert _stock(cliente, muzza) == 20  # admin cancela -> restituye
    assert admin.patch(url, json={"estado": "PENDIENTE"}).status_code == 400  # terminal
    assert admin.patch(url, json={"estado": "INVENTADO"}).status_code == 422
    assert admin.patch(f"{API}/pedidos/9999/estado", json={"estado": "CANCELADO"}).status_code == 404


def test_listados_y_resumen(cliente: TestClient, otro_cliente: TestClient, admin: TestClient) -> None:
    muzza = producto_id(cliente, "Muzzarella")
    p1 = cliente.post(f"{API}/pedidos", json=_pedido([{"producto_id": muzza, "cantidad": 1}])).json()["id"]
    otro_cliente.post(f"{API}/pedidos", json=_pedido([{"producto_id": muzza, "cantidad": 1}]))
    assert cliente.get(f"{API}/pedidos").json()["total"] == 1
    assert admin.get(f"{API}/pedidos").json()["total"] == 2
    admin.patch(f"{API}/pedidos/{p1}/estado", json={"estado": "EN_PREPARACION"})
    admin.patch(f"{API}/pedidos/{p1}/estado", json={"estado": "ENTREGADO"})
    assert admin.get(f"{API}/pedidos", params={"estado": "ENTREGADO"}).json()["total"] == 1
    resumen = admin.get(f"{API}/pedidos/resumen").json()
    assert resumen == {
        "pendientes": 1,
        "en_preparacion": 0,
        "entregados": 1,
        "cancelados": 0,
        "pedidos_hoy": 2,
        "ingresos_entregados": 8500.0,
    }
    assert cliente.get(f"{API}/pedidos/resumen").status_code == 403
