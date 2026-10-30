const API_BASE = '/api';

export const api = {
  async generateTrip(payload) {
    try {
      const res = await fetch(`${API_BASE}/trips/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('API call failed, attempting scenario generator:', err);
      return null;
    }
  },

  async getTrip(tripId) {
    const res = await fetch(`${API_BASE}/trips/${tripId}`);
    if (!res.ok) throw new Error('Trip not found');
    return await res.json();
  },

  async listTrips() {
    try {
      const res = await fetch(`${API_BASE}/trips`);
      if (!res.ok) return [];
      return await res.json();
    } catch (err) {
      return [];
    }
  },

  async regenerateDay(tripId, dayNumber, promptAdjustment) {
    const res = await fetch(`${API_BASE}/trips/${tripId}/regenerate-day`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        day_number: dayNumber,
        prompt_adjustment: promptAdjustment
      })
    });
    if (!res.ok) throw new Error('Failed to regenerate day');
    return await res.json();
  },

  async swapActivity(tripId, dayNumber, activityId, preferredCategory, userFeedback) {
    const res = await fetch(`${API_BASE}/trips/${tripId}/swap-activity`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        day_number: dayNumber,
        activity_id: activityId,
        preferred_category: preferredCategory,
        user_feedback: userFeedback
      })
    });
    if (!res.ok) throw new Error('Failed to swap activity');
    return await res.json();
  },

  async inviteCollaborator(tripId, email, role = 'editor') {
    const res = await fetch(`${API_BASE}/trips/${tripId}/collaborators`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, role })
    });
    return await res.json();
  },

  async loadScenario(scenarioId) {
    let endpoint = '/scenarios/solo-weekend';
    if (scenarioId === 'couple_romantic') endpoint = '/scenarios/couple-vacation';
    if (scenarioId === 'group_adventure') endpoint = '/scenarios/group-adventure';

    const res = await fetch(`${API_BASE}${endpoint}`);
    if (!res.ok) throw new Error('Failed to load scenario');
    return await res.json();
  }
};
