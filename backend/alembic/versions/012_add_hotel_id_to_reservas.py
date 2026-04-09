"""add hotel_id to reservas

Revision ID: 012
Revises: 011
Create Date: 2026-04-09
"""
from alembic import op
import sqlalchemy as sa

revision = '012'
down_revision = '011'
branch_labels = None
depends_on = None


def _col_exists(table, col):
    bind = op.get_bind()
    from sqlalchemy import inspect
    insp = inspect(bind)
    cols = [c['name'] for c in insp.get_columns(table)]
    return col in cols


def upgrade():
    with op.batch_alter_table('reservas') as batch_op:
        if not _col_exists('reservas', 'hotel_id'):
            batch_op.add_column(sa.Column('hotel_id', sa.Integer(), sa.ForeignKey('hoteles.id'), nullable=True))


def downgrade():
    with op.batch_alter_table('reservas') as batch_op:
        batch_op.drop_column('hotel_id')
