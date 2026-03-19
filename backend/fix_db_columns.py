"""
Script de emergencia: agrega columnas faltantes directamente en SQLite.
Ejecutar desde /backend con: python fix_db_columns.py
"""
import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "local_dev.db")

def column_exists(cursor, table, column):
    cursor.execute(f"PRAGMA table_info({table})")
    return any(row[1] == column for row in cursor.fetchall())

def add_column_if_missing(cursor, table, column, definition):
    if not column_exists(cursor, table, column):
        cursor.execute(f"ALTER TABLE {table} ADD COLUMN {column} {definition}")
        print(f"  ✓ {table}.{column} agregada")
    else:
        print(f"  — {table}.{column} ya existe")

conn = sqlite3.connect(DB_PATH)
cur = conn.cursor()

print("\n── destinos ──")
add_column_if_missing(cur, "destinos", "sigla", "VARCHAR(20)")
add_column_if_missing(cur, "destinos", "descripcion", "TEXT")
add_column_if_missing(cur, "destinos", "es_combinado", "BOOLEAN NOT NULL DEFAULT 0")
add_column_if_missing(cur, "destinos", "destino_ids", "JSON")

print("\n── transportes ──")
add_column_if_missing(cur, "transportes", "razon_social", "VARCHAR(255)")

print("\n── hoteles ──")
add_column_if_missing(cur, "hoteles", "telefono", "VARCHAR(50)")
add_column_if_missing(cur, "hoteles", "destino_id", "INTEGER")

print("\n── users ──")
add_column_if_missing(cur, "users", "nombre_sistema", "VARCHAR(255)")
add_column_if_missing(cur, "users", "telefono", "VARCHAR(50)")

conn.commit()
conn.close()
print("\n✅ Listo. Reiniciá el servidor.")
