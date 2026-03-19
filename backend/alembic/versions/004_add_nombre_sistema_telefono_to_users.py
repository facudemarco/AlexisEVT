"""add nombre_sistema and telefono to users

Revision ID: 004
Revises: 003
Create Date: 2026-03-19
"""
from alembic import op
import sqlalchemy as sa

revision = '004'
down_revision = '003'
branch_labels = None
depends_on = None


def upgrade():
    with op.batch_alter_table('users') as batch_op:
        batch_op.add_column(sa.Column('nombre_sistema', sa.String(255), nullable=True))
        batch_op.add_column(sa.Column('telefono', sa.String(50), nullable=True))


def downgrade():
    with op.batch_alter_table('users') as batch_op:
        batch_op.drop_column('telefono')
        batch_op.drop_column('nombre_sistema')
