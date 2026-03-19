from pydantic import BaseModel, EmailStr
from typing import Optional
from app.models.user import UserRole

class UserBase(BaseModel):
    nombre_sistema: Optional[str] = None
    nombre: str
    email: EmailStr
    telefono: Optional[str] = None
    rol: UserRole = UserRole.VENDEDOR
    agencia_nombre: Optional[str] = None
    comision_porcentaje: float = 0.0

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    nombre_sistema: Optional[str] = None
    nombre: Optional[str] = None
    email: Optional[EmailStr] = None
    telefono: Optional[str] = None
    rol: Optional[UserRole] = None
    agencia_nombre: Optional[str] = None
    comision_porcentaje: Optional[float] = None
    password: Optional[str] = None

class UserInDBBase(UserBase):
    id: int

    class Config:
        from_attributes = True

class User(UserInDBBase):
    pass
