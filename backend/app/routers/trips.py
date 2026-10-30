from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query, status
from fastapi.responses import PlainTextResponse

from app.models.trip import (
    TripRequest, TripResponse, ItineraryDay, Activity,
    DayRegenerationRequest, ActivitySwapRequest
)
from app.models.user import ShareInviteRequest
from app.services.ai_planner import ai_planner
from app.services.supabase_service import supabase_service

router = APIRouter(prefix="/trips", tags=["Trips"])


@router.post("/generate", response_model=TripResponse, status_code=status.HTTP_201_CREATED)
async def generate_trip(req: TripRequest):
    """
    Generate a full personalized day-by-day itinerary using generative AI & prompt engineering.
    Optimizes attractions, dining, accommodations, and transportation based on user preferences.
    """
    try:
        trip = await ai_planner.generate_itinerary(req)
        await supabase_service.save_trip(trip)
        return trip
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Itinerary generation failed: {str(e)}")


@router.get("", response_model=List[TripResponse])
async def list_trips(user_id: str = Query(default="demo-user-1")):
    """List all saved itineraries for the current user."""
    trips = await supabase_service.list_user_trips(user_id=user_id)
    return trips


@router.get("/{trip_id}", response_model=TripResponse)
async def get_trip(trip_id: str):
    """Retrieve full day-by-day details of a saved trip."""
    trip = await supabase_service.get_trip(trip_id)
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    return trip


@router.post("/{trip_id}/regenerate-day", response_model=TripResponse)
async def regenerate_day(trip_id: str, req: DayRegenerationRequest):
    """
    Regenerate a specific day's activities and dining based on user feedback prompt,
    without altering other days of the itinerary.
    """
    trip = await supabase_service.get_trip(trip_id)
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")

    revised_day = await ai_planner.regenerate_single_day(trip, req.day_number, req.prompt_adjustment)
    updated_trip = await supabase_service.update_trip_day(trip_id, revised_day)
    return updated_trip


@router.post("/{trip_id}/swap-activity", response_model=TripResponse)
async def swap_activity(trip_id: str, req: ActivitySwapRequest):
    """
    Swap a specific activity with a category-tailored alternative fitting the same time slot and locale.
    """
    trip = await supabase_service.get_trip(trip_id)
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")

    target_day = next((d for d in trip.days if d.day_number == req.day_number), None)
    if not target_day:
        raise HTTPException(status_code=400, detail=f"Day {req.day_number} not found in trip")

    new_act = await ai_planner.swap_single_activity(
        trip=trip,
        day_number=req.day_number,
        activity_id=req.activity_id,
        preferred_category=req.preferred_category,
        feedback=req.user_feedback
    )

    # Replace activity
    new_acts = [new_act if a.id == req.activity_id else a for a in target_day.activities]
    target_day.activities = new_acts
    target_day.day_total_cost_usd = sum(a.estimated_cost_usd for a in new_acts) + sum(d.estimated_cost_usd for d in target_day.dining)

    updated_trip = await supabase_service.update_trip_day(trip_id, target_day)
    return updated_trip


@router.post("/{trip_id}/collaborators")
async def invite_collaborator(trip_id: str, req: ShareInviteRequest):
    """Invite a friend or partner to co-plan and view this itinerary."""
    trip = await supabase_service.get_trip(trip_id)
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    collab = await supabase_service.add_collaborator(trip_id, req.email, req.role)
    return {"message": f"Invitation sent to {req.email}", "collaborator": collab}


@router.get("/{trip_id}/collaborators")
async def get_collaborators(trip_id: str):
    """Get list of collaborators invited to this trip."""
    trip = await supabase_service.get_trip(trip_id)
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    return await supabase_service.list_collaborators(trip_id)


@router.get("/{trip_id}/export")
async def export_itinerary(trip_id: str, format: str = Query(default="markdown")):
    """Export the itinerary as beautifully formatted Markdown or JSON."""
    trip = await supabase_service.get_trip(trip_id)
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")

    if format == "json":
        return trip.model_dump()

    # Generate Markdown format
    lines = [
        f"# {trip.title}",
        f"**Destination:** {trip.destination} | **Duration:** {trip.duration_days} Days | **Travel Style:** {trip.travel_style.value.capitalize()} (Group of {trip.group_size})",
        f"**Budget Tier:** {trip.budget_tier.value.capitalize()} | **Pacing:** {trip.pacing.value.capitalize()}",
        "",
        f"### Trip Overview",
        trip.summary,
        "",
        f"### Recommended Lodging: {trip.accommodation.name}",
        f"- **Type:** {trip.accommodation.property_type} in {trip.accommodation.location_area}",
        f"- **Estimated Nightly Rate:** ${trip.accommodation.price_per_night_usd:,.0f} USD (Total: ${trip.accommodation.total_stay_cost_usd:,.0f})",
        f"- **Why it fits:** {trip.accommodation.best_for}",
        "",
        "---",
        ""
    ]

    for d in trip.days:
        lines.append(f"## {d.date}: {d.title}")
        lines.append(f"**District Focus:** {d.area_focus}")
        lines.append(f"**Estimated Day Cost:** ${d.day_total_cost_usd:,.0f} USD")
        lines.append("")
        lines.append("### Activities")
        for a in d.activities:
            lines.append(f"- **{a.time_window} [{a.time_slot.upper()}]:** {a.title} (${a.estimated_cost_usd:,.0f})")
            lines.append(f"  - *Location:* {a.location_name} ({a.address or ''})")
            lines.append(f"  - *Insight:* {a.description}")
            if a.insider_tip:
                lines.append(f"  - *Local Tip:* {a.insider_tip}")
        lines.append("")
        lines.append("### Curated Dining")
        for din in d.dining:
            lines.append(f"- **{din.meal_type.capitalize()}:** {din.restaurant_name} ({din.cuisine}, {din.price_range})")
            lines.append(f"  - *Must Try:* {din.recommended_dish}")
            lines.append(f"  - *Atmosphere:* {din.vibe}")
        lines.append("")
        lines.append(f"> **Route Efficiency:** {d.route_efficiency_note}")
        lines.append("")
        lines.append("---")
        lines.append("")

    lines.append("## Cost & Logistics Summary")
    lines.append(f"- **Activities Total:** ${trip.cost_breakdown.activities_total_usd:,.0f}")
    lines.append(f"- **Dining Total:** ${trip.cost_breakdown.dining_total_usd:,.0f}")
    lines.append(f"- **Accommodation Total:** ${trip.cost_breakdown.accommodation_total_usd:,.0f}")
    lines.append(f"- **Local Transit Total:** ${trip.cost_breakdown.local_transport_total_usd:,.0f}")
    lines.append(f"- **Grand Total Estimated Cost:** ${trip.cost_breakdown.grand_total_usd:,.0f} USD")
    lines.append(f"- **Per Person Cost:** ${trip.cost_breakdown.cost_per_person_usd:,.0f} USD")
    lines.append("")
    lines.append(f"**Airport / Hub Arrival:** {trip.logistics.arrival_transfer_tip}")
    lines.append(f"**Primary Transit:** {trip.logistics.primary_transport_mode}")

    return PlainTextResponse("\n".join(lines), media_type="text/markdown")
