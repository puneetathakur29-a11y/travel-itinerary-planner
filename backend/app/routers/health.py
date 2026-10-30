from fastapi import APIRouter
from app.core.config import settings
from app.services.supabase_service import supabase_service
from app.services.ai_planner import ai_planner

router = APIRouter(tags=["Health"])


@router.get("/health")
async def health_check():
    """Health check endpoint indicating AI provider status and database connectivity."""
    return {
        "status": "online",
        "service": settings.PROJECT_NAME,
        "environment": settings.ENVIRONMENT,
        "supabase_connected": supabase_service.client is not None,
        "gemini_active": ai_planner.gemini_model is not None,
        "openai_active": ai_planner.openai_client is not None,
        "active_ai_engine": (
            "Google Gemini 1.5 Pro" if ai_planner.gemini_model else
            ("OpenAI GPT-4o" if ai_planner.openai_client else "WanderLoom Intelligent Heuristic Engine (Ready & Deterministic)")
        )
    }
