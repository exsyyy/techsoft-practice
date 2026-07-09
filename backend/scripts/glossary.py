import sys
from pathlib import Path

sys.path.append(str(Path(__file__).parent.parent))

from app.core.database import SessionLocal


if __name__ == "__main__":
    update_glossary()

    # RUN 
    # docker exec -it cases_backend python scripts/glossary.py