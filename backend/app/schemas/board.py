from pydantic import BaseModel
from typing import Optional
from datetime import date

class BoardItemBase(BaseModel):
    nombre: str
    periodo: str
    imagen_url: str

class BoardItemCreate(BoardItemBase):
    pass

class BoardItemUpdate(BaseModel):
    nombre: Optional[str] = None
    periodo: Optional[str] = None
    imagen_url: Optional[str] = None

class BoardItemInDBBase(BoardItemBase):
    id: int

    class Config:
        from_attributes = True

class BoardItem(BoardItemInDBBase):
    pass
