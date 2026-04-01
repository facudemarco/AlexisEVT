from pydantic import BaseModel, computed_field
from typing import Optional, List, Any
from datetime import date, datetime
from decimal import Decimal


# ── Items ──────────────────────────────────────────────────────────────
class LiquidacionItemBase(BaseModel):
    orden: int = 1
    descripcion: str
    precio: Decimal
    cant_pax: int = 1
    aplica_comision: bool = True


class LiquidacionItemCreate(LiquidacionItemBase):
    pass


class LiquidacionItemResponse(LiquidacionItemBase):
    id: int
    liquidacion_id: int

    @computed_field
    @property
    def total(self) -> Decimal:
        return self.precio * self.cant_pax

    class Config:
        from_attributes = True


# ── Pagos ──────────────────────────────────────────────────────────────
class PagoBase(BaseModel):
    fecha: date
    monto: Decimal
    descripcion: Optional[str] = None


class PagoCreate(PagoBase):
    pass


class PagoResponse(PagoBase):
    id: int
    liquidacion_id: int

    class Config:
        from_attributes = True


# ── Minimal reserva info (para no circular imports) ───────────────────
class ReservaResumen(BaseModel):
    id: int
    cliente_nombre: Optional[str] = None
    precio_total: float
    paquete_id: int
    paquete_titulo: Optional[str] = None
    destino_nombre: Optional[str] = None
    fecha_salida: Optional[date] = None

    class Config:
        from_attributes = True


# ── Liquidacion ────────────────────────────────────────────────────────
class LiquidacionCreate(BaseModel):
    reserva_id: int
    fecha: date
    comision_porcentaje: float = 15.0
    notas: Optional[str] = None
    items: List[LiquidacionItemCreate] = []


class LiquidacionUpdate(BaseModel):
    fecha: Optional[date] = None
    comision_porcentaje: Optional[float] = None
    notas: Optional[str] = None
    items: Optional[List[LiquidacionItemCreate]] = None


class LiquidacionResponse(BaseModel):
    id: int
    reserva_id: int
    fecha: date
    comision_porcentaje: float
    notas: Optional[str] = None
    created_at: datetime
    items: List[LiquidacionItemResponse] = []
    pagos: List[PagoResponse] = []
    reserva_resumen: Optional[ReservaResumen] = None

    @computed_field
    @property
    def subtotal(self) -> Decimal:
        return sum((item.precio * item.cant_pax for item in self.items), Decimal("0"))

    @computed_field
    @property
    def base_comision(self) -> Decimal:
        return sum(
            (item.precio * item.cant_pax for item in self.items if item.aplica_comision),
            Decimal("0"),
        )

    @computed_field
    @property
    def comision_monto(self) -> Decimal:
        return (self.base_comision * Decimal(str(self.comision_porcentaje)) / Decimal("100")).quantize(Decimal("0.01"))

    @computed_field
    @property
    def total_pagos(self) -> Decimal:
        return sum((p.monto for p in self.pagos), Decimal("0"))

    @computed_field
    @property
    def saldo(self) -> Decimal:
        return self.subtotal - self.comision_monto - self.total_pagos

    class Config:
        from_attributes = True
