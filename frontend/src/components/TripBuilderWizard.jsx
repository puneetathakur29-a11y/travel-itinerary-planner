import React, { useState } from 'react';
import { 
  Sparkles, Compass, Calendar, Users, DollarSign, 
  MapPin, Clock, Heart, Award, ArrowRight, ArrowLeft, Check, AlertCircle 
} from 'lucide-react';

const INTEREST_OPTIONS = [
  { id: 'sightseeing', label: 'Top Landmarks' },
  { id: 'food', label: 'Food & Street Markets' },
  { id: 'culture', label: 'Art & Heritage' },
  { id: 'nature', label: 'Parks & Nature' },
  { id: 'adventure', label: 'Outdoor Adventure' },
  { id: 'romantic dining', label: 'Romantic Dining' },
  { id: 'scenic spots', label: 'Scenic Viewpoints' },
  { id: 'relaxation', label: 'Wellness & Spa' },
  { id: 'nightlife', label: 'Craft Bars & Nightlife' },
  { id: 'shopping', label: 'Artisan Shopping' }
];

const DESTINATION_SUGGESTIONS = [
  'Kyoto, Japan',
  'Amalfi Coast, Italy',
  'Costa Rica',
  'Paris, France',
  'Barcelona, Spain',
  'Bali, Indonesia',
  'New York City, USA',
  'Reykjavik, Iceland',
  'Swiss Alps, Switzerland'
];

export default function TripBuilderWizard({ onGenerateTrip, isGenerating, onCancel }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    destination: 'Kyoto, Japan',
    durationDays: 3,
    travelStyle: 'solo',
    groupSize: 1,
    budgetTier: 'moderate',
    pacing: 'balanced',
    interests: ['sightseeing', 'food', 'culture'],
    dietaryPreferences: [],
    specialNotes: ''
  });

  const toggleInterest = (interestId) => {
    setFormData(prev => {
      const exists = prev.interests.includes(interestId);
      return {
        ...prev,
        interests: exists 
          ? prev.interests.filter(i => i !== interestId)
          : [...prev.interests, interestId]
      };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onGenerateTrip({
      destination: formData.destination,
      duration_days: parseInt(formData.durationDays),
      travel_style: formData.travelStyle,
      group_size: parseInt(formData.groupSize),
      budget_tier: formData.budgetTier,
      pacing: formData.pacing,
      interests: formData.interests,
      special_notes: formData.specialNotes
    });
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <div className="glass-panel rounded-3xl p-6 sm:p-10 border border-slate-800 shadow-2xl relative overflow-hidden">
        
        {/* Step Progress Bar */}
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-800">
          <div>
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
              Step {step} of 3
            </span>
            <h2 className="text-xl font-bold text-white mt-1">
              {step === 1 && "Destination & Dates"}
              {step === 2 && "Travel Style & Dynamics"}
              {step === 3 && "Pacing, Budget & Preferences"}
            </h2>
          </div>
          <div className="flex items-center space-x-2">
            {[1, 2, 3].map(s => (
              <div 
                key={s}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  step === s 
                    ? 'bg-emerald-500 text-slate-950 font-extrabold ring-4 ring-emerald-500/20' 
                    : step > s 
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' 
                    : 'bg-slate-800 text-slate-500'
                }`}
              >
                {step > s ? <Check className="w-4 h-4" /> : s}
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* STEP 1: DESTINATION & DURATION */}
          {step === 1 && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Where do you want to travel?
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-3.5 w-5 h-5 text-emerald-400" />
                  <input
                    type="text"
                    required
                    value={formData.destination}
                    onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                    placeholder="e.g. Kyoto, Japan or Amalfi Coast, Italy"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-white rounded-xl pl-11 pr-4 py-3 text-sm placeholder-slate-500 outline-none transition-all"
                  />
                </div>
                {/* Destination suggestions pills */}
                <div className="flex flex-wrap gap-1.5 mt-3">
                  <span className="text-[11px] text-slate-400 py-1 mr-1">Popular:</span>
                  {DESTINATION_SUGGESTIONS.map((city) => (
                    <button
                      key={city}
                      type="button"
                      onClick={() => setFormData({ ...formData, destination: city })}
                      className="text-xs px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-emerald-500/10 hover:text-emerald-400 text-slate-300 border border-slate-700 transition-colors"
                    >
                      {city}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Trip Duration (Days)
                </label>
                <div className="flex items-center space-x-3">
                  {[1, 2, 3, 4, 5, 7].map((days) => (
                    <button
                      key={days}
                      type="button"
                      onClick={() => setFormData({ ...formData, durationDays: days })}
                      className={`flex-1 py-3 rounded-xl border text-sm font-semibold transition-all ${
                        formData.durationDays === days
                          ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-500/20'
                          : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {days} {days === 1 ? 'Day' : 'Days'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: TRAVEL STYLE & GROUP DYNAMICS */}
          {step === 2 && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Who is traveling? (Travel Style)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { id: 'solo', label: 'Solo Traveler', icon: '👤', sub: 'Independent & agile' },
                    { id: 'couple', label: 'Couple', icon: '💑', sub: 'Romantic & scenic' },
                    { id: 'friends', label: 'Friends Group', icon: '👥', sub: 'Shared adventures' },
                    { id: 'family', label: 'Family', icon: '👨‍👩‍👧', sub: 'Balanced pacing' }
                  ].map((style) => (
                    <button
                      key={style.id}
                      type="button"
                      onClick={() => {
                        const defaultGroup = style.id === 'solo' ? 1 : style.id === 'couple' ? 2 : 4;
                        setFormData({ ...formData, travelStyle: style.id, groupSize: defaultGroup });
                      }}
                      className={`p-4 rounded-xl border text-left transition-all ${
                        formData.travelStyle === style.id
                          ? 'bg-emerald-500/10 border-emerald-500 ring-2 ring-emerald-500/30'
                          : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <span className="text-2xl mb-1 block">{style.icon}</span>
                      <div className="text-sm font-bold text-white">{style.label}</div>
                      <div className="text-[11px] text-slate-400">{style.sub}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Group Size
                </label>
                <div className="flex items-center space-x-4 bg-slate-950 border border-slate-800 rounded-xl p-3 max-w-xs">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, groupSize: Math.max(1, formData.groupSize - 1) })}
                    className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold text-lg flex items-center justify-center transition-colors"
                  >
                    -
                  </button>
                  <div className="flex-1 text-center font-bold text-white text-base">
                    {formData.groupSize} {formData.groupSize === 1 ? 'Traveler' : 'Travelers'}
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, groupSize: Math.min(20, formData.groupSize + 1) })}
                    className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold text-lg flex items-center justify-center transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: PACING, BUDGET & INTERESTS */}
          {step === 3 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Budget Tier */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Budget Tier
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'budget', label: 'Budget', sub: '$' },
                      { id: 'moderate', label: 'Moderate', sub: '$$' },
                      { id: 'luxury', label: 'Luxury', sub: '$$$' }
                    ].map((tier) => (
                      <button
                        key={tier.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, budgetTier: tier.id })}
                        className={`p-2.5 rounded-xl border text-center transition-all ${
                          formData.budgetTier === tier.id
                            ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 font-bold'
                            : 'bg-slate-950 border-slate-800 text-slate-300'
                        }`}
                      >
                        <div className="text-xs font-semibold">{tier.label}</div>
                        <div className="text-xs opacity-60">{tier.sub}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Pacing */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Pacing
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'relaxed', label: 'Relaxed', sub: 'Unhurried' },
                      { id: 'balanced', label: 'Balanced', sub: 'Ideal' },
                      { id: 'packed', label: 'Packed', sub: 'Max sights' }
                    ].map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, pacing: p.id })}
                        className={`p-2.5 rounded-xl border text-center transition-all ${
                          formData.pacing === p.id
                            ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 font-bold'
                            : 'bg-slate-950 border-slate-800 text-slate-300'
                        }`}
                      >
                        <div className="text-xs font-semibold">{p.label}</div>
                        <div className="text-[10px] opacity-60">{p.sub}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Interests multiselect */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Primary Interests (Select 2-4)
                </label>
                <div className="flex flex-wrap gap-2">
                  {INTEREST_OPTIONS.map((intOpt) => {
                    const isSelected = formData.interests.includes(intOpt.id);
                    return (
                      <button
                        key={intOpt.id}
                        type="button"
                        onClick={() => toggleInterest(intOpt.id)}
                        className={`text-xs px-3 py-2 rounded-xl border transition-all flex items-center space-x-1.5 ${
                          isSelected
                            ? 'bg-emerald-500 text-slate-950 font-bold border-emerald-400 shadow-sm'
                            : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5" />}
                        <span>{intOpt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Special Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Special Notes / Accessibility / Dietary Needs (Optional)
                </label>
                <input
                  type="text"
                  value={formData.specialNotes}
                  onChange={(e) => setFormData({ ...formData, specialNotes: e.target.value })}
                  placeholder="e.g. Vegetarian dining, avoid steep stairs, sunset views preferred"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-white rounded-xl px-4 py-2.5 text-xs placeholder-slate-500 outline-none transition-all"
                />
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-6 border-t border-slate-800">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="flex items-center space-x-2 text-slate-400 hover:text-white text-xs sm:text-sm font-semibold px-4 py-2 rounded-xl hover:bg-slate-800 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onCancel}
                className="text-slate-400 hover:text-white text-xs sm:text-sm font-semibold px-4 py-2 rounded-xl hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
            )}

            {step < 3 ? (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-white text-xs sm:text-sm font-semibold px-5 py-2.5 rounded-xl border border-slate-700 transition-all active:scale-95"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={isGenerating}
                className="flex items-center space-x-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs sm:text-sm px-6 py-2.5 rounded-xl shadow-lg shadow-emerald-500/25 transition-all active:scale-95 disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    <span>Synthesizing Day-by-Day Plan...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate AI Itinerary</span>
                  </>
                )}
              </button>
            )}
          </div>

        </form>
      </div>
    </div>
  );
}
