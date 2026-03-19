from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, date
from app.models.booking import ReservaStatus
from app.schemas.package import Paquete
from app.schemas.user import User


class PasajeroBase(BaseModel):
    nombre: str
    apellido: str
    dni: Optional[str] = None
    fecha_nacimiento: Optional[date] = None
    telefono: Optional[str] = None


class PasajeroCreate(PasajeroBase):
    pass


class Pasajero(PasajeroBase):
    id: int
    reserva_id: int

    class Config:
        from_attributes = True


class ReservaBase(BaseModel):
    paquete_id: int
    cliente_nombre: Optional[str] = None
    cliente_email: Optional[str] = None
    cliente_telefono: Optional[str] = None
    pasajeros_adultos: int = 1
    pasajeros_menores: int = 0
    precio_total: float


class ReservaCreate(ReservaBase):
    pasajeros: List[PasajeroCreate] = []


class ReservaUpdate(BaseModel):
    estado_reserva: ReservaStatus
    motivo_rechazo: Optional[str] = None


class ReservaInDBBase(ReservaBase):
    id: int
    vendedor_id: int
    estado_reserva: ReservaStatus
    motivo_rechazo: Optional[str] = None
    fecha_creacion: datetime

    class Config:
        from_attributes = True


class Reserva(ReservaInDBBase):
    vendedor: Optional[User] = None
    paquete: Optional[Paquete] = None
    pasajeros: List[Pasajero] = []
