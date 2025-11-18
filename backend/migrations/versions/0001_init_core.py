
"""init core tables"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '0001'
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    op.create_table('tenants',
        sa.Column('id', sa.String(length=64), primary_key=True),
        sa.Column('name', sa.String(length=200), nullable=False),
        sa.Column('code', sa.String(length=64), nullable=False, unique=True),
    )
    op.create_table('users',
        sa.Column('id', sa.String(length=36), primary_key=True),
        sa.Column('tenant_id', sa.String(length=64), sa.ForeignKey('tenants.id', ondelete='CASCADE'), index=True),
        sa.Column('email', sa.String(length=255), unique=True, index=True),
        sa.Column('username', sa.String(length=100)),
        sa.Column('role', sa.String(length=32), default='user'),
        sa.Column('password_hash', sa.String(length=255)),
    )
    op.create_table('customers',
        sa.Column('id', sa.String(length=36), primary_key=True),
        sa.Column('tenant_id', sa.String(length=64), sa.ForeignKey('tenants.id', ondelete='CASCADE'), index=True),
        sa.Column('name', sa.String(length=200), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=True),
        sa.Column('phone', sa.String(length=32), nullable=True),
        sa.Column('created_at', sa.DateTime()),
        sa.Column('updated_at', sa.DateTime()),
    )
    op.create_table('vehicles',
        sa.Column('id', sa.String(length=36), primary_key=True),
        sa.Column('tenant_id', sa.String(length=64), sa.ForeignKey('tenants.id', ondelete='CASCADE'), index=True),
        sa.Column('customer_id', sa.String(length=36), sa.ForeignKey('customers.id', ondelete='CASCADE'), index=True),
        sa.Column('make', sa.String(length=100)),
        sa.Column('model', sa.String(length=100)),
        sa.Column('year', sa.Integer()),
        sa.Column('vin', sa.String(length=64)),
        sa.Column('active', sa.Boolean(), default=True),
        sa.Column('created_at', sa.DateTime()),
        sa.Column('updated_at', sa.DateTime()),
    )
    op.create_table('invoices',
        sa.Column('id', sa.String(length=36), primary_key=True),
        sa.Column('tenant_id', sa.String(length=64), sa.ForeignKey('tenants.id', ondelete='CASCADE'), index=True),
        sa.Column('customer_id', sa.String(length=36), sa.ForeignKey('customers.id', ondelete='SET NULL'), nullable=True, index=True),
        sa.Column('vehicle_id', sa.String(length=36), sa.ForeignKey('vehicles.id', ondelete='SET NULL'), nullable=True, index=True),
        sa.Column('number', sa.String(length=32), unique=True, index=True),
        sa.Column('total_amount', sa.Numeric(12,2), default=0),
        sa.Column('status', sa.String(length=24), default='draft'),
        sa.Column('issued_at', sa.DateTime()),
        sa.Column('updated_at', sa.DateTime()),
    )

def downgrade():
    op.drop_table('invoices')
    op.drop_table('vehicles')
    op.drop_table('customers')
    op.drop_table('users')
    op.drop_table('tenants')
