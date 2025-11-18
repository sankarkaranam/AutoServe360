from alembic import context
from sqlalchemy import engine_from_config, pool
from logging.config import fileConfig

# Import your Base and model modules so Alembic can see them
from apps.core.db import Base
from apps.services.dealers import models as dealer_models
from apps.services.auth import models as auth_models
# add other modules when you build them

# this is used by Alembic for autogenerate
target_metadata = Base.metadata
