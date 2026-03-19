from sqlalchemy.orm import Session
from typing import TypeVar, Type, List
from app.db.session import Base
from pydantic import BaseModel

ModelType = TypeVar("ModelType", bound=Base)
CreateSchemaType = TypeVar("CreateSchemaType", bound=BaseModel)

def get_multi(db: Session, model: Type[ModelType], skip: int = 0, limit: int = 100) -> List[ModelType]:
    return db.query(model).offset(skip).limit(limit).all()

def get(db: Session, model: Type[ModelType], id: int) -> ModelType | None:
    return db.query(model).filter(model.id == id).first()

def create(db: Session, model: Type[ModelType], obj_in: CreateSchemaType) -> ModelType:
    obj_in_data = obj_in.model_dump()
    db_obj = model(**obj_in_data)
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def update(db: Session, model: Type[ModelType], id: int, obj_in: CreateSchemaType) -> ModelType | None:
    obj = db.query(model).get(id)
    if not obj:
        return None
    for key, value in obj_in.model_dump(exclude_unset=True).items():
        setattr(obj, key, value)
    db.commit()
    db.refresh(obj)
    return obj

def remove(db: Session, model: Type[ModelType], id: int) -> ModelType | None:
    obj = db.query(model).get(id)
    if obj:
        db.delete(obj)
        db.commit()
    return obj
