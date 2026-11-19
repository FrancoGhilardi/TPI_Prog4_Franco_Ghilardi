from collections.abc import Callable
from types import TracebackType

from sqlmodel import Session

from app.core.database import session_factory as default_session_factory


class UnitOfWork:
    """Abre la sesión en __enter__; commit/rollback y close en __exit__.

    Es el ÚNICO lugar del proyecto que llama a session.commit().
    """

    session: Session

    def __init__(self, session_factory: Callable[[], Session] = default_session_factory) -> None:
        self._session_factory = session_factory

    def __enter__(self) -> "UnitOfWork":
        self.session = self._session_factory()
        self._init_repositories(self.session)
        return self

    def _init_repositories(self, session: Session) -> None:
        """Las subclases crean aquí sus repositorios sobre la misma sesión."""

    def __exit__(
        self,
        exc_type: type[BaseException] | None,
        exc: BaseException | None,
        tb: TracebackType | None,
    ) -> None:
        try:
            if exc_type is None:
                self.session.commit()
            else:
                self.session.rollback()
        finally:
            self.session.close()
