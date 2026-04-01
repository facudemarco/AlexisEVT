"""add liquidaciones, liquidacion_items, pagos tables

Revision ID: 010
Revises: 009
Create Date: 2026-04-01
"""
from alembic import op
import sqlalchemy as sa

revision = '010'
down_revision = '009'
branch_labels = None
depends_on = None


def upgrade():
    bind = op.get_bind()
    insp = sa.inspect(bind)
    existing_tables = insp.get_table_names()

    if "liquidaciones" not in existing_tables:
        op.create_table(
            "liquidaciones",
            sa.Column("id", sa.Integer, primary_key=True, index=True),
            sa.Column("reserva_id", sa.Integer, sa.ForeignKey("reservas.id", ondelete="CASCADE"), unique=True, nullable=False),
            sa.Column("fecha", sa.Date, nullable=False),
            sa.Column("comision_porcentaje", sa.Float, default=15.0, nullable=False),
            sa.Column("notas", sa.String(500), nullable=True),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        )

    if "liquidacion_items" not in existing_tables:
        op.create_table(
            "liquidacion_items",
            sa.Column("id", sa.Integer, primary_key=True, index=True),
            sa.Column("liquidacion_id", sa.Integer, sa.ForeignKey("liquidaciones.id", ondelete="CASCADE"), nullable=False),
            sa.Column("orden", sa.Integer, default=1, nullable=False),
            sa.Column("descripcion", sa.String(255), nullable=False),
            sa.Column("precio", sa.DECIMAL(12, 2), nullable=False),
            sa.Column("cant_pax", sa.Integer, default=1, nullable=False),
            sa.Column("aplica_comision", sa.Boolean, default=True, nullable=False),
        )

    if "pagos" not in existing_tables:
        op.create_table(
            "pagos",
            sa.Column("id", sa.Integer, primary_key=True, index=True),
            sa.Column("liquidacion_id", sa.Integer, sa.ForeignKey("liquidaciones.id", ondelete="CASCADE"), nullable=False),
            sa.Column("fecha", sa.Date, nullable=False),
            sa.Column("monto", sa.DECIMAL(12, 2), nullable=False),
            sa.Column("descripcion", sa.String(255), nullable=True),
        )


def downgrade():
    op.drop_table("pagos")
    op.drop_table("liquidacion_items")
    op.drop_table("liquidaciones")
