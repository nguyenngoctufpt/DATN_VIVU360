import api from './api';

const safeSegment = value => encodeURIComponent(String(value));

export async function loadPackingList(ownerId) {
  const response = await api.get(`/packing-lists/${safeSegment(ownerId)}`);
  return response.data.data || [];
}

export async function savePackingList(ownerId, items) {
  const response = await api.put(`/packing-lists/${safeSegment(ownerId)}`, { items });
  return response.data.data || [];
}

export async function getPackingSuggestions(ownerId, existingItems) {
  const response = await api.post('/packing-suggestions', { existingItems }, {
    headers: { 'x-user-id': ownerId },
  });
  return response.data.data;
}