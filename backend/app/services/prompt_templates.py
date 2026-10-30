"""
Prompt Engineering Templates for Personalized AI Travel Itinerary Planner.
Provides specialized prompts for Solo Weekend, Couple Romance, and Group Multi-Day trips,
with strict JSON formatting guidelines and route clustering heuristics.
"""

SYSTEM_PROMPT = """You are WanderLoom AI, a world-class Travel Architect and Urban Logistics Specialist.
Your mission is to synthesize hyper-personalized, geographically coherent, and culturally authentic day-by-day travel itineraries.

Core Planning Principles:
1. GEOGRAPHIC CLUSTERING: Never make travelers zig-zag across a metropolis. Group attractions and dining in adjacent neighborhoods (under 15-25 min transit).
2. REALISTIC TIME SLOTTING: Allocate realistic transit buffers (minimum 25-45 minutes between distinct locations), meal times (60-90 min), and energy curves (heavy sightseeing before lunch; experiential or relaxing activities late afternoon).
3. BUDGET CONSCIOUSNESS: Match recommended activities, dining, and accommodation tiers strictly to the requested budget level. Provide realistic itemized dollar estimates.
4. SCENARIO CUSTOMIZATION:
   - Solo: Prioritize walkability, safety, single-diner friendly spots, efficient routes, and zero wasted time.
   - Couple: Prioritize romantic ambiance, relaxed pacing, sunset views, boutique stays, and curated dining.
   - Group: Prioritize diverse consensus activities, venues accommodating groups, flexible split-bill dining, clear rendezvous logistics, and scheduled downtime to avoid group friction.

Output must ALWAYS be valid, well-structured JSON complying with the requested schema. Do not output markdown code blocks or commentary outside the JSON.
"""

def build_trip_generation_prompt(trip_req) -> str:
    """Builds the comprehensive generation prompt tailored to travel style and scenario."""
    
    scenario_guidance = ""
    if trip_req.preset_scenario == "solo_weekend" or trip_req.travel_style == "solo":
        scenario_guidance = """
[SPECIAL DIRECTIVE: SOLO WEEKEND GETAWAY SCENARIO]
- Maximize high-impact experiences in a compact timeframe (48-72 hours).
- Cluster day activities within tight walkable districts (e.g. historic quarter Day 1, arts/waterfront Day 2).
- Recommend vibrant, safe cafes and counter-dining spots where solo travelers feel welcome.
- Focus on low-friction transit (metro cards, scenic walking routes).
"""
    elif trip_req.preset_scenario == "couple_romantic" or trip_req.travel_style == "couple":
        scenario_guidance = """
[SPECIAL DIRECTIVE: COUPLE ROMANTIC VACATION SCENARIO]
- Emphasize intimate pacing: late starts (9:30-10:00 AM), scenic golden-hour viewpoints, and romantic dinner atmospheres.
- Suggest memorable shared experiences (sunset cruise, wine tasting, scenic cliff walk, private cooking masterclass).
- Choose boutique or scenic accommodations with romantic character.
- Ensure evenings have reservation advice and ambient candlelit dining.
"""
    elif trip_req.preset_scenario == "group_adventure" or trip_req.travel_style in ["friends", "family"] or trip_req.group_size > 2:
        scenario_guidance = f"""
[SPECIAL DIRECTIVE: MULTI-DAY GROUP TRIP SCENARIO (Group Size: {trip_req.group_size})]
- Balance diverse interests: mix physical outdoor adventure with cultural exploration and downtime.
- Ensure chosen dining places comfortably seat {trip_req.group_size} people and offer dietary flexibility.
- Build in 30-minute buffers for group assembly, ticket purchasing, and bathroom breaks.
- Include group logistics (group transit pass, car share, designated meeting spots).
"""

    prompt = f"""
Plan a {trip_req.duration_days}-day trip to {trip_req.destination}.
Parameters:
- Travel Style: {trip_req.travel_style}
- Group Size: {trip_req.group_size} person(s)
- Budget Tier: {trip_req.budget_tier}
- Pacing: {trip_req.pacing}
- Primary Interests: {', '.join(trip_req.interests)}
- Dietary Preferences: {', '.join(trip_req.dietary_preferences) if trip_req.dietary_preferences else 'None specified'}
- Mobility / Accessibility: {trip_req.mobility_notes or 'Standard mobility'}
- Special Requests: {trip_req.special_notes or 'None'}

{scenario_guidance}

Please produce a complete JSON response matching this schema:
{{
  "id": "trip_gen_unique",
  "title": "Inspiring Trip Title",
  "destination": "{trip_req.destination}",
  "duration_days": {trip_req.duration_days},
  "travel_style": "{trip_req.travel_style}",
  "group_size": {trip_req.group_size},
  "budget_tier": "{trip_req.budget_tier}",
  "pacing": "{trip_req.pacing}",
  "summary": "2-3 sentences summarizing the trip personality and flow",
  "accommodation": {{
    "id": "acc_1",
    "name": "Property Name",
    "property_type": "Boutique Hotel / Luxury Villa / Central Apartment",
    "tier": "{trip_req.budget_tier}",
    "price_per_night_usd": 180.0,
    "total_stay_cost_usd": {180.0 * trip_req.duration_days},
    "location_area": "Neighborhood Name",
    "highlights": ["Highlight 1", "Highlight 2"],
    "best_for": "Why it suits this traveler/group"
  }},
  "logistics": {{
    "arrival_transfer_tip": "How to get from airport/train to base",
    "primary_transport_mode": "Metro / Walking / Rideshare",
    "transit_pass_recommendation": "Pass name & duration",
    "daily_transit_cost_usd": 15.0,
    "general_safety_and_currency_tips": ["Tip 1", "Tip 2"]
  }},
  "cost_breakdown": {{
    "activities_total_usd": 120.0,
    "dining_total_usd": 240.0,
    "accommodation_total_usd": {180.0 * trip_req.duration_days},
    "local_transport_total_usd": {15.0 * trip_req.duration_days},
    "grand_total_usd": 0.0,
    "cost_per_person_usd": 0.0,
    "currency": "USD"
  }},
  "days": [
    {{
      "day_number": 1,
      "date": "Day 1",
      "title": "Evocative Day Theme",
      "area_focus": "District Name",
      "morning_summary": "Morning overview",
      "afternoon_summary": "Afternoon overview",
      "evening_summary": "Evening overview",
      "activities": [
        {{
          "id": "act_1_1",
          "title": "Attraction Name",
          "description": "Specific activities, viewpoints, and context",
          "time_slot": "morning",
          "time_window": "09:30 AM - 12:00 PM",
          "duration_hours": 2.5,
          "category": "sightseeing",
          "location_name": "Landmark Name",
          "address": "Street or district",
          "estimated_cost_usd": 20.0,
          "booking_required": false,
          "insider_tip": "Insider trick to skip crowds or best photo angle",
          "transit_from_previous": "15 min stroll via Old Town"
        }}
      ],
      "dining": [
        {{
          "id": "din_1_1",
          "meal_type": "lunch",
          "restaurant_name": "Bistro Name",
          "cuisine": "Local Specialty",
          "price_range": "$$",
          "estimated_cost_usd": 25.0,
          "recommended_dish": "Signature dish",
          "neighborhood": "Area",
          "reservation_advised": false,
          "vibe": "Cozy & authentic"
        }}
      ],
      "day_total_cost_usd": 110.0,
      "route_efficiency_note": "All stops are within a 1.2 mile walking radius."
    }}
  ]
}}
"""
    return prompt


def build_day_regeneration_prompt(trip, day_number: int, feedback: str) -> str:
    """Prompt to regenerate a specific day based on user feedback."""
    return f"""
The user wants to regenerate Day {day_number} of their trip to {trip.destination}.
Overall Trip Context:
- Style: {trip.travel_style}
- Group Size: {trip.group_size}
- Budget: {trip.budget_tier}

User feedback / changes requested for Day {day_number}:
"{feedback}"

Generate a freshly revised Day {day_number} in JSON format conforming strictly to the ItineraryDay schema.
Preserve harmony with the overall destination and realistic geographical clustering.
"""


def build_activity_swap_prompt(trip, day_number: int, old_activity, preferred_category: str, feedback: str) -> str:
    """Prompt to swap a single activity while keeping timing and location coherent."""
    return f"""
In Day {day_number} of the trip to {trip.destination}, replace the following activity:
Old Activity: "{old_activity.title}" (Time slot: {old_activity.time_slot}, Category: {old_activity.category})
Location context: {old_activity.location_name}

Preferred new category: {preferred_category or 'Any suitable alternative'}
User specific requirement: {feedback or 'Something different but nearby'}

Generate 1 replacement Activity object in JSON matching the Activity schema that seamlessly fits into this time slot.
"""
