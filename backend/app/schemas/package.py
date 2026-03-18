from pydantic import BaseModel
from typing import Optional, List
from datetime import date
from app.schemas.config import Destino, Categoria, Hotel, Transporte, Servicio, PuntoAscenso

class PaqueteBase(BaseModel):
    destino_id: int
    categoria_id: int
    titulo_subtitulo: str
    fecha_salida: date
    fecha_regreso: date
    duracion_dias: int
    duracion_noches: int
    precio_base: float
    estado: bool = True
    imagen_url: Optional[str] = None
    regimen: Optional[str] = None
    gastos_reserva: float = 0
    salidas_diarias: bool = False
    # Additional detail fields
    periodo: Optional[str] = None
    moneda: Optional[str] = None
    adicionales_json: Optional[Dict[str, Any]] = None
    transporte_incluido: Optional[bool] = None
    transporte_empresa: Optional[str] = None
    transporte_tipo: Optional[str] = None
    horario_salida: Optional[time] = None
    horario_regreso: Optional[time] = None
    alojamiento_incluido: Optional[bool] = None
    alojamiento_noches: Optional[int] = None

class PaqueteCreate(PaqueteBase):
    hotel_ids: List[int] = []
    transporte_ids: List[int] = []
    servicio_ids: List[int] = []
    punto_ascenso_ids: List[int] = []

class PaqueteUpdate(BaseModel):
    destino_id: Optional[int] = None
    categoria_id: Optional[int] = None
    titulo_subtitulo: Optional[str] = None
    fecha_salida: Optional[date] = None
    fecha_regreso: Optional[date] = None
    duracion_dias: Optional[int] = None
    duracion_noches: Optional[int] = None
    precio_base: Optional[float] = None
    estado: Optional[bool] = None
    imagen_url: Optional[str] = None
    regimen: Optional[str] = None
    gastos_reserva: Optional[float] = None
    salidas_diarias: Optional[bool] = None
    # Additional detail fields for update
    periodo: Optional[str] = None
    moneda: Optional[str] = None
    adicionales_json: Optional[Dict[str, Any]] = None
    transporte_incluido: Optional[bool] = None
    transporte_empresa: Optional[str] = None
    transporte_tipo: Optional[str] = None
    horario_salida: Optional[time] = None
    horario_regreso: Optional[time] = None
    alojamiento_incluido: Optional[bool] = None
    alojamiento_noches: Optional[int] = None
    hotel_ids: Optional[List[int]] = None
    transporte_ids: Optional[List[int]] = None
    servicio_ids: Optional[List[int]] = None
    punto_ascenso_ids: Optional[List[int]] = None

class PaqueteInDBBase(PaqueteBase):
    id: int
    destino: Optional[Destino] = None
    categoria: Optional[Categoria] = None
    hoteles: List[Hotel] = []
    transportes: List[Transporte] = []
    servicios: List[Servicio] = []
    puntos_ascenso: List[PuntoAscenso] = []

    class Config:
        from_attributes = True

class Paquete(PaqueteInDBBase):
    pass

