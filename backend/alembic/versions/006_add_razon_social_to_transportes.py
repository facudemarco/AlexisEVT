"""add razon_social to transportes

Revision ID: 006
Revises: 005
Create Date: 2026-03-19
"""
from alembic import op
import sqlalchemy as sa

revision = '006'
down_revision = '005'
branch_labels = None
depends_on = None


def upgrade():
    with op.batch_alter_table('transportes') as batch_op:
        batch_op.add_column(sa.Column('razon_social', sa.String(255), nullable=True))


def downgrade():
    with op.batch_alter_table('transportes') as batch_op:
        batch_op.drop_column('razon_social')
