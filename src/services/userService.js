import api from './api';

export async function syncUser(user) {
  const response = await api.post('/users/sync', user);
  return response.data.data;
}

export async function getUser(identifier) {
  const response = await api.get(`/users/${encodeURIComponent(identifier)}`);
  return response.data.data;
}

export async function updateUser(identifier, profile) {
  const response = await api.put(`/users/${encodeURIComponent(identifier)}`, profile);
  return response.data.data;
}

export async function searchFriends(query, excludeFirebaseUid) {
  const response = await api.get('/users/search/friends', {
    params: { q: query, exclude: excludeFirebaseUid || undefined, viewerId: excludeFirebaseUid || undefined },
  });
  return response.data.data;
}
