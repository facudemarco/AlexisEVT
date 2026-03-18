from sqlalchemy import create_engine
from app.core.config import settings

print(f"URL from settings: {settings.DATABASE_URL}")
engine = create_engine(settings.DATABASE_URL)
try:
    with engine.connect() as conn:
        print("Successfully connected!")
except Exception as e:
    import traceback
    traceback.print_exc()
