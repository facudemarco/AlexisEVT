"""add slug to categorias

Revision ID: 002
Revises: 001
Create Date: 2026-03-19

Agrega columna slug a la tabla categorias.
"""
from alembic import op
import sqlalchemy as sa

revision = "002"
down_revision = "001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("categorias", sa.Column("slug", sa.String(100), nullable=True))
    try:
        op.create_unique_constraint("uq_categorias_slug", "categorias", ["slug"])
    except Exception:
        pass  # SQLite ignores some constraint operations


def downgrade() -> None:
    try:
        op.drop_constraint("uq_categorias_slug", "categorias", type_="unique")
    except Exception:
        pass
    op.drop_column("categorias", "slug")
