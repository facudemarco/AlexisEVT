from app.db.session import SessionLocal
from app.crud.crud_package import get_paquetes_by_category_slug

db = SessionLocal()
try:
    print("Testing CRUD get_paquetes_by_category_slug...")
    paquetes = get_paquetes_by_category_slug(db, slug="miniturismo")
    print(f"Success! Found {len(paquetes)} paquetes.")
    for p in paquetes:
        print(f"Paquete ID: {p.id}, Titulo: {p.titulo_subtitulo}")
except Exception as e:
    import traceback
    traceback.print_exc()
finally:
    db.close()
