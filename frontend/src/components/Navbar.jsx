import React from 'react';
import { Compass, Sparkles, PlusCircle, Share2, Database, Layers } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, onNewTrip, activeTrip }) {
  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-slate-800 bg-slate-900/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand */}
        <div 
          onClick={() => setActiveTab('dashboard')} 
          className="flex items-center space-x-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            <Compass className="w-5 h-5 text-slate-950 font-bold" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-lg tracking-tight text-white">Wander<span className="text-emerald-400">Loom</span></span>
              <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">AI Planner</span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">Personalized Itinerary Engine</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center space-x-1 sm:space-x-2">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'dashboard' 
                ? 'bg-slate-800 text-white border border-slate-700' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            Dashboard
          </button>

          <button
            onClick={() => setActiveTab('scenarios')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1.5 ${
              activeTab === 'scenarios' 
                ? 'bg-slate-800 text-emerald-400 border border-emerald-500/30' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Layers className="w-4 h-4 text-emerald-400" />
            <span>Scenarios</span>
          </button>

          {activeTrip && (
            <button
              onClick={() => setActiveTab('itinerary')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                activeTab === 'itinerary' 
                  ? 'bg-slate-800 text-emerald-400 border border-emerald-500/30' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Active Trip</span>
            </button>
          )}
        </nav>

        {/* Action Button */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onNewTrip}
            className="flex items-center space-x-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-semibold text-xs sm:text-sm px-3.5 py-2 rounded-xl shadow-md shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Plan New Trip</span>
          </button>
        </div>

      </div>
    </header>
  );
}
