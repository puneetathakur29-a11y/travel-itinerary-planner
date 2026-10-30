# WanderLoom Architecture & Prompt Engineering Specification

## 1. Core Planning & Route Clustering Heuristics

Traditional travel itinerary tools suffer from a major flaw: they recommend top attractions in isolation, causing travelers to criss-cross large metropolises (e.g. from northern Kyoto to southern Fushimi and back 3 times in a day).

WanderLoom implements an **Urban Logistics Heuristic**:
1. **Neighborhood Contiguity (Radial Clustering):**
   - Sights scheduled for a single day must fall within a maximum transit radius of 1.5–2.5 km (or direct single-train connection under 20 minutes).
2. **Energy Curve Optimization:**
   - **Morning (07:00 – 11:30):** High-footprint sightseeing, dawn hikes, uncrowded temple verandas before tour groups arrive.
   - **Midday (12:00 – 14:00):** Regional culinary immersion (counter ramen, water-taxi cove trattoria, local soda).
   - **Afternoon (14:00 – 17:00):** Cultural or experiential activity (artisan workshops, market strolling, hanging bridges).
   - **Evening (17:30 – 21:00):** Sunset panoramas followed by curated dining and relaxed night strolls.
3. **Pacing Constraints:**
   - **Relaxed:** Max 2 primary activities + leisurely 90-minute meals (ideal for Couples).
   - **Balanced:** 3 well-spaced activities with 30-minute buffers (ideal for Solo travelers and general vacations).
   - **Packed:** 4 timed stops optimizing dawn-to-dusk highlights.

---

## 2. Prompt Engineering System

### System Persona Prompt
```text
You are WanderLoom AI, a world-class Travel Architect and Urban Logistics Specialist.
Your mission is to synthesize hyper-personalized, geographically coherent, and culturally authentic day-by-day travel itineraries.

Core Planning Principles:
1. GEOGRAPHIC CLUSTERING: Never make travelers zig-zag across a metropolis. Group attractions and dining in adjacent neighborhoods.
2. REALISTIC TIME SLOTTING: Allocate realistic transit buffers (minimum 25-45 minutes between distinct locations) and energy curves.
3. BUDGET CONSCIOUSNESS: Match recommended activities, dining, and accommodation tiers strictly to the requested budget level.
4. SCENARIO CUSTOMIZATION:
   - Solo: Walkability, single-diner friendly spots, efficient routes, and zero wasted time.
   - Couple: Romantic ambiance, relaxed pacing, sunset views, boutique stays, and curated dining.
   - Group: Consensus activities, venues accommodating groups, flexible split-bill dining, and group buffer times.
```

### Scenario Directives
- **Solo Weekend Directive:**
  - Fast-action 48-hour structure.
  - Safe, walkable central districts.
  - Counter-style dining (ramen, teppanyaki, bakeries) where solo travelers feel completely natural.
  - Low transit friction (tap-and-go contactless passes).
- **Couple Romantic Vacation Directive:**
  - Unhurried starts (10:00 AM).
  - Private moments: wooden gozzo boats, infinity garden terraces, private limoncello farm tastings.
  - Dining: candlelit atmosphere, scenic cliff terraces, reservation advice included.
- **Small Group Adventure Directive:**
  - Group size: 4-8.
  - Activity balance: outdoor physical adventure (ziplining, white-water rafting) + shared natural relaxation.
  - Lodging: multi-bedroom private eco-villas with shared pools (efficient cost splitting).
  - Logistics: chartered private minibus instead of split taxi coordination.

---

## 3. Pydantic v2 Data Schema

```python
class Activity(BaseModel):
    id: str
    title: str
    description: str
    time_slot: str  # morning, afternoon, evening
    time_window: str  # e.g. 09:30 AM - 12:00 PM
    duration_hours: float
    category: ActivityCategoryEnum
    location_name: str
    estimated_cost_usd: float
    insider_tip: Optional[str]
    transit_from_previous: Optional[str]

class DiningRecommendation(BaseModel):
    meal_type: str  # breakfast, lunch, dinner
    restaurant_name: str
    cuisine: str
    price_range: str  # $, $$, $$$, $$$$
    estimated_cost_usd: float
    recommended_dish: str
    neighborhood: str
    vibe: str

class ItineraryDay(BaseModel):
    day_number: int
    date: str
    title: str
    area_focus: str
    route_efficiency_note: str
    activities: List[Activity]
    dining: List[DiningRecommendation]
    day_total_cost_usd: float

class TripResponse(BaseModel):
    id: str
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
```
