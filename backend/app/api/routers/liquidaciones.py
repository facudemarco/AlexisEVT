from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.api.deps import get_db
from app.api.deps_security import get_current_admin_user, get_current_user
from app.crud import crud_liquidacion, crud_booking
from app.schemas.liquidacion import (
    LiquidacionCreate,
    LiquidacionUpdate,
    LiquidacionResponse,
    PagoCreate,
    PagoResponse,
)

router = APIRouter()


@router.get("/", response_model=List[LiquidacionResponse])
def list_liquidaciones(
    skip: int = 0,
    limit: int = 200,
    db: Session = Depends(get_db),
    _=Depends(get_current_admin_user),
):
    return crud_liquidacion.get_all_liquidaciones(db, skip=skip, limit=limit)


@router.post("/", response_model=LiquidacionResponse, status_code=status.HTTP_201_CREATED)
def create_liquidacion(
    data: LiquidacionCreate,
    db: Session = Depends(get_db),
    _=Depends(get_current_admin_user),
):
    reserva = crud_booking.get_reserva(db, data.reserva_id)
    if not reserva:
        raise HTTPException(status_code=404, detail="Reserva no encontrada")

    existing = crud_liquidacion.get_liquidacion_by_reserva(db, data.reserva_id)
    if existing:
        raise HTTPException(status_code=409, detail="Esta reserva ya tiene una liquidación")

    return crud_liquidacion.create_liquidacion(db, data)


@router.get("/by-reserva/{reserva_id}", response_model=LiquidacionResponse)
def get_by_reserva(
    reserva_id: int,
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    liq = crud_liquidacion.get_liquidacion_by_reserva(db, reserva_id)
    if not liq:
        raise HTTPException(status_code=404, detail="Liquidación no encontrada")
    from app.crud.crud_liquidacion import _load_liq
    return _load_liq(db, liq)


@router.get("/{liquidacion_id}", response_model=LiquidacionResponse)
def get_liquidacion(
    liquidacion_id: int,
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    liq = crud_liquidacion.get_liquidacion(db, liquidacion_id)
    if not liq:
        raise HTTPException(status_code=404, detail="Liquidación no encontrada")
    from app.crud.crud_liquidacion import _load_liq
    return _load_liq(db, liq)


@router.put("/{liquidacion_id}", response_model=LiquidacionResponse)
def update_liquidacion(
    liquidacion_id: int,
    data: LiquidacionUpdate,
    db: Session = Depends(get_db),
    _=Depends(get_current_admin_user),
):
    liq = crud_liquidacion.get_liquidacion(db, liquidacion_id)
    if not liq:
        raise HTTPException(status_code=404, detail="Liquidación no encontrada")
    return crud_liquidacion.update_liquidacion(db, liq, data)


@router.delete("/{liquidacion_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_liquidacion(
    liquidacion_id: int,
    db: Session = Depends(get_db),
    _=Depends(get_current_admin_user),
):
    liq = crud_liquidacion.get_liquidacion(db, liquidacion_id)
    if not liq:
        raise HTTPException(status_code=404, detail="Liquidación no encontrada")
    crud_liquidacion.delete_liquidacion(db, liq)


# ── Pagos ──────────────────────────────────────────────────────────────

@router.post("/{liquidacion_id}/pagos", response_model=PagoResponse, status_code=status.HTTP_201_CREATED)
def add_pago(
    liquidacion_id: int,
    data: PagoCreate,
    db: Session = Depends(get_db),
    _=Depends(get_current_admin_user),
):
    pago = crud_liquidacion.add_pago(db, liquidacion_id, data)
    if not pago:
        raise HTTPException(status_code=404, detail="Liquidación no encontrada")
    return pago


@router.delete("/{liquidacion_id}/pagos/{pago_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_pago(
    liquidacion_id: int,
    pago_id: int,
    db: Session = Depends(get_db),
    _=Depends(get_current_admin_user),
):
    ok = crud_liquidacion.delete_pago(db, liquidacion_id, pago_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Pago no encontrado")
