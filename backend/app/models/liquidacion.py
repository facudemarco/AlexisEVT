from sqlalchemy import Column, Integer, String, Float, Date, DateTime, Boolean, ForeignKey, DECIMAL
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.session import Base


class Liquidacion(Base):
    __tablename__ = "liquidaciones"

    id = Column(Integer, primary_key=True, index=True)
    reserva_id = Column(Integer, ForeignKey("reservas.id", ondelete="CASCADE"), unique=True, nullable=False)
    fecha = Column(Date, nullable=False)
    comision_porcentaje = Column(Float, default=15.0, nullable=False)
    notas = Column(String(500), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    reserva = relationship("Reserva", back_populates="liquidacion")
    items = relationship("LiquidacionItem", back_populates="liquidacion", cascade="all, delete-orphan", order_by="LiquidacionItem.orden")
    pagos = relationship("Pago", back_populates="liquidacion", cascade="all, delete-orphan", order_by="Pago.fecha")


class LiquidacionItem(Base):
    __tablename__ = "liquidacion_items"

    id = Column(Integer, primary_key=True, index=True)
    liquidacion_id = Column(Integer, ForeignKey("liquidaciones.id", ondelete="CASCADE"), nullable=False)
    orden = Column(Integer, default=1, nullable=False)
    descripcion = Column(String(255), nullable=False)
    precio = Column(DECIMAL(12, 2), nullable=False)
    cant_pax = Column(Integer, default=1, nullable=False)
    # aplica_comision: si False, este ítem no cuenta para calcular la comisión (ej: gastos de reserva)
    aplica_comision = Column(Boolean, default=True, nullable=False)

    liquidacion = relationship("Liquidacion", back_populates="items")


class Pago(Base):
    __tablename__ = "pagos"

    id = Column(Integer, primary_key=True, index=True)
    liquidacion_id = Column(Integer, ForeignKey("liquidaciones.id", ondelete="CASCADE"), nullable=False)
    fecha = Column(Date, nullable=False)
    monto = Column(DECIMAL(12, 2), nullable=False)
    descripcion = Column(String(255), nullable=True)

    liquidacion = relationship("Liquidacion", back_populates="pagos")
