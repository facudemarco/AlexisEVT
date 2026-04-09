from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, date
from app.models.booking import ReservaStatus
from app.schemas.package import Paquete
from app.schemas.user import User
from app.schemas.config import Hotel


class PasajeroBase(BaseModel):
    nombre: str
    apellido: str
    dni: Optional[str] = None
    fecha_nacimiento: Optional[date] = None
    telefono: Optional[str] = None
    punto_ascenso_id: Optional[int] = None


class PasajeroCreate(PasajeroBase):
    pass


class Pasajero(PasajeroBase):
    id: int
    reserva_id: int

    class Config:
        from_attributes = True


class ReservaBase(BaseModel):
    paquete_id: int
    hotel_id: Optional[int] = None
    cliente_nombre: Optional[str] = None
    cliente_email: Optional[str] = None
    cliente_telefono: Optional[str] = None
    pasajeros_adultos: int = 1
    pasajeros_menores: int = 0
    precio_total: float
    fecha_salida: Optional[date] = None


class ReservaCreate(ReservaBase):
    pasajeros: List[PasajeroCreate] = []
    vendedor_id: Optional[int] = None  # Admin puede asignar a un vendedor específico


class ReservaUpdate(BaseModel):
    estado_reserva: ReservaStatus
    motivo_rechazo: Optional[str] = None
    fecha_salida: Optional[date] = None


class ReservaFullUpdate(BaseModel):
    paquete_id: Optional[int] = None
    hotel_id: Optional[int] = None
    vendedor_id: Optional[int] = None
    cliente_nombre: Optional[str] = None
    cliente_email: Optional[str] = None
    cliente_telefono: Optional[str] = None
    pasajeros_adultos: Optional[int] = None
    pasajeros_menores: Optional[int] = None
    precio_total: Optional[float] = None
    fecha_salida: Optional[date] = None
    pasajeros: Optional[List[PasajeroCreate]] = None


class ReservaInDBBase(ReservaBase):
    id: int
    vendedor_id: Optional[int] = None
    estado_reserva: ReservaStatus
    motivo_rechazo: Optional[str] = None
    fecha_creacion: datetime

    class Config:
        from_attributes = True


class Reserva(ReservaInDBBase):
    vendedor: Optional[User] = None
    paquete: Optional[Paquete] = None
    hotel: Optional[Hotel] = None
    pasajeros: List[Pasajero] = []
