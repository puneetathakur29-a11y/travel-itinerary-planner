import React from 'react';
import { DollarSign, X, CheckCircle, PieChart, Users, Bed, Utensils, Compass, Navigation } from 'lucide-react';

export default function BudgetModal({ isOpen, onClose, trip }) {
  if (!isOpen || !trip || !trip.cost_breakdown) return null;

  const cb = trip.cost_breakdown;
  const grandTotal = cb.grand_total_usd || 1;

  const items = [
    { label: 'Activities & Attractions', amount: cb.activities_total_usd, icon: Compass, color: 'bg-emerald-400' },
    { label: 'Curated Dining', amount: cb.dining_total_usd, icon: Utensils, color: 'bg-amber-400' },
    { label: 'Lodging & Accommodation', amount: cb.accommodation_total_usd, icon: Bed, color: 'bg-purple-400' },
    { label: 'Local Transit & Transfers', amount: cb.local_transport_total_usd, icon: Navigation, color: 'bg-cyan-400' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="glass-panel w-full max-w-lg rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl relative space-y-6">
        
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Itemized Budget Breakdown</h3>
              <p className="text-xs text-slate-400">{trip.duration_days} Days in {trip.destination} ({trip.budget_tier} Tier)</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Totals Summary */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 block">Grand Total Estimated</span>
            <div className="text-2xl font-extrabold text-emerald-400">
              ${Math.round(cb.grand_total_usd).toLocaleString()} <span className="text-xs font-normal text-slate-400">USD</span>
            </div>
          </div>
          <div className="text-right border-l border-slate-800 pl-4">
            <span className="text-xs text-slate-400 block">Cost Per Traveler</span>
            <div className="text-lg font-bold text-white">
              ${Math.round(cb.cost_per_person_usd).toLocaleString()} <span className="text-xs font-normal text-slate-400">USD</span>
            </div>
            <span className="text-[11px] text-slate-500">for {trip.group_size} {trip.group_size === 1 ? 'person' : 'people'}</span>
          </div>
        </div>

        {/* Budget Bar Progress */}
        <div className="space-y-2">
          <div className="h-3 w-full bg-slate-950 rounded-full flex overflow-hidden p-0.5 border border-slate-800">
            {items.map((item, idx) => {
              const pct = (item.amount / grandTotal) * 100;
              return (
                <div 
                  key={idx}
                  style={{ width: `${pct}%` }} 
                  className={`h-full ${item.color} first:rounded-l-full last:rounded-r-full transition-all`}
                  title={`${item.label}: ${Math.round(pct)}%`}
                />
              );
            })}
          </div>
        </div>

        {/* Breakdown List */}
        <div className="space-y-3">
          {items.map((item, idx) => {
            const Icon = item.icon;
            const pct = Math.round((item.amount / grandTotal) * 100);
            return (
              <div key={idx} className="flex items-center justify-between text-xs py-2 border-b border-slate-800/80 last:border-b-0">
                <div className="flex items-center space-x-2.5">
                  <div className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                  <Icon className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-slate-300 font-medium">{item.label}</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-white">${Math.round(item.amount).toLocaleString()}</span>
                  <span className="text-[11px] text-slate-500 ml-1.5">({pct}%)</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="pt-4 border-t border-slate-800 text-right">
          <button
            onClick={onClose}
            className="text-xs font-semibold px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
