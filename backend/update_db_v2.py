from sqlalchemy import text
from app.db.session import engine

def update_schema():
    with engine.begin() as conn:
        # Obtener columnas actuales
        res = conn.execute(text("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'paquetes'"))
        current_cols = [r[0] for r in res.fetchall()]
        print(f"Columnas actuales: {current_cols}")
        
        if 'aereo_horario_salida_hasta' not in current_cols:
            conn.execute(text("ALTER TABLE paquetes ADD COLUMN aereo_horario_salida_hasta VARCHAR(100) NULL"))
            print('Columna aereo_horario_salida_hasta añadida.')
        else:
            print('Columna aereo_horario_salida_hasta ya existe.')

if __name__ == "__main__":
    update_schema()
