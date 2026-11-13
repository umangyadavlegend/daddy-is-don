from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

from app.config import settings


def _fix_url(url):
    """Hosting sites give 'postgres://...'. SQLAlchemy needs a driver name."""
    if url.startswith("postgres://"):
        return "postgresql+psycopg://" + url[len("postgres://"):]
    if url.startswith("postgresql://"):
        return "postgresql+psycopg://" + url[len("postgresql://"):]
    return url


database_url = _fix_url(settings.database_url)
is_sqlite = database_url.startswith("sqlite")

# SQLite needs an extra option to work with FastAPI. PostgreSQL does not.
engine = create_engine(
    database_url,
    connect_args={"check_same_thread": False} if is_sqlite else {},
    pool_pre_ping=True,
)

SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
