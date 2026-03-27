"""
Seed inicial de la base de datos.
Se ejecuta automáticamente al iniciar el backend (ver main.py lifespan).
Es idempotente: no inserta duplicados si los datos ya existen.

Solo crea las tablas y el usuario admin inicial.
Todos los datos (destinos, hoteles, paquetes, etc.) se gestionan
exclusivamente desde el panel de administración.
"""

from app.db.session import SessionLocal, engine, Base
from app.models.user import User, UserRole
from app.core.security import get_password_hash


def get_or_create(db, model, defaults=None, **kwargs):
    instance = db.query(model).filter_by(**kwargs).first()
    if instance:
        return instance, False
    params = {**kwargs, **(defaults or {})}
    instance = model(**params)
    db.add(instance)
    return instance, True


def seed_db():
    # Crea tablas si no existen (para entornos fresh)
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        # ── Usuario admin inicial ─────────────────────────────────────────────
        # Único dato pre-cargado: el admin que permite entrar al panel por primera vez.
        facundod, created = get_or_create(db, User, email="facundod@iwebtecnology.com")
        if created:
            facundod.nombre = "Facundo Demarco"
            facundod.password_hash = get_password_hash("facundo")
            facundod.rol = UserRole.ADMIN

        db.commit()
        print("[seed] Base de datos inicializada correctamente.")

    except Exception as e:
        db.rollback()
        print(f"[seed] Error al inicializar la base de datos: {e}")
    finally:
        db.close()
