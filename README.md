# Food Store — Sistema de pedidos de comida

Trabajo Práctico Integrador · Programación 4 · Tecnicatura Universitaria en Programación a Distancia (UTN).

Aplicación web para un negocio de comidas: los clientes se registran, recorren el catálogo, arman un carrito y confirman pedidos (efectivo o transferencia); el administrador gestiona categorías, productos, stock, pedidos y usuarios.

- **Repositorio:** https://github.com/FrancoGhilardi/TPI_Prog4_Franco_Ghilardi
- **Video de demostración:** https://drive.google.com/file/d/1rUb3QHGir9wS85VShThCgnpAe56cNI_q/view?usp=sharing
- **Alumno:** Franco Ghilardi

## Stack

| Parte    | Tecnologías                                                                                                          |
| -------- | -------------------------------------------------------------------------------------------------------------------- |
| Backend  | Python 3.11–3.13, FastAPI, SQLModel, PostgreSQL (o SQLite en desarrollo), JWT en cookie HttpOnly, passlib + bcrypt   |
| Frontend | React 19, TypeScript (strict), Vite 7, Tailwind CSS 4, TanStack Query / Form / Table, React Router 7, Zustand, Axios |

## Requisitos

- **Python 3.11, 3.12 o 3.13** (SQLModel 0.0.22 no funciona con 3.14)
- **PostgreSQL 15+**, o **Docker Desktop** para levantarlo con un comando (para desarrollo también se acepta SQLite, ver más abajo)
- **Node.js 20.19+** y **pnpm 9+** (`npm install -g pnpm`)

## Estructura

```
.
├── backend/     API REST FastAPI (app/core, app/modules/{auth,usuarios,categorias,productos,pedidos}, app/db/seed.py)
├── frontend/    SPA React + TypeScript organizada por features
├── docker-compose.yml   PostgreSQL + backend + frontend (opcional)
└── README.md
```

## Backend

### 1. Instalación

```bash
cd backend
python -m venv venv
# Windows (PowerShell)
.\venv\Scripts\Activate.ps1
# Linux / macOS
source venv/bin/activate

pip install -r requirements.txt
```

### 2. Variables de entorno

Copiar el ejemplo y ajustar:

```bash
# Windows
copy .env.example .env
# Linux / macOS
cp .env.example .env
```

| Variable                      | Descripción                          | Ejemplo                                                      |
| ----------------------------- | ------------------------------------ | ------------------------------------------------------------ |
| `DATABASE_URL`                | Conexión a la base                   | `postgresql://postgres:postgres@localhost:5432/foodstore_db` |
| `SECRET_KEY`                  | Firma del JWT (mínimo 32 caracteres) | `cambiar-esta-clave-de-al-menos-32-caracteres`               |
| `ALGORITHM`                   | Algoritmo del JWT                    | `HS256`                                                      |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Expiración del token y de la cookie  | `30`                                                         |
| `FRONTEND_ORIGIN`             | Origen permitido por CORS            | `http://localhost:5173`                                      |

**Base de datos PostgreSQL** (elegir una opción):

- Con Docker (recomendado, no requiere instalar PostgreSQL). Desde la raíz del proyecto:

  ```bash
  docker compose up -d db
  ```

  Crea `foodstore_db` con usuario `postgres` / `postgres` en `localhost:5432`, que coincide con `.env.example`.

  > Si ya tenés PostgreSQL instalado escuchando en el puerto 5432, el contenedor no puede usarlo. Creá un archivo `.env` en la raíz con `DB_HOST_PORT=5433`, volvé a ejecutar `docker compose up -d db` y en `backend/.env` usá `DATABASE_URL=postgresql://postgres:postgres@localhost:5433/foodstore_db`. (Síntoma típico en Windows: `UnicodeDecodeError` al conectar.)

- Con PostgreSQL instalado localmente: crear la base y ajustar usuario/contraseña en `DATABASE_URL`:

  ```bash
  psql -U postgres -c "CREATE DATABASE foodstore_db;"
  ```

**Alternativa SQLite (sin instalar PostgreSQL):** en `.env` usar `DATABASE_URL=sqlite:///./foodstore.db`.

### 3. Datos iniciales (seed)

```bash
python -m app.db.seed
```

Crea las tablas y carga (idempotente, se puede correr varias veces):

| Usuario   | Contraseña     | Rol   |
| --------- | -------------- | ----- |
| `admin`   | `Admin1234!`   | admin |
| `cliente` | `Cliente1234!` | user  |

Además, 5 categorías y 10 productos con stock.

### 4. Ejecución

```bash
uvicorn app.main:app --reload
```

- API: http://localhost:8000/api/v1
- Documentación Swagger: http://localhost:8000/docs
- Documentación ReDoc: http://localhost:8000/redoc

### 5. Pruebas (opcional)

```bash
pip install -r requirements-dev.txt
pytest -q
```

## Frontend

### 1. Instalación

```bash
cd frontend
pnpm install
```

### 2. Variables de entorno

```bash
# Windows
copy .env.example .env
# Linux / macOS
cp .env.example .env
```

| Variable       | Descripción        | Ejemplo                        |
| -------------- | ------------------ | ------------------------------ |
| `VITE_API_URL` | URL base de la API | `http://localhost:8000/api/v1` |

### 3. Ejecución

```bash
pnpm build   # verifica tipos y genera dist/
pnpm dev     # http://localhost:5173
```

> **Importante:** abrir el frontend en `http://localhost:5173` (no `127.0.0.1`). La sesión viaja en una cookie HttpOnly que solo se comparte entre orígenes del mismo sitio (`localhost`).

## Ejecución con Docker (opcional)

Alternativa a los pasos anteriores: levanta PostgreSQL, el backend (ejecuta el seed al iniciar) y el frontend servido con nginx. Requiere Docker Desktop.

```bash
docker compose up --build -d
```

| Servicio      | URL                                                                              |
| ------------- | -------------------------------------------------------------------------------- |
| Frontend      | http://localhost:5173                                                            |
| API / Swagger | http://localhost:8000/docs                                                       |
| PostgreSQL    | `localhost:5432` o `DB_HOST_PORT` (`postgres` / `postgres`, base `foodstore_db`) |

Detener: `docker compose down` · Borrar también los datos: `docker compose down -v`.
No se puede correr a la vez que `uvicorn` / `pnpm dev` nativos (usan los mismos puertos).

## Funcionalidades

**Cliente:** registro e inicio de sesión · catálogo paginado con búsqueda y filtro por categoría · carrito persistido en el navegador · checkout con dirección, forma de pago y notas · "Mis pedidos" con detalle y cancelación en estado PENDIENTE.

**Administrador:** resumen con indicadores · ABM de categorías y productos (incluye stock y disponibilidad) · gestión de pedidos según la máquina de estados · activación y desactivación de usuarios.

### Reglas de negocio

| Regla | Descripción                                                                                                                                                                                     |
| ----- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| RN-01 | El pedido se crea en una transacción: valida productos (activos, disponibles, con stock, sin repetir), descuenta stock y copia nombre y precio en cada línea. Si algo falla, no se guarda nada. |
| RN-02 | Estados: `PENDIENTE → EN_PREPARACION → ENTREGADO`; `PENDIENTE` y `EN_PREPARACION` pueden pasar a `CANCELADO`. `ENTREGADO` y `CANCELADO` son terminales.                                         |
| RN-03 | Cancelar restituye el stock en la misma transacción.                                                                                                                                            |
| RN-04 | El cliente ve y cancela solo sus pedidos (solo en PENDIENTE); el admin ve todos y los avanza o cancela.                                                                                         |
| RN-05 | Las líneas y el total de un pedido no cambian después de crearlo.                                                                                                                               |
| RN-06 | `forma_pago`: EFECTIVO o TRANSFERENCIA; `direccion_entrega`: 5 a 200 caracteres.                                                                                                                |

## Endpoints principales (`/api/v1`)

| Método                      | Ruta                                                                                 | Acceso        |
| --------------------------- | ------------------------------------------------------------------------------------ | ------------- |
| POST                        | `/auth/register`, `/auth/token`, `/auth/logout`                                      | Público       |
| GET                         | `/auth/me`                                                                           | Sesión        |
| GET / POST                  | `/admin/usuarios`, `/admin/usuarios/{id}/activar`, `/admin/usuarios/{id}/desactivar` | admin         |
| GET                         | `/categorias`, `/categorias/{id}`                                                    | Público       |
| POST / PUT / DELETE         | `/categorias`, `/categorias/{id}`                                                    | admin         |
| GET                         | `/productos?skip&limit&search&categoria_id&disponible`, `/productos/{id}`            | Público       |
| POST / PUT / PATCH / DELETE | `/productos`, `/productos/{id}`, `/productos/{id}/stock`                             | admin         |
| POST / GET                  | `/pedidos`                                                                           | Sesión        |
| GET                         | `/pedidos/resumen`                                                                   | admin         |
| GET                         | `/pedidos/{id}`                                                                      | Dueño o admin |
| PATCH                       | `/pedidos/{id}/estado`                                                               | admin         |
| PATCH                       | `/pedidos/{id}/cancelar`                                                             | Dueño         |

Detalle completo, schemas y códigos de error en `/docs`.
