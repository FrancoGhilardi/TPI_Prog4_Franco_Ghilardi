from fastapi.testclient import TestClient

from tests.conftest import API, login


def test_registro_crea_user_sin_hash(anon: TestClient) -> None:
    r = anon.post(
        f"{API}/auth/register",
        json={"username": "ana", "full_name": "Ana", "email": "ana@x.com", "password": "Password123"},
    )
    assert r.status_code == 201
    body = r.json()
    assert body["role"] == "user" and "hashed_password" not in body


def test_registro_duplicado_409_y_password_corta_422(anon: TestClient) -> None:
    dup = {"username": "admin", "full_name": "Xx", "email": "nuevo@x.com", "password": "Password123"}
    assert anon.post(f"{API}/auth/register", json=dup).status_code == 409
    corta = {"username": "bob", "full_name": "Bob", "email": "bob@x.com", "password": "123"}
    assert anon.post(f"{API}/auth/register", json=corta).status_code == 422


def test_login_cookie_httponly_sin_token_en_cuerpo(anon: TestClient) -> None:
    r = anon.post(f"{API}/auth/token", data={"username": "admin", "password": "Admin1234!"})
    assert r.status_code == 200
    assert r.json() == {"message": "Login exitoso"}
    cookie = r.headers["set-cookie"].lower()
    assert "access_token=" in cookie and "httponly" in cookie


def test_login_incorrecto_401_y_me_sin_sesion_401(anon: TestClient) -> None:
    r = anon.post(f"{API}/auth/token", data={"username": "admin", "password": "mala"})
    assert r.status_code == 401
    assert anon.get(f"{API}/auth/me").status_code == 401


def test_me_y_logout(cliente: TestClient) -> None:
    assert cliente.get(f"{API}/auth/me").json()["username"] == "cliente"
    assert cliente.post(f"{API}/auth/logout").status_code == 200
    assert cliente.get(f"{API}/auth/me").status_code == 401


def test_desactivar_usuario_bloquea_sesion_y_login(admin: TestClient, cliente: TestClient) -> None:
    usuarios = admin.get(f"{API}/admin/usuarios").json()
    cid = next(u["id"] for u in usuarios if u["username"] == "cliente")
    assert admin.post(f"{API}/admin/usuarios/{cid}/desactivar").status_code == 200
    assert admin.post(f"{API}/admin/usuarios/{cid}/desactivar").status_code == 200  # idempotente
    assert cliente.get(f"{API}/auth/me").status_code == 400
    r = TestClient(cliente.app).post(
        f"{API}/auth/token", data={"username": "cliente", "password": "Cliente1234!"}
    )
    assert r.status_code == 400 and r.json()["detail"] == "Cuenta de usuario desactivada"
    assert admin.post(f"{API}/admin/usuarios/{cid}/activar").json()["disabled"] is False
    login("cliente", "Cliente1234!")


def test_admin_usuarios_errores(admin: TestClient, cliente: TestClient) -> None:
    yo = admin.get(f"{API}/auth/me").json()["id"]
    assert admin.post(f"{API}/admin/usuarios/{yo}/desactivar").status_code == 400
    assert admin.post(f"{API}/admin/usuarios/9999/activar").status_code == 404
    assert cliente.get(f"{API}/admin/usuarios").status_code == 403
