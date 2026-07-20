import api from './api';

const auth = userId => ({ headers: { 'x-user-id': userId } });

export async function getSocialNotifications(userId) {
  const response = await api.get('/social-notifications', auth(userId));
  return response.data.data;
}

export async function markSocialNotificationsRead(userId) {
  await api.patch('/social-notifications/read', {}, auth(userId));
}
