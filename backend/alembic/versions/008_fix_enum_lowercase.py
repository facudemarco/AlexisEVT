"""fix enum lowercase values for userrole and reservastatus

Revision ID: 008
Revises: 007
Create Date: 2026-03-27

Convierte los valores del ENUM en MySQL de mayúsculas (ADMIN, VENDEDOR)
a los valores correctos del modelo Python ('admin', 'vendedor').
Solo aplica en MySQL; en SQLite los ENUMs son VARCHAR y no requieren ALTER.
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mysql

revision = '008'
down_revision = '007'
branch_labels = None
depends_on = None


def _is_mysql(connection) -> bool:
    return connection.dialect.name == "mysql"


def upgrade() -> None:
    connection = op.get_bind()
    if not _is_mysql(connection):
        return

    # ── users.rol ──────────────────────────────────────────────────────────────
    # 1. Convertir la columna temporalmente a VARCHAR para poder editar los datos
    op.alter_column(
        "users", "rol",
        existing_type=mysql.ENUM("ADMIN", "VENDEDOR"),
        type_=sa.String(50),
        existing_nullable=False,
    )
    # 2. Actualizar los valores existentes
    connection.execute(sa.text("UPDATE users SET rol = 'admin'    WHERE rol = 'ADMIN'"))
    connection.execute(sa.text("UPDATE users SET rol = 'vendedor' WHERE rol = 'VENDEDOR'"))
    # 3. Volver al ENUM con los valores correctos
    op.alter_column(
        "users", "rol",
        existing_type=sa.String(50),
        type_=mysql.ENUM("admin", "vendedor"),
        existing_nullable=False,
    )

    # ── reservas.estado_reserva ────────────────────────────────────────────────
    # Los valores de ReservaStatus ya son mixtos ('Pendiente','Aprobada','Rechazada')
    # pero si el ENUM fue creado con mayúsculas ('PENDIENTE',...) los corregimos.
    # Esta migración es segura si los valores ya son correctos (no hace nada).
    op.alter_column(
        "reservas", "estado_reserva",
        existing_type=mysql.ENUM("PENDIENTE", "APROBADA", "RECHAZADA", "Pendiente", "Aprobada", "Rechazada"),
        type_=sa.String(50),
        existing_nullable=True,
    )
    connection.execute(sa.text("UPDATE reservas SET estado_reserva = 'Pendiente'  WHERE estado_reserva IN ('PENDIENTE', 'pendiente')"))
    connection.execute(sa.text("UPDATE reservas SET estado_reserva = 'Aprobada'   WHERE estado_reserva IN ('APROBADA',  'aprobada')"))
    connection.execute(sa.text("UPDATE reservas SET estado_reserva = 'Rechazada'  WHERE estado_reserva IN ('RECHAZADA', 'rechazada')"))
    op.alter_column(
        "reservas", "estado_reserva",
        existing_type=sa.String(50),
        type_=mysql.ENUM("Pendiente", "Aprobada", "Rechazada"),
        existing_nullable=True,
    )


def downgrade() -> None:
    # No se revierte: bajar a mayúsculas rompería el app
    pass
