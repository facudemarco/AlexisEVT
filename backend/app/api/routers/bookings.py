from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from app.api.deps import get_db
from app.api.deps_security import get_current_user, get_current_admin_user
from app.schemas.booking import Reserva, ReservaCreate
from app.models.user import User, UserRole
from app.crud import crud_booking

router = APIRouter()


@router.post("/", response_model=Reserva)
def create_reserva(
    reserva_in: ReservaCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    auto_approve = current_user.rol == UserRole.ADMIN
    return crud_booking.create_reserva(db=db, reserva=reserva_in, vendedor_id=current_user.id, auto_approve=auto_approve)


@router.get("/", response_model=List[Reserva])
def read_reservas(
    skip: int = 0,
    limit: int = 200,
    estado: Optional[str] = Query(None),
    destino_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.rol == UserRole.ADMIN:
        return crud_booking.get_todas_reservas(db, skip=skip, limit=limit, estado=estado, destino_id=destino_id)
    else:
        return crud_booking.get_reservas_by_vendedor(db, vendedor_id=current_user.id, skip=skip, limit=limit)


class EstadoUpdate(BaseModel):
    estado: str
    motivo: Optional[str] = None


@router.patch("/{reserva_id}/status", response_model=Reserva)
def update_estado(
    reserva_id: int,
    body: EstadoUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    reserva = crud_booking.get_reserva(db, reserva_id)
    if not reserva:
        raise HTTPException(status_code=404, detail="Reserva no encontrada")

    if body.estado not in ["Pendiente", "Aprobada", "Rechazada"]:
        raise HTTPException(status_code=400, detail="Estado inválido. Use: Pendiente, Aprobada, Rechazada")

    return crud_booking.update_reserva_estado(db, reserva_id, body.estado, motivo=body.motivo)
