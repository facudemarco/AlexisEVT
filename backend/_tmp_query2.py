from app.db.session import engine
from sqlalchemy import text

tables = ['transportes', 'servicios', 'paquete_transporte', 'paquete_servicio', 'paquetes_hoteles', 'puntos_ascenso', 'paquetes_puntoascenso']

with engine.connect() as conn:
    for t in tables:
        try:
            result = conn.execute(text(f"DESCRIBE {t}"))
            print(f"\n=== {t} ===")
            for row in result:
                print(f"{row[0]} | {row[1]} | {row[2]}")
        except Exception as e:
            print(f"\n=== {t} ===\nExists but could not describe or does not exist: {e}")
