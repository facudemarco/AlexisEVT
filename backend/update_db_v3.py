from sqlalchemy import text
from app.db.session import engine

def update_schema():
    with engine.begin() as conn:
        print("Cambiando tipos de columna en la tabla 'paquetes'...")
        # Alterar horario_salida y horario_regreso de TIME a VARCHAR(100)
        try:
            conn.execute(text("ALTER TABLE paquetes MODIFY COLUMN horario_salida VARCHAR(100) NULL"))
            print("Columna 'horario_salida' modificada a VARCHAR(100).")
        except Exception as e:
            print(f"Error al modificar 'horario_salida': {e}")
            
        try:
            conn.execute(text("ALTER TABLE paquetes MODIFY COLUMN horario_regreso VARCHAR(100) NULL"))
            print("Columna 'horario_regreso' modificada a VARCHAR(100).")
        except Exception as e:
            print(f"Error al modificar 'horario_regreso': {e}")

if __name__ == "__main__":
    update_schema()
