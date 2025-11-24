"""add_customers_vehicles_invoices_tables

Revision ID: a4665f343bb1
Revises: c34e657f37b6
Create Date: 2025-11-21

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'a4665f343bb1'
down_revision = 'c34e657f37b6'
branch_labels = None
depends_on = None


def upgrade():
    # Create customers table
    op.create_table('customers',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('tenant_id', sa.UUID(), nullable=False),
        sa.Column('name', sa.String(200), nullable=False),
        sa.Column('email', sa.String(255), nullable=True),
        sa.Column('phone', sa.String(20), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['tenant_id'], ['tenants.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_customers_tenant_id', 'customers', ['tenant_id'])
    
    # Create vehicles table
    op.create_table('vehicles',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('tenant_id', sa.UUID(), nullable=False),
        sa.Column('customer_id', sa.UUID(), nullable=True),
        sa.Column('registration_number', sa.String(20), nullable=False),
        sa.Column('make', sa.String(100), nullable=True),
        sa.Column('model', sa.String(100), nullable=True),
        sa.Column('year', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['tenant_id'], ['tenants.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['customer_id'], ['customers.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_vehicles_tenant_id', 'vehicles', ['tenant_id'])
    op.create_index('ix_vehicles_customer_id', 'vehicles', ['customer_id'])
    
    # Create invoices table
    op.create_table('invoices',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('tenant_id', sa.UUID(), nullable=False),
        sa.Column('customer_id', sa.UUID(), nullable=True),
        sa.Column('vehicle_id', sa.UUID(), nullable=True),
        sa.Column('number', sa.String(32), nullable=False),
        sa.Column('total_amount', sa.Numeric(12, 2), nullable=False, server_default='0'),
        sa.Column('status', sa.String(24), nullable=False, server_default='draft'),
        sa.Column('issued_at', sa.DateTime(), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['tenant_id'], ['tenants.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['customer_id'], ['customers.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['vehicle_id'], ['vehicles.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_invoices_tenant_id', 'invoices', ['tenant_id'])
    op.create_index('ix_invoices_customer_id', 'invoices', ['customer_id'])
    op.create_index('ix_invoices_vehicle_id', 'invoices', ['vehicle_id'])
    op.create_index('ix_invoices_number', 'invoices', ['number'], unique=True)


def downgrade():
    op.drop_index('ix_invoices_number', table_name='invoices')
    op.drop_index('ix_invoices_vehicle_id', table_name='invoices')
    op.drop_index('ix_invoices_customer_id', table_name='invoices')
    op.drop_index('ix_invoices_tenant_id', table_name='invoices')
    op.drop_table('invoices')
    
    op.drop_index('ix_vehicles_customer_id', table_name='vehicles')
    op.drop_index('ix_vehicles_tenant_id', table_name='vehicles')
    op.drop_table('vehicles')
    
    op.drop_index('ix_customers_tenant_id', table_name='customers')
    op.drop_table('customers')
