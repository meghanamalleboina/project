import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.api.endpoints import router as api_router
from backend.app.database.session import engine, Base
from backend.app.services.data_service import generate_synthetic_samples

# Create database tables automatically
Base.metadata.create_all(bind=engine)

# Generate synthetic datasets for instant verification and demonstration
generate_synthetic_samples()

app = FastAPI(
    title="NexaDS API",
    description="Automated Data Science and Predictive Analytics Backend",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api")

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "NexaDS Automated Data Science Engine",
        "database": engine.dialect.name
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="127.0.0.1", port=8000, reload=True)
