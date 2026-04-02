from sqlalchemy import text
from app.db.session import engine

def update_schema():
    with engine.begin() as conn:
        # Obtener columnas actuales
        res = conn.execute(text("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'paquetes'"))
        current_cols = [r[0] for r in res.fetchall()]
        print(f"Columnas actuales: {current_cols}")
        
        if 'aereo_incluido' not in current_cols:
            conn.execute(text("ALTER TABLE paquetes ADD COLUMN aereo_incluido BOOLEAN DEFAULT FALSE"))
            print('Columna aereo_incluido añadida.')
            
        if 'aereo_aerolinea_id' not in current_cols:
            conn.execute(text("ALTER TABLE paquetes ADD COLUMN aereo_aerolinea_id INTEGER NULL"))
            print('Columna aereo_aerolinea_id añadida.')
            
        if 'aereo_tipo_servicio' not in current_cols:
            conn.execute(text("ALTER TABLE paquetes ADD COLUMN aereo_tipo_servicio VARCHAR(255) NULL"))
            print('Columna aereo_tipo_servicio añadida.')
            
        if 'aereo_horario_salida' not in current_cols:
            conn.execute(text("ALTER TABLE paquetes ADD COLUMN aereo_horario_salida VARCHAR(255) NULL"))
            print('Columna aereo_horario_salida añadida.')
            
        if 'aereo_horario_regreso' not in current_cols:
            conn.execute(text("ALTER TABLE paquetes ADD COLUMN aereo_horario_regreso VARCHAR(255) NULL"))
            print('Columna aereo_horario_regreso añadida.')

if __name__ == "__main__":
    update_schema()
