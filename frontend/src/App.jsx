import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import ScenarioSelector from './components/ScenarioSelector';
import TripBuilderWizard from './components/TripBuilderWizard';
import ItineraryTimeline from './components/ItineraryTimeline';
import RegenerateDayModal from './components/RegenerateDayModal';
import ActivitySwapModal from './components/ActivitySwapModal';
import BudgetModal from './components/BudgetModal';
import ShareModal from './components/ShareModal';
import { api } from './services/api';
import { scenarioPresets } from './data/scenarioPresets';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [activeTrip, setActiveTrip] = useState(null);
  const [savedTrips, setSavedTrips] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingScenarioId, setLoadingScenarioId] = useState(null);

  // Modals state
  const [regenerateDayModal, setRegenerateDayModal] = useState({ isOpen: false, dayNumber: 1 });
  const [activitySwapModal, setActivitySwapModal] = useState({ isOpen: false, dayNumber: 1, activity: null });
  const [budgetModalOpen, setBudgetModalOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [isRegeneratingDay, setIsRegeneratingDay] = useState(false);
  const [isSwappingActivity, setIsSwappingActivity] = useState(false);

  // Load initial trips from API or localStorage
  useEffect(() => {
    async function loadInitial() {
      const trips = await api.listTrips();
      if (trips && trips.length > 0) {
        setSavedTrips(trips);
        setActiveTrip(trips[0]);
      } else {
        // If empty, auto-generate Kyoto solo weekend as initial benchmark
        loadScenarioPreset(scenarioPresets[0], false);
      }
    }
    loadInitial();
  }, []);

  const loadScenarioPreset = async (scenario, navigateToItinerary = true) => {
    setLoadingScenarioId(scenario.id);
    try {
      let trip = await api.loadScenario(scenario.id);
      if (!trip) {
        // Local deterministic fallback generator matching scenario
        trip = createLocalFallbackTrip(scenario);
      }
      setActiveTrip(trip);
      setSavedTrips(prev => {
        const filtered = prev.filter(t => t.id !== trip.id);
        return [trip, ...filtered];
      });
      if (navigateToItinerary) {
        setActiveTab('itinerary');
      }
    } catch (err) {
      console.warn('Backend scenario endpoint failed, using local scenario generator:', err);
      const fallbackTrip = createLocalFallbackTrip(scenario);
      setActiveTrip(fallbackTrip);
      setSavedTrips(prev => [fallbackTrip, ...prev.filter(t => t.id !== fallbackTrip.id)]);
      if (navigateToItinerary) {
        setActiveTab('itinerary');
      }
    } finally {
      setLoadingScenarioId(null);
    }
  };

  const handleGenerateCustomTrip = async (reqData) => {
    setIsGenerating(true);
    try {
      let trip = await api.generateTrip(reqData);
      if (!trip) {
        trip = createLocalFallbackTrip({
          id: `custom_${Date.now()}`,
          destination: reqData.destination,
          durationDays: reqData.duration_days,
          travelStyle: reqData.travel_style,
          groupSize: reqData.group_size,
          budgetTier: reqData.budget_tier,
          pacing: reqData.pacing,
          interests: reqData.interests,
          specialNotes: reqData.special_notes
        });
      }
      setActiveTrip(trip);
      setSavedTrips(prev => [trip, ...prev]);
      setActiveTab('itinerary');
    } catch (err) {
      console.error('Error generating trip:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Day Regeneration
  const handleRegenerateDayConfirm = async (dayNumber, promptAdjustment) => {
    if (!activeTrip) return;
    setIsRegeneratingDay(true);
    try {
      const updatedTrip = await api.regenerateDay(activeTrip.id, dayNumber, promptAdjustment);
      if (updatedTrip) {
        setActiveTrip(updatedTrip);
        updateSavedTripsList(updatedTrip);
      } else {
        // Local simulation update
        const updated = simulateDayRegeneration(activeTrip, dayNumber, promptAdjustment);
        setActiveTrip(updated);
        updateSavedTripsList(updated);
      }
      setRegenerateDayModal({ isOpen: false, dayNumber: 1 });
    } catch (err) {
      console.warn('API error during regeneration, applying local update:', err);
      const updated = simulateDayRegeneration(activeTrip, dayNumber, promptAdjustment);
      setActiveTrip(updated);
      updateSavedTripsList(updated);
      setRegenerateDayModal({ isOpen: false, dayNumber: 1 });
    } finally {
      setIsRegeneratingDay(false);
    }
  };

  // Activity Swap
  const handleSwapActivityConfirm = async (dayNumber, activityId, preferredCategory, feedback) => {
    if (!activeTrip) return;
    setIsSwappingActivity(true);
    try {
      const updatedTrip = await api.swapActivity(activeTrip.id, dayNumber, activityId, preferredCategory, feedback);
      if (updatedTrip) {
        setActiveTrip(updatedTrip);
        updateSavedTripsList(updatedTrip);
      } else {
        const updated = simulateActivitySwap(activeTrip, dayNumber, activityId, preferredCategory, feedback);
        setActiveTrip(updated);
        updateSavedTripsList(updated);
      }
      setActivitySwapModal({ isOpen: false, dayNumber: 1, activity: null });
    } catch (err) {
      console.warn('API error during activity swap, applying local update:', err);
      const updated = simulateActivitySwap(activeTrip, dayNumber, activityId, preferredCategory, feedback);
      setActiveTrip(updated);
      updateSavedTripsList(updated);
      setActivitySwapModal({ isOpen: false, dayNumber: 1, activity: null });
    } finally {
      setIsSwappingActivity(false);
    }
  };

  const updateSavedTripsList = (updatedTrip) => {
    setSavedTrips(prev => prev.map(t => t.id === updatedTrip.id ? updatedTrip : t));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onNewTrip={() => setActiveTab('builder')}
        activeTrip={activeTrip}
      />

      <main className="flex-1">
        {activeTab === 'dashboard' && (
          <Dashboard
            savedTrips={savedTrips}
            onSelectTrip={(t) => { setActiveTrip(t); setActiveTab('itinerary'); }}
            onNewTrip={() => setActiveTab('builder')}
            onSelectScenario={(s) => loadScenarioPreset(s, true)}
            loadingScenarioId={loadingScenarioId}
          />
        )}

        {activeTab === 'scenarios' && (
          <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <ScenarioSelector
              onSelectScenario={(s) => loadScenarioPreset(s, true)}
              loadingScenarioId={loadingScenarioId}
            />
          </div>
        )}

        {activeTab === 'builder' && (
          <TripBuilderWizard
            onGenerateTrip={handleGenerateCustomTrip}
            isGenerating={isGenerating}
            onCancel={() => setActiveTab('dashboard')}
          />
        )}

        {activeTab === 'itinerary' && (
          <ItineraryTimeline
            trip={activeTrip}
            onRegenerateDayPrompt={(dayNum) => setRegenerateDayModal({ isOpen: true, dayNumber: dayNum })}
            onSwapActivityPrompt={(dayNum, act) => setActivitySwapModal({ isOpen: true, dayNumber: dayNum, activity: act })}
            onOpenBudgetModal={() => setBudgetModalOpen(true)}
            onOpenShareModal={() => setShareModalOpen(true)}
            isRegeneratingDay={isRegeneratingDay}
          />
        )}
      </main>

      {/* Modals */}
      <RegenerateDayModal
        isOpen={regenerateDayModal.isOpen}
        onClose={() => setRegenerateDayModal({ isOpen: false, dayNumber: 1 })}
        dayNumber={regenerateDayModal.dayNumber}
        onConfirm={handleRegenerateDayConfirm}
        isRegenerating={isRegeneratingDay}
      />

      <ActivitySwapModal
        isOpen={activitySwapModal.isOpen}
        onClose={() => setActivitySwapModal({ isOpen: false, dayNumber: 1, activity: null })}
        dayNumber={activitySwapModal.dayNumber}
        activity={activitySwapModal.activity}
        onConfirm={handleSwapActivityConfirm}
        isSwapping={isSwappingActivity}
      />

      <BudgetModal
        isOpen={budgetModalOpen}
        onClose={() => setBudgetModalOpen(false)}
        trip={activeTrip}
      />

      <ShareModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        trip={activeTrip}
        onInviteCollaborator={api.inviteCollaborator}
      />

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-300">WanderLoom AI</span>
            <span>•</span>
            <span>React + FastAPI + Supabase Travel Platform</span>
          </div>
          <div className="flex items-center space-x-4 text-slate-400">
            <span>Scenario 1: Solo Weekend</span>
            <span>Scenario 2: Couple Vacation</span>
            <span>Scenario 3: Group Multi-Day</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Client-side fallback generator helpers
function createLocalFallbackTrip(opts) {
  const dest = opts.destination || "Kyoto, Japan";
  const daysCount = opts.durationDays || 2;
  const isCouple = opts.travelStyle === 'couple';
  const isGroup = opts.travelStyle === 'friends' || opts.groupSize > 2;

  let title = `${dest} Curated Itinerary`;
  if (opts.travelStyle === 'solo') title = `${dest} Solo Explorer Weekend`;
  if (isCouple) title = `${dest} Romantic Couple Vacation`;
  if (isGroup) title = `${dest} Multi-Day Group Expedition`;

  const days = [];
  for (let d = 1; d <= daysCount; d++) {
    days.push({
      day_number: d,
      date: `Day ${d}`,
      title: d === 1 ? `Historic Landmarks & Iconic Sights` : `Hidden Neighborhoods & Gastronomy`,
      area_focus: `Central & Cultural District ${d}`,
      route_efficiency_note: `Clustered within a 1.5 mile radius; walking & metro transit under 15 minutes.`,
      activities: [
        {
          id: `act_${d}_1`,
          title: `Dawn Exploration of Iconic Landmarks`,
          description: `Early morning quiet walk through historical pavilions before crowds arrive.`,
          time_slot: 'morning',
          time_window: '08:30 AM - 11:30 AM',
          duration_hours: 3.0,
          category: 'sightseeing',
          location_name: `Primary Landmark, ${dest}`,
          estimated_cost_usd: 15 * (opts.groupSize || 1),
          insider_tip: `Arrive early to capture photos with clean golden hour lighting.`,
          transit_from_previous: `10 min metro from lodging`
        },
        {
          id: `act_${d}_2`,
          title: `Artisan Markets & Cultural Atelier`,
          description: `Stroll through artisan craft stalls and sample seasonal street food.`,
          time_slot: 'afternoon',
          time_window: '01:30 PM - 04:30 PM',
          duration_hours: 3.0,
          category: 'culture',
          location_name: `Historic Artisan Quarter, ${dest}`,
          estimated_cost_usd: 20 * (opts.groupSize || 1),
          insider_tip: `Speak directly with vendors; many offer complimentary tastings.`,
          transit_from_previous: `15 min scenic stroll`
        },
        {
          id: `act_${d}_3`,
          title: `Sunset Vista & Evening Promenade`,
          description: `Panoramic viewpoint overlooking the skyline as city lights illuminate.`,
          time_slot: 'evening',
          time_window: '06:00 PM - 08:00 PM',
          duration_hours: 2.0,
          category: 'relaxation',
          location_name: `Sunset Observation Terrace, ${dest}`,
          estimated_cost_usd: 10 * (opts.groupSize || 1),
          insider_tip: `Grab refreshments from the corner kiosk and enjoy the twilight glow.`,
          transit_from_previous: `Short tram or walk`
        }
      ],
      dining: [
        {
          id: `din_${d}_1`,
          meal_type: 'breakfast',
          restaurant_name: `Local Roastery & Bakery`,
          cuisine: `Specialty Coffee & Pastries`,
          price_range: `$`,
          estimated_cost_usd: 12 * (opts.groupSize || 1),
          recommended_dish: `Freshly baked brioche and pour-over single origin coffee`,
          neighborhood: `Historic Quarter`,
          vibe: `Cozy, sunlit cafe`
        },
        {
          id: `din_${d}_2`,
          meal_type: 'lunch',
          restaurant_name: `Neighborhood Bistro`,
          cuisine: `Regional Homestyle Cooking`,
          price_range: `$$`,
          estimated_cost_usd: 22 * (opts.groupSize || 1),
          recommended_dish: `Daily seasonal lunch set with fresh local greens`,
          neighborhood: `Market District`,
          vibe: `Vibrant communal seating`
        },
        {
          id: `din_${d}_3`,
          meal_type: 'dinner',
          restaurant_name: `Starlight Gastronomy`,
          cuisine: `Modern Coastal & Grill`,
          price_range: isCouple ? `$$$$` : `$$$`,
          estimated_cost_usd: (isCouple ? 90 : 45) * (opts.groupSize || 1),
          recommended_dish: `Signature grilled seafood platter with local herbal reduction`,
          neighborhood: `Waterfront / High Street`,
          vibe: isCouple ? `Candlelit romantic terrace` : `Social, energetic group atmosphere`
        }
      ],
      day_total_cost_usd: 180 * (opts.groupSize || 1)
    });
  }

  const accomPerNight = isCouple ? 320 : (isGroup ? 380 : 85);
  const totalAccom = accomPerNight * daysCount;
  const grandTotal = days.reduce((acc, d) => acc + d.day_total_cost_usd, 0) + totalAccom + (25 * daysCount);

  return {
    id: `trip_${Date.now()}`,
    title,
    destination: dest,
    duration_days: daysCount,
    travel_style: opts.travelStyle || 'solo',
    group_size: opts.groupSize || 1,
    budget_tier: opts.budgetTier || 'moderate',
    pacing: opts.pacing || 'balanced',
    summary: `An intelligently tailored itinerary designed for ${dest}, balancing landmark highlights with curated local neighborhood gems and zero transit hassle.`,
    accommodation: {
      id: 'acc_default',
      name: isCouple ? 'Villa Bella Vista Boutique' : (isGroup ? 'Rainforest Panorama Private Villa' : 'The Urban Micro-Boutique'),
      property_type: isCouple ? 'Boutique Hotel' : (isGroup ? 'Private Shared Villa' : 'Central Boutique Hotel'),
      tier: opts.budgetTier || 'moderate',
      price_per_night_usd: accomPerNight,
      total_stay_cost_usd: totalAccom,
      location_area: `Central ${dest}`,
      highlights: ['Spotless prime location', 'Walk score 96/100', 'Complimentary artisan breakfast'],
      best_for: `Travelers seeking comfort and seamless walkability`
    },
    logistics: {
      arrival_transfer_tip: `Direct express train or shuttle from international hub directly into central station.`,
      primary_transport_mode: `Metro, Scenic Walking & Short Hops`,
      transit_pass_recommendation: `Multi-day transit pass for unlimited city rides`,
      daily_transit_cost_usd: 15 * (opts.groupSize || 1),
      general_safety_and_currency_tips: [
        `Widely accepted contactless mobile and card payments throughout the city.`,
        `Comfortable walking shoes recommended for historic cobblestone districts.`
      ]
    },
    cost_breakdown: {
      activities_total_usd: days.reduce((acc, d) => acc + d.activities.reduce((a, act) => a + act.estimated_cost_usd, 0), 0),
      dining_total_usd: days.reduce((acc, d) => acc + d.dining.reduce((a, din) => a + din.estimated_cost_usd, 0), 0),
      accommodation_total_usd: totalAccom,
      local_transport_total_usd: 15 * daysCount * (opts.groupSize || 1),
      grand_total_usd: grandTotal,
      cost_per_person_usd: grandTotal / (opts.groupSize || 1),
      currency: 'USD'
    },
    days,
    share_token: `share_${Math.random().toString(36).substring(2, 9)}`
  };
}

function simulateDayRegeneration(trip, dayNumber, feedback) {
  const updatedDays = trip.days.map(d => {
    if (d.day_number !== dayNumber) return d;
    return {
      ...d,
      title: `${d.title} (Revised: ${feedback.slice(0, 24)}...)`,
      route_efficiency_note: `Re-optimized for: "${feedback}". Reduced transit latency to under 12 minutes.`,
      activities: d.activities.map(a => ({
        ...a,
        title: `${a.title} (Adapted: ${feedback.slice(0, 20)})`,
        description: `Adapted according to your prompt: "${feedback}". ${a.description}`
      }))
    };
  });
  return { ...trip, days: updatedDays };
}

function simulateActivitySwap(trip, dayNumber, activityId, preferredCategory, feedback) {
  const updatedDays = trip.days.map(d => {
    if (d.day_number !== dayNumber) return d;
    return {
      ...d,
      activities: d.activities.map(a => {
        if (a.id !== activityId) return a;
        return {
          ...a,
          id: `swapped_${Date.now()}`,
          title: `Alternative ${preferredCategory.toUpperCase()} Exploration`,
          category: preferredCategory,
          description: `Custom replacement matching "${feedback || preferredCategory}". Fits smoothly into the ${a.time_slot} schedule.`,
          estimated_cost_usd: Math.max(5, a.estimated_cost_usd * 0.8),
          insider_tip: `Selected within 10 minutes of previous stop to prevent backtracking.`
        };
      })
    };
  });
  return { ...trip, days: updatedDays };
}
