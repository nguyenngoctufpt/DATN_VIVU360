import api from './api';

const auth = (userId) => ({ headers: { 'x-user-id': userId } });

export async function generateAIItinerary(userId, payload) {
  const response = await api.post('/ai-itineraries/generate', payload, auth(userId));
  return response.data.data;
}

export async function regenerateAIItinerary(userId, tripId, payload = {}) {
  const response = await api.post(`/ai-itineraries/${encodeURIComponent(tripId)}/regenerate`, payload, auth(userId));
  return response.data.data;
}

export async function regenerateAIItineraryDay(userId, tripId, dayId, payload = {}) {
  const response = await api.post(`/ai-itineraries/${encodeURIComponent(tripId)}/days/${encodeURIComponent(dayId)}/regenerate`, payload, auth(userId));
  return response.data.data;
}

export async function replaceAIItineraryActivity(userId, tripId, activityId, payload = {}) {
  const response = await api.post(`/ai-itineraries/${encodeURIComponent(tripId)}/activities/${encodeURIComponent(activityId)}/replace`, payload, auth(userId));
  return response.data.data;
}

export async function optimizeAIItinerary(userId, tripId, payload = {}) {
  const response = await api.post(`/ai-itineraries/${encodeURIComponent(tripId)}/optimize`, payload, auth(userId));
  return response.data.data;
}

export async function saveAIItinerary(userId, tripId, payload = {}) {
  const response = await api.post(`/ai-itineraries/${encodeURIComponent(tripId)}/save`, payload, auth(userId));
  return response.data.data;
}

export async function getSavedAIItineraries(userId, params = {}) {
  const response = await api.get('/ai-itineraries/saved', {
    ...auth(userId),
    params,
  });
  return response.data.data;
}

export async function getSavedAIItinerary(userId, tripId, params = {}) {
  const response = await api.get(`/ai-itineraries/saved/${encodeURIComponent(tripId)}`, {
    ...auth(userId),
    params,
  });
  return response.data.data;
}

export async function updateSavedAIItinerary(userId, tripId, payload = {}) {
  const response = await api.put(`/ai-itineraries/saved/${encodeURIComponent(tripId)}`, payload, auth(userId));
  return response.data.data;
}

export async function deleteSavedAIItinerary(userId, tripId, params = {}) {
  const response = await api.delete(`/ai-itineraries/saved/${encodeURIComponent(tripId)}`, {
    ...auth(userId),
    params,
  });
  return response.data.data;
}

export async function adjustAIItinerary(userId, tripId, payload = {}) {
  const response = await api.post(`/ai-itineraries/${encodeURIComponent(tripId)}/adjust`, payload, auth(userId));
  return response.data.data;
}

export async function getAIItineraryHistory(userId, tripId) {
  const response = await api.get(`/ai-itineraries/${encodeURIComponent(tripId)}/history`, auth(userId));
  return response.data.data;
}
