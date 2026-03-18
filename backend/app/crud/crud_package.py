from sqlalchemy.orm import Session, joinedload
from app.models.package import Paquete
from app.models.config import Categoria, Hotel, Transporte, Servicio, PuntoAscenso
from app.schemas.package import PaqueteCreate

def get_paquete(db: Session, paquete_id: int):
    return db.query(Paquete).filter(Paquete.id == paquete_id).first()

def get_paquetes(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Paquete).offset(skip).limit(limit).all()

def get_paquetes_by_category_slug(db: Session, slug: str):
    """Fetch active packages by category slug, with eager-loaded relationships."""
    return (
        db.query(Paquete)
        .join(Categoria, Paquete.categoria_id == Categoria.id)
        .options(
            joinedload(Paquete.destino),
            joinedload(Paquete.categoria),
            joinedload(Paquete.hoteles),
        )
        .filter(Categoria.slug == slug)
        .filter(Paquete.estado == True)
        .filter(Paquete.deleted_at == None)
        .all()
    )

def get_categoria_by_slug(db: Session, slug: str):
    return db.query(Categoria).filter(Categoria.slug == slug).first()

def create_paquete(db: Session, paquete: PaqueteCreate):
    db_paquete = Paquete(
        destino_id=paquete.destino_id,
        categoria_id=paquete.categoria_id,
        titulo_subtitulo=paquete.titulo_subtitulo,
        fecha_salida=paquete.fecha_salida,
        fecha_regreso=paquete.fecha_regreso,
        duracion_dias=paquete.duracion_dias,
        duracion_noches=paquete.duracion_noches,
        precio_base=paquete.precio_base,
        estado=paquete.estado,
        imagen_url=paquete.imagen_url,
        regimen=paquete.regimen,
        gastos_reserva=paquete.gastos_reserva,
        salidas_diarias=paquete.salidas_diarias,
    )
    
    # Handle relationships M2M manually before commit
    db_paquete.hoteles = db.query(Hotel).filter(Hotel.id.in_(paquete.hotel_ids)).all()
    db_paquete.transportes = db.query(Transporte).filter(Transporte.id.in_(paquete.transporte_ids)).all()
    db_paquete.servicios = db.query(Servicio).filter(Servicio.id.in_(paquete.servicio_ids)).all()
    db_paquete.puntos_ascenso = db.query(PuntoAscenso).filter(PuntoAscenso.id.in_(paquete.punto_ascenso_ids)).all()
    
    db.add(db_paquete)
    db.commit()
    db.refresh(db_paquete)
    return db_paquete

