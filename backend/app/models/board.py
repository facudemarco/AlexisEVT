from sqlalchemy import Column, Integer, String, Date
from app.db.session import Base
from datetime import date

class BoardItem(Base):
    __tablename__ = "cartelera"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(255), nullable=False)
    periodo = Column(String(100), nullable=False)
    imagen_url = Column(String(500), nullable=False)
    fecha_creacion = Column(Date, nullable=False, default=date.today)

