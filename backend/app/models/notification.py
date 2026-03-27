from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.db.session import Base


class Notificacion(Base):
    __tablename__ = "notificaciones"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    reserva_id = Column(Integer, ForeignKey("reservas.id", ondelete="SET NULL"), nullable=True)
    tipo = Column(String(50), nullable=False)  # confirmacion | rechazo | cancelacion | pendiente
    mensaje = Column(String(500), nullable=False)
    leida = Column(Boolean, default=False)
    fecha_creacion = Column(DateTime(timezone=True), server_default=func.now())
