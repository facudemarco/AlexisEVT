from sqlalchemy import text
from app.db.session import engine

def update_schema():
    with engine.begin() as conn:
        # Obtener columnas actuales de 'reservas'
        res = conn.execute(text("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'reservas'"))
        current_cols = [r[0] for r in res.fetchall()]
        print(f"Columnas en 'reservas': {current_cols}")
        
        if 'fecha_salida' not in current_cols:
            conn.execute(text("ALTER TABLE reservas ADD COLUMN fecha_salida DATE NULL"))
            print('Columna fecha_salida añadida a tabla reservas.')
        else:
            print('Columna fecha_salida ya existe en tabla reservas.')

if __name__ == "__main__":
    update_schema()
