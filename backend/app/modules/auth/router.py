from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Response, status
from fastapi.security import OAuth2PasswordRequestForm

from app.core.config import settings
from app.core.deps import get_current_active_user
from app.modules.auth.schemas import MensajeResponse
from app.modules.auth.service import (
    AuthService,
    CredencialesInvalidas,
    CuentaDesactivada,
    UsuarioDuplicado,
    get_auth_service,
)
from app.modules.usuarios.models import Usuario
from app.modules.usuarios.schemas import UserCreate, UserPublic

router = APIRouter(prefix="/auth", tags=["auth"])

COOKIE_NAME = "access_token"
ServiceDep = Annotated[AuthService, Depends(get_auth_service)]


@router.post("/register", response_model=UserPublic, status_code=status.HTTP_201_CREATED)
def register(data: UserCreate, service: ServiceDep) -> UserPublic:
    try:
        return service.registrar(data)
    except UsuarioDuplicado as e:
        raise HTTPException(status.HTTP_409_CONFLICT, e.detail) from None


@router.post("/token", response_model=MensajeResponse)
def login(
    response: Response,
    form: Annotated[OAuth2PasswordRequestForm, Depends()],
    service: ServiceDep,
) -> MensajeResponse:
    try:
        token = service.autenticar(form.username, form.password)
    except CredencialesInvalidas as e:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, e.detail) from None
    except CuentaDesactivada as e:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, e.detail) from None
    response.set_cookie(
        key=COOKIE_NAME,
        value=token,
        httponly=True,
        samesite="lax",
        secure=False,  # en producción con HTTPS: True
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        path="/",
    )
    return MensajeResponse(message="Login exitoso")


@router.post("/logout", response_model=MensajeResponse)
def logout(response: Response) -> MensajeResponse:
    response.delete_cookie(key=COOKIE_NAME, path="/", httponly=True, samesite="lax")
    return MensajeResponse(message="Cerraste sesión.")


@router.get("/me", response_model=UserPublic)
def me(usuario: Annotated[Usuario, Depends(get_current_active_user)]) -> UserPublic:
    return UserPublic.model_validate(usuario)
