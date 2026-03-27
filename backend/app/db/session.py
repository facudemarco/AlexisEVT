from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from app.core.config import settings

_db_url = settings.db_url

# MySQL en producción: pool persistente. SQLite en dev: check_same_thread=False.
if _db_url.startswith("sqlite"):
    engine = create_engine(
        _db_url,
        connect_args={"check_same_thread": False},
        pool_pre_ping=True,
    )
else:
    engine = create_engine(
        _db_url,
        pool_pre_ping=True,
        pool_recycle=3600,   # recicla conexiones cada hora (evita MySQL timeout)
        pool_size=10,
        max_overflow=20,
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()
