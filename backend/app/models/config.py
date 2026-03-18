from sqlalchemy import Column, Integer, String, SmallInteger
from app.db.session import Base

class Destino(Base):
    __tablename__ = "destinos"
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(255), unique=True, nullable=False)

class Categoria(Base):
    __tablename__ = "categorias"
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(255), unique=True, nullable=False)
    slug = Column(String(100), unique=True, nullable=True)
    imagen_url = Column(String(500), nullable=True)

class Hotel(Base):
    __tablename__ = "hoteles"
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(255), nullable=False)
    estrellas = Column(SmallInteger, nullable=True)
    ubicacion = Column(String(255), nullable=False, default="")

class Transporte(Base):
    __tablename__ = "transportes"
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(255), nullable=False)

class Servicio(Base):
    __tablename__ = "servicios"
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(255), nullable=False)

class PuntoAscenso(Base):
    __tablename__ = "puntos_ascenso"
    id = Column(Integer, primary_key=True, index=True)
    nombre_lugar = Column(String(150), nullable=False)
    direccion_maps = Column(String(255), nullable=False, default="")
    horario_default = Column(String(50), nullable=False, default="00:00")


