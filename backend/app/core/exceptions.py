class DomainError(Exception):
    """Base de las excepciones de dominio. Cada Router la traduce a HTTPException."""

    detail: str = "Error de dominio"

    def __init__(self, detail: str | None = None) -> None:
        self.detail = detail or self.detail
        super().__init__(self.detail)
