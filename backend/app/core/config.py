import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent
DATASETS_DIR = BASE_DIR / "datasets"
UPLOADS_DIR = DATASETS_DIR / "uploads"
SAMPLES_DIR = DATASETS_DIR / "samples"
MODELS_DIR = BASE_DIR / "saved_models"
BASELINE_MODELS_DIR = MODELS_DIR / "baseline"
IMPROVED_MODELS_DIR = MODELS_DIR / "improved"
REPORTS_DIR = BASE_DIR / "generated_reports"

# Ensure runtime directories exist
for p in [UPLOADS_DIR, SAMPLES_DIR, BASELINE_MODELS_DIR, IMPROVED_MODELS_DIR, REPORTS_DIR]:
    p.mkdir(parents=True, exist_ok=True)

DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{BASE_DIR / 'nexads.db'}")
API_PREFIX = "/api"
PROJECT_NAME = "NexaDS"
