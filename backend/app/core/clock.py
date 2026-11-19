from datetime import datetime, timezone


def utcnow() -> datetime:
    """Fecha/hora actual en UTC sin tzinfo (compatible con PostgreSQL TIMESTAMP y SQLite)."""
    return datetime.now(timezone.utc).replace(tzinfo=None)
