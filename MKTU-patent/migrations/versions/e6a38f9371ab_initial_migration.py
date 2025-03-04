"""Initial migration

Revision ID: e6a38f9371ab
Revises: 
Create Date: 2025-02-13 16:44:33.571021

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'e6a38f9371ab'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('item',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('code', sa.String(length=10), nullable=False),
    sa.Column('name_ru', sa.String(length=255), nullable=False),
    sa.Column('name_en', sa.String(length=255), nullable=False),
    sa.Column('name_fr', sa.String(length=255), nullable=False),
    sa.Column('name_ky', sa.String(length=255), nullable=False),
    sa.Column('class_code', sa.String(length=10), nullable=False),
    sa.Column('is_nice', sa.Boolean(), nullable=True),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('code')
    )
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table('item')
    # ### end Alembic commands ###
