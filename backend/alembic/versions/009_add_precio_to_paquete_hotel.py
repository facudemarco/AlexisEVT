"""add precio to paquete_hotel

Revision ID: 009
Revises: 008
Create Date: 2026-03-30
"""
from alembic import op
import sqlalchemy as sa

revision = '009'
down_revision = '008'
branch_labels = None
depends_on = None


def upgrade():
    bind = op.get_bind()
    insp = sa.inspect(bind)
    cols = [c["name"] for c in insp.get_columns("paquete_hotel")]
    if "precio" not in cols:
        op.add_column("paquete_hotel", sa.Column("precio", sa.DECIMAL(10, 2), nullable=True))


def downgrade():
    op.drop_column("paquete_hotel", "precio")
