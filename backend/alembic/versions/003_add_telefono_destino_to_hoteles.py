"""add telefono and destino_id to hoteles

Revision ID: 003
Revises: 002
Create Date: 2026-03-19
"""
from alembic import op
import sqlalchemy as sa

revision = '003'
down_revision = '002'
branch_labels = None
depends_on = None


def upgrade():
    with op.batch_alter_table('hoteles') as batch_op:
        batch_op.add_column(sa.Column('telefono', sa.String(50), nullable=True))
        batch_op.add_column(sa.Column('destino_id', sa.Integer(), nullable=True))


def downgrade():
    with op.batch_alter_table('hoteles') as batch_op:
        batch_op.drop_column('destino_id')
        batch_op.drop_column('telefono')
