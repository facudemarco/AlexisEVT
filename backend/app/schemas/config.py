from pydantic import BaseModel
from typing import Optional

# --- Generic Config Schema ---
class ConfigItemBase(BaseModel):
    nombre: str

class ConfigItemCreate(ConfigItemBase):
    pass

class ConfigItemInDBBase(ConfigItemBase):
    id: int

    class Config:
        from_attributes = True

# Specific Schemas
class Destino(ConfigItemInDBBase): pass
class DestinoCreate(ConfigItemCreate): pass

class Categoria(ConfigItemInDBBase):
    slug: Optional[str] = None
    imagen_url: Optional[str] = None
class CategoriaCreate(ConfigItemCreate):
    slug: Optional[str] = None
    imagen_url: Optional[str] = None

class Hotel(ConfigItemInDBBase):
    estrellas: Optional[int] = None
    ubicacion: str = ""
class HotelCreate(ConfigItemCreate):
    estrellas: Optional[int] = None
    ubicacion: str = ""

class Transporte(ConfigItemInDBBase): pass
class TransporteCreate(ConfigItemCreate): pass

class Servicio(ConfigItemInDBBase): pass
class ServicioCreate(ConfigItemCreate): pass

class PuntoAscenso(BaseModel):
    id: int
    nombre_lugar: str
    direccion_maps: str
    horario_default: str

    class Config:
        from_attributes = True

class PuntoAscensoCreate(BaseModel):
    nombre_lugar: str
    direccion_maps: str
    horario_default: str


