from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
from app.api.deps import get_db
from app.api.deps_security import get_current_user
from app.models.notification import Notificacion
from app.models.user import User

router = APIRouter()


class NotificacionOut(BaseModel):
    id: int
    reserva_id: Optional[int]
    tipo: str
    mensaje: str
    leida: bool
    fecha_creacion: datetime

    class Config:
        from_attributes = True


@router.get("/", response_model=List[NotificacionOut])
def get_notifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return (
        db.query(Notificacion)
        .filter(Notificacion.user_id == current_user.id)
        .order_by(Notificacion.fecha_creacion.desc())
        .limit(50)
        .all()
    )


@router.get("/unread-count")
def unread_count(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    count = (
        db.query(Notificacion)
        .filter(Notificacion.user_id == current_user.id, Notificacion.leida == False)
        .count()
    )
    return {"count": count}


@router.patch("/{notif_id}/read")
def mark_read(
    notif_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    notif = db.query(Notificacion).filter(
        Notificacion.id == notif_id,
        Notificacion.user_id == current_user.id,
    ).first()
    if notif:
        notif.leida = True
        db.commit()
    return {"ok": True}


@router.patch("/mark-all-read")
def mark_all_read(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    db.query(Notificacion).filter(
        Notificacion.user_id == current_user.id,
        Notificacion.leida == False,
    ).update({"leida": True})
    db.commit()
    return {"ok": True}
