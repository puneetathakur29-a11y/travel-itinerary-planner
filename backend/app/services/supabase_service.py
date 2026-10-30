import logging
from typing import List, Optional, Dict, Any
from datetime import datetime

from app.core.config import settings
from app.models.trip import TripResponse, ItineraryDay

logger = logging.getLogger(__name__)


class SupabaseService:
    def __init__(self):
        self.client = None
        self._memory_trips: Dict[str, TripResponse] = {}
        self._collaborators: Dict[str, List[Dict[str, Any]]] = {}
        self._init_supabase()

    def _init_supabase(self):
        if settings.SUPABASE_URL and settings.SUPABASE_KEY and "your-project" not in settings.SUPABASE_URL:
            try:
                from supabase import create_client, Client
                self.client: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
                logger.info("Successfully connected to Supabase backend")
            except Exception as e:
                logger.warning(f"Failed to connect to Supabase: {e}. Falling back to in-memory store.")
                self.client = None
        else:
            logger.info("Supabase credentials not configured. Using active in-memory repository.")

    async def save_trip(self, trip: TripResponse) -> TripResponse:
        """Saves a trip to Supabase if connected, or to memory store."""
        self._memory_trips[trip.id] = trip

        if self.client:
            try:
                payload = {
                    "id": trip.id,
                    "user_id": trip.user_id,
                    "title": trip.title,
                    "destination": trip.destination,
                    "duration_days": trip.duration_days,
                    "travel_style": trip.travel_style.value,
                    "group_size": trip.group_size,
                    "budget_tier": trip.budget_tier.value,
                    "pacing": trip.pacing.value,
                    "summary": trip.summary,
                    "accommodation": trip.accommodation.model_dump(),
                    "logistics": trip.logistics.model_dump(),
                    "cost_breakdown": trip.cost_breakdown.model_dump(),
                    "days": [d.model_dump() for d in trip.days],
                    "share_token": trip.share_token,
                    "updated_at": datetime.utcnow().isoformat()
                }
                # Upsert to 'trips' table
                self.client.table("trips").upsert(payload).execute()
                logger.info(f"Trip {trip.id} persisted to Supabase")
            except Exception as e:
                logger.error(f"Error saving trip to Supabase: {e}")

        return trip

    async def get_trip(self, trip_id: str) -> Optional[TripResponse]:
        """Retrieves a trip by ID."""
        if self.client:
            try:
                res = self.client.table("trips").select("*").eq("id", trip_id).execute()
                if res.data and len(res.data) > 0:
                    return TripResponse(**res.data[0])
            except Exception as e:
                logger.warning(f"Error retrieving trip from Supabase: {e}")

        return self._memory_trips.get(trip_id)

    async def list_user_trips(self, user_id: str = "demo-user-1") -> List[TripResponse]:
        """Lists all trips for the active user."""
        if self.client:
            try:
                res = self.client.table("trips").select("*").eq("user_id", user_id).order("created_at", desc=True).execute()
                if res.data:
                    return [TripResponse(**t) for t in res.data]
            except Exception as e:
                logger.warning(f"Error listing trips from Supabase: {e}")

        return list(self._memory_trips.values())

    async def update_trip_day(self, trip_id: str, updated_day: ItineraryDay) -> Optional[TripResponse]:
        """Updates a specific day in a trip and recalculates costs."""
        trip = await self.get_trip(trip_id)
        if not trip:
            return None

        # Replace matching day
        new_days = []
        for d in trip.days:
            if d.day_number == updated_day.day_number:
                new_days.append(updated_day)
            else:
                new_days.append(d)
        trip.days = new_days

        # Recalculate cost breakdown
        acts_cost = sum(act.estimated_cost_usd for d in trip.days for act in d.activities)
        din_cost = sum(din.estimated_cost_usd for d in trip.days for din in d.dining)
        transit_cost = trip.logistics.daily_transit_cost_usd * trip.duration_days
        grand = acts_cost + din_cost + transit_cost + trip.accommodation.total_stay_cost_usd

        trip.cost_breakdown.activities_total_usd = acts_cost
        trip.cost_breakdown.dining_total_usd = din_cost
        trip.cost_breakdown.grand_total_usd = grand
        trip.cost_breakdown.cost_per_person_usd = grand / trip.group_size

        return await self.save_trip(trip)

    async def add_collaborator(self, trip_id: str, email: str, role: str = "editor") -> Dict[str, Any]:
        """Adds a collaborator to a trip for shared group planning."""
        collaborator = {
            "id": f"collab_{len(self._collaborators.get(trip_id, [])) + 1}",
            "trip_id": trip_id,
            "email": email,
            "role": role,
            "status": "invited",
            "invited_at": datetime.utcnow().isoformat()
        }

        if trip_id not in self._collaborators:
            self._collaborators[trip_id] = []
        self._collaborators[trip_id].append(collaborator)

        if self.client:
            try:
                self.client.table("trip_collaborators").insert(collaborator).execute()
            except Exception as e:
                logger.warning(f"Error persisting collaborator to Supabase: {e}")

        return collaborator

    async def list_collaborators(self, trip_id: str) -> List[Dict[str, Any]]:
        """Lists collaborators for a given trip."""
        if self.client:
            try:
                res = self.client.table("trip_collaborators").select("*").eq("trip_id", trip_id).execute()
                if res.data:
                    return res.data
            except Exception as e:
                logger.warning(f"Error fetching collaborators: {e}")

        return self._collaborators.get(trip_id, [
            {"id": "collab_owner", "trip_id": trip_id, "email": "you@wanderloom.app", "role": "owner", "status": "active"}
        ])


supabase_service = SupabaseService()
