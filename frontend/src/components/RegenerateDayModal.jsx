import React, { useState } from 'react';
import { RefreshCw, Sparkles, X, MessageSquare } from 'lucide-react';

export default function RegenerateDayModal({ isOpen, onClose, dayNumber, onConfirm, isRegenerating }) {
  const [promptAdjustment, setPromptAdjustment] = useState('');

  if (!isOpen) return null;

  const quickPrompts = [
    "More outdoor scenic spots and quiet nature",
    "Focus on local street food and culinary markets",
    "Less walking, more relaxed cafe culture and views",
    "High-energy adventure activities"
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm(dayNumber, promptAdjustment);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="glass-panel w-full max-w-lg rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl relative space-y-6">
        
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Regenerate Day {dayNumber}</h3>
              <p className="text-xs text-slate-400">Instruct WanderLoom AI to adapt this day's schedule</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              What would you like to change about Day {dayNumber}?
            </label>
            <textarea
              rows={3}
              required
              value={promptAdjustment}
              onChange={(e) => setPromptAdjustment(e.target.value)}
              placeholder="e.g. Replace museums with scenic waterfront walks, include budget ramen places, or make the pacing slower..."
              className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-white rounded-xl p-3 text-xs placeholder-slate-500 outline-none transition-all resize-none"
            />
          </div>

          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
              Quick Prompt Ideas:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {quickPrompts.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setPromptAdjustment(p)}
                  className="text-xs px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-emerald-500/10 hover:text-emerald-400 text-slate-300 border border-slate-800 transition-colors"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="text-xs font-semibold text-slate-400 hover:text-white px-4 py-2 rounded-xl hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isRegenerating || !promptAdjustment.trim()}
              className="flex items-center space-x-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs px-5 py-2.5 rounded-xl shadow-md shadow-emerald-500/20 transition-all disabled:opacity-50"
            >
              {isRegenerating ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>Regenerating...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Update Day {dayNumber}</span>
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
