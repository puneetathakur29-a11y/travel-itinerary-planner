import React from 'react';
import { 
  Compass, PlusCircle, Sparkles, MapPin, Calendar, Clock, 
  Users, DollarSign, ArrowRight, ShieldCheck, Heart, Layers 
} from 'lucide-react';
import ScenarioSelector from './ScenarioSelector';

export default function Dashboard({ 
  savedTrips, 
  onSelectTrip, 
  onNewTrip, 
  onSelectScenario, 
  loadingScenarioId 
}) {
  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-10 animate-fadeIn">
      
      {/* 1. HERO HEADER */}
      <div className="relative rounded-3xl glass-panel p-8 sm:p-12 border border-slate-800 shadow-2xl overflow-hidden">
        <div className="absolute top-0 right-0 -mt-16 -mr-16 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Urban Logistics & Route Optimization</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Curate Tailored Journeys in <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">Seconds</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
            Eliminate decision fatigue and travel research complexity. WanderLoom synthesizes geographic clustering, local culinary secrets, pacing, and realistic budgets into structured, day-by-day plans.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={onNewTrip}
              className="flex items-center space-x-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-sm px-6 py-3 rounded-xl shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Build Custom Itinerary</span>
            </button>
          </div>
        </div>

        {/* Metric Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-8 border-t border-slate-800/80">
          <div>
            <span className="text-xs text-slate-400 block">Planning Time Saved</span>
            <div className="text-xl sm:text-2xl font-extrabold text-white">94%</div>
            <span className="text-[11px] text-emerald-400">vs manual web research</span>
          </div>
          <div>
            <span className="text-xs text-slate-400 block">Transit Routing</span>
            <div className="text-xl sm:text-2xl font-extrabold text-white">Zero Backtracking</div>
            <span className="text-[11px] text-cyan-400">Neighborhood clustering</span>
          </div>
          <div>
            <span className="text-xs text-slate-400 block">Generative Flexibility</span>
            <div className="text-xl sm:text-2xl font-extrabold text-white">Day & Activity</div>
            <span className="text-[11px] text-purple-400">Instant AI regeneration</span>
          </div>
          <div>
            <span className="text-xs text-slate-400 block">Group Coordination</span>
            <div className="text-xl sm:text-2xl font-extrabold text-white">Real-Time</div>
            <span className="text-[11px] text-amber-400">Shared budgets & roles</span>
          </div>
        </div>
      </div>

      {/* 2. THE 3 BENCHMARK SCENARIOS SECTION */}
      <ScenarioSelector 
        onSelectScenario={onSelectScenario} 
        loadingScenarioId={loadingScenarioId} 
      />

      {/* 3. RECENT SAVED TRIPS */}
      {savedTrips && savedTrips.length > 0 && (
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-white">Your Saved Itineraries</h3>
              <p className="text-xs text-slate-400">Access and modify your active plans</p>
            </div>
            <span className="text-xs text-slate-500">{savedTrips.length} Itineraries</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedTrips.map((t) => (
              <div
                key={t.id}
                onClick={() => onSelectTrip(t)}
                className="group glass-card rounded-2xl p-5 border border-slate-800 hover:border-emerald-500/40 cursor-pointer transition-all hover:shadow-lg hover:shadow-emerald-500/5 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full flex items-center space-x-1">
                      <MapPin className="w-3 h-3" />
                      <span>{t.destination}</span>
                    </span>
                    <span className="text-slate-400 font-medium">
                      {t.duration_days} Days
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors line-clamp-1">
                    {t.title}
                  </h4>

                  <p className="text-xs text-slate-300 line-clamp-2">
                    {t.summary}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-500 text-[10px] block">Est. Cost</span>
                    <span className="font-bold text-white">
                      ${Math.round(t.cost_breakdown?.grand_total_usd || 0).toLocaleString()} USD
                    </span>
                  </div>
                  <div className="flex items-center space-x-1 text-emerald-400 font-semibold group-hover:translate-x-1 transition-transform">
                    <span>View Itinerary</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
