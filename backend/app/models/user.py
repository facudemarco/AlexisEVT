from sqlalchemy import Column, Integer, String, Float, Enum
from app.db.session import Base
import enum

class UserRole(str, enum.Enum):
    ADMIN = "admin"
    VENDEDOR = "vendedor"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    nombre_sistema = Column(String(255), nullable=True)   # Ej: "VEND VALENTIN DEMARCO"
    nombre = Column(String(255), nullable=False)           # Nombre completo
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    telefono = Column(String(50), nullable=True)
    rol = Column(
        Enum(UserRole, values_callable=lambda obj: [e.value for e in obj]),
        default=UserRole.VENDEDOR,
        nullable=False,
    )
    agencia_nombre = Column(String(255), nullable=True)
    comision_porcentaje = Column(Float, default=0.0)
