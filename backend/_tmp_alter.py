from app.db.session import engine
from sqlalchemy import text

alters = [
    "ALTER TABLE paquetes ADD COLUMN periodo VARCHAR(100) DEFAULT NULL",
    "ALTER TABLE paquetes ADD COLUMN moneda VARCHAR(10) DEFAULT 'ARS'",
    "ALTER TABLE paquetes ADD COLUMN adicionales_json JSON DEFAULT NULL",
    "ALTER TABLE paquetes ADD COLUMN transporte_incluido BOOLEAN DEFAULT 0",
    "ALTER TABLE paquetes ADD COLUMN transporte_empresa VARCHAR(150) DEFAULT NULL",
    "ALTER TABLE paquetes ADD COLUMN transporte_tipo VARCHAR(100) DEFAULT NULL",
    "ALTER TABLE paquetes ADD COLUMN horario_salida TIME DEFAULT NULL",
    "ALTER TABLE paquetes ADD COLUMN horario_regreso TIME DEFAULT NULL",
    "ALTER TABLE paquetes ADD COLUMN alojamiento_incluido BOOLEAN DEFAULT 1",
    "ALTER TABLE paquetes ADD COLUMN alojamiento_noches INT DEFAULT NULL"
]

with engine.begin() as conn:
    for sql in alters:
        try:
            conn.execute(text(sql))
            print(f"SUCCESS: {sql}")
        except Exception as e:
            msg = str(e)
            if "Duplicate column name" in msg:
                print(f"SKIPPED (Already exists): {sql}")
            else:
                print(f"ERROR executing {sql}: {e}")
