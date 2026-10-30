import React, { useState } from 'react';
import { ArrowRightLeft, X, Check } from 'lucide-react';

const CATEGORIES = [
  { id: 'sightseeing', label: 'Sightseeing' },
  { id: 'nature', label: 'Nature & Parks' },
  { id: 'culture', label: 'Culture & Art' },
  { id: 'adventure', label: 'Adventure' },
  { id: 'relaxation', label: 'Relaxation' },
  { id: 'dining', label: 'Food Tasting' }
];

export default function ActivitySwapModal({ isOpen, onClose, dayNumber, activity, onConfirm, isSwapping }) {
  const [category, setCategory] = useState('nature');
  const [feedback, setFeedback] = useState('');

  if (!isOpen || !activity) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm(dayNumber, activity.id, category, feedback);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="glass-panel w-full max-w-lg rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl relative space-y-6">
        
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
              <ArrowRightLeft className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Swap Activity</h3>
              <p className="text-xs text-slate-400">Find an alternative that fits Day {dayNumber}'s geographical cluster</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Activity Banner */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">Current Activity to Replace:</span>
          <div className="font-bold text-white text-sm">{activity.title}</div>
          <div className="text-slate-400">{activity.location_name} • {activity.time_window}</div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Select Desired Replacement Category
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className={`text-xs py-2 px-3 rounded-xl border transition-all text-center ${
                    category === cat.id
                      ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400 font-bold'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Specific Preference (Optional)
            </label>
            <input
              type="text"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="e.g. Quieter scenic spot with lower entrance fee"
              className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-white rounded-xl px-4 py-2.5 text-xs placeholder-slate-500 outline-none transition-all"
            />
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
              disabled={isSwapping}
              className="flex items-center space-x-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 font-bold text-xs px-5 py-2.5 rounded-xl shadow-md shadow-cyan-500/20 transition-all disabled:opacity-50"
            >
              {isSwapping ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>Finding Alternative...</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Swap Activity</span>
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
