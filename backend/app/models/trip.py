from datetime import date as DateType, datetime
from enum import Enum
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class TravelStyleEnum(str, Enum):
    SOLO = "solo"
    COUPLE = "couple"
    FAMILY = "family"
    FRIENDS = "friends"
    BUSINESS = "business"


class BudgetTierEnum(str, Enum):
    BUDGET = "budget"
    MODERATE = "moderate"
    LUXURY = "luxury"
    ULTRA_LUXURY = "ultra_luxury"


class PacingEnum(str, Enum):
    RELAXED = "relaxed"
    BALANCED = "balanced"
    PACKED = "packed"


class ActivityCategoryEnum(str, Enum):
    SIGHTSEEING = "sightseeing"
    DINING = "dining"
    CULTURE = "culture"
    NATURE = "nature"
    ADVENTURE = "adventure"
    RELAXATION = "relaxation"
    NIGHTLIFE = "nightlife"
    SHOPPING = "shopping"


class Activity(BaseModel):
    id: str = Field(description="Unique activity identifier (e.g. act_1_1)")
    title: str = Field(description="Name of attraction or activity")
    description: str = Field(description="Detailed description with local insights")
    time_slot: str = Field(description="morning, afternoon, or evening")
    time_window: str = Field(description="e.g. 09:30 AM - 12:00 PM")
    duration_hours: float = Field(default=2.0)
    category: ActivityCategoryEnum = Field(default=ActivityCategoryEnum.SIGHTSEEING)
    location_name: str = Field(description="Specific venue or landmark name")
    address: Optional[str] = None
    estimated_cost_usd: float = Field(default=0.0)
    booking_required: bool = False
    booking_url: Optional[str] = None
    insider_tip: Optional[str] = None
    transit_from_previous: Optional[str] = None


class DiningRecommendation(BaseModel):
    id: str
    meal_type: str = Field(description="breakfast, lunch, or dinner")
    restaurant_name: str
    cuisine: str
    price_range: str = Field(description="$, $$, $$$, or $$$$")
    estimated_cost_usd: float
    recommended_dish: str
    neighborhood: str
    reservation_advised: bool = False
    vibe: str


class AccommodationRecommendation(BaseModel):
    id: str
    name: str
    property_type: str = Field(description="Boutique Hotel, Luxury Resort, Eco-Lodge, Central Apartment, Hostel")
    tier: BudgetTierEnum
    price_per_night_usd: float
    total_stay_cost_usd: float
    location_area: str
    highlights: List[str] = []
    best_for: str


class LogisticsSummary(BaseModel):
    arrival_transfer_tip: str
    primary_transport_mode: str
    transit_pass_recommendation: Optional[str] = None
    daily_transit_cost_usd: float
    general_safety_and_currency_tips: List[str] = []


class CostBreakdown(BaseModel):
    activities_total_usd: float
    dining_total_usd: float
    accommodation_total_usd: float
    local_transport_total_usd: float
    grand_total_usd: float
    cost_per_person_usd: float
    currency: str = "USD"


class ItineraryDay(BaseModel):
    day_number: int
    date: Optional[str] = None
    title: str = Field(description="Theme/headline for the day (e.g. Historic Temples & Riverside Twilight)")
    area_focus: str = Field(description="Neighborhood or district visited")
    morning_summary: str
    afternoon_summary: str
    evening_summary: str
    activities: List[Activity]
    dining: List[DiningRecommendation]
    day_total_cost_usd: float
    route_efficiency_note: str


class TripRequest(BaseModel):
    destination: str = Field(example="Kyoto, Japan")
    origin_city: Optional[str] = Field(default=None, example="San Francisco, USA")
    duration_days: int = Field(default=3, ge=1, le=14)
    start_date: Optional[str] = Field(default="2026-11-10")
    travel_style: TravelStyleEnum = Field(default=TravelStyleEnum.SOLO)
    group_size: int = Field(default=1, ge=1, le=20)
    budget_tier: BudgetTierEnum = Field(default=BudgetTierEnum.MODERATE)
    interests: List[str] = Field(default=["sightseeing", "food", "culture"])
    pacing: PacingEnum = Field(default=PacingEnum.BALANCED)
    dietary_preferences: Optional[List[str]] = Field(default=[])
    mobility_notes: Optional[str] = None
    special_notes: Optional[str] = None
    preset_scenario: Optional[str] = Field(default=None, description="solo_weekend, couple_romantic, group_adventure")


class TripResponse(BaseModel):
    id: str
    user_id: Optional[str] = "demo-user-1"
    title: str
    destination: str
    duration_days: int
    travel_style: TravelStyleEnum
    group_size: int
    budget_tier: BudgetTierEnum
    pacing: PacingEnum
    summary: str
    accommodation: AccommodationRecommendation
    logistics: LogisticsSummary
    cost_breakdown: CostBreakdown
    days: List[ItineraryDay]
    created_at: datetime = Field(default_factory=datetime.utcnow)
    share_token: Optional[str] = None


class DayRegenerationRequest(BaseModel):
    day_number: int
    prompt_adjustment: str = Field(description="User instruction for change, e.g. 'More outdoor scenic spots and less crowded cafes'")
    budget_override: Optional[float] = None
    pacing_override: Optional[PacingEnum] = None


class ActivitySwapRequest(BaseModel):
    day_number: int
    activity_id: str
    preferred_category: Optional[ActivityCategoryEnum] = None
    user_feedback: Optional[str] = "Find an alternative closer to nature with lower entrance fee"
