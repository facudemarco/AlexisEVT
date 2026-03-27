from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
from typing import Optional
from pydantic import BaseModel, EmailStr
from app.api.deps import get_db
from app.api.deps_security import get_current_user
from app.core.security import verify_password, create_access_token, get_password_hash
from app.core.config import settings
from app.crud.crud_user import get_user_by_email
from app.schemas.user import User

router = APIRouter()

@router.post("/login")
def login_for_access_token(db: Session = Depends(get_db), form_data: OAuth2PasswordRequestForm = Depends()):
    user = get_user_by_email(db, email=form_data.username)
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        subject=user.id, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer", "rol": user.rol.value, "nombre": user.nombre}


@router.get("/me", response_model=User)
def get_me(current_user = Depends(get_current_user)):
    return current_user


class MeUpdate(BaseModel):
    nombre: Optional[str] = None
    telefono: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = None


@router.put("/me", response_model=User)
def update_me(body: MeUpdate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    if body.nombre is not None:
        current_user.nombre = body.nombre
    if body.telefono is not None:
        current_user.telefono = body.telefono
    if body.email is not None:
        existing = get_user_by_email(db, email=body.email)
        if existing and existing.id != current_user.id:
            raise HTTPException(status_code=400, detail="Ese email ya está en uso.")
        current_user.email = body.email
    if body.password:
        current_user.password_hash = get_password_hash(body.password)
    db.commit()
    db.refresh(current_user)
    return current_user

