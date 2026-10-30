import React, { useState } from 'react';
import { 
  Calendar, MapPin, Users, DollarSign, Clock, Sparkles, RefreshCw, 
  Share2, Download, Bed, Utensils, Compass, ChevronRight, Check, AlertCircle,
  HelpCircle, Navigation, Info, ArrowRightLeft, ShieldCheck
} from 'lucide-react';

export default function ItineraryTimeline({ 
  trip, 
  onRegenerateDayPrompt, 
  onSwapActivityPrompt,
  onOpenBudgetModal,
  onOpenShareModal,
  isRegeneratingDay 
}) {
  const [selectedDayNumber, setSelectedDayNumber] = useState(1);

  if (!trip || !trip.days || trip.days.length === 0) {
    return (
      <div className="py-20 text-center space-y-4">
        <Compass className="w-12 h-12 text-slate-600 mx-auto animate-pulse" />
        <h3 className="text-lg font-bold text-slate-300">No active itinerary selected</h3>
        <p className="text-xs text-slate-500">Pick a scenario or plan a new trip to view the itinerary.</p>
      </div>
    );
  }

  const currentDay = trip.days.find(d => d.day_number === selectedDayNumber) || trip.days[0];

  const handleDownloadMarkdown = () => {
    let md = `# ${trip.title}\n`;
    md += `Destination: ${trip.destination} | Duration: ${trip.duration_days} Days | Style: ${trip.travel_style}\n\n`;
    md += `## Overview\n${trip.summary}\n\n`;
    trip.days.forEach(d => {
      md += `### ${d.date}: ${d.title}\n`;
      md += `District: ${d.area_focus}\n\n`;
      d.activities.forEach(a => {
        md += `- **${a.time_window} [${a.time_slot.toUpperCase()}]:** ${a.title} ($${a.estimated_cost_usd})\n`;
        md += `  ${a.description}\n`;
        if (a.insider_tip) md += `  *Tip:* ${a.insider_tip}\n`;
      });
      md += `\n`;
    });
    
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${trip.destination.toLowerCase().replace(/[^a-z0-9]/g, '-')}-itinerary.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-8 animate-fadeIn">
      
      {/* 1. HERO TRIP BANNER */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl relative overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3 max-w-3xl">
            {/* Meta Tags */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center space-x-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                <span>{trip.destination}</span>
              </span>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700 capitalize flex items-center space-x-1">
                <Users className="w-3.5 h-3.5 text-slate-400" />
                <span>{trip.travel_style} ({trip.group_size} {trip.group_size === 1 ? 'person' : 'people'})</span>
              </span>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700 capitalize flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>{trip.pacing} Pacing</span>
              </span>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 capitalize">
                {trip.budget_tier} Tier
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {trip.title}
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              {trip.summary}
            </p>
          </div>

          {/* Quick Stats & Primary Actions */}
          <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between gap-4 shrink-0 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-800">
            <div>
              <div className="text-right lg:text-right">
                <span className="text-xs text-slate-400 block">Total Estimated Cost</span>
                <div className="text-2xl font-extrabold text-emerald-400">
                  ${Math.round(trip.cost_breakdown?.grand_total_usd || 0).toLocaleString()} <span className="text-xs font-normal text-slate-400">USD</span>
                </div>
                {trip.group_size > 1 && (
                  <span className="text-[11px] text-slate-400 block">
                    (${Math.round(trip.cost_breakdown?.cost_per_person_usd || 0).toLocaleString()} / person)
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={onOpenBudgetModal}
                className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
                title="View Cost Breakdown"
              >
                <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                <span>Budget</span>
              </button>

              <button
                onClick={onOpenShareModal}
                className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
                title="Share & Collaborate"
              >
                <Share2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>Share</span>
              </button>

              <button
                onClick={handleDownloadMarkdown}
                className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
                title="Export Itinerary"
              >
                <Download className="w-3.5 h-3.5 text-purple-400" />
                <span>Export</span>
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* 2. DAY SELECTION TABS */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
        {trip.days.map((day) => {
          const isActive = day.day_number === selectedDayNumber;
          return (
            <button
              key={day.day_number}
              onClick={() => setSelectedDayNumber(day.day_number)}
              className={`px-5 py-3 rounded-2xl text-left border transition-all shrink-0 flex items-center space-x-3 ${
                isActive
                  ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-bold shadow-lg shadow-emerald-500/20 ring-2 ring-emerald-500/30'
                  : 'bg-slate-900/90 text-slate-300 border-slate-800 hover:border-slate-700 hover:bg-slate-800'
              }`}
            >
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-extrabold ${
                isActive ? 'bg-slate-950 text-emerald-400' : 'bg-slate-800 text-slate-400'
              }`}>
                {day.day_number}
              </div>
              <div>
                <div className="text-xs uppercase tracking-wider font-semibold opacity-70">
                  {day.date || `Day ${day.day_number}`}
                </div>
                <div className="text-xs font-bold truncate max-w-[150px]">
                  {day.area_focus || day.title}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* 3. ACTIVE DAY CONTENT */}
      <div className="space-y-6">

        {/* Day Header Banner with AI Regeneration Trigger */}
        <div className="glass-panel rounded-2xl p-5 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-extrabold uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {currentDay.date || `Day ${currentDay.day_number}`}
              </span>
              <span className="text-xs text-slate-400">
                Area: <strong className="text-slate-200">{currentDay.area_focus}</strong>
              </span>
            </div>
            <h2 className="text-xl font-bold text-white">
              {currentDay.title}
            </h2>
            <p className="text-xs text-slate-400">
              Estimated Day Spend: <strong className="text-emerald-400">${Math.round(currentDay.day_total_cost_usd || 0)} USD</strong>
            </p>
          </div>

          <div>
            <button
              onClick={() => onRegenerateDayPrompt(currentDay.day_number)}
              disabled={isRegeneratingDay}
              className="flex items-center space-x-2 bg-slate-800 hover:bg-emerald-500 hover:text-slate-950 text-emerald-400 font-semibold text-xs py-2 px-3.5 rounded-xl border border-emerald-500/30 transition-all shadow-sm active:scale-95 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRegeneratingDay ? 'animate-spin' : ''}`} />
              <span>Regenerate Day with AI</span>
            </button>
          </div>
        </div>

        {/* Route Efficiency Advisory */}
        {currentDay.route_efficiency_note && (
          <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-3.5 flex items-start space-x-3 text-xs text-slate-300">
            <Navigation className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-emerald-400">Urban Logistics Heuristic:</strong> {currentDay.route_efficiency_note}
            </div>
          </div>
        )}

        {/* Time Slot Activities Timeline */}
        <div className="space-y-4">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-2">
            <span>Planned Activities</span>
            <div className="h-px bg-slate-800 flex-1" />
          </div>

          <div className="grid grid-cols-1 gap-4">
            {currentDay.activities.map((activity, idx) => {
              const timeSlotColor = 
                activity.time_slot === 'morning' ? 'border-amber-500/30 text-amber-400 bg-amber-500/10' :
                activity.time_slot === 'afternoon' ? 'border-cyan-500/30 text-cyan-400 bg-cyan-500/10' :
                'border-indigo-500/30 text-indigo-400 bg-indigo-500/10';

              return (
                <div
                  key={activity.id || idx}
                  className="glass-card rounded-2xl p-5 border border-slate-800 hover:border-slate-700 transition-all space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center space-x-2.5">
                      <span className={`text-[11px] font-bold uppercase px-2 py-0.5 rounded-md border ${timeSlotColor}`}>
                        {activity.time_slot}
                      </span>
                      <span className="text-xs font-semibold text-slate-300">
                        {activity.time_window}
                      </span>
                      <span className="text-xs text-slate-500">•</span>
                      <span className="text-xs text-emerald-400 font-semibold">
                        {activity.estimated_cost_usd > 0 ? `$${activity.estimated_cost_usd} USD` : 'Free entry'}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => onSwapActivityPrompt(currentDay.day_number, activity)}
                        className="flex items-center space-x-1 text-slate-400 hover:text-emerald-400 text-xs px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700 transition-colors"
                        title="Swap with alternative activity"
                      >
                        <ArrowRightLeft className="w-3 h-3" />
                        <span>Swap</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-white flex items-center space-x-2">
                      <span>{activity.title}</span>
                    </h3>
                    <div className="flex items-center text-xs text-slate-400 mt-1 space-x-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" />
                      <span>{activity.location_name} {activity.address ? `(${activity.address})` : ''}</span>
                    </div>
                    <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                      {activity.description}
                    </p>
                  </div>

                  {/* Insider Tip & Transit Footnote */}
                  <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    {activity.insider_tip && (
                      <div className="flex items-start space-x-1.5 text-emerald-300/90">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span><strong className="text-emerald-400">Local Tip:</strong> {activity.insider_tip}</span>
                      </div>
                    )}
                    {activity.transit_from_previous && (
                      <div className="text-slate-400 text-[11px] shrink-0">
                        Transit: {activity.transit_from_previous}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Curated Dining Recommendations for the Day */}
        {currentDay.dining && currentDay.dining.length > 0 && (
          <div className="space-y-4 pt-4">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-2">
              <Utensils className="w-3.5 h-3.5 text-emerald-400" />
              <span>Curated Dining & Local Flavors</span>
              <div className="h-px bg-slate-800 flex-1" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {currentDay.dining.map((din, idx) => (
                <div
                  key={din.id || idx}
                  className="glass-card rounded-2xl p-4 border border-slate-800 space-y-2 flex flex-col justify-between"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold uppercase text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-[10px]">
                        {din.meal_type}
                      </span>
                      <span className="text-slate-400 font-semibold">{din.price_range} • ~${din.estimated_cost_usd}</span>
                    </div>

                    <h4 className="font-bold text-sm text-white">{din.restaurant_name}</h4>
                    <p className="text-[11px] text-slate-400">{din.cuisine} • {din.neighborhood}</p>
                    
                    <div className="pt-2 text-xs text-slate-300">
                      <strong className="text-slate-200">Recommended:</strong> {din.recommended_dish}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 italic">
                    "{din.vibe}"
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* 4. TRIP LOGISTICS & ACCOMMODATION CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
        
        {/* Accommodation Card */}
        {trip.accommodation && (
          <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                <Bed className="w-4 h-4" />
                <span>Recommended Lodging</span>
              </div>
              <span className="text-xs font-bold text-white bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700">
                ${trip.accommodation.price_per_night_usd} / night
              </span>
            </div>

            <div>
              <h3 className="text-lg font-bold text-white">{trip.accommodation.name}</h3>
              <p className="text-xs text-slate-400">{trip.accommodation.property_type} in {trip.accommodation.location_area}</p>
              <p className="text-xs text-slate-300 mt-2">
                <strong className="text-slate-200">Why it fits:</strong> {trip.accommodation.best_for}
              </p>
            </div>

            {trip.accommodation.highlights && (
              <div className="pt-2 border-t border-slate-800/80 space-y-1">
                {trip.accommodation.highlights.map((h, i) => (
                  <div key={i} className="text-xs text-slate-300 flex items-center space-x-2">
                    <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                    <span>{h}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Logistics & Transit Card */}
        {trip.logistics && (
          <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
            <div className="flex items-center space-x-2 text-cyan-400 text-xs font-bold uppercase tracking-wider">
              <Navigation className="w-4 h-4" />
              <span>Logistics & Arrival Transfer</span>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <div>
                <strong className="text-white block mb-0.5">Arrival Route:</strong>
                <p className="text-slate-400">{trip.logistics.arrival_transfer_tip}</p>
              </div>

              <div>
                <strong className="text-white block mb-0.5">Primary Transit:</strong>
                <p className="text-slate-400">{trip.logistics.primary_transport_mode}</p>
              </div>

              {trip.logistics.transit_pass_recommendation && (
                <div>
                  <strong className="text-white block mb-0.5">Recommended Transit Pass:</strong>
                  <p className="text-slate-400">{trip.logistics.transit_pass_recommendation}</p>
                </div>
              )}
            </div>

            {trip.logistics.general_safety_and_currency_tips && (
              <div className="pt-2 border-t border-slate-800/80 space-y-1">
                {trip.logistics.general_safety_and_currency_tips.map((tip, i) => (
                  <div key={i} className="text-xs text-slate-400 flex items-start space-x-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                    <span>{tip}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

    </div>
  );
}
