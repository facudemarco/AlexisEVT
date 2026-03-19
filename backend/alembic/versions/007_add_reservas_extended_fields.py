"""add extended fields to reservas and create pasajeros table

Revision ID: 007
Revises: 006
Create Date: 2026-03-19
"""
from alembic import op
import sqlalchemy as sa

revision = '007'
down_revision = '006'
branch_labels = None
depends_on = None


def _col_exists(table, col):
    from alembic import op as _op
    from sqlalchemy import inspect, engine_from_config
    bind = _op.get_bind()
    insp = inspect(bind)
    cols = [c['name'] for c in insp.get_columns(table)]
    return col in cols


def _table_exists(table):
    from alembic import op as _op
    from sqlalchemy import inspect
    bind = _op.get_bind()
    insp = inspect(bind)
    return table in insp.get_table_names()


def upgrade():
    # Extend reservas table
    with op.batch_alter_table('reservas') as batch_op:
        if not _col_exists('reservas', 'cliente_nombre'):
            batch_op.add_column(sa.Column('cliente_nombre', sa.String(255), nullable=True))
        if not _col_exists('reservas', 'cliente_email'):
            batch_op.add_column(sa.Column('cliente_email', sa.String(255), nullable=True))
        if not _col_exists('reservas', 'cliente_telefono'):
            batch_op.add_column(sa.Column('cliente_telefono', sa.String(50), nullable=True))
        if not _col_exists('reservas', 'motivo_rechazo'):
            batch_op.add_column(sa.Column('motivo_rechazo', sa.Text(), nullable=True))

    # Create pasajeros table only if it doesn't exist
    if not _table_exists('pasajeros'):
        op.create_table(
            'pasajeros',
            sa.Column('id', sa.Integer(), primary_key=True, index=True),
            sa.Column('reserva_id', sa.Integer(), sa.ForeignKey('reservas.id', ondelete='CASCADE'), nullable=True),
            sa.Column('nombre', sa.String(255), nullable=False),
            sa.Column('apellido', sa.String(255), nullable=False),
            sa.Column('dni', sa.String(20), nullable=True),
            sa.Column('fecha_nacimiento', sa.Date(), nullable=True),
            sa.Column('telefono', sa.String(50), nullable=True),
        )


def downgrade():
    op.drop_table('pasajeros')

    with op.batch_alter_table('reservas') as batch_op:
        batch_op.drop_column('motivo_rechazo')
        batch_op.drop_column('cliente_telefono')
        batch_op.drop_column('cliente_email')
        batch_op.drop_column('cliente_nombre')
