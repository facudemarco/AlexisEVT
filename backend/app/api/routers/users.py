from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.api.deps import get_db
from app.api.deps_security import get_current_admin_user
from app.schemas.user import User, UserCreate, UserUpdate
from app.crud import crud_user

router = APIRouter()

@router.post("/", response_model=User)
def create_vendedor(user_in: UserCreate, db: Session = Depends(get_db), current_admin = Depends(get_current_admin_user)):
    """Solo el Admin puede crear usuarios (Vendedores)."""
    user = crud_user.get_user_by_email(db, email=user_in.email)
    if user:
        raise HTTPException(status_code=400, detail="Este email ya está registrado.")
    return crud_user.create_user(db=db, user=user_in)

@router.get("/", response_model=List[User])
def read_users(
    skip: int = 0,
    limit: int = 100,
    rol: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_admin = Depends(get_current_admin_user),
):
    return crud_user.get_users(db, skip=skip, limit=limit, rol=rol)


@router.put("/{user_id}", response_model=User)
def update_vendedor(user_id: int, user_in: UserUpdate, db: Session = Depends(get_db), current_admin = Depends(get_current_admin_user)):
    user = crud_user.update_user(db, user_id=user_id, user_in=user_in)
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado.")
    return user


@router.delete("/{user_id}", response_model=User)
def delete_vendedor(user_id: int, db: Session = Depends(get_db), current_admin = Depends(get_current_admin_user)):
    user = crud_user.delete_user(db, user_id=user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado.")
    return user
