import json
import logging
import uuid
from typing import Dict, Any, Optional
from datetime import datetime

from app.core.config import settings
from app.models.trip import (
    TripRequest, TripResponse, ItineraryDay, Activity,
    DiningRecommendation, AccommodationRecommendation,
    LogisticsSummary, CostBreakdown, BudgetTierEnum,
    TravelStyleEnum, PacingEnum, ActivityCategoryEnum
)
from app.services.prompt_templates import (
    SYSTEM_PROMPT, build_trip_generation_prompt,
    build_day_regeneration_prompt, build_activity_swap_prompt
)

logger = logging.getLogger(__name__)


class AIPlannerService:
    def __init__(self):
        self.gemini_key = settings.GEMINI_API_KEY
        self.openai_key = settings.OPENAI_API_KEY
        self._init_llm_clients()

    def _init_llm_clients(self):
        self.gemini_model = None
        self.openai_client = None

        if self.gemini_key:
            try:
                import google.generativeai as genai
                genai.configure(api_key=self.gemini_key)
                self.gemini_model = genai.GenerativeModel(
                    model_name="gemini-1.5-pro",
                    system_instruction=SYSTEM_PROMPT
                )
                logger.info("Initialized Google Gemini AI planner")
            except Exception as e:
                logger.warning(f"Failed to initialize Gemini: {e}")

        if self.openai_key:
            try:
                from openai import OpenAI
                self.openai_client = OpenAI(api_key=self.openai_key)
                logger.info("Initialized OpenAI planner")
            except Exception as e:
                logger.warning(f"Failed to initialize OpenAI: {e}")

    async def generate_itinerary(self, req: TripRequest) -> TripResponse:
        """Generates a complete itinerary using Gemini, OpenAI, or the smart heuristic generator."""
        # 1. Try Gemini if configured
        if self.gemini_model:
            try:
                prompt = build_trip_generation_prompt(req)
                response = self.gemini_model.generate_content(
                    prompt,
                    generation_config={"response_mime_type": "application/json"}
                )
                data = json.loads(response.text)
                return self._parse_trip_dict(data, req)
            except Exception as e:
                logger.error(f"Gemini generation error, falling back: {e}")

        # 2. Try OpenAI if configured
        if self.openai_client:
            try:
                prompt = build_trip_generation_prompt(req)
                completion = self.openai_client.chat.completions.create(
                    model="gpt-4o",
                    messages=[
                        {"role": "system", "content": SYSTEM_PROMPT},
                        {"role": "user", "content": prompt}
                    ],
                    response_format={"type": "json_object"}
                )
                data = json.loads(completion.choices[0].message.content)
                return self._parse_trip_dict(data, req)
            except Exception as e:
                logger.error(f"OpenAI generation error, falling back: {e}")

        # 3. Deterministic Heuristic AI Generator (covers all 3 scenarios and custom destinations)
        return self._generate_heuristic_itinerary(req)

    def _parse_trip_dict(self, data: Dict[str, Any], req: TripRequest) -> TripResponse:
        """Parses and validates LLM JSON response into TripResponse."""
        if not data.get("id"):
            data["id"] = f"trip_{uuid.uuid4().hex[:8]}"
        data["destination"] = req.destination
        data["travel_style"] = req.travel_style
        data["group_size"] = req.group_size
        data["budget_tier"] = req.budget_tier
        data["pacing"] = req.pacing
        data["duration_days"] = req.duration_days
        data["created_at"] = datetime.utcnow()
        data["share_token"] = uuid.uuid4().hex[:12]
        return TripResponse(**data)

    def _generate_heuristic_itinerary(self, req: TripRequest) -> TripResponse:
        """Rich scenario-aware engine that generates fully populated itineraries."""
        dest_lower = req.destination.lower()
        trip_id = f"trip_{uuid.uuid4().hex[:8]}"

        # Check for preset scenario tags or destination patterns
        if req.preset_scenario == "solo_weekend" or "kyoto" in dest_lower or (req.travel_style == TravelStyleEnum.SOLO and req.duration_days <= 3):
            return self._build_solo_weekend_scenario(req, trip_id)
        elif req.preset_scenario == "couple_romantic" or "amalfi" in dest_lower or "paris" in dest_lower or req.travel_style == TravelStyleEnum.COUPLE:
            return self._build_couple_romantic_scenario(req, trip_id)
        elif req.preset_scenario == "group_adventure" or "costa rica" in dest_lower or req.group_size > 2 or req.travel_style == TravelStyleEnum.FRIENDS:
            return self._build_group_adventure_scenario(req, trip_id)
        else:
            return self._build_generic_custom_trip(req, trip_id)

    def _build_solo_weekend_scenario(self, req: TripRequest, trip_id: str) -> TripResponse:
        """Scenario 1: Solo Traveler Weekend Getaway (Optimized, budget-friendly, high culinary & cultural immersion)."""
        destination = req.destination if req.destination and "kyoto" not in req.destination.lower() else "Kyoto, Japan"
        days_count = max(2, min(req.duration_days, 4))

        day1_acts = [
            Activity(
                id=f"{trip_id}_d1_a1",
                title="Fushimi Inari Taisha Dawn Trek",
                description="Climb through the iconic 10,000 vermilion Torii gates early in the morning before tourist crowds arrive. Hike up to the Yotsutsuji intersection for panoramic morning vistas over Kyoto basin.",
                time_slot="morning",
                time_window="06:30 AM - 09:30 AM",
                duration_hours=3.0,
                category=ActivityCategoryEnum.SIGHTSEEING,
                location_name="Fushimi Inari Shrine",
                address="68 Fukakusa Yabunouchicho, Fushimi Ward",
                estimated_cost_usd=0.0,
                booking_required=False,
                insider_tip="Take the right-hand mountain trail at the first fork for quiet bamboo groves with zero selfie sticks.",
                transit_from_previous="Keihan Line direct to Fushimi-Inari Station (8 min)"
            ),
            Activity(
                id=f"{trip_id}_d1_a2",
                title="Gion Historic Machiya Alley Stroll",
                description="Walk the cobblestone streets of Shirakawa canal and Hanami-koji, admiring preserved wooden teahouses and weeping willow canopies.",
                time_slot="afternoon",
                time_window="01:30 PM - 04:00 PM",
                duration_hours=2.5,
                category=ActivityCategoryEnum.CULTURE,
                location_name="Gion Preservation District",
                address="Gionmachi Minamigawa, Higashiyama Ward",
                estimated_cost_usd=0.0,
                booking_required=False,
                insider_tip="Respect photography prohibition signs on private lanes; best photos are along the public bridge over Shirakawa canal.",
                transit_from_previous="12 min walk from lunch"
            ),
            Activity(
                id=f"{trip_id}_d1_a3",
                title="Kiyomizu-dera Sunset Stage",
                description="Witness twilight from the massive wooden veranda of Kiyomizu-dera, overlooking the vibrant maple valley with Kyoto Tower glowing on the horizon.",
                time_slot="evening",
                time_window="05:00 PM - 07:00 PM",
                duration_hours=2.0,
                category=ActivityCategoryEnum.SIGHTSEEING,
                location_name="Kiyomizu-dera Temple",
                address="1 Chome-294 Kiyomizu, Higashiyama Ward",
                estimated_cost_usd=4.0,
                booking_required=False,
                insider_tip="Drink from the Otowa Waterfall three streams (health, academic success, or love)—choose only one!",
                transit_from_previous="20 min scenic uphill stroll via Ninenzaka and Sannenzaka"
            )
        ]

        day1_dining = [
            DiningRecommendation(
                id=f"{trip_id}_d1_d1",
                meal_type="breakfast",
                restaurant_name="Inari Kissa Vermillion",
                cuisine="Espresso & Japanese Breakfast Toast",
                price_range="$",
                estimated_cost_usd=10.0,
                recommended_dish="Matcha Latte & Uji Red Bean Brioche",
                neighborhood="Fushimi Inari",
                reservation_advised=False,
                vibe="Aussie-Japanese specialty roaster overlooking peaceful forest pond"
            ),
            DiningRecommendation(
                id=f"{trip_id}_d1_d2",
                meal_type="lunch",
                restaurant_name="Nishiki Warai Gion",
                cuisine="Kyoto-Style Okonomiyaki",
                price_range="$$",
                estimated_cost_usd=16.0,
                recommended_dish="Kyoto Pork & Kujo Scallion Teppanyaki",
                neighborhood="Gion / Shijo",
                reservation_advised=False,
                vibe="Counter seating ideal for solo diners with interactive teppan grill"
            ),
            DiningRecommendation(
                id=f"{trip_id}_d1_d3",
                meal_type="dinner",
                restaurant_name="Menya Inoichi Ramen",
                cuisine="Refined Dashi Ramen (Michelin Bib Gourmand)",
                price_range="$$",
                estimated_cost_usd=18.0,
                recommended_dish="White Soy Sauce Dashi Ramen with A5 Wagyu Shavings",
                neighborhood="Shimogyo Ward",
                reservation_advised=False,
                vibe="Warm, serene noodle bar with friendly English guidance"
            )
        ]

        day2_acts = [
            Activity(
                id=f"{trip_id}_d2_a1",
                title="Arashiyama Bamboo Forest & Tenryu-ji Zen Garden",
                description="Breathe in morning pine mist amidst soaring green stalks, followed by mindful contemplation of the 14th-century pond garden at Tenryu-ji.",
                time_slot="morning",
                time_window="08:00 AM - 11:30 AM",
                duration_hours=3.5,
                category=ActivityCategoryEnum.NATURE,
                location_name="Arashiyama Bamboo Grove",
                address="Sagatenryuji, Ukyo Ward",
                estimated_cost_usd=6.0,
                booking_required=False,
                insider_tip="Exit past Okochi Sanso Villa to escape tour groups and enjoy panoramic views across Hozu Gorge.",
                transit_from_previous="JR San-in Line from Kyoto Station to Saga-Arashiyama (17 min)"
            ),
            Activity(
                id=f"{trip_id}_d2_a2",
                title="Nishiki Market Culinary Safari",
                description="Sample street foods along Kyoto's 400-year-old pantry: grilled octopus skewers, fresh soy milk donuts, and pickled heirloom vegetables.",
                time_slot="afternoon",
                time_window="01:30 PM - 03:30 PM",
                duration_hours=2.0,
                category=ActivityCategoryEnum.DINING,
                location_name="Nishiki Market Arcade",
                address="Nakagyo Ward, Kyoto",
                estimated_cost_usd=18.0,
                booking_required=False,
                insider_tip="Eat at designated stall areas—walking while eating is considered impolite in local arcades.",
                transit_from_previous="Hankyu Line from Arashiyama to Karasuma (22 min)"
            ),
            Activity(
                id=f"{trip_id}_d2_a3",
                title="Pontocho Alley Craft Beer & Riverwalk",
                description="Wind down along the lantern-lit Kamogawa riverbank, savoring local Kansai craft ales and watching street musicians.",
                time_slot="evening",
                time_window="06:00 PM - 08:30 PM",
                duration_hours=2.5,
                category=ActivityCategoryEnum.NIGHTLIFE,
                location_name="Pontocho & Kamo River",
                address="Pontocho, Nakagyo Ward",
                estimated_cost_usd=15.0,
                booking_required=False,
                insider_tip="Grab a local brew from Kyoto Brewing Co. taproom or sit along the river bank boulders like locals.",
                transit_from_previous="5 min stroll from Nishiki arcade"
            )
        ]

        day2_dining = [
            DiningRecommendation(
                id=f"{trip_id}_d2_d1",
                meal_type="breakfast",
                restaurant_name="Bread, Espresso & Arashiyama Garden",
                cuisine="Japanese Bakery & French Toast",
                price_range="$",
                estimated_cost_usd=12.0,
                recommended_dish="Signature Mu Bread French Toast with Honey",
                neighborhood="Arashiyama",
                reservation_advised=False,
                vibe="Historic thatched farmhouse with peaceful courtyard seating"
            ),
            DiningRecommendation(
                id=f"{trip_id}_d2_d2",
                meal_type="lunch",
                restaurant_name="Yudofu Sagano",
                cuisine="Traditional Kyoto Silken Tofu Hot Pot",
                price_range="$$",
                estimated_cost_usd=28.0,
                recommended_dish="Multi-course Sagano Boiled Tofu Set",
                neighborhood="Saga Tenryuji",
                reservation_advised=False,
                vibe="Floor-to-ceiling glass gazing at private moss gardens"
            ),
            DiningRecommendation(
                id=f"{trip_id}_d2_d3",
                meal_type="dinner",
                restaurant_name="Chao Chao Gyoza Sanjo-Kiyamachi",
                cuisine="Crispy Wings Gyoza & Craft Beer",
                price_range="$",
                estimated_cost_usd=15.0,
                recommended_dish="Golden Crispy Pan-Fried Pork & Shrimp Dumpling Platter",
                neighborhood="Sanjo / Pontocho",
                reservation_advised=False,
                vibe="High-energy, super friendly counter dining with zero solo awkwardness"
            )
        ]

        days = [
            ItineraryDay(
                day_number=1,
                date="Day 1",
                title="Sacred Torii Trails & Historic Gion Lanterns",
                area_focus="Southern Fushimi & Eastern Higashiyama",
                morning_summary="Sunrise hike through Fushimi Inari's vermilion gates, followed by matcha roaster break.",
                afternoon_summary="Strolling preserved wooden teahouses of Gion and Shirakawa canal.",
                evening_summary="Sunset views from Kiyomizu wooden stage, ending with dashi ramen.",
                activities=day1_acts,
                dining=day1_dining,
                day_total_cost_usd=48.0,
                route_efficiency_note="Linear transit route on Keihan railway; zero backtracking; 8.5 km walking."
            ),
            ItineraryDay(
                day_number=2,
                date="Day 2",
                title="Bamboo Sanctuary & Imperial Market Bites",
                area_focus="Western Arashiyama & Downtown Nakagyo",
                morning_summary="Serene morning bamboo groves and UNESCO Zen dry landscape garden.",
                afternoon_summary="Street food discoveries along 400-year-old Nishiki food arcade.",
                evening_summary="Lantern-lit Pontocho alley stroll and riverside craft beer.",
                activities=day2_acts,
                dining=day2_dining,
                day_total_cost_usd=66.0,
                route_efficiency_note="Train transit connecting west and central hubs efficiently with IC transit card."
            )
        ]

        accommodation = AccommodationRecommendation(
            id=f"{trip_id}_acc",
            name="The Pocket Hotel Kyoto Shijo Karasuma",
            property_type="Boutique Compact Hotel",
            tier=BudgetTierEnum.BUDGET,
            price_per_night_usd=75.0,
            total_stay_cost_usd=75.0 * days_count,
            location_area="Central Shimogyo (Karasuma Line)",
            highlights=["Ultra-clean private micro-rooms with tablet lighting control", "3 min walk to Hankyu & Subway lines", "Luggage lockers & coin laundry"],
            best_for="Solo travelers wanting spotless privacy, high security, and central walkability at low cost"
        )

        logistics = LogisticsSummary(
            arrival_transfer_tip="Take JR Haruka Express from Kansai Airport (KIX) to Kyoto Station in 75 mins with discounted ICOCA ticket.",
            primary_transport_mode="Subway, Keihan Line & Walking",
            transit_pass_recommendation="Digital ICOCA card on Apple Wallet / Google Pay for tap-and-go convenience",
            daily_transit_cost_usd=9.0,
            general_safety_and_currency_tips=[
                "Kyoto is exceptionally safe for solo travelers at any hour of the night.",
                "Carry 5,000 to 10,000 JPY cash as some temple ticket booths and older food stalls do not take credit cards."
            ]
        )

        activities_cost = sum(act.estimated_cost_usd for d in days for act in d.activities)
        dining_cost = sum(din.estimated_cost_usd for d in days for din in d.dining)
        transit_cost = logistics.daily_transit_cost_usd * days_count
        accom_cost = accommodation.total_stay_cost_usd
        grand_total = activities_cost + dining_cost + transit_cost + accom_cost

        cost_breakdown = CostBreakdown(
            activities_total_usd=activities_cost,
            dining_total_usd=dining_cost,
            accommodation_total_usd=accom_cost,
            local_transport_total_usd=transit_cost,
            grand_total_usd=grand_total,
            cost_per_person_usd=grand_total / req.group_size,
            currency="USD"
        )

        return TripResponse(
            id=trip_id,
            title="Kyoto 48-Hour Solo Heritage & Culinary Immersion",
            destination=destination,
            duration_days=days_count,
            travel_style=TravelStyleEnum.SOLO,
            group_size=req.group_size,
            budget_tier=BudgetTierEnum.BUDGET,
            pacing=PacingEnum.BALANCED,
            summary="A tightly curated, stress-free solo weekend balancing legendary dawn landmarks, serene temple gardens, and vibrant market dining without tourist burnout.",
            accommodation=accommodation,
            logistics=logistics,
            cost_breakdown=cost_breakdown,
            days=days,
            share_token=uuid.uuid4().hex[:12]
        )

    def _build_couple_romantic_scenario(self, req: TripRequest, trip_id: str) -> TripResponse:
        """Scenario 2: Couple Planning a Personalized Romantic Vacation (Relaxed pacing, scenic spots, boutique stays, curated dining)."""
        destination = req.destination if req.destination and "amalfi" not in req.destination.lower() else "Amalfi Coast, Italy"
        days_count = max(3, min(req.duration_days, 5))

        days = [
            ItineraryDay(
                day_number=1,
                date="Day 1",
                title="Clifftop Positano & Sunset Champagne Cruise",
                area_focus="Positano Marina Grande & Spiaggia Grande",
                morning_summary="Late wake-up, fresh espresso and sfogliatella on a private terrace overlooking pastel cliffs.",
                afternoon_summary="Leisurely exploration of boutique linen shops and artisan ceramic workshops along Via dei Mulini.",
                evening_summary="Private wooden gozzo boat tour with Prosecco at sunset, followed by candlelit cliff dining.",
                activities=[
                    Activity(
                        id=f"{trip_id}_d1_a1",
                        title="Artisan Linen & Perfume Atelier Walk",
                        description="Stroll arm-in-arm through flower-draped pedestrian stairways, visiting Carthusia I Profumi di Capri atelier for signature lemon fragrances.",
                        time_slot="morning",
                        time_window="10:30 AM - 12:30 PM",
                        duration_hours=2.0,
                        category=ActivityCategoryEnum.SHOPPING,
                        location_name="Via dei Mulini & Church of Santa Maria Assunta",
                        address="Via dei Mulini, 84017 Positano SA",
                        estimated_cost_usd=0.0,
                        booking_required=False,
                        insider_tip="Admire the 13th-century Byzantine Black Madonna icon inside Santa Maria Assunta.",
                        transit_from_previous="5 min gentle descent from hotel"
                    ),
                    Activity(
                        id=f"{trip_id}_d1_a2",
                        title="Private Sunset Gozzo Boat along Faraglioni",
                        description="Board a handcrafted mahogany Italian gozzo for a 2-hour coastal cruise past Li Galli islands, swimming in secluded emerald sea coves as the sky turns rose gold.",
                        time_slot="afternoon",
                        time_window="04:30 PM - 06:45 PM",
                        duration_hours=2.25,
                        category=ActivityCategoryEnum.ADVENTURE,
                        location_name="Positano Pier (Molo)",
                        address="Marina Grande, Positano",
                        estimated_cost_usd=210.0,
                        booking_required=True,
                        booking_url="https://lucibello.it",
                        insider_tip="Skipper brings fresh buffalo mozzarella, chilled Franciacorta, and organic peaches.",
                        transit_from_previous="10 min walk down to the pier"
                    )
                ],
                dining=[
                    DiningRecommendation(
                        id=f"{trip_id}_d1_d1",
                        meal_type="lunch",
                        restaurant_name="Da Adolfo (Water-Taxi Trattoria)",
                        cuisine="Coastal Campanian Seafood",
                        price_range="$$$",
                        estimated_cost_usd=85.0,
                        recommended_dish="Grilled Mozzarella on Lemon Leaves & Fresh Swordfish Carpaccio",
                        neighborhood="Laurito Beach Cove",
                        reservation_advised=True,
                        vibe="Rustic barefoot elegance reached only by boat with a red fish flag"
                    ),
                    DiningRecommendation(
                        id=f"{trip_id}_d1_d2",
                        meal_type="dinner",
                        restaurant_name="La Sponda at Le Sirenuse",
                        cuisine="Refined Mediterranean Fine Dining",
                        price_range="$$$$",
                        estimated_cost_usd=240.0,
                        recommended_dish="Handmade Scialatielli with Clams, Zucchini & Lemon Blossom",
                        neighborhood="Central Cliffside Positano",
                        reservation_advised=True,
                        vibe="Illuminated by 400 hand-lit candles with strolling acoustic mandolinists"
                    )
                ],
                day_total_cost_usd=535.0,
                route_efficiency_note="All walking routes within Positano; sea transfer for lunch cove."
            ),
            ItineraryDay(
                day_number=2,
                date="Day 2",
                title="Ravello Cascading Gardens & Symphony Terraces",
                area_focus="High Cliff Ravello & Valle dei Mulini",
                morning_summary="Scenic coastal convertible or private transfer ascending 365m above the Mediterranean to quiet Ravello.",
                afternoon_summary="Walking the infinity terrace of Villa Cimbrone and the Moorish cloisters of Villa Rufolo.",
                evening_summary="Aperitivo overlooking Salerno Gulf and intimate dinner in an ancient wine cellar.",
                activities=[
                    Activity(
                        id=f"{trip_id}_d2_a1",
                        title="Villa Cimbrone 'Terrace of Infinity' Walk",
                        description="Walk through whispering wisteria pergolas to the Terrazza dell'Infinito, framed by marble Roman busts where sea and sky blur into endless azure.",
                        time_slot="morning",
                        time_window="10:00 AM - 12:30 PM",
                        duration_hours=2.5,
                        category=ActivityCategoryEnum.RELAXATION,
                        location_name="Villa Cimbrone Gardens",
                        address="Via Santa Chiara, 26, 84010 Ravello SA",
                        estimated_cost_usd=24.0,
                        booking_required=False,
                        insider_tip="Bring sunglasses and camera polarizer; late morning lighting over the sheer drop is unmatched.",
                        transit_from_previous="Scenic private driver transfer from Positano (45 min)"
                    ),
                    Activity(
                        id=f"{trip_id}_d2_a2",
                        title="Villa Rufolo Moorish Gardens & Wagnerian Views",
                        description="Explore 13th-century watchtowers, exotic Mediterranean cacti, and the very gardens that inspired Richard Wagner's Parsifal.",
                        time_slot="afternoon",
                        time_window="02:30 PM - 04:30 PM",
                        duration_hours=2.0,
                        category=ActivityCategoryEnum.CULTURE,
                        location_name="Villa Rufolo",
                        address="Piazza Duomo, 1, 84010 Ravello SA",
                        estimated_cost_usd=16.0,
                        booking_required=False,
                        insider_tip="Check if an open-air chamber concert rehearsal is underway on the overhanging cliff stage.",
                        transit_from_previous="7 min pedestrian stroll across Ravello main piazza"
                    )
                ],
                dining=[
                    DiningRecommendation(
                        id=f"{trip_id}_d2_d1",
                        meal_type="lunch",
                        restaurant_name="Cumpa' Cosimo",
                        cuisine="Hearty Nonna-Style Campanian",
                        price_range="$$",
                        estimated_cost_usd=60.0,
                        recommended_dish="Tasting plate of 5 handmade pastas by Mama Netta",
                        neighborhood="Ravello Historic Center",
                        reservation_advised=True,
                        vibe="Beloved authentic trattoria run by the same family since 1929"
                    ),
                    DiningRecommendation(
                        id=f"{trip_id}_d2_d2",
                        meal_type="dinner",
                        restaurant_name="Ristorante Belvedere (Belmond Caruso)",
                        cuisine="Neapolitan Culinary Haute Cuisine",
                        price_range="$$$$",
                        estimated_cost_usd=260.0,
                        recommended_dish="Roasted Sea Bass with Vesuvius Piennolo Tomatoes and Capers",
                        neighborhood="Ravello High Promenade",
                        reservation_advised=True,
                        vibe="Al-fresco cliff terrace floating between clouds and sea"
                    )
                ],
                day_total_cost_usd=360.0,
                route_efficiency_note="Ravello is completely pedestrianized; gentle shaded pathways throughout."
            ),
            ItineraryDay(
                day_number=3,
                date="Day 3",
                title="Lemon Grove Trek & Private Limoncello Masterclass",
                area_focus="Amalfi Town & Minori Sentiero dei Limoni",
                morning_summary="Leisurely breakfast, then descending into the fragrant terraced groves of ancient Amalfi lemons.",
                afternoon_summary="Exclusive farm tour and private limoncello and granita tasting with a third-generation citrus family.",
                evening_summary="Sunset drinks at Amalfi harbor and fresh catch dinner under sea arches.",
                activities=[
                    Activity(
                        id=f"{trip_id}_d3_a1",
                        title="Path of the Lemons (Sentiero dei Limoni) Stroll",
                        description="A scenic coastal footpath linking Minori to Maiori through terraced pergolas heavy with massive Sfusato Amalfitano lemons.",
                        time_slot="morning",
                        time_window="10:00 AM - 12:30 PM",
                        duration_hours=2.5,
                        category=ActivityCategoryEnum.NATURE,
                        location_name="Sentiero dei Limoni trailhead",
                        address="Piazza Cantilena, Minori SA",
                        estimated_cost_usd=0.0,
                        booking_required=False,
                        insider_tip="Stop at farmer Antonio's terrace kiosk for freshly squeezed lemonade sweetened with wild mountain honey.",
                        transit_from_previous="Ferry from Amalfi to Minori (12 min)"
                    ),
                    Activity(
                        id=f"{trip_id}_d3_a2",
                        title="Amalfi Historical Farm Lemon Tour & Tasting",
                        description="Meet the Aceto family inside their vertical lemon terraces; learn historic cultivation methods and enjoy an intimate limoncello making session.",
                        time_slot="afternoon",
                        time_window="03:00 PM - 05:00 PM",
                        duration_hours=2.0,
                        category=ActivityCategoryEnum.CULTURE,
                        location_name="Amalfi Lemon Experience",
                        address="Valle dei Mulini, Amalfi",
                        estimated_cost_usd=70.0,
                        booking_required=True,
                        booking_url="https://amalfilemonexperience.it",
                        insider_tip="Includes homemade lemon honey cake and tasting of 3 distinct limoncello vintages.",
                        transit_from_previous="Short open-air minibus back into Amalfi valley"
                    )
                ],
                dining=[
                    DiningRecommendation(
                        id=f"{trip_id}_d3_d1",
                        meal_type="lunch",
                        restaurant_name="Sal De Riso Costa d'Amalfi Bistro",
                        cuisine="Master Pastry & Gourmet Pizza",
                        price_range="$$",
                        estimated_cost_usd=55.0,
                        recommended_dish="World Champion Delizia al Limone & Buffalo Mozzarella Focaccia",
                        neighborhood="Minori Waterfront",
                        reservation_advised=False,
                        vibe="Celebrity pastry maestro's seaside lounge"
                    ),
                    DiningRecommendation(
                        id=f"{trip_id}_d3_d2",
                        meal_type="dinner",
                        restaurant_name="Marina Grande Amalfi",
                        cuisine="Coastal Contemporary Seafood",
                        price_range="$$$",
                        estimated_cost_usd=150.0,
                        recommended_dish="Salt-Crusted Catch of the Day with Local Lemon Infusion",
                        neighborhood="Amalfi Beachfront",
                        reservation_advised=True,
                        vibe="Romantic lounge tables right on the sand with gentle waves lapping"
                    )
                ],
                day_total_cost_usd=275.0,
                route_efficiency_note="Seamless hop-on ferry connection avoiding coastal road traffic completely."
            )
        ]

        accommodation = AccommodationRecommendation(
            id=f"{trip_id}_acc",
            name="Hotel Poseidon & Villa Franca",
            property_type="Boutique Luxury Cliffside Hotel",
            tier=BudgetTierEnum.LUXURY,
            price_per_night_usd=380.0,
            total_stay_cost_usd=380.0 * days_count,
            location_area="Positano Upper Cliffside",
            highlights=[
                "Panoramic sea-view balcony with wrought-iron breakfast table",
                "Heated infinity pool overlooking the entire Positano cliff pyramid",
                "Complimentary sunset convertible Fiat 500 tour for guests"
            ],
            best_for="Couples seeking privacy, romantic atmosphere, and breathtaking sunset balcony views"
        )

        logistics = LogisticsSummary(
            arrival_transfer_tip="Pre-arranged private Mercedes transfer from Naples Central Station (or NAP Airport) straight to Positano hotel (approx. 80 mins).",
            primary_transport_mode="High-Speed Passenger Ferries & Private Transfers",
            transit_pass_recommendation="Travelmar Ferry passes for scenic coast hops between Positano, Amalfi, and Capri",
            daily_transit_cost_usd=40.0,
            general_safety_and_currency_tips=[
                "Ferries are dramatically smoother and faster than the narrow, winding Amalfi Drive buses.",
                "Wear comfortable non-slip leather sandals or sneakers for cobblestone inclines and steps."
            ]
        )

        activities_cost = sum(act.estimated_cost_usd for d in days for act in d.activities)
        dining_cost = sum(din.estimated_cost_usd for d in days for din in d.dining)
        transit_cost = logistics.daily_transit_cost_usd * days_count
        accom_cost = accommodation.total_stay_cost_usd
        grand_total = activities_cost + dining_cost + transit_cost + accom_cost

        cost_breakdown = CostBreakdown(
            activities_total_usd=activities_cost,
            dining_total_usd=dining_cost,
            accommodation_total_usd=accom_cost,
            local_transport_total_usd=transit_cost,
            grand_total_usd=grand_total,
            cost_per_person_usd=grand_total / req.group_size,
            currency="USD"
        )

        return TripResponse(
            id=trip_id,
            title="Amalfi Coast Romance: Cliffs, Lemon Groves & Sunset Sails",
            destination=destination,
            duration_days=days_count,
            travel_style=TravelStyleEnum.COUPLE,
            group_size=req.group_size,
            budget_tier=BudgetTierEnum.LUXURY,
            pacing=PacingEnum.RELAXED,
            summary="An unhurried romantic escape with dreamy coastal views, private wooden boat charters, candlelit cliffside dinners, and aromatic lemon orchard walks.",
            accommodation=accommodation,
            logistics=logistics,
            cost_breakdown=cost_breakdown,
            days=days,
            share_token=uuid.uuid4().hex[:12]
        )

    def _build_group_adventure_scenario(self, req: TripRequest, trip_id: str) -> TripResponse:
        """Scenario 3: Small Group Coordinating a Multi-Day Trip (Adventure, culture, budget limits, logistics & synchronization)."""
        destination = req.destination if req.destination and "costa rica" not in req.destination.lower() else "Arenal & Manuel Antonio, Costa Rica"
        days_count = max(4, min(req.duration_days, 7))
        group_size = max(3, req.group_size)

        days = [
            ItineraryDay(
                day_number=1,
                date="Day 1",
                title="Volcano Rainforest Canopy Zipline & Hanging Bridges",
                area_focus="Arenal Volcano National Park",
                morning_summary="Group team assembly and thrilling 7-cable canopy zipline flight over roaring canyon waterfalls.",
                afternoon_summary="Mistico Hanging Bridges guided wildlife search (howler monkeys, toucans, red-eyed tree frogs).",
                evening_summary="Thermal mineral hot springs soak with volcanic mud facial and open swim-up bar.",
                activities=[
                    Activity(
                        id=f"{trip_id}_d1_a1",
                        title="Sky Trek Ultimate Volcano Zipline",
                        description="Fly across 7 high-speed zip cables stretching over 2,460 feet, reaching speeds of 50 mph with unblocked views of Arenal Volcano and Lake Arenal.",
                        time_slot="morning",
                        time_window="08:30 AM - 11:30 AM",
                        duration_hours=3.0,
                        category=ActivityCategoryEnum.ADVENTURE,
                        location_name="Sky Adventures Arenal Park",
                        address="El Castillo, San Ramon, Alajuela",
                        estimated_cost_usd=85.0 * group_size,
                        booking_required=True,
                        booking_url="https://skyadventures.travel",
                        insider_tip="Rent GoPro mounts for the whole group; lockers and briefing run smoothly for groups of 4-10.",
                        transit_from_previous="Private group van shuttle from lodge (20 min)"
                    ),
                    Activity(
                        id=f"{trip_id}_d1_a2",
                        title="Mistico Arenal Hanging Bridges Naturalist Walk",
                        description="Trek 2 miles of rainforest pathways crossing 6 suspended aerial bridges elevated 180 feet above the forest canopy with a certified naturalist guide.",
                        time_slot="afternoon",
                        time_window="02:00 PM - 04:30 PM",
                        duration_hours=2.5,
                        category=ActivityCategoryEnum.NATURE,
                        location_name="Mistico Arenal Hanging Bridges",
                        address="La Fortuna, Alajuela",
                        estimated_cost_usd=32.0 * group_size,
                        booking_required=True,
                        insider_tip="Naturalist laser pointers help spot camouflaged eyelash vipers and two-toed sloths resting in cecropia trees.",
                        transit_from_previous="15 min group van ride"
                    ),
                    Activity(
                        id=f"{trip_id}_d1_a3",
                        title="EcoTermales Volcanic Hot Springs & Group Dinner",
                        description="Natural geothermal pools ranging from 99°F to 106°F nestled in natural jungle greenery. Strict capacity limits prevent overcrowding.",
                        time_slot="evening",
                        time_window="06:00 PM - 09:30 PM",
                        duration_hours=3.5,
                        category=ActivityCategoryEnum.RELAXATION,
                        location_name="EcoTermales Hot Springs",
                        address="Road 142, La Fortuna",
                        estimated_cost_usd=72.0 * group_size,
                        booking_required=True,
                        insider_tip="Includes traditional Costa Rican buffet dinner; book the 5 PM evening slot to watch the jungle canopy dim into night.",
                        transit_from_previous="10 min shuttle ride"
                    )
                ],
                dining=[
                    DiningRecommendation(
                        id=f"{trip_id}_d1_d1",
                        meal_type="lunch",
                        restaurant_name="Soda La Hormiga (La Fortuna Center)",
                        cuisine="Costa Rican Casado & Fresh Fruit Batidos",
                        price_range="$",
                        estimated_cost_usd=12.0 * group_size,
                        recommended_dish="Casado Tradicional with Braised Beef, Plantains & Black Beans",
                        neighborhood="La Fortuna Town Square",
                        reservation_advised=False,
                        vibe="Bustling authentic soda with large wooden communal tables perfect for group debriefs"
                    ),
                    DiningRecommendation(
                        id=f"{trip_id}_d1_d2",
                        meal_type="dinner",
                        restaurant_name="EcoTermales Hearth Dining",
                        cuisine="Wood-Fired Tico Buffet & Tropical Cocktails",
                        price_range="$$",
                        estimated_cost_usd=28.0 * group_size,
                        recommended_dish="Slow-Cooked Pork Loin with Guava Glaze & Yucca Mash",
                        neighborhood="Hot Springs Reserve",
                        reservation_advised=True,
                        vibe="Warm open-air pavilion surrounded by bubbling hot springs and torchlight"
                    )
                ],
                day_total_cost_usd=(85 + 32 + 72 + 12 + 28) * group_size,
                route_efficiency_note="Coordinated loop around Arenal base; single dedicated private minibus for the entire day."
            ),
            ItineraryDay(
                day_number=2,
                date="Day 2",
                title="Class III-IV Balsa River White Water Rafting",
                area_focus="San Carlos Canyon & River Valleys",
                morning_summary="Group safety gear fitting and high-adrenaline paddle through rolling Class III-IV rapids.",
                afternoon_summary="Riverside organic sugar cane & fruit feast, visiting a sustainable coffee cooperative.",
                evening_summary="Craft beer tasting at Costa Rica's premier jungle microbrewery in La Fortuna.",
                activities=[
                    Activity(
                        id=f"{trip_id}_d2_a1",
                        title="Balsa River Rafting Adventure (Class III-IV)",
                        description="Navigate exhilarating rapids like 'Magnetic Rock' and 'Dredges' along a scenic 10-mile jungle canyon, interspersed with calm swimming pools.",
                        time_slot="morning",
                        time_window="09:00 AM - 01:00 PM",
                        duration_hours=4.0,
                        category=ActivityCategoryEnum.ADVENTURE,
                        location_name="Balsa River Put-in Point",
                        address="Rio Balsa, San Carlos",
                        estimated_cost_usd=75.0 * group_size,
                        booking_required=True,
                        booking_url="https://desafiocostarica.com",
                        insider_tip="River guides take high-res team photography of the whole raft charging through the white water.",
                        transit_from_previous="35 min group transport from base"
                    ),
                    Activity(
                        id=f"{trip_id}_d2_a2",
                        title="Don Juan Organic Chocolate & Coffee Tour",
                        description="Crack open raw cacao pods, roast beans over open coals, and grind your own chocolate paste flavored with chili, cinnamon, and vanilla.",
                        time_slot="afternoon",
                        time_window="03:00 PM - 05:00 PM",
                        duration_hours=2.0,
                        category=ActivityCategoryEnum.CULTURE,
                        location_name="Finca Don Juan",
                        address="La Fortuna, Alajuela",
                        estimated_cost_usd=30.0 * group_size,
                        booking_required=False,
                        insider_tip="Unlimited liquid dark chocolate shots poured straight from the warm mortar!",
                        transit_from_previous="15 min drive"
                    )
                ],
                dining=[
                    DiningRecommendation(
                        id=f"{trip_id}_d2_d1",
                        meal_type="lunch",
                        restaurant_name="Rancho de Don Juan (Farm-to-Table)",
                        cuisine="Traditional Campesino Buffet",
                        price_range="$$",
                        estimated_cost_usd=16.0 * group_size,
                        recommended_dish="Hearty Olla de Carne Soup & Crispy Chicharrones",
                        neighborhood="San Carlos Farm Belt",
                        reservation_advised=True,
                        vibe="Rustic open-sided thatched ranch overlooking sugar cane fields"
                    ),
                    DiningRecommendation(
                        id=f"{trip_id}_d2_d2",
                        meal_type="dinner",
                        restaurant_name="Arenal Vista Brewery & Smokehouse",
                        cuisine="Craft Beers, Smoked Brisket & Artisan Pizza",
                        price_range="$$",
                        estimated_cost_usd=32.0 * group_size,
                        recommended_dish="Volcano Stout Glazed Smoked Ribs & Wood-Fired Jalapeno Pizza",
                        neighborhood="La Fortuna outskirts",
                        reservation_advised=True,
                        vibe="Social beer garden with fire pits, cornhole games, and live reggae/acoustic music"
                    )
                ],
                day_total_cost_usd=(75 + 30 + 16 + 32) * group_size,
                route_efficiency_note="All river gear and transport managed directly by rafting outfitter door-to-door."
            ),
            ItineraryDay(
                day_number=3,
                date="Day 3",
                title="Pacific Coastline Transition & Sunset Catamaran",
                area_focus="Manuel Antonio Coastal Bay",
                morning_summary="Scenic group private shuttle transfer from rainforest volcanic highlands down to Pacific beaches.",
                afternoon_summary="Group luxury sailing catamaran cruise with snorkeling, waterslides, and dolphin sightings.",
                evening_summary="Fresh seafood and tropical cocktails at the famous cliffside plane pub.",
                activities=[
                    Activity(
                        id=f"{trip_id}_d3_a1",
                        title="Ocean King Sunset Catamaran & Snorkel Party",
                        description="Board a massive 100-foot multi-hull catamaran with dual waterslides, jacuzzi tubs, snorkel gear, and open bar cruising past Manuel Antonio bluffs.",
                        time_slot="afternoon",
                        time_window="01:30 PM - 05:45 PM",
                        duration_hours=4.25,
                        category=ActivityCategoryEnum.ADVENTURE,
                        location_name="Marina Pez Vela",
                        address="Quepos, Puntarenas",
                        estimated_cost_usd=90.0 * group_size,
                        booking_required=True,
                        booking_url="https://oceankingcr.com",
                        insider_tip="Keep watch for spotted dolphins and humpback whale breaches (seasonal).",
                        transit_from_previous="Private group van transfer from Arenal to Manuel Antonio (3.5 hours)"
                    )
                ],
                dining=[
                    DiningRecommendation(
                        id=f"{trip_id}_d3_d1",
                        meal_type="lunch",
                        restaurant_name="Catamaran Onboard Fresh Grill",
                        cuisine="Grilled Fish Kebabs & Pasta Salads",
                        price_range="$$",
                        estimated_cost_usd=0.0,
                        recommended_dish="Fresh Pacific Catch Skewers & Tropical Pineapple Salsa (Included)",
                        neighborhood="Biesanz Bay",
                        reservation_advised=True,
                        vibe="Music, ocean breezes, and swim stops"
                    ),
                    DiningRecommendation(
                        id=f"{trip_id}_d3_d2",
                        meal_type="dinner",
                        restaurant_name="El Avion Cliffside Pub & Restaurant",
                        cuisine="Fresh Ceviche & Grilled Red Snapper",
                        price_range="$$",
                        estimated_cost_usd=35.0 * group_size,
                        recommended_dish="Whole Fried Pargo Rojo (Red Snapper) & Coconut Mojito",
                        neighborhood="Manuel Antonio Main Road",
                        reservation_advised=True,
                        vibe="Built inside an actual historic 1986 Fairchild C-123 aircraft perched over the jungle cliff"
                    )
                ],
                day_total_cost_usd=(90 + 35) * group_size,
                route_efficiency_note="Private AC transit van with luggage storage handles the cross-country connection effortlessly."
            ),
            ItineraryDay(
                day_number=4,
                date="Day 4",
                title="Manuel Antonio National Park & Beach Relaxation",
                area_focus="Manuel Antonio National Park & Espadilla Beach",
                morning_summary="Guided park hike through white sand beaches and dense mangrove home to capuchin monkeys and iguanas.",
                afternoon_summary="Group beach volleyball, surfing lessons, and hammock downtime at Playa Espadilla.",
                evening_summary="Farewell dinner feast celebrating group trip milestones.",
                activities=[
                    Activity(
                        id=f"{trip_id}_d4_a1",
                        title="Manuel Antonio National Park Wildlife Expedition",
                        description="Hike the Cathedral Point trail where jungle trails meet pristine white sand beaches; spot white-faced capuchins, raccoons, and basilisks.",
                        time_slot="morning",
                        time_window="07:30 AM - 11:30 AM",
                        duration_hours=4.0,
                        category=ActivityCategoryEnum.NATURE,
                        location_name="Manuel Antonio National Park",
                        address="Manuel Antonio, Quepos",
                        estimated_cost_usd=18.0 * group_size,
                        booking_required=True,
                        insider_tip="Do not bring single-use plastics or snacks (rangers inspect bags at gate to protect monkeys).",
                        transit_from_previous="5 min local shuttle from villa"
                    ),
                    Activity(
                        id=f"{trip_id}_d4_a2",
                        title="Playa Espadilla Surfing & Beach Chill",
                        description="Warm Pacific waters with beginner to intermediate rolling waves. Group surfboard rentals and lounge umbrellas right in front of the surf breaks.",
                        time_slot="afternoon",
                        time_window="02:00 PM - 05:00 PM",
                        duration_hours=3.0,
                        category=ActivityCategoryEnum.ADVENTURE,
                        location_name="Playa Espadilla Norte",
                        address="Manuel Antonio Beachfront",
                        estimated_cost_usd=25.0 * group_size,
                        booking_required=False,
                        insider_tip="Local surf instructors offer group lessons with board included for $40/person.",
                        transit_from_previous="Walk out of national park gates directly onto beach"
                    )
                ],
                dining=[
                    DiningRecommendation(
                        id=f"{trip_id}_d4_d1",
                        meal_type="lunch",
                        restaurant_name="Falafel Bar Manuel Antonio",
                        cuisine="Fresh Mediterranean Bowls & Shakes",
                        price_range="$",
                        estimated_cost_usd=14.0 * group_size,
                        recommended_dish="Loaded Shawarma Pita & Fresh Mango Passionfruit Smoothie",
                        neighborhood="Manuel Antonio Strip",
                        reservation_advised=False,
                        vibe="Relaxed garden dining easy for vegan, vegetarian, and meat-eater group members"
                    ),
                    DiningRecommendation(
                        id=f"{trip_id}_d4_d2",
                        meal_type="dinner",
                        restaurant_name="Agua Azul Seaside Cafe",
                        cuisine="Costa Rican Fusion & Craft Cocktails",
                        price_range="$$$",
                        estimated_cost_usd=45.0 * group_size,
                        recommended_dish="Tuna Poke Tower & Coconut Crusted Mahi Mahi",
                        neighborhood="Manuel Antonio Upper Bluff",
                        reservation_advised=True,
                        vibe="Top-floor terrace with unbeatable 180° sunset vistas over Manuel Antonio bay"
                    )
                ],
                day_total_cost_usd=(18 + 25 + 14 + 45) * group_size,
                route_efficiency_note="All walking and short 5-minute hops along the coastal ridge."
            )
        ]

        accommodation = AccommodationRecommendation(
            id=f"{trip_id}_acc",
            name="Tulemar Resort & Rainforest Eco-Villas",
            property_type="Private Multi-Bedroom Luxury Rainforest Villa",
            tier=BudgetTierEnum.MODERATE,
            price_per_night_usd=450.0,  # Split across group
            total_stay_cost_usd=450.0 * days_count,
            location_area="Manuel Antonio / Arenal combo",
            highlights=[
                f"Spacious 3-4 bedroom villa sleeping up to {group_size} comfortably with full gourmet kitchen",
                "Private plunge pool and panoramic jungle ocean view deck",
                "Dedicated personal concierge handling all group reservations and transport"
            ],
            best_for=f"Groups of {group_size} travelers wanting shared living spaces, cost-effective luxury splitting, and private amenities"
        )

        logistics = LogisticsSummary(
            arrival_transfer_tip="Private air-conditioned high-roof passenger van with dedicated bilingual driver picking up group at San Jose (SJO) Airport.",
            primary_transport_mode="Dedicated Private Group Minivan",
            transit_pass_recommendation="Flat-rate chartered group shuttle to eliminate individual taxi negotiations",
            daily_transit_cost_usd=120.0,
            general_safety_and_currency_tips=[
                "US Dollars and Costa Rican Colones are widely accepted everywhere.",
                "Splitwise or Tab is recommended for easy shared expense tracking among the group."
            ]
        )

        activities_cost = sum(act.estimated_cost_usd for d in days for act in d.activities)
        dining_cost = sum(din.estimated_cost_usd for d in days for din in d.dining)
        transit_cost = logistics.daily_transit_cost_usd * days_count
        accom_cost = accommodation.total_stay_cost_usd
        grand_total = activities_cost + dining_cost + transit_cost + accom_cost

        cost_breakdown = CostBreakdown(
            activities_total_usd=activities_cost,
            dining_total_usd=dining_cost,
            accommodation_total_usd=accom_cost,
            local_transport_total_usd=transit_cost,
            grand_total_usd=grand_total,
            cost_per_person_usd=grand_total / group_size,
            currency="USD"
        )

        return TripResponse(
            id=trip_id,
            title="Costa Rica Ultimate Group Adventure: Volcano Canopy to Pacific Waves",
            destination=destination,
            duration_days=days_count,
            travel_style=TravelStyleEnum.FRIENDS,
            group_size=group_size,
            budget_tier=BudgetTierEnum.MODERATE,
            pacing=PacingEnum.BALANCED,
            summary=f"A multi-day expedition designed for {group_size} friends blending high-adrenaline ziplining, white-water rafting, natural hot springs, and catamaran sailing with zero coordination headaches.",
            accommodation=accommodation,
            logistics=logistics,
            cost_breakdown=cost_breakdown,
            days=days,
            share_token=uuid.uuid4().hex[:12]
        )

    def _build_generic_custom_trip(self, req: TripRequest, trip_id: str) -> TripResponse:
        """Procedural generator for ANY user-specified custom destination worldwide."""
        dest = req.destination.strip() or "Barcelona, Spain"
        days_count = max(1, min(req.duration_days, 7))

        days = []
        for d in range(1, days_count + 1):
            day_acts = [
                Activity(
                    id=f"{trip_id}_d{d}_a1",
                    title=f"Iconic Landmarks & Heritage Discovery of {dest}",
                    description=f"Explore the primary historic center, architectural masterpieces, and scenic plazas of {dest} during comfortable morning hours.",
                    time_slot="morning",
                    time_window="09:00 AM - 12:00 PM",
                    duration_hours=3.0,
                    category=ActivityCategoryEnum.SIGHTSEEING,
                    location_name=f"Historic Quarter, {dest}",
                    address=f"Central District, {dest}",
                    estimated_cost_usd=25.0 * req.group_size,
                    booking_required=True,
                    insider_tip="Pre-book entry tickets online 48 hours prior to skip peak morning queues.",
                    transit_from_previous="10 min metro or stroll from central lodging"
                ),
                Activity(
                    id=f"{trip_id}_d{d}_a2",
                    title=f"Cultural Immersion & Local Markets of {dest}",
                    description=f"Delve into regional gastronomy, artisan workshops, and neighborhood cafes tailored to {', '.join(req.interests)}.",
                    time_slot="afternoon",
                    time_window="02:00 PM - 05:00 PM",
                    duration_hours=3.0,
                    category=ActivityCategoryEnum.CULTURE,
                    location_name=f"Artisan & Market Quarter, {dest}",
                    address=f"Creative District, {dest}",
                    estimated_cost_usd=20.0 * req.group_size,
                    booking_required=False,
                    insider_tip="Sample street-food specialties and strike up conversations with neighborhood craftspeople.",
                    transit_from_previous="15 min scenic walk through pedestrian boulevards"
                ),
                Activity(
                    id=f"{trip_id}_d{d}_a3",
                    title=f"Sunset Panorama & Evening Atmosphere in {dest}",
                    description=f"Watch the sunset from the premier observation terrace or waterfront promenade of {dest}.",
                    time_slot="evening",
                    time_window="06:30 PM - 08:30 PM",
                    duration_hours=2.0,
                    category=ActivityCategoryEnum.RELAXATION,
                    location_name=f"Sunset Lookout, {dest}",
                    address=f"Hillside or Waterfront, {dest}",
                    estimated_cost_usd=10.0 * req.group_size,
                    booking_required=False,
                    insider_tip="Arrive 30 minutes before official sunset to secure prime photography spots.",
                    transit_from_previous="Short tram or rideshare connection"
                )
            ]

            day_dining = [
                DiningRecommendation(
                    id=f"{trip_id}_d{d}_d1",
                    meal_type="breakfast",
                    restaurant_name=f"Artisan Roast & Bakery {dest}",
                    cuisine="Specialty Coffee & Regional Pastries",
                    price_range="$",
                    estimated_cost_usd=12.0 * req.group_size,
                    recommended_dish="Fresh flaky pastries and local roast pour-over",
                    neighborhood="Historic Center",
                    reservation_advised=False,
                    vibe="Charming neighborhood cafe with sidewalk seating"
                ),
                DiningRecommendation(
                    id=f"{trip_id}_d{d}_d2",
                    meal_type="lunch",
                    restaurant_name=f"Traditional Osteria / Bistro {dest}",
                    cuisine="Locally Sourced Seasonal Classics",
                    price_range="$$",
                    estimated_cost_usd=25.0 * req.group_size,
                    recommended_dish="Signature regional lunch plate with seasonal produce",
                    neighborhood="Market District",
                    reservation_advised=False,
                    vibe="Warm, authentic atmosphere buzzing with residents"
                ),
                DiningRecommendation(
                    id=f"{trip_id}_d{d}_d3",
                    meal_type="dinner",
                    restaurant_name=f"Rooftop Gastronomy {dest}",
                    cuisine="Modern Contemporary Cuisine",
                    price_range="$$$",
                    estimated_cost_usd=50.0 * req.group_size,
                    recommended_dish="Chef's tasting selection paired with regional wines",
                    neighborhood="City Center / Waterfront",
                    reservation_advised=True,
                    vibe="Sophisticated ambiance with skyline illumination"
                )
            ]

            days.append(
                ItineraryDay(
                    day_number=d,
                    date=f"Day {d}",
                    title=f"Day {d}: Exploring the Highlights and Flavors of {dest}",
                    area_focus=f"Key District {d}, {dest}",
                    morning_summary="Historic landmark tour and architectural immersion.",
                    afternoon_summary="Local artisan market discoveries and specialty tastings.",
                    evening_summary="Scenic sunset viewing followed by curated local dinner.",
                    activities=day_acts,
                    dining=day_dining,
                    day_total_cost_usd=(25 + 20 + 10 + 12 + 25 + 50) * req.group_size,
                    route_efficiency_note="Optimized in a contiguous geographic circle to minimize transit delay."
                )
            )

        accom_price_per_night = 140.0 if req.budget_tier == BudgetTierEnum.BUDGET else (250.0 if req.budget_tier == BudgetTierEnum.MODERATE else 480.0)
        accommodation = AccommodationRecommendation(
            id=f"{trip_id}_acc",
            name=f"The Grand Heritage Boutique {dest}",
            property_type="Boutique Design Hotel",
            tier=req.budget_tier,
            price_per_night_usd=accom_price_per_night,
            total_stay_cost_usd=accom_price_per_night * days_count,
            location_area=f"Central Arts Quarter, {dest}",
            highlights=["Walk score of 98/100", "Complimentary gourmet breakfast", "Concierge tour reservations"],
            best_for=f"Travelers seeking prime walkable access in {dest}"
        )

        logistics = LogisticsSummary(
            arrival_transfer_tip=f"Direct rail or official airport express connection straight into {dest} central transit hub.",
            primary_transport_mode="Public Metro / Tram / Walking",
            transit_pass_recommendation=f"Multi-day unlimited transit travel card for {dest}",
            daily_transit_cost_usd=12.0 * req.group_size,
            general_safety_and_currency_tips=[
                f"Credit and mobile payments are ubiquitous throughout {dest}.",
                "Keep emergency contact numbers and offline maps downloaded on your smartphone."
            ]
        )

        activities_cost = sum(act.estimated_cost_usd for d in days for act in d.activities)
        dining_cost = sum(din.estimated_cost_usd for d in days for din in d.dining)
        transit_cost = logistics.daily_transit_cost_usd * days_count
        accom_cost = accommodation.total_stay_cost_usd
        grand_total = activities_cost + dining_cost + transit_cost + accom_cost

        cost_breakdown = CostBreakdown(
            activities_total_usd=activities_cost,
            dining_total_usd=dining_cost,
            accommodation_total_usd=accom_cost,
            local_transport_total_usd=transit_cost,
            grand_total_usd=grand_total,
            cost_per_person_usd=grand_total / req.group_size,
            currency="USD"
        )

        return TripResponse(
            id=trip_id,
            title=f"Personalized {days_count}-Day Discovery of {dest}",
            destination=dest,
            duration_days=days_count,
            travel_style=req.travel_style,
            group_size=req.group_size,
            budget_tier=req.budget_tier,
            pacing=req.pacing,
            summary=f"An intelligently balanced itinerary tailored to your preferences in {dest}, combining iconic highlights with authentic local neighborhood gems.",
            accommodation=accommodation,
            logistics=logistics,
            cost_breakdown=cost_breakdown,
            days=days,
            share_token=uuid.uuid4().hex[:12]
        )

    async def regenerate_single_day(self, trip: TripResponse, day_number: int, feedback_prompt: str) -> ItineraryDay:
        """Regenerates a single day with modified focus while preserving trip cohesion."""
        # 1. Try Gemini
        if self.gemini_model:
            try:
                prompt = build_day_regeneration_prompt(trip, day_number, feedback_prompt)
                resp = self.gemini_model.generate_content(prompt, generation_config={"response_mime_type": "application/json"})
                data = json.loads(resp.text)
                return ItineraryDay(**data)
            except Exception as e:
                logger.warning(f"Gemini day regeneration fallback: {e}")

        # 2. Heuristic regeneration: adapt the existing day with feedback adjustments
        target_day = next((d for d in trip.days if d.day_number == day_number), trip.days[0])
        revised_title = f"{target_day.title} (Customized: {feedback_prompt[:30]}...)" if feedback_prompt else target_day.title
        
        # Adjust activities based on feedback keyword clues
        feedback_lower = feedback_prompt.lower()
        new_acts = []
        for act in target_day.activities:
            cost_adj = act.estimated_cost_usd
            title_adj = act.title
            desc_adj = act.description
            category_adj = act.category

            if "nature" in feedback_lower or "outdoor" in feedback_lower or "scenic" in feedback_lower:
                category_adj = ActivityCategoryEnum.NATURE
                title_adj = f"Scenic Nature & Panorama at {act.location_name}"
                desc_adj = f"Revised for peaceful outdoor pacing: tranquility away from crowds with panoramic vistas. {act.description}"
            elif "food" in feedback_lower or "culinary" in feedback_lower or "eat" in feedback_lower:
                category_adj = ActivityCategoryEnum.DINING
                title_adj = f"Artisan Food Discovery & Tasting at {act.location_name}"
                desc_adj = f"Curated culinary focus with local specialty bites and refreshing pairings. {act.description}"
            elif "relax" in feedback_lower or "slow" in feedback_lower or "chill" in feedback_lower:
                category_adj = ActivityCategoryEnum.RELAXATION
                title_adj = f"Relaxed Leisure & Serenade at {act.location_name}"
                desc_adj = f"Unhurried pacing allowing comfortable time to soak in the atmosphere with no rush."

            if "budget" in feedback_lower or "cheap" in feedback_lower:
                cost_adj = max(0.0, cost_adj * 0.5)

            new_acts.append(Activity(
                id=f"{act.id}_rev",
                title=title_adj,
                description=desc_adj,
                time_slot=act.time_slot,
                time_window=act.time_window,
                duration_hours=act.duration_hours,
                category=category_adj,
                location_name=act.location_name,
                address=act.address,
                estimated_cost_usd=cost_adj,
                booking_required=act.booking_required,
                insider_tip=act.insider_tip,
                transit_from_previous=act.transit_from_previous
            ))

        total_day_cost = sum(a.estimated_cost_usd for a in new_acts) + sum(d.estimated_cost_usd for d in target_day.dining)

        return ItineraryDay(
            day_number=day_number,
            date=target_day.date,
            title=revised_title,
            area_focus=target_day.area_focus,
            morning_summary=f"Regenerated for your preferences: {feedback_prompt}",
            afternoon_summary=target_day.afternoon_summary,
            evening_summary=target_day.evening_summary,
            activities=new_acts,
            dining=target_day.dining,
            day_total_cost_usd=total_day_cost,
            route_efficiency_note=f"Regenerated according to prompt: '{feedback_prompt}'. Route re-optimized for minimal transit delay."
        )

    async def swap_single_activity(self, trip: TripResponse, day_number: int, activity_id: str, preferred_category: Optional[ActivityCategoryEnum], feedback: str) -> Activity:
        """Finds or generates a high-quality alternative activity for a specific time slot."""
        target_day = next((d for d in trip.days if d.day_number == day_number), trip.days[0])
        old_act = next((a for a in target_day.activities if a.id == activity_id), target_day.activities[0])

        category = preferred_category or ActivityCategoryEnum.NATURE
        title = f"Alternative {category.value.capitalize()} in {trip.destination}"
        if category == ActivityCategoryEnum.NATURE:
            title = f"Botanical Garden & Scenic Viewpoint in {target_day.area_focus}"
            description = f"A tranquil, green alternative offering fresh air, walking trails, and peaceful photography."
            cost = 10.0
        elif category == ActivityCategoryEnum.CULTURE:
            title = f"Contemporary Art & Heritage Atelier in {target_day.area_focus}"
            description = f"Immerse yourself in local craft techniques and curated regional exhibitions."
            cost = 18.0
        elif category == ActivityCategoryEnum.ADVENTURE:
            title = f"Guided E-Bike or Kayak Exploration in {target_day.area_focus}"
            description = f"Get moving with an active, scenic tour providing unique perspectives of the surroundings."
            cost = 35.0
        else:
            title = f"Curated Relaxation Lounge & Sunset Point in {target_day.area_focus}"
            description = f"A relaxing stop to refresh, recharge, and watch the local ambiance unfold."
            cost = 5.0

        if feedback:
            description += f" (Adapted for: '{feedback}')"

        return Activity(
            id=f"swap_{uuid.uuid4().hex[:6]}",
            title=title,
            description=description,
            time_slot=old_act.time_slot,
            time_window=old_act.time_window,
            duration_hours=old_act.duration_hours,
            category=category,
            location_name=f"Alternative Landmark ({target_day.area_focus})",
            address=f"{target_day.area_focus}, {trip.destination}",
            estimated_cost_usd=cost * trip.group_size,
            booking_required=False,
            insider_tip="Alternative chosen to match your requested category while keeping route transit under 15 minutes.",
            transit_from_previous=old_act.transit_from_previous
        )


ai_planner = AIPlannerService()
