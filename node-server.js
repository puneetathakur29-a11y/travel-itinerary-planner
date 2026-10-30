/**
 * Standalone Zero-Dependency Runner & Mock Backend for WanderLoom Travel Planner
 * Can be run immediately using:
 * & "C:\Users\Asus\AppData\Roaming\Antigravity\bin\agy-node.cmd" node-server.js
 */

const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 8000;

// In-Memory Repository
const database = {
  trips: new Map(),
  collaborators: new Map()
};

// Seed Scenarios
function getSoloWeekendScenario() {
  return {
    id: "trip_solo_kyoto",
    title: "Kyoto 48-Hour Solo Heritage & Culinary Immersion",
    destination: "Kyoto, Japan",
    duration_days: 2,
    travel_style: "solo",
    group_size: 1,
    budget_tier: "budget",
    pacing: "balanced",
    summary: "A tightly curated, stress-free solo weekend balancing legendary dawn landmarks, serene temple gardens, and vibrant market dining without tourist burnout.",
    accommodation: {
      id: "acc_pocket",
      name: "The Pocket Hotel Kyoto Shijo Karasuma",
      property_type: "Boutique Compact Hotel",
      tier: "budget",
      price_per_night_usd: 75.0,
      total_stay_cost_usd: 150.0,
      location_area: "Central Shimogyo (Karasuma Line)",
      highlights: ["Ultra-clean private micro-rooms with tablet controls", "3 min to Hankyu line", "Luggage lockers"],
      best_for: "Solo travelers wanting privacy, high security, and central walkability at low cost"
    },
    logistics: {
      arrival_transfer_tip: "JR Haruka Express from Kansai Airport (KIX) directly into Kyoto Station in 75 mins.",
      primary_transport_mode: "Subway, Keihan Line & Walking",
      transit_pass_recommendation: "Digital ICOCA card for tap-and-go convenience",
      daily_transit_cost_usd: 9.0,
      general_safety_and_currency_tips: ["Exceptionally safe at any hour", "Carry 5,000 JPY for temple booths"]
    },
    cost_breakdown: {
      activities_total_usd: 28.0,
      dining_total_usd: 97.0,
      accommodation_total_usd: 150.0,
      local_transport_total_usd: 18.0,
      grand_total_usd: 293.0,
      cost_per_person_usd: 293.0,
      currency: "USD"
    },
    days: [
      {
        day_number: 1,
        date: "Day 1",
        title: "Sacred Torii Trails & Historic Gion Lanterns",
        area_focus: "Southern Fushimi & Eastern Higashiyama",
        morning_summary: "Sunrise hike through Fushimi Inari's vermilion gates.",
        afternoon_summary: "Strolling preserved wooden teahouses of Gion and Shirakawa canal.",
        evening_summary: "Sunset views from Kiyomizu wooden stage, ending with dashi ramen.",
        activities: [
          {
            id: "act_1_1",
            title: "Fushimi Inari Taisha Dawn Trek",
            description: "Climb through the iconic 10,000 vermilion Torii gates early in the morning before tourist crowds arrive.",
            time_slot: "morning",
            time_window: "06:30 AM - 09:30 AM",
            duration_hours: 3.0,
            category: "sightseeing",
            location_name: "Fushimi Inari Shrine",
            address: "68 Fukakusa Yabunouchicho",
            estimated_cost_usd: 0.0,
            insider_tip: "Take the right-hand mountain trail at the first fork for quiet bamboo groves.",
            transit_from_previous: "Keihan Line direct to Fushimi-Inari Station (8 min)"
          },
          {
            id: "act_1_2",
            title: "Gion Historic Machiya Alley Stroll",
            description: "Walk the cobblestone streets of Shirakawa canal and Hanami-koji, admiring preserved wooden teahouses.",
            time_slot: "afternoon",
            time_window: "01:30 PM - 04:00 PM",
            duration_hours: 2.5,
            category: "culture",
            location_name: "Gion Preservation District",
            estimated_cost_usd: 0.0,
            insider_tip: "Best photos are along the public bridge over Shirakawa canal.",
            transit_from_previous: "12 min walk from lunch"
          },
          {
            id: "act_1_3",
            title: "Kiyomizu-dera Sunset Stage",
            description: "Witness twilight from the massive wooden veranda overlooking the maple valley.",
            time_slot: "evening",
            time_window: "05:00 PM - 07:00 PM",
            duration_hours: 2.0,
            category: "sightseeing",
            location_name: "Kiyomizu-dera Temple",
            estimated_cost_usd: 4.0,
            insider_tip: "Drink from Otowa Waterfall three streams for good fortune.",
            transit_from_previous: "20 min scenic uphill stroll via Ninenzaka"
          }
        ],
        dining: [
          {
            id: "din_1_1",
            meal_type: "breakfast",
            restaurant_name: "Inari Kissa Vermillion",
            cuisine: "Japanese Roaster Breakfast",
            price_range: "$",
            estimated_cost_usd: 10.0,
            recommended_dish: "Matcha Latte & Uji Red Bean Brioche",
            neighborhood: "Fushimi Inari",
            vibe: "Serene roaster overlooking forest pond"
          },
          {
            id: "din_1_2",
            meal_type: "lunch",
            restaurant_name: "Nishiki Warai Gion",
            cuisine: "Kyoto-Style Okonomiyaki",
            price_range: "$$",
            estimated_cost_usd: 16.0,
            recommended_dish: "Pork & Kujo Scallion Teppanyaki",
            neighborhood: "Gion",
            vibe: "Counter seating ideal for solo diners"
          },
          {
            id: "din_1_3",
            meal_type: "dinner",
            restaurant_name: "Menya Inoichi Ramen",
            cuisine: "Michelin Bib Gourmand Dashi Ramen",
            price_range: "$$",
            estimated_cost_usd: 18.0,
            recommended_dish: "White Soy Sauce Dashi Ramen with A5 Wagyu Shavings",
            neighborhood: "Shimogyo",
            vibe: "Serene noodle bar"
          }
        ],
        day_total_cost_usd: 48.0,
        route_efficiency_note: "Linear transit route on Keihan railway; zero backtracking."
      },
      {
        day_number: 2,
        date: "Day 2",
        title: "Bamboo Sanctuary & Imperial Market Bites",
        area_focus: "Western Arashiyama & Downtown Nakagyo",
        morning_summary: "Morning bamboo groves and Tenryu-ji Zen dry landscape garden.",
        afternoon_summary: "Street food discoveries along 400-year-old Nishiki food arcade.",
        evening_summary: "Lantern-lit Pontocho alley stroll and riverside craft beer.",
        activities: [
          {
            id: "act_2_1",
            title: "Arashiyama Bamboo Forest & Tenryu-ji Zen Garden",
            description: "Breathe in morning pine mist amidst soaring green stalks, followed by mindful contemplation of the 14th-century pond garden.",
            time_slot: "morning",
            time_window: "08:00 AM - 11:30 AM",
            duration_hours: 3.5,
            category: "nature",
            location_name: "Arashiyama Bamboo Grove",
            estimated_cost_usd: 6.0,
            insider_tip: "Exit past Okochi Sanso Villa to escape crowds.",
            transit_from_previous: "JR San-in Line from Kyoto Station (17 min)"
          },
          {
            id: "act_2_2",
            title: "Nishiki Market Culinary Safari",
            description: "Sample street foods along Kyoto's 400-year-old pantry: grilled octopus skewers and soy milk donuts.",
            time_slot: "afternoon",
            time_window: "01:30 PM - 03:30 PM",
            duration_hours: 2.0,
            category: "dining",
            location_name: "Nishiki Market Arcade",
            estimated_cost_usd: 18.0,
            insider_tip: "Eat at designated stall areas.",
            transit_from_previous: "Hankyu Line to Karasuma (22 min)"
          },
          {
            id: "act_2_3",
            title: "Pontocho Alley Craft Beer & Riverwalk",
            description: "Wind down along the lantern-lit Kamogawa riverbank with Kansai craft ales.",
            time_slot: "evening",
            time_window: "06:00 PM - 08:30 PM",
            duration_hours: 2.5,
            category: "nightlife",
            location_name: "Pontocho & Kamo River",
            estimated_cost_usd: 15.0,
            insider_tip: "Sit along riverbank boulders like locals.",
            transit_from_previous: "5 min stroll from Nishiki arcade"
          }
        ],
        dining: [
          {
            id: "din_2_1",
            meal_type: "breakfast",
            restaurant_name: "Bread, Espresso & Arashiyama Garden",
            cuisine: "Japanese Bakery",
            price_range: "$",
            estimated_cost_usd: 12.0,
            recommended_dish: "Signature Mu French Toast with Honey",
            neighborhood: "Arashiyama",
            vibe: "Historic thatched farmhouse"
          },
          {
            id: "din_2_2",
            meal_type: "lunch",
            restaurant_name: "Yudofu Sagano",
            cuisine: "Kyoto Silken Tofu Hot Pot",
            price_range: "$$",
            estimated_cost_usd: 26.0,
            recommended_dish: "Sagano Boiled Tofu Set",
            neighborhood: "Saga Tenryuji",
            vibe: "Gazing at private moss gardens"
          },
          {
            id: "din_2_3",
            meal_type: "dinner",
            restaurant_name: "Chao Chao Gyoza Sanjo",
            cuisine: "Crispy Pan-Fried Dumplings",
            price_range: "$",
            estimated_cost_usd: 15.0,
            recommended_dish: "Golden Crispy Pork & Shrimp Dumpling Platter",
            neighborhood: "Pontocho",
            vibe: "Energetic counter dining with zero solo awkwardness"
          }
        ],
        day_total_cost_usd: 92.0,
        route_efficiency_note: "Seamless train connecting west and central districts."
      }
    ],
    share_token: "kyoto_solo_share"
  };
}

function getCoupleVacationScenario() {
  return {
    id: "trip_couple_amalfi",
    title: "Amalfi Coast Romance: Cliffs, Lemon Groves & Sunset Sails",
    destination: "Amalfi Coast, Italy",
    duration_days: 3,
    travel_style: "couple",
    group_size: 2,
    budget_tier: "luxury",
    pacing: "relaxed",
    summary: "An unhurried romantic escape with dreamy coastal views, private wooden boat charters, candlelit cliffside dinners, and aromatic lemon orchard walks.",
    accommodation: {
      id: "acc_poseidon",
      name: "Hotel Poseidon & Villa Franca",
      property_type: "Boutique Luxury Cliffside Hotel",
      tier: "luxury",
      price_per_night_usd: 380.0,
      total_stay_cost_usd: 1140.0,
      location_area: "Positano Upper Cliffside",
      highlights: ["Panoramic sea-view balcony with wrought-iron breakfast table", "Heated infinity pool", "Sunset convertible Fiat 500 tour"],
      best_for: "Couples seeking privacy, romantic atmosphere, and breathtaking sunset balcony views"
    },
    logistics: {
      arrival_transfer_tip: "Private Mercedes transfer from Naples Central Station (NAP) straight to hotel (80 mins).",
      primary_transport_mode: "High-Speed Passenger Ferries & Private Transfers",
      transit_pass_recommendation: "Travelmar Ferry passes for scenic coast hops",
      daily_transit_cost_usd: 40.0,
      general_safety_and_currency_tips: ["Ferries are smoother and faster than cliff buses.", "Wear comfortable shoes for cobblestones."]
    },
    cost_breakdown: {
      activities_total_usd: 320.0,
      dining_total_usd: 850.0,
      accommodation_total_usd: 1140.0,
      local_transport_total_usd: 120.0,
      grand_total_usd: 2430.0,
      cost_per_person_usd: 1215.0,
      currency: "USD"
    },
    days: [
      {
        day_number: 1,
        date: "Day 1",
        title: "Clifftop Positano & Sunset Champagne Cruise",
        area_focus: "Positano Marina Grande & Spiaggia Grande",
        morning_summary: "Espresso and sfogliatella on private terrace overlooking pastel cliffs.",
        afternoon_summary: "Artisan perfumery ateliers and linen boutiques along Via dei Mulini.",
        evening_summary: "Private wooden gozzo boat tour with Prosecco, followed by candlelit dinner.",
        activities: [
          {
            id: "act_c1_1",
            title: "Artisan Linen & Perfume Atelier Walk",
            description: "Stroll arm-in-arm through flower-draped pedestrian stairways visiting Carthusia perfumery.",
            time_slot: "morning",
            time_window: "10:30 AM - 12:30 PM",
            duration_hours: 2.0,
            category: "shopping",
            location_name: "Via dei Mulini",
            estimated_cost_usd: 0.0,
            insider_tip: "Admire the 13th-century Byzantine Black Madonna icon.",
            transit_from_previous: "5 min gentle descent"
          },
          {
            id: "act_c1_2",
            title: "Private Sunset Gozzo Boat along Faraglioni",
            description: "Board a handcrafted mahogany Italian gozzo for a 2-hour coastal cruise past Li Galli islands with fresh mozzarella and chilled Franciacorta.",
            time_slot: "afternoon",
            time_window: "04:30 PM - 06:45 PM",
            duration_hours: 2.25,
            category: "adventure",
            location_name: "Positano Pier",
            estimated_cost_usd: 210.0,
            insider_tip: "Skipper brings organic peaches and local prosecco.",
            transit_from_previous: "10 min walk to pier"
          }
        ],
        dining: [
          {
            id: "din_c1_1",
            meal_type: "lunch",
            restaurant_name: "Da Adolfo (Water-Taxi Trattoria)",
            cuisine: "Coastal Campanian Seafood",
            price_range: "$$$",
            estimated_cost_usd: 85.0,
            recommended_dish: "Grilled Mozzarella on Lemon Leaves",
            neighborhood: "Laurito Beach Cove",
            vibe: "Barefoot elegance reached only by boat"
          },
          {
            id: "din_c1_2",
            meal_type: "dinner",
            restaurant_name: "La Sponda at Le Sirenuse",
            cuisine: "Haute Mediterranean",
            price_range: "$$$$",
            estimated_cost_usd: 240.0,
            recommended_dish: "Scialatielli with Clams, Zucchini & Lemon Blossom",
            neighborhood: "Central Positano",
            vibe: "Illuminated by 400 hand-lit candles with mandolinists"
          }
        ],
        day_total_cost_usd: 535.0,
        route_efficiency_note: "All walking inside Positano; water taxi to Laurito cove."
      },
      {
        day_number: 2,
        date: "Day 2",
        title: "Ravello Cascading Gardens & Symphony Terraces",
        area_focus: "High Cliff Ravello & Valle dei Mulini",
        morning_summary: "Private car ascending 365m above the sea to quiet Ravello.",
        afternoon_summary: "Walking the infinity terrace of Villa Cimbrone and Moorish cloisters of Villa Rufolo.",
        evening_summary: "Aperitivo overlooking Salerno Gulf and intimate dinner in an ancient wine cellar.",
        activities: [
          {
            id: "act_c2_1",
            title: "Villa Cimbrone 'Terrace of Infinity' Walk",
            description: "Whispering wisteria pergolas to Terrazza dell'Infinito with marble Roman busts where sea and sky blur.",
            time_slot: "morning",
            time_window: "10:00 AM - 12:30 PM",
            duration_hours: 2.5,
            category: "relaxation",
            location_name: "Villa Cimbrone Gardens",
            estimated_cost_usd: 24.0,
            insider_tip: "Bring sunglasses and camera polarizer; lighting is magical.",
            transit_from_previous: "Private driver transfer (45 min)"
          },
          {
            id: "act_c2_2",
            title: "Villa Rufolo Moorish Gardens",
            description: "13th-century watchtowers and gardens that inspired Richard Wagner.",
            time_slot: "afternoon",
            time_window: "02:30 PM - 04:30 PM",
            duration_hours: 2.0,
            category: "culture",
            location_name: "Villa Rufolo",
            estimated_cost_usd: 16.0,
            insider_tip: "Listen for open-air chamber concert rehearsals.",
            transit_from_previous: "7 min pedestrian stroll"
          }
        ],
        dining: [
          {
            id: "din_c2_1",
            meal_type: "lunch",
            restaurant_name: "Cumpa' Cosimo",
            cuisine: "Nonna-Style Campanian",
            price_range: "$$",
            estimated_cost_usd: 60.0,
            recommended_dish: "Tasting plate of 5 handmade pastas",
            neighborhood: "Ravello Historic Center",
            vibe: "Beloved authentic trattoria run by the same family since 1929"
          },
          {
            id: "din_c2_2",
            meal_type: "dinner",
            restaurant_name: "Ristorante Belvedere (Belmond Caruso)",
            cuisine: "Neapolitan Haute Cuisine",
            price_range: "$$$$",
            estimated_cost_usd: 260.0,
            recommended_dish: "Roasted Sea Bass with Vesuvius Piennolo Tomatoes",
            neighborhood: "Ravello High Promenade",
            vibe: "Al-fresco cliff terrace floating between clouds and sea"
          }
        ],
        day_total_cost_usd: 360.0,
        route_efficiency_note: "Ravello is completely pedestrianized."
      },
      {
        day_number: 3,
        date: "Day 3",
        title: "Lemon Grove Trek & Private Limoncello Masterclass",
        area_focus: "Amalfi Town & Minori Sentiero dei Limoni",
        morning_summary: "Descending into fragrant terraced groves of ancient Amalfi lemons.",
        afternoon_summary: "Exclusive farm tour and private limoncello and granita tasting.",
        evening_summary: "Sunset drinks at Amalfi harbor and fresh catch dinner under sea arches.",
        activities: [
          {
            id: "act_c3_1",
            title: "Path of the Lemons (Sentiero dei Limoni) Stroll",
            description: "Scenic coastal footpath linking Minori to Maiori through terraced pergolas heavy with lemons.",
            time_slot: "morning",
            time_window: "10:00 AM - 12:30 PM",
            duration_hours: 2.5,
            category: "nature",
            location_name: "Sentiero dei Limoni",
            estimated_cost_usd: 0.0,
            insider_tip: "Stop at farmer Antonio's terrace for fresh honey lemonade.",
            transit_from_previous: "Ferry from Amalfi to Minori (12 min)"
          },
          {
            id: "act_c3_2",
            title: "Amalfi Historical Farm Lemon Tour & Tasting",
            description: "Meet the Aceto family inside vertical lemon terraces; learn historic cultivation methods.",
            time_slot: "afternoon",
            time_window: "03:00 PM - 05:00 PM",
            duration_hours: 2.0,
            category: "culture",
            location_name: "Amalfi Lemon Experience",
            estimated_cost_usd: 70.0,
            insider_tip: "Includes homemade lemon honey cake and tasting of 3 vintages.",
            transit_from_previous: "Short open-air minibus"
          }
        ],
        dining: [
          {
            id: "din_c3_1",
            meal_type: "lunch",
            restaurant_name: "Sal De Riso Costa d'Amalfi Bistro",
            cuisine: "Master Pastry & Gourmet Pizza",
            price_range: "$$",
            estimated_cost_usd: 55.0,
            recommended_dish: "World Champion Delizia al Limone",
            neighborhood: "Minori Waterfront",
            vibe: "Celebrity pastry maestro's seaside lounge"
          },
          {
            id: "din_c3_2",
            meal_type: "dinner",
            restaurant_name: "Marina Grande Amalfi",
            cuisine: "Coastal Contemporary",
            price_range: "$$$",
            estimated_cost_usd: 150.0,
            recommended_dish: "Salt-Crusted Catch of the Day with Local Lemon Infusion",
            neighborhood: "Amalfi Beachfront",
            vibe: "Lounge tables right on the sand with gentle waves"
          }
        ],
        day_total_cost_usd: 275.0,
        route_efficiency_note: "Seamless ferry connection avoiding road traffic."
      }
    ],
    share_token: "amalfi_couple_share"
  };
}

function getGroupAdventureScenario() {
  const gSize = 4;
  return {
    id: "trip_group_costarica",
    title: "Costa Rica Ultimate Group Adventure: Volcano Canopy to Pacific Waves",
    destination: "Arenal & Manuel Antonio, Costa Rica",
    duration_days: 4,
    travel_style: "friends",
    group_size: gSize,
    budget_tier: "moderate",
    pacing: "balanced",
    summary: `A multi-day expedition designed for ${gSize} friends blending high-adrenaline ziplining, white-water rafting, natural hot springs, and catamaran sailing with zero coordination headaches.`,
    accommodation: {
      id: "acc_tulemar",
      name: "Tulemar Resort & Rainforest Eco-Villas",
      property_type: "Private Multi-Bedroom Luxury Rainforest Villa",
      tier: "moderate",
      price_per_night_usd: 450.0,
      total_stay_cost_usd: 1800.0,
      location_area: "Manuel Antonio / Arenal combo",
      highlights: ["Spacious 3-4 bedroom villa sleeping up to 6 with full kitchen", "Private plunge pool and panoramic jungle deck", "Personal dedicated concierge"],
      best_for: `Groups of ${gSize} travelers wanting shared spaces, cost-effective splitting, and private amenities`
    },
    logistics: {
      arrival_transfer_tip: "Private air-conditioned high-roof passenger van picking up group at San Jose (SJO) Airport.",
      primary_transport_mode: "Dedicated Private Group Minivan",
      transit_pass_recommendation: "Flat-rate chartered group shuttle to eliminate individual taxi negotiations",
      daily_transit_cost_usd: 120.0,
      general_safety_and_currency_tips: ["US Dollars and Colones widely accepted.", "Splitwise recommended for shared expense tracking."]
    },
    cost_breakdown: {
      activities_total_usd: 1340.0,
      dining_total_usd: 780.0,
      accommodation_total_usd: 1800.0,
      local_transport_total_usd: 480.0,
      grand_total_usd: 4400.0,
      cost_per_person_usd: 1100.0,
      currency: "USD"
    },
    days: [
      {
        day_number: 1,
        date: "Day 1",
        title: "Volcano Rainforest Canopy Zipline & Hanging Bridges",
        area_focus: "Arenal Volcano National Park",
        morning_summary: "Group canopy zipline flight over roaring canyon waterfalls.",
        afternoon_summary: "Mistico Hanging Bridges guided wildlife search (howler monkeys, toucans).",
        evening_summary: "Thermal mineral hot springs soak with volcanic mud facial and open swim-up bar.",
        activities: [
          {
            id: "act_g1_1",
            title: "Sky Trek Ultimate Volcano Zipline",
            description: "Fly across 7 high-speed zip cables stretching over 2,460 feet with unblocked views of Arenal Volcano.",
            time_slot: "morning",
            time_window: "08:30 AM - 11:30 AM",
            duration_hours: 3.0,
            category: "adventure",
            location_name: "Sky Adventures Arenal Park",
            estimated_cost_usd: 85.0 * gSize,
            insider_tip: "Rent GoPro mounts for the whole group.",
            transit_from_previous: "Private group van shuttle from lodge (20 min)"
          },
          {
            id: "act_g1_2",
            title: "Mistico Arenal Hanging Bridges Walk",
            description: "Trek 2 miles of rainforest pathways crossing 6 suspended aerial bridges elevated 180 feet above the forest canopy.",
            time_slot: "afternoon",
            time_window: "02:00 PM - 04:30 PM",
            duration_hours: 2.5,
            category: "nature",
            location_name: "Mistico Arenal Hanging Bridges",
            estimated_cost_usd: 32.0 * gSize,
            insider_tip: "Naturalist laser pointers help spot camouflaged sloths.",
            transit_from_previous: "15 min group van ride"
          },
          {
            id: "act_g1_3",
            title: "EcoTermales Volcanic Hot Springs & Group Dinner",
            description: "Natural geothermal pools ranging from 99°F to 106°F nestled in lush jungle greenery.",
            time_slot: "evening",
            time_window: "06:00 PM - 09:30 PM",
            duration_hours: 3.5,
            category: "relaxation",
            location_name: "EcoTermales Hot Springs",
            estimated_cost_usd: 72.0 * gSize,
            insider_tip: "Includes traditional Costa Rican buffet dinner.",
            transit_from_previous: "10 min shuttle ride"
          }
        ],
        dining: [
          {
            id: "din_g1_1",
            meal_type: "lunch",
            restaurant_name: "Soda La Hormiga (La Fortuna)",
            cuisine: "Costa Rican Casado",
            price_range: "$",
            estimated_cost_usd: 12.0 * gSize,
            recommended_dish: "Casado Tradicional with Braised Beef, Plantains & Black Beans",
            neighborhood: "La Fortuna Town Square",
            vibe: "Communal wooden tables perfect for group debriefs"
          },
          {
            id: "din_g1_2",
            meal_type: "dinner",
            restaurant_name: "EcoTermales Hearth Dining",
            cuisine: "Wood-Fired Tico Buffet",
            price_range: "$$",
            estimated_cost_usd: 28.0 * gSize,
            recommended_dish: "Slow-Cooked Pork Loin with Guava Glaze",
            neighborhood: "Hot Springs Reserve",
            vibe: "Open-air pavilion surrounded by bubbling hot springs"
          }
        ],
        day_total_cost_usd: (85 + 32 + 72 + 12 + 28) * gSize,
        route_efficiency_note: "Coordinated loop around Arenal base; single dedicated minibus for the day."
      },
      {
        day_number: 2,
        date: "Day 2",
        title: "Class III-IV Balsa River White Water Rafting",
        area_focus: "San Carlos Canyon & River Valleys",
        morning_summary: "Group safety gear fitting and high-adrenaline paddle through rolling rapids.",
        afternoon_summary: "Riverside organic sugar cane & chocolate tour.",
        evening_summary: "Craft beer tasting at premier jungle microbrewery in La Fortuna.",
        activities: [
          {
            id: "act_g2_1",
            title: "Balsa River Rafting Adventure (Class III-IV)",
            description: "Navigate exhilarating rapids along a scenic 10-mile jungle canyon.",
            time_slot: "morning",
            time_window: "09:00 AM - 01:00 PM",
            duration_hours: 4.0,
            category: "adventure",
            location_name: "Rio Balsa Put-in Point",
            estimated_cost_usd: 75.0 * gSize,
            insider_tip: "Guides take high-res team photography of the raft.",
            transit_from_previous: "35 min group transport"
          },
          {
            id: "act_g2_2",
            title: "Don Juan Organic Chocolate & Coffee Tour",
            description: "Crack open raw cacao pods, roast beans, and grind your own chocolate paste.",
            time_slot: "afternoon",
            time_window: "03:00 PM - 05:00 PM",
            duration_hours: 2.0,
            category: "culture",
            location_name: "Finca Don Juan",
            estimated_cost_usd: 30.0 * gSize,
            insider_tip: "Unlimited dark chocolate shots poured straight from mortar!",
            transit_from_previous: "15 min drive"
          }
        ],
        dining: [
          {
            id: "din_g2_1",
            meal_type: "lunch",
            restaurant_name: "Rancho de Don Juan (Farm-to-Table)",
            cuisine: "Traditional Campesino Buffet",
            price_range: "$$",
            estimated_cost_usd: 16.0 * gSize,
            recommended_dish: "Hearty Olla de Carne Soup & Crispy Chicharrones",
            neighborhood: "San Carlos Farm Belt",
            vibe: "Rustic open-sided ranch overlooking sugar cane fields"
          },
          {
            id: "din_g2_2",
            meal_type: "dinner",
            restaurant_name: "Arenal Vista Brewery & Smokehouse",
            cuisine: "Craft Beers, Smoked Brisket & Pizza",
            price_range: "$$",
            estimated_cost_usd: 32.0 * gSize,
            recommended_dish: "Volcano Stout Glazed Smoked Ribs",
            neighborhood: "La Fortuna outskirts",
            vibe: "Social beer garden with fire pits and cornhole games"
          }
        ],
        day_total_cost_usd: (75 + 30 + 16 + 32) * gSize,
        route_efficiency_note: "All gear and transport managed directly by rafting outfitter."
      },
      {
        day_number: 3,
        date: "Day 3",
        title: "Pacific Coastline Transition & Sunset Catamaran",
        area_focus: "Manuel Antonio Coastal Bay",
        morning_summary: "Scenic group private van shuttle transfer from rainforest to Pacific coast.",
        afternoon_summary: "Group luxury sailing catamaran cruise with snorkeling, waterslides, and dolphin sightings.",
        evening_summary: "Fresh seafood and tropical cocktails at the famous cliffside plane pub.",
        activities: [
          {
            id: "act_g3_1",
            title: "Ocean King Sunset Catamaran & Snorkel Party",
            description: "100-foot multi-hull catamaran with dual waterslides, jacuzzi tubs, and open bar cruising past Manuel Antonio bluffs.",
            time_slot: "afternoon",
            time_window: "01:30 PM - 05:45 PM",
            duration_hours: 4.25,
            category: "adventure",
            location_name: "Marina Pez Vela",
            estimated_cost_usd: 90.0 * gSize,
            insider_tip: "Watch for dolphins and humpback whale breaches.",
            transit_from_previous: "Private group van transfer (3.5 hours)"
          }
        ],
        dining: [
          {
            id: "din_g3_1",
            meal_type: "lunch",
            restaurant_name: "Catamaran Onboard Fresh Grill",
            cuisine: "Fresh Pacific Fish Kebabs",
            price_range: "$$",
            estimated_cost_usd: 0.0,
            recommended_dish: "Catch Skewers & Tropical Pineapple Salsa (Included)",
            neighborhood: "Biesanz Bay",
            vibe: "Music, ocean breezes, and swim stops"
          },
          {
            id: "din_g3_2",
            meal_type: "dinner",
            restaurant_name: "El Avion Cliffside Pub & Restaurant",
            cuisine: "Fresh Ceviche & Red Snapper",
            price_range: "$$",
            estimated_cost_usd: 35.0 * gSize,
            recommended_dish: "Whole Fried Pargo Rojo & Coconut Mojito",
            neighborhood: "Manuel Antonio Main Road",
            vibe: "Built inside an actual historic 1986 Fairchild aircraft"
          }
        ],
        day_total_cost_usd: (90 + 35) * gSize,
        route_efficiency_note: "Private AC transit van with luggage storage."
      },
      {
        day_number: 4,
        date: "Day 4",
        title: "Manuel Antonio National Park & Beach Relaxation",
        area_focus: "Manuel Antonio National Park & Espadilla Beach",
        morning_summary: "Guided park hike through white sand beaches and dense mangrove with capuchin monkeys.",
        afternoon_summary: "Group beach volleyball, surfing lessons, and hammock downtime.",
        evening_summary: "Farewell dinner feast celebrating group trip milestones.",
        activities: [
          {
            id: "act_g4_1",
            title: "Manuel Antonio National Park Wildlife Expedition",
            description: "Hike Cathedral Point trail where jungle meets pristine white sand beaches; spot monkeys and iguanas.",
            time_slot: "morning",
            time_window: "07:30 AM - 11:30 AM",
            duration_hours: 4.0,
            category: "nature",
            location_name: "Manuel Antonio National Park",
            estimated_cost_usd: 18.0 * gSize,
            insider_tip: "No single-use plastics or snacks allowed.",
            transit_from_previous: "5 min local shuttle from villa"
          },
          {
            id: "act_g4_2",
            title: "Playa Espadilla Surfing & Beach Chill",
            description: "Warm Pacific waters with beginner to intermediate rolling waves.",
            time_slot: "afternoon",
            time_window: "02:00 PM - 05:00 PM",
            duration_hours: 3.0,
            category: "adventure",
            location_name: "Playa Espadilla Norte",
            estimated_cost_usd: 25.0 * gSize,
            insider_tip: "Group surfboard rentals available on the sand.",
            transit_from_previous: "Walk directly onto beach"
          }
        ],
        dining: [
          {
            id: "din_g4_1",
            meal_type: "lunch",
            restaurant_name: "Falafel Bar Manuel Antonio",
            cuisine: "Fresh Mediterranean Bowls & Shakes",
            price_range: "$",
            estimated_cost_usd: 14.0 * gSize,
            recommended_dish: "Loaded Shawarma Pita & Fresh Mango Passionfruit Smoothie",
            neighborhood: "Manuel Antonio Strip",
            vibe: "Easy for vegan, vegetarian, and meat-eaters"
          },
          {
            id: "din_g4_2",
            meal_type: "dinner",
            restaurant_name: "Agua Azul Seaside Cafe",
            cuisine: "Costa Rican Fusion & Cocktails",
            price_range: "$$$",
            estimated_cost_usd: 45.0 * gSize,
            recommended_dish: "Tuna Poke Tower & Coconut Crusted Mahi Mahi",
            neighborhood: "Manuel Antonio Upper Bluff",
            vibe: "Top-floor terrace with unbeatable 180° sunset vistas"
          }
        ],
        day_total_cost_usd: (18 + 25 + 14 + 45) * gSize,
        route_efficiency_note: "All short 5-minute hops along the coastal ridge."
      }
    ],
    share_token: "costarica_group_share"
  };
}

// Seed the initial trips
const trip1 = getSoloWeekendScenario();
const trip2 = getCoupleVacationScenario();
const trip3 = getGroupAdventureScenario();
database.trips.set(trip1.id, trip1);
database.trips.set(trip2.id, trip2);
database.trips.set(trip3.id, trip3);

// HTTP Server
const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // Health
  if (pathname === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: "online",
      service: "Personalized Travel Itinerary Planner",
      mode: "Node Native Runner",
      supabase_connected: false,
      active_ai_engine: "WanderLoom Intelligent Heuristic Engine (Ready & Deterministic)"
    }));
    return;
  }

  // Scenarios direct endpoints
  if (pathname === '/api/scenarios/solo-weekend') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(getSoloWeekendScenario()));
    return;
  }
  if (pathname === '/api/scenarios/couple-vacation') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(getCoupleVacationScenario()));
    return;
  }
  if (pathname === '/api/scenarios/group-adventure') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(getGroupAdventureScenario()));
    return;
  }

  // List Trips
  if (pathname === '/api/trips' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(Array.from(database.trips.values())));
    return;
  }

  // Get Trip by ID
  const tripMatch = pathname.match(/^\/api\/trips\/([^\/]+)$/);
  if (tripMatch && req.method === 'GET') {
    const tripId = tripMatch[1];
    const trip = database.trips.get(tripId);
    if (!trip) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: "Trip not found" }));
      return;
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(trip));
    return;
  }

  // Generate Trip (POST)
  if (pathname === '/api/trips/generate' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const reqData = JSON.parse(body);
        let trip;
        const dest = (reqData.destination || '').toLowerCase();
        if (dest.includes('kyoto') || reqData.preset_scenario === 'solo_weekend' || reqData.travel_style === 'solo') {
          trip = getSoloWeekendScenario();
        } else if (dest.includes('amalfi') || dest.includes('paris') || reqData.preset_scenario === 'couple_romantic' || reqData.travel_style === 'couple') {
          trip = getCoupleVacationScenario();
        } else if (dest.includes('costa') || reqData.preset_scenario === 'group_adventure' || reqData.group_size > 2) {
          trip = getGroupAdventureScenario();
        } else {
          trip = getSoloWeekendScenario();
          trip.id = `trip_${Date.now()}`;
          trip.destination = reqData.destination || "Kyoto, Japan";
          trip.title = `Curated Itinerary for ${trip.destination}`;
        }
        database.trips.set(trip.id, trip);
        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(trip));
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: "Invalid JSON" }));
      }
    });
    return;
  }

  // Regenerate Day (POST)
  const regenMatch = pathname.match(/^\/api\/trips\/([^\/]+)\/regenerate-day$/);
  if (regenMatch && req.method === 'POST') {
    const tripId = regenMatch[1];
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      const { day_number, prompt_adjustment } = JSON.parse(body || '{}');
      const trip = database.trips.get(tripId) || getSoloWeekendScenario();
      const updatedDays = trip.days.map(d => {
        if (d.day_number !== day_number) return d;
        return {
          ...d,
          title: `${d.title} (Revised: ${prompt_adjustment.slice(0, 20)}...)`,
          route_efficiency_note: `Re-optimized for: "${prompt_adjustment}".`,
          activities: d.activities.map(a => ({
            ...a,
            title: `Adapted: ${a.title}`,
            description: `Modified for '${prompt_adjustment}'. ${a.description}`
          }))
        };
      });
      trip.days = updatedDays;
      database.trips.set(trip.id, trip);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(trip));
    });
    return;
  }

  // Swap Activity (POST)
  const swapMatch = pathname.match(/^\/api\/trips\/([^\/]+)\/swap-activity$/);
  if (swapMatch && req.method === 'POST') {
    const tripId = swapMatch[1];
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      const { day_number, activity_id, preferred_category, user_feedback } = JSON.parse(body || '{}');
      const trip = database.trips.get(tripId) || getSoloWeekendScenario();
      const targetDay = trip.days.find(d => d.day_number === day_number);
      if (targetDay) {
        targetDay.activities = targetDay.activities.map(a => {
          if (a.id !== activity_id) return a;
          return {
            ...a,
            id: `swap_${Date.now()}`,
            title: `Alternative ${preferred_category ? preferred_category.toUpperCase() : 'Scenic'} Experience`,
            category: preferred_category || 'nature',
            description: `Curated replacement: "${user_feedback || 'Alternative nearby spot'}". Carefully fitted to keep transit under 15 minutes.`,
            estimated_cost_usd: Math.max(5, a.estimated_cost_usd * 0.9)
          };
        });
      }
      database.trips.set(trip.id, trip);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(trip));
    });
    return;
  }

  // Default Fallback
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    message: "WanderLoom Travel Planner API is running",
    endpoints: [
      "/api/health",
      "/api/scenarios/solo-weekend",
      "/api/scenarios/couple-vacation",
      "/api/scenarios/group-adventure",
      "/api/trips",
      "/api/trips/generate"
    ]
  }));
});

server.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`  WanderLoom Travel Planner API running on port ${PORT}`);
  console.log(`  Health Check: http://localhost:${PORT}/api/health`);
  console.log(`  Solo Scenario: http://localhost:${PORT}/api/scenarios/solo-weekend`);
  console.log(`  Couple Scenario: http://localhost:${PORT}/api/scenarios/couple-vacation`);
  console.log(`  Group Scenario: http://localhost:${PORT}/api/scenarios/group-adventure`);
  console.log(`=======================================================`);
});
