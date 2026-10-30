import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.routers import trips, scenarios, health

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("wanderloom")

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Full-stack AI-powered Personalized Travel Itinerary Planner backend built with FastAPI & Supabase",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(health.router, prefix="/api")
app.include_router(trips.router, prefix="/api")
app.include_router(scenarios.router, prefix="/api")


@app.get("/")
async def root():
    return {
        "message": "Welcome to WanderLoom Personalized Travel Itinerary Planner API",
        "documentation": "/docs",
        "health": "/api/health",
        "endpoints": {
            "generate_trip": "POST /api/trips/generate",
            "list_trips": "GET /api/trips",
            "regenerate_day": "POST /api/trips/{trip_id}/regenerate-day",
            "swap_activity": "POST /api/trips/{trip_id}/swap-activity",
            "scenario_solo_weekend": "GET /api/scenarios/solo-weekend",
            "scenario_couple_vacation": "GET /api/scenarios/couple-vacation",
            "scenario_group_adventure": "GET /api/scenarios/group-adventure"
        }
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=True)
