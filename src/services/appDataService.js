import api from './api';

const safeSegment = value => encodeURIComponent(String(value));

export async function loadAppData(ownerId, namespace) {
  const response = await api.get(`/app-data/${safeSegment(ownerId)}/${safeSegment(namespace)}`);
  return response.data.data;
}

export async function saveAppData(ownerId, namespace, data) {
  const response = await api.put(`/app-data/${safeSegment(ownerId)}/${safeSegment(namespace)}`, { data });
  return response.data.data;
}
