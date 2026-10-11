"""Initial owner-scoped research metadata tables.

Revision ID: 0001
Revises:
"""
from alembic import op
from app.db.models import Base
revision = '0001'
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    bind = op.get_bind()
    for table in Base.metadata.sorted_tables:
        table.create(bind, checkfirst=False)

def downgrade():
    bind = op.get_bind()
    for table in reversed(Base.metadata.sorted_tables):
        table.drop(bind, checkfirst=False)
