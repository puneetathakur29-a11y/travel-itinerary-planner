import pytest
from app.models.trip import TripRequest, TravelStyleEnum, BudgetTierEnum, PacingEnum
from app.services.ai_planner import ai_planner


@pytest.mark.asyncio
async def test_solo_weekend_scenario():
    req = TripRequest(
        destination="Kyoto, Japan",
        duration_days=2,
        travel_style=TravelStyleEnum.SOLO,
        group_size=1,
        budget_tier=BudgetTierEnum.BUDGET,
        pacing=PacingEnum.BALANCED,
        interests=["food", "sightseeing"],
        preset_scenario="solo_weekend"
    )
    trip = await ai_planner.generate_itinerary(req)
    assert trip.travel_style == TravelStyleEnum.SOLO
    assert trip.duration_days == 2
    assert len(trip.days) == 2
    assert trip.cost_breakdown.grand_total_usd > 0
    assert trip.accommodation.name is not None
    assert len(trip.days[0].activities) > 0


@pytest.mark.asyncio
async def test_couple_romantic_scenario():
    req = TripRequest(
        destination="Amalfi Coast, Italy",
        duration_days=3,
        travel_style=TravelStyleEnum.COUPLE,
        group_size=2,
        budget_tier=BudgetTierEnum.LUXURY,
        pacing=PacingEnum.RELAXED,
        interests=["romantic dining", "scenic"],
        preset_scenario="couple_romantic"
    )
    trip = await ai_planner.generate_itinerary(req)
    assert trip.travel_style == TravelStyleEnum.COUPLE
    assert trip.group_size == 2
    assert len(trip.days) == 3
    assert trip.cost_breakdown.cost_per_person_usd == trip.cost_breakdown.grand_total_usd / 2


@pytest.mark.asyncio
async def test_group_adventure_scenario():
    req = TripRequest(
        destination="Costa Rica",
        duration_days=4,
        travel_style=TravelStyleEnum.FRIENDS,
        group_size=4,
        budget_tier=BudgetTierEnum.MODERATE,
        pacing=PacingEnum.BALANCED,
        interests=["adventure", "nature"],
        preset_scenario="group_adventure"
    )
    trip = await ai_planner.generate_itinerary(req)
    assert trip.group_size == 4
    assert len(trip.days) == 4
    assert trip.accommodation.property_type is not None


@pytest.mark.asyncio
async def test_day_regeneration():
    req = TripRequest(
        destination="Kyoto, Japan",
        duration_days=2,
        travel_style=TravelStyleEnum.SOLO,
        group_size=1,
        budget_tier=BudgetTierEnum.BUDGET
    )
    trip = await ai_planner.generate_itinerary(req)
    revised_day = await ai_planner.regenerate_single_day(trip, 1, "More quiet nature and scenic bamboo")
    assert revised_day.day_number == 1
    assert len(revised_day.activities) > 0
