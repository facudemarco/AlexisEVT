from app.db.session import engine
from sqlalchemy import text

with engine.connect() as conn:
    result = conn.execute(text("SHOW TABLES"))
    print("TABLES:")
    for row in result:
        print(row[0])
