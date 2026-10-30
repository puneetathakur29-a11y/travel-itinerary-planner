# WanderLoom | Personalized Travel Itinerary Planner 🌍✈️

WanderLoom is a full-stack, AI-powered travel planning platform designed to eliminate research complexity, decision fatigue, and group coordination friction. Built with a **React** frontend, **FastAPI** backend, and **Supabase** database integration, it generates customized day-by-day itineraries using prompt engineering and generative AI.

The system delivers geographically clustered plans that optimize attractions, dining, accommodations, and transportation in a structured format with real-time day regeneration, activity swapping, and itemized cost tracking.

---

## 🌟 Core Benchmark Scenarios

### 🧭 Scenario 1: Solo Traveler Planning a Weekend Getaway
* **Profile:** A solo traveler with limited time wanting high-efficiency exploration.
* **Destination:** Kyoto, Japan (or Lisbon, Portugal) • 2 Days (48 Hours).
* **AI Strategy:**
  - Strict geographic clustering: eliminates cross-city zig-zagging (under 1.5 km walkable radius per day).
  - Pacing & Energy: Dawn hikes to iconic spots (Fushimi Inari Torii gates) before tourist crowds, quiet afternoons in historic preservation alleys (Gion), and sunset stages (Kiyomizu-dera).
  - Solo-Friendly Dining: High-quality counter dining and noodle bars (Menya Inoichi, Chao Chao Gyoza) with zero solo dining awkwardness.
  - Budget & Lodging: Ultra-clean micro-boutique hotel with high security and luggage lockers ($75/night).
  - Total Estimated Cost: ~$293 USD total.

### 💑 Scenario 2: Couple Planning a Personalized Romantic Vacation
* **Profile:** A couple seeking intimate pacing, scenic viewpoints, and memorable dining rather than generic tourist traps.
* **Destination:** Amalfi Coast, Italy • 3 Days.
* **AI Strategy:**
  - Relaxed Pacing: Late morning starts (10:00 AM), scenic golden-hour activities, and zero rush.
  - Romantic Ambiance: Handcrafted mahogany wooden *gozzo* boat charter past Li Galli islands with Prosecco at sunset, infinity garden terraces (Villa Cimbrone), and aromatic lemon grove walks.
  - Candlelit Curated Dining: Advance reservation tips for cliffside restaurants (La Sponda lit by 400 candles, Ristorante Belvedere).
  - Lodging: Boutique cliffside hotel with private sea-view balcony and heated infinity pool ($380/night).
  - Total Estimated Cost: ~$2,430 USD total ($1,215 / person).

### 👥 Scenario 3: Small Group Coordinating a Multi-Day Trip
* **Profile:** 4 friends organizing a multi-day holiday with shared budgets and diverse interests.
* **Destination:** Arenal & Manuel Antonio, Costa Rica • 4 Days.
* **AI Strategy:**
  - Interest Harmonization: Balances adrenaline outdoor adventure (Sky Trek volcano ziplining, Class III-IV Balsa River rafting) with natural relaxation (EcoTermales hot springs, Manuel Antonio beach surf).
  - Group Logistics: Dedicated private air-conditioned high-roof passenger van to eliminate taxi arguments; built-in 30-minute buffers for group assembly.
  - Large-Table Dining: Casual sodas and smokehouse beer gardens accommodating groups with split-bill ease.
  - Shared Villa Economics: 3-4 bedroom private rainforest eco-villa with plunge pool ($450/night split 4 ways = $112.50/person/night).
  - Total Estimated Cost: ~$4,400 USD total ($1,100 / person).

---

## 🏗️ System Architecture

```
                               ┌────────────────────────────────┐
                               │         React Frontend         │
                               │  (Vite + Tailwind + Lucide)    │
                               └──────────────┬─────────────────┘
                                              │ HTTP / JSON API
                                              ▼
                               ┌────────────────────────────────┐
                               │        FastAPI Backend         │
                               │  (Pydantic v2 + CORS Router)   │
                               └───────┬────────────────┬───────┘
                                       │                │
            ┌──────────────────────────┘                └──────────────────────────┐
            ▼                                                                      ▼
┌───────────────────────────────┐                                    ┌───────────────────────────────┐
│     AI Engineering Engine     │                                    │     Supabase Integration      │
│  - Gemini 1.5 Pro / GPT-4o    │                                    │  - PostgreSQL with RLS        │
│  - Geographical Clustering    │                                    │  - Auth & Profile Linking     │
│  - Heuristic Fallback Engine  │                                    │  - Real-Time Collaborators    │
└───────────────────────────────┘                                    └───────────────────────────────┘
```

---

## 📁 Codebase Layout

```
travel-itinerary-planner/
├── backend/
│   ├── app/
│   │   ├── core/
│   │   │   └── config.py               # Settings (Supabase, API keys, CORS)
│   │   ├── models/
│   │   │   ├── trip.py                 # Pydantic v2 models (Activities, Days, Budget)
│   │   │   └── user.py                 # Profiles & Collaborator models
│   │   ├── services/
│   │   │   ├── prompt_templates.py     # Prompt engineering system for Solo, Couple, Group
│   │   │   ├── ai_planner.py           # Gemini/OpenAI integration & deterministic engine
│   │   │   └── supabase_service.py     # Supabase client & memory fallback
│   │   ├── routers/
│   │   │   ├── trips.py                # REST endpoints (/generate, /regenerate-day, /swap)
│   │   │   ├── scenarios.py            # Direct scenario benchmarks
│   │   │   └── health.py               # Health & provider status
│   │   └── main.py                     # FastAPI application entrypoint
│   ├── tests/
│   │   └── test_planner.py             # Pytest test suite
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx              # Navigation & branding
│   │   │   ├── Dashboard.jsx           # SaaS Dashboard with recent trips & metrics
│   │   │   ├── ScenarioSelector.jsx    # Scenario 1, 2, 3 quick selector cards
│   │   │   ├── TripBuilderWizard.jsx   # 3-step smart trip configuration wizard
│   │   │   ├── ItineraryTimeline.jsx   # Day-by-day interactive timeline & logistics
│   │   │   ├── RegenerateDayModal.jsx  # AI day regeneration prompt modal
│   │   │   ├── ActivitySwapModal.jsx   # Category-aware activity replacement modal
│   │   │   ├── BudgetModal.jsx         # Itemized cost breakdown & group split
│   │   │   └── ShareModal.jsx          # Collaborative co-planning & invite modal
│   │   ├── data/
│   │   │   └── scenarioPresets.js      # Benchmark scenario templates
│   │   ├── services/
│   │   │   ├── api.js                  # Frontend API client
│   │   │   └── supabase.js             # Supabase JS SDK client
│   │   ├── App.jsx                     # Root application
│   │   └── main.jsx
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
├── supabase/
│   └── migrations/
│       └── 20261029_initial_schema.sql # Complete PostgreSQL schema & RLS policies
├── node-server.js                      # Standalone zero-dependency Node API & runner
├── docker-compose.yml                  # Full stack containerization
└── README.md
```

---

## 🚀 Quickstart Guide

### Option 1: Docker Compose (One-Click Full Stack)
```bash
docker-compose up --build
```
- Frontend: `http://localhost:5173`
- Backend API & Docs: `http://localhost:8000/docs`

---

### Option 2: Running with Python & Vite

#### 1. Start the FastAPI Backend
```bash
cd backend
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
cp .env.example .env

uvicorn app.main:app --reload --port 8000
```
Interactive API documentation will be available at `http://localhost:8000/docs`.

#### 2. Start the React Frontend
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

---

### Option 3: Instant Native Node Runner (No Python required)
```bash
# Using standard Node.js or agy-node:
node node-server.js
```
Bootstraps the complete mock backend matching the exact FastAPI API contracts on port 8000.

---

## ⚡ Interactive Application Artifact

An interactive web artifact has been generated in your Antigravity conversation brain:
- **File:** `C:\Users\Asus\.gemini\antigravity\brain\2d5469c9-d8bd-419f-90f4-26c02ed42301\wanderloom_travel_planner.html`
- Contains the full interactive SaaS dashboard, all 3 benchmark scenarios, trip builder wizard, day regeneration simulation, and activity swapping controls.

---

## 🔒 Supabase Database & Security

Run the SQL migration in `supabase/migrations/20261029_initial_schema.sql` inside your Supabase project dashboard SQL editor:
- **Profiles Table:** Synced with Supabase Auth (`auth.users`).
- **Trips Table:** Stores structured itinerary days, activities, and budget JSONB with auto-updating timestamps.
- **Trip Collaborators Table:** Manages shared trip access (`viewer` and `editor` roles).
- **Row Level Security (RLS):** Ensures private trips remain accessible only to the owner, while shared trips grant access to authorized collaborators.
