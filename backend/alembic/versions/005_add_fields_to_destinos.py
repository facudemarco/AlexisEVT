"""add sigla, descripcion, es_combinado, destino_ids to destinos

Revision ID: 005
Revises: 004
Create Date: 2026-03-19
"""
from alembic import op
import sqlalchemy as sa

revision = '005'
down_revision = '004'
branch_labels = None
depends_on = None


def upgrade():
    with op.batch_alter_table('destinos') as batch_op:
        batch_op.add_column(sa.Column('sigla', sa.String(20), nullable=True))
        batch_op.add_column(sa.Column('descripcion', sa.Text(), nullable=True))
        batch_op.add_column(sa.Column('es_combinado', sa.Boolean(), nullable=False, server_default='0'))
        batch_op.add_column(sa.Column('destino_ids', sa.JSON(), nullable=True))
        # Eliminar constraint unique de nombre (ahora puede haber combinados con mismo nombre)
        batch_op.drop_constraint('uq_destinos_nombre', type_='unique') if False else None


def downgrade():
    with op.batch_alter_table('destinos') as batch_op:
        batch_op.drop_column('destino_ids')
        batch_op.drop_column('es_combinado')
        batch_op.drop_column('descripcion')
        batch_op.drop_column('sigla')
