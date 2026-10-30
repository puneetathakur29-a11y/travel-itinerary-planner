from fastapi import APIRouter
from app.models.trip import TripRequest, TripResponse, TravelStyleEnum, BudgetTierEnum, PacingEnum
from app.services.ai_planner import ai_planner
from app.services.supabase_service import supabase_service

router = APIRouter(prefix="/scenarios", tags=["Scenarios"])


@router.get("/solo-weekend", response_model=TripResponse)
async def get_solo_weekend_scenario():
    """
    Scenario 1: Solo Traveler Planning a Weekend Getaway.
    Destination: Kyoto, Japan (or Lisbon, Portugal).
    Budget: Budget-conscious. Pacing: Balanced. Focus: Food, Sightseeing, Culture.
    """
    req = TripRequest(
        destination="Kyoto, Japan",
        duration_days=2,
        travel_style=TravelStyleEnum.SOLO,
        group_size=1,
        budget_tier=BudgetTierEnum.BUDGET,
        pacing=PacingEnum.BALANCED,
        interests=["food", "sightseeing", "culture", "photography"],
        preset_scenario="solo_weekend"
    )
    trip = await ai_planner.generate_itinerary(req)
    await supabase_service.save_trip(trip)
    return trip


@router.get("/couple-vacation", response_model=TripResponse)
async def get_couple_vacation_scenario():
    """
    Scenario 2: Couple Planning a Personalized Vacation.
    Destination: Amalfi Coast, Italy.
    Budget: Luxury. Pacing: Relaxed. Focus: Scenic spots, romantic dining, boutique stays.
    """
    req = TripRequest(
        destination="Amalfi Coast, Italy",
        duration_days=3,
        travel_style=TravelStyleEnum.COUPLE,
        group_size=2,
        budget_tier=BudgetTierEnum.LUXURY,
        pacing=PacingEnum.RELAXED,
        interests=["romantic dining", "scenic viewpoints", "relaxation", "wine tasting"],
        preset_scenario="couple_romantic"
    )
    trip = await ai_planner.generate_itinerary(req)
    await supabase_service.save_trip(trip)
    return trip


@router.get("/group-adventure", response_model=TripResponse)
async def get_group_adventure_scenario():
    """
    Scenario 3: Small Group Coordinating a Multi-Day Trip.
    Destination: Arenal & Manuel Antonio, Costa Rica.
    Budget: Moderate. Pacing: Balanced. Focus: Adventure, nature, group dining, logistics.
    """
    req = TripRequest(
        destination="Costa Rica",
        duration_days=4,
        travel_style=TravelStyleEnum.FRIENDS,
        group_size=4,
        budget_tier=BudgetTierEnum.MODERATE,
        pacing=PacingEnum.BALANCED,
        interests=["adventure", "nature", "wildlife", "beach"],
        preset_scenario="group_adventure"
    )
    trip = await ai_planner.generate_itinerary(req)
    await supabase_service.save_trip(trip)
    return trip
