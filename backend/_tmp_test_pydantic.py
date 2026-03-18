from app.db.session import SessionLocal
from app.crud.crud_package import get_paquetes_by_category_slug
from app.schemas.package import Paquete

db = SessionLocal()
try:
    paquetes = get_paquetes_by_category_slug(db, slug="miniturismo")
    for p in paquetes:
        pydantic_p = Paquete.model_validate(p)
except Exception as e:
    import traceback
    with open('_error.log', 'w') as f:
        traceback.print_exc(file=f)
finally:
    db.close()
