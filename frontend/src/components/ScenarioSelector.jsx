import React from 'react';
import { scenarioPresets } from '../data/scenarioPresets';
import { User, Heart, Users, Sparkles, ArrowRight, CheckCircle2, Clock, MapPin, DollarSign } from 'lucide-react';

export default function ScenarioSelector({ onSelectScenario, loadingScenarioId }) {
  const getScenarioIcon = (style) => {
    switch (style) {
      case 'solo':
        return <User className="w-5 h-5 text-emerald-400" />;
      case 'couple':
        return <Heart className="w-5 h-5 text-rose-400" />;
      case 'friends':
        return <Users className="w-5 h-5 text-amber-400" />;
      default:
        return <Sparkles className="w-5 h-5 text-cyan-400" />;
    }
  };

  return (
    <div className="py-6 space-y-6">
      <div className="text-center max-w-3xl mx-auto space-y-2">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Curated AI Benchmark Scenarios</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Experience Tailored Travel Architecture
        </h2>
        <p className="text-sm sm:text-base text-slate-400">
          Select any of the 3 core traveler profiles to see how generative prompt engineering personalizes pacing, logistics, dining, and budgets.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
        {scenarioPresets.map((scenario) => {
          const isLoading = loadingScenarioId === scenario.id;

          return (
            <div
              key={scenario.id}
              className="group relative rounded-2xl glass-panel p-6 flex flex-col justify-between border border-slate-800 hover:border-slate-700 hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-300"
            >
              {/* Header */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${scenario.tagColor} flex items-center space-x-1.5`}>
                    {getScenarioIcon(scenario.travelStyle)}
                    <span>Scenario {scenario.scenarioNumber}: {scenario.tag}</span>
                  </span>
                  <span className="text-xs text-slate-500 flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{scenario.durationDays} Days</span>
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-white group-hover:text-emerald-400 transition-colors">
                    {scenario.title}
                  </h3>
                  <div className="flex items-center text-xs text-slate-400 mt-1 space-x-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{scenario.destination}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {scenario.description}
                </p>

                {/* Highlights */}
                <div className="space-y-2 pt-2 border-t border-slate-800/80">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Curated Highlights
                  </span>
                  <ul className="space-y-1.5">
                    {scenario.highlights.map((h, idx) => (
                      <li key={idx} className="text-xs text-slate-300 flex items-center space-x-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span className="truncate">{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-6">
                <button
                  onClick={() => onSelectScenario(scenario)}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center space-x-2 bg-slate-800 hover:bg-emerald-500 hover:text-slate-950 text-emerald-400 font-semibold text-xs sm:text-sm py-2.5 px-4 rounded-xl border border-emerald-500/30 hover:border-transparent transition-all shadow-sm active:scale-95 disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                      <span>Synthesizing Plan...</span>
                    </>
                  ) : (
                    <>
                      <span>Explore Scenario {scenario.scenarioNumber}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
