from sqlalchemy.orm import Session
from sqlalchemy import asc
from typing import Optional
from app.models.booking import Reserva, Pasajero, ReservaStatus
from app.schemas.booking import ReservaCreate


def get_reserva(db: Session, reserva_id: int):
    return db.query(Reserva).filter(Reserva.id == reserva_id).first()


def get_reservas_by_vendedor(db: Session, vendedor_id: int, skip: int = 0, limit: int = 100):
    from app.models.package import Paquete
    return (
        db.query(Reserva)
        .join(Paquete, Reserva.paquete_id == Paquete.id)
        .filter(Reserva.vendedor_id == vendedor_id)
        .order_by(asc(Paquete.fecha_salida))
        .offset(skip)
        .limit(limit)
        .all()
    )


def get_todas_reservas(
    db: Session,
    skip: int = 0,
    limit: int = 200,
    estado: Optional[str] = None,
    destino_id: Optional[int] = None,
):
    from app.models.package import Paquete

    q = db.query(Reserva).join(Paquete, Reserva.paquete_id == Paquete.id)

    if estado:
        q = q.filter(Reserva.estado_reserva == estado)
    if destino_id:
        q = q.filter(Paquete.destino_id == destino_id)

    q = q.order_by(asc(Paquete.fecha_salida))
    return q.offset(skip).limit(limit).all()


def create_reserva(db: Session, reserva: ReservaCreate, vendedor_id: int, auto_approve: bool = False):
    estado = ReservaStatus.APROBADA if auto_approve else ReservaStatus.PENDIENTE
    db_reserva = Reserva(
        vendedor_id=vendedor_id,
        paquete_id=reserva.paquete_id,
        cliente_nombre=reserva.cliente_nombre,
        cliente_email=reserva.cliente_email,
        cliente_telefono=reserva.cliente_telefono,
        pasajeros_adultos=reserva.pasajeros_adultos,
        pasajeros_menores=reserva.pasajeros_menores,
        precio_total=reserva.precio_total,
        estado_reserva=estado,
    )
    db.add(db_reserva)
    db.flush()

    for p in reserva.pasajeros:
        db_pasajero = Pasajero(
            reserva_id=db_reserva.id,
            nombre=p.nombre,
            apellido=p.apellido,
            dni=p.dni,
            fecha_nacimiento=p.fecha_nacimiento,
            telefono=p.telefono,
        )
        db.add(db_pasajero)

    db.commit()
    db.refresh(db_reserva)
    return db_reserva


def update_reserva_estado(db: Session, reserva_id: int, nuevo_estado: str, motivo: Optional[str] = None):
    reserva = get_reserva(db, reserva_id)
    if reserva:
        reserva.estado_reserva = nuevo_estado
        if motivo is not None:
            reserva.motivo_rechazo = motivo
        db.commit()
        db.refresh(reserva)
    return reserva
